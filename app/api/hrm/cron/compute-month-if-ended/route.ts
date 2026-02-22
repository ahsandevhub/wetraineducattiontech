/**
 * POST /api/hrm/cron/compute-month-if-ended
 * Cron endpoint: Compute and lock previous month if we're in first 2 days of new month
 *
 * Authentication: Requires X-CRON-SECRET header
 * Idempotent: Safe to call multiple times (checks if already computed/locked)
 * Timezone: Uses Asia/Dhaka for date determination
 *
 * Logic:
 * - Check if Dhaka date is day 1 or 2 of current month
 * - If yes, compute previous month (if not already computed)
 * - Lock previous month after computation
 * - Skip if previous month is already LOCKED
 *
 * Schedule: Run daily at 01:00 Dhaka time (19:00 UTC previous day)
 */

import { createClient } from "@/app/utils/supabase/server";
import { verifyCronSecret } from "@/lib/hrm/cron-auth";
import {
  computeMonthlyResult,
  HrmTier,
  updateConsecutiveImprovementMonths,
} from "@/lib/hrm/monthly-logic";
import { notifyEmployeesMonthResult } from "@/lib/hrm/notification-helpers";
import {
  getDhakaNow,
  getMonthDateRange,
  listFridayWeekKeysForMonth,
} from "@/lib/hrm/week-utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Verify cron secret
  const authError = verifyCronSecret(request);
  if (authError) return authError;

  try {
    const supabase = await createClient();

    // Get current date in Dhaka timezone
    const dhakaDate = getDhakaNow();
    const dayOfMonth = dhakaDate.getDate();

    // Only process if we're in the first 2 days of the month
    if (dayOfMonth > 2) {
      return NextResponse.json({
        success: true,
        action: "skipped",
        reason: "not_in_first_2_days",
        currentDay: dayOfMonth,
        message: `Skipped: Current day is ${dayOfMonth}. Only runs on days 1-2 of month.`,
      });
    }

    // Calculate previous month key
    const currentYear = dhakaDate.getFullYear();
    const currentMonth = dhakaDate.getMonth(); // 0-11

    let prevYear = currentYear;
    let prevMonth = currentMonth - 1;

    if (prevMonth < 0) {
      prevMonth = 11;
      prevYear = currentYear - 1;
    }

    const monthKey = `${prevYear}-${String(prevMonth + 1).padStart(2, "0")}`;

    // Check if month exists and get status
    const { data: existingMonth } = await supabase
      .from("hrm_months")
      .select("id, status")
      .eq("month_key", monthKey)
      .maybeSingle();

    // If month is already locked, skip
    if (existingMonth && existingMonth.status === "LOCKED") {
      return NextResponse.json({
        success: true,
        action: "skipped",
        reason: "already_locked",
        monthKey,
        message: `Month ${monthKey} is already locked.`,
      });
    }

    // Ensure month exists
    let monthId: string;
    if (!existingMonth) {
      const { startDate, endDate } = getMonthDateRange(monthKey);

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

      if (monthError) {
        console.error("Error creating month:", monthError);
        throw monthError;
      }
      monthId = newMonth.id;
    } else {
      monthId = existingMonth.id;
    }

    // Get all Friday week keys for this month
    const fridayWeekKeys = listFridayWeekKeysForMonth(monthKey);
    const expectedWeeksCount = fridayWeekKeys.length;

    if (expectedWeeksCount === 0) {
      return NextResponse.json(
        {
          error: "No Fridays found in previous month",
          monthKey,
        },
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
          error: "No weekly data found. Compute weeks first.",
          monthKey,
          expectedWeeks: fridayWeekKeys,
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
          error: "No weekly results found. Compute weekly results first.",
          monthKey,
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
        .maybeSingle();

      const previousMonthTier =
        (monthState?.last_month_tier as HrmTier) || null;

      // Compute tier, fine, action
      const result = computeMonthlyResult(monthlyScore, previousMonthTier);

      // Upsert monthly result
      const { error: resultError } = await supabase
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
            gift_amount: null,
            weeks_count_used: weeksCountUsed,
            expected_weeks_count: expectedWeeksCount,
            is_complete_month: isCompleteMonth,
            computed_at: new Date().toISOString(),
          },
          { onConflict: "month_id,subject_user_id" },
        );

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

    // Lock the month after successful computation
    const { error: lockError } = await supabase
      .from("hrm_months")
      .update({ status: "LOCKED", updated_at: new Date().toISOString() })
      .eq("id", monthId);

    if (lockError) {
      console.error("Error locking month:", lockError);
      return NextResponse.json(
        {
          success: true,
          action: "computed_not_locked",
          monthKey,
          computedSubjects: computedCount,
          warning: "Month computed but failed to lock",
          lockError: lockError.message,
        },
        { status: 207 },
      );
    }

    // Notify employees about their monthly results
    await notifyEmployeesMonthResult(monthKey);

    return NextResponse.json({
      success: true,
      action: "computed_and_locked",
      monthKey,
      expectedWeeksCount,
      computedSubjects: computedCount,
      status: "LOCKED",
      message: `Month ${monthKey} computed (${computedCount} subjects) and locked successfully`,
    });
  } catch (error) {
    console.error("Cron compute-month-if-ended error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to compute/lock month", details: message },
      { status: 500 },
    );
  }
}
