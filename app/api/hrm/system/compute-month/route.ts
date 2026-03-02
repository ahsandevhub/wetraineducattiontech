import { createAdminClient } from "@/app/utils/supabase/admin";
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
  const adminSupabase = await createAdminClient();

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
    .eq("id", user.id)
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

  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(monthKey)) {
    return NextResponse.json(
      { error: "Invalid monthKey format. Use YYYY-MM." },
      { status: 400 },
    );
  }

  try {
    console.log(
      `[Compute Month] Starting computation for monthKey: ${monthKey}`,
    );

    // Ensure month exists in database
    const { startDate, endDate } = getMonthDateRange(monthKey);
    console.log(
      `[Compute Month] Month range: ${startDate.toDateString()} to ${endDate.toDateString()}`,
    );

    const { data: existingMonth, error: monthReadError } = await adminSupabase
      .from("hrm_months")
      .select("id, status")
      .eq("month_key", monthKey)
      .maybeSingle();

    if (monthReadError && monthReadError.code !== "PGRST116") {
      throw monthReadError;
    }

    let monthId: string;

    if (!existingMonth) {
      // Create month
      const { data: newMonth, error: monthError } = await adminSupabase
        .from("hrm_months")
        .insert({
          month_key: monthKey,
          start_date: startDate.toISOString().split("T")[0],
          end_date: endDate.toISOString().split("T")[0],
          status: "OPEN",
        })
        .select("id")
        .single();

      if (monthError) {
        if (monthError.code === "23505") {
          const { data: raceMonth, error: raceMonthError } = await adminSupabase
            .from("hrm_months")
            .select("id")
            .eq("month_key", monthKey)
            .single();

          if (raceMonthError) throw raceMonthError;
          monthId = raceMonth.id;
        } else {
          throw monthError;
        }
      } else {
        monthId = newMonth.id;
      }
      console.log(`[Compute Month] Created new month record: ${monthId}`);
    } else {
      // Check if locked
      if (existingMonth.status === "LOCKED") {
        return NextResponse.json(
          { error: "Month is locked. Unlock it before recomputing." },
          { status: 403 },
        );
      }
      monthId = existingMonth.id;
      console.log(`[Compute Month] Using existing month record: ${monthId}`);
    }

    // Get all Friday week keys for this month
    const fridayWeekKeys = listFridayWeekKeysForMonth(monthKey);
    const expectedWeeksCount = fridayWeekKeys.length;

    console.log(
      `[Compute Month] Expected Fridays in ${monthKey}: ${expectedWeeksCount}`,
    );
    console.log(
      `[Compute Month] Friday week keys: ${fridayWeekKeys.join(", ")}`,
    );

    if (expectedWeeksCount === 0) {
      return NextResponse.json(
        { error: "No Fridays found in this month" },
        { status: 400 },
      );
    }

    // Get all weeks in this month
    const { data: weeks, error: weeksError } = await adminSupabase
      .from("hrm_weeks")
      .select("id, week_key")
      .in("week_key", fridayWeekKeys);

    if (weeksError) {
      throw weeksError;
    }

    console.log(
      `[Compute Month] Found ${weeks?.length || 0} week records in database for expected Fridays`,
    );

    if (!weeks || weeks.length === 0) {
      return NextResponse.json(
        {
          error:
            "No weekly data found for this month. Please compute weeks first.",
          expectedWeeks: fridayWeekKeys,
        },
        { status: 400 },
      );
    }

    const sortedWeeks = [...weeks].sort((a, b) =>
      a.week_key.localeCompare(b.week_key),
    );
    const weekIds = sortedWeeks.map((w) => w.id);

    // ALWAYS recompute ALL weekly results from fresh submission data
    console.log(
      `[Compute Month] Recomputing weekly results for ALL ${sortedWeeks.length} weeks from fresh submission data...`,
    );

    // Get all subjects with active assignments (for expected marker count)
    const { data: assignments, error: assignmentsError } = await adminSupabase
      .from("hrm_assignments")
      .select("subject_user_id, marker_admin_id")
      .eq("is_active", true);

    if (assignmentsError) {
      throw assignmentsError;
    }

    // Group assignments by subject to get expected marker count
    const subjectMarkers = new Map<string, Set<string>>();
    for (const assignment of assignments || []) {
      if (!subjectMarkers.has(assignment.subject_user_id)) {
        subjectMarkers.set(assignment.subject_user_id, new Set());
      }
      subjectMarkers
        .get(assignment.subject_user_id)!
        .add(assignment.marker_admin_id);
    }

    let weeksComputedInMonth = 0;
    const allSubjectsInMonth = new Set<string>();

    for (const week of sortedWeeks) {
      try {
        console.log(
          `[Compute Month] Computing weekly results for week: ${week.week_key}`,
        );

        // Get all submissions for this week
        const { data: submissions, error: submissionsError } =
          await adminSupabase
            .from("hrm_kpi_submissions")
            .select("subject_user_id, marker_admin_id, total_score")
            .eq("week_id", week.id);

        if (submissionsError) {
          throw submissionsError;
        }

        console.log(
          `[Compute Month] Week ${week.week_key}: Found ${submissions?.length || 0} submissions`,
        );

        // Group submissions by subject
        const subjectSubmissions = new Map<
          string,
          Array<{ markerAdminId: string; totalScore: number }>
        >();

        for (const sub of submissions || []) {
          if (!subjectSubmissions.has(sub.subject_user_id)) {
            subjectSubmissions.set(sub.subject_user_id, []);
          }
          subjectSubmissions.get(sub.subject_user_id)!.push({
            markerAdminId: sub.marker_admin_id,
            totalScore: sub.total_score,
          });
        }

        // Compute weekly results for each subject
        const weeklyResults = [];
        const allSubjectIds = new Set([
          ...subjectSubmissions.keys(),
          ...subjectMarkers.keys(),
        ]);

        for (const subjectUserId of allSubjectIds) {
          allSubjectsInMonth.add(subjectUserId); // Track all subjects
          const subs = subjectSubmissions.get(subjectUserId) || [];
          const expectedMarkers =
            subjectMarkers.get(subjectUserId) || new Set();

          const numericScores = subs
            .map((s) => Number(s.totalScore))
            .filter((score) => Number.isFinite(score));
          const weeklyAvgScore =
            numericScores.length > 0
              ? numericScores.reduce((sum, score) => sum + score, 0) /
                numericScores.length
              : 0;

          const expectedMarkersCount = expectedMarkers.size;
          const submittedMarkersCount = numericScores.length;
          const isComplete = submittedMarkersCount >= expectedMarkersCount;

          weeklyResults.push({
            week_id: week.id,
            subject_user_id: subjectUserId,
            weekly_avg_score: Math.round(weeklyAvgScore * 100) / 100,
            expected_markers_count: expectedMarkersCount,
            submitted_markers_count: submittedMarkersCount,
            is_complete: isComplete,
            computed_at: new Date().toISOString(),
          });
        }

        // Upsert weekly results
        if (weeklyResults.length > 0) {
          const { error: resultsError } = await adminSupabase
            .from("hrm_weekly_results")
            .upsert(weeklyResults, {
              onConflict: "week_id,subject_user_id",
            });

          if (resultsError) {
            console.error(
              `[Compute Month] Error upserting weekly results for week ${week.week_key}:`,
              resultsError,
            );
          } else {
            weeksComputedInMonth++;
            console.log(
              `[Compute Month] Successfully computed ${weeklyResults.length} weekly results for week ${week.week_key}`,
            );
          }
        }
      } catch (weekError) {
        console.error(
          `[Compute Month] Error computing weekly results for week ${week.week_key}:`,
          weekError,
        );
        // Continue with next week
      }
    }

    console.log(
      `[Compute Month] Computed weekly results for ${weeksComputedInMonth}/${sortedWeeks.length} weeks`,
    );
    console.log(
      `[Compute Month] Total unique subjects found: ${allSubjectsInMonth.size}`,
    );

    // Get all weekly results for these weeks (freshly computed)
    const { data: weeklyResults, error: weeklyResultsError } =
      await adminSupabase
        .from("hrm_weekly_results")
        .select("subject_user_id, weekly_avg_score")
        .in("week_id", weekIds);

    if (weeklyResultsError) {
      throw weeklyResultsError;
    }

    console.log(
      `[Compute Month] Total weekly results available: ${weeklyResults?.length || 0}`,
    );

    if (!weeklyResults || weeklyResults.length === 0) {
      return NextResponse.json(
        {
          error:
            "No submissions found for this month. Please ensure KPI submissions exist for at least one week.",
          debugInfo: {
            monthKey,
            weeksInDatabase: weeks.length,
            expectedFridays: expectedWeeksCount,
            weeksProcessed: weeksComputedInMonth,
          },
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
    const monthlyResultErrors: string[] = [];

    console.log(
      `[Compute Month] Processing ${Object.keys(subjectWeeklyScores).length} subjects for monthly aggregation`,
    );

    for (const subjectId of Object.keys(subjectWeeklyScores)) {
      const { scores } = subjectWeeklyScores[subjectId];
      const weeksCountUsed = scores.length;
      const monthlyScore =
        scores.reduce((sum, score) => sum + score, 0) / weeksCountUsed;
      const isCompleteMonth = weeksCountUsed === expectedWeeksCount;

      console.log(
        `[Compute Month] Subject ${subjectId}: ${weeksCountUsed} weeks, score: ${monthlyScore.toFixed(2)}`,
      );

      // Get previous month state
      const { data: monthStateRows, error: monthStateError } =
        await adminSupabase
          .from("hrm_subject_month_states")
          .select("last_month_tier, consecutive_improvement_months")
          .eq("subject_user_id", subjectId)
          .order("updated_at", { ascending: false })
          .limit(1);

      if (monthStateError) {
        console.error("Error reading subject month state:", monthStateError);
      }

      const monthState = monthStateRows?.[0] || null;

      const previousMonthTier =
        (monthState?.last_month_tier as HrmTier) || null;

      // Compute tier, fine, action
      const result = computeMonthlyResult(monthlyScore, previousMonthTier);

      // Upsert monthly result
      const { error: resultError } = await adminSupabase
        .from("hrm_monthly_results")
        .upsert(
          {
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
          },
          {
            onConflict: "month_id,subject_user_id",
          },
        );

      if (resultError) {
        console.error("Error upserting monthly result:", resultError);
        monthlyResultErrors.push(`${subjectId}: ${resultError.message}`);
        continue;
      }

      // Update subject month state
      const newConsecutiveCount = updateConsecutiveImprovementMonths(
        result.tier,
        monthState?.consecutive_improvement_months || 0,
      );

      const { error: monthStateUpsertError } = await adminSupabase
        .from("hrm_subject_month_states")
        .upsert(
          {
            subject_user_id: subjectId,
            last_month_key: monthKey,
            last_month_tier: result.tier,
            consecutive_improvement_months: newConsecutiveCount,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "subject_user_id",
          },
        );

      if (monthStateUpsertError) {
        console.error(
          "Error upserting subject month state:",
          monthStateUpsertError,
        );
      }

      computedCount++;
      console.log(
        `[Compute Month] Subject ${subjectId}: Tier=${result.tier}, Fine=${result.finalFine}`,
      );
    }

    if (computedCount === 0 && Object.keys(subjectWeeklyScores).length > 0) {
      return NextResponse.json(
        {
          error:
            "Month computation failed for all subjects. Check schema constraints/columns on hrm_monthly_results and hrm_subject_month_states.",
          monthKey,
          attemptedSubjects: Object.keys(subjectWeeklyScores).length,
          sampleErrors: monthlyResultErrors.slice(0, 5),
        },
        { status: 500 },
      );
    }

    console.log(
      `[Compute Month] Completed computation for ${monthKey}: ${computedCount} subjects`,
    );

    return NextResponse.json({
      success: true,
      monthKey,
      expectedWeeksCount,
      computedSubjectsCount: computedCount,
      weeksInMonth: weeks.length,
      message: `✓ Computed monthly results for ${computedCount} subjects from ${weeks.length} weeks`,
    });
  } catch (error) {
    console.error(`[Compute Month] Error computing month ${monthKey}:`, error);
    const message =
      error instanceof Error ? error.message : "Failed to compute month";
    return NextResponse.json({ error: message, monthKey }, { status: 500 });
  }
}
