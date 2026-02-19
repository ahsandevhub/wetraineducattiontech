import { createClient } from "@/app/utils/supabase/server";
import {
  computeMonthlyResult,
  HrmTier,
  updateConsecutiveImprovementMonths,
} from "@/lib/hrm/monthly-logic";
import {
  getMonthDateRange,
  listFridayWeekKeysForMonth,
} from "@/lib/hrm/week-utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check SUPER_ADMIN role
  const { data: hrmUser } = await supabase
    .from("hrm_users")
    .select("hrm_role")
    .eq("profile_id", user.id)
    .single();

  if (!hrmUser || hrmUser.hrm_role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const monthKey = searchParams.get("monthKey");

  if (!monthKey) {
    return NextResponse.json(
      { error: "monthKey is required (format: YYYY-MM)" },
      { status: 400 },
    );
  }

  try {
    // Ensure month exists in database
    const { startDate, endDate } = getMonthDateRange(monthKey);

    const { data: existingMonth } = await supabase
      .from("hrm_months")
      .select("id, status")
      .eq("month_key", monthKey)
      .single();

    let monthId: string;

    if (!existingMonth) {
      // Create month
      const { data: newMonth, error: monthError } = await supabase
        .from("hrm_months")
        .insert({
          month_key: monthKey,
          start_date: startDate.toISOString().split("T")[0],
          end_date: endDate.toISOString().split("T")[0],
          status: "OPEN",
        })
        .select("id")
        .single();

      if (monthError) throw monthError;
      monthId = newMonth.id;
    } else {
      // Check if locked
      if (existingMonth.status === "LOCKED") {
        return NextResponse.json(
          { error: "Month is locked. Unlock it before recomputing." },
          { status: 403 },
        );
      }
      monthId = existingMonth.id;
    }

    // Get all Friday week keys for this month
    const fridayWeekKeys = listFridayWeekKeysForMonth(monthKey);
    const expectedWeeksCount = fridayWeekKeys.length;

    if (expectedWeeksCount === 0) {
      return NextResponse.json(
        { error: "No Fridays found in this month" },
        { status: 400 },
      );
    }

    // Get all weeks in this month
    const { data: weeks } = await supabase
      .from("hrm_weeks")
      .select("id, week_key")
      .in("week_key", fridayWeekKeys);

    if (!weeks || weeks.length === 0) {
      return NextResponse.json(
        {
          error:
            "No weekly data found for this month. Please compute weeks first.",
        },
        { status: 400 },
      );
    }

    const weekIds = weeks.map((w) => w.id);

    // Get all weekly results for these weeks
    const { data: weeklyResults } = await supabase
      .from("hrm_weekly_results")
      .select("subject_user_id, weekly_avg_score")
      .in("week_id", weekIds);

    if (!weeklyResults || weeklyResults.length === 0) {
      return NextResponse.json(
        {
          error:
            "No weekly results found. Please compute weekly results first.",
        },
        { status: 400 },
      );
    }

    // Group by subject
    const subjectWeeklyScores: Record<
      string,
      { scores: number[]; subjectId: string }
    > = {};

    weeklyResults.forEach((result) => {
      const subjectId = result.subject_user_id;
      if (!subjectWeeklyScores[subjectId]) {
        subjectWeeklyScores[subjectId] = { scores: [], subjectId };
      }
      subjectWeeklyScores[subjectId].scores.push(result.weekly_avg_score);
    });

    // Compute monthly results for each subject
    let computedCount = 0;

    for (const subjectId of Object.keys(subjectWeeklyScores)) {
      const { scores } = subjectWeeklyScores[subjectId];
      const weeksCountUsed = scores.length;
      const monthlyScore =
        scores.reduce((sum, score) => sum + score, 0) / weeksCountUsed;
      const isCompleteMonth = weeksCountUsed === expectedWeeksCount;

      // Get previous month state
      const { data: monthState } = await supabase
        .from("hrm_subject_month_states")
        .select("last_month_tier, consecutive_improvement_months")
        .eq("subject_user_id", subjectId)
        .single();

      const previousMonthTier =
        (monthState?.last_month_tier as HrmTier) || null;

      // Compute tier, fine, action
      const result = computeMonthlyResult(monthlyScore, previousMonthTier);

      // Upsert monthly result
      const { error: resultError } = await supabase
        .from("hrm_monthly_results")
        .upsert({
          month_id: monthId,
          subject_user_id: subjectId,
          monthly_score: monthlyScore,
          tier: result.tier,
          action_type: result.actionType,
          base_fine: result.baseFine,
          month_fine_count: result.monthFineCount,
          final_fine: result.finalFine,
          gift_amount: null, // Keep null for now
          weeks_count_used: weeksCountUsed,
          expected_weeks_count: expectedWeeksCount,
          is_complete_month: isCompleteMonth,
          computed_at: new Date().toISOString(),
        });

      if (resultError) {
        console.error("Error upserting monthly result:", resultError);
        continue;
      }

      // Update subject month state
      const newConsecutiveCount = updateConsecutiveImprovementMonths(
        result.tier,
        monthState?.consecutive_improvement_months || 0,
      );

      await supabase.from("hrm_subject_month_states").upsert({
        subject_user_id: subjectId,
        last_month_key: monthKey,
        last_month_tier: result.tier,
        consecutive_improvement_months: newConsecutiveCount,
        updated_at: new Date().toISOString(),
      });

      computedCount++;
    }

    return NextResponse.json({
      success: true,
      monthKey,
      expectedWeeksCount,
      computedSubjectsCount: computedCount,
      message: `Computed monthly results for ${computedCount} subjects`,
    });
  } catch (error) {
    console.error("Error computing month:", error);
    const message =
      error instanceof Error ? error.message : "Failed to compute month";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
