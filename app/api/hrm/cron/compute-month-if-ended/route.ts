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

import { createAdminClient } from "@/app/utils/supabase/admin";
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
    const supabase = await createAdminClient();

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
      const startDateISO = startDate.toISOString().split("T")[0];
      const endDateISO = endDate.toISOString().split("T")[0];

      // Prefer newer schema (start_date/end_date), then fallback to older
      // schema (year_month) if those columns are unavailable.
      const { data: newMonth, error: monthError } = await supabase
        .from("hrm_months")
        .insert({
          month_key: monthKey,
          start_date: startDateISO,
          end_date: endDateISO,
        })
        .select("id")
        .single();

      if (monthError) {
        const monthErrorMessage = monthError.message?.toLowerCase() || "";
        const monthErrorDetails = monthError.details?.toLowerCase() || "";
        const yearMonthNotNullViolation =
          monthError.code === "23502" &&
          (monthErrorMessage.includes("year_month") ||
            monthErrorDetails.includes("year_month"));
        const missingStartOrEndDateColumn =
          monthError.code === "PGRST204" &&
          (monthErrorMessage.includes("start_date") ||
            monthErrorMessage.includes("end_date"));
        const isRetriableMonthInsertError =
          yearMonthNotNullViolation ||
          missingStartOrEndDateColumn ||
          monthError.code === "23505";

        const monthInsertErrorPayload = {
          code: monthError.code,
          message: monthError.message,
          details: monthError.details,
          hint: monthError.hint,
        };

        if (isRetriableMonthInsertError) {
          console.warn(
            "[Cron Compute Month] Month insert attempt failed, applying fallback/retry",
            monthInsertErrorPayload,
          );
        } else {
          console.error(
            "[Cron Compute Month] Error creating month:",
            monthInsertErrorPayload,
          );
        }

        if (yearMonthNotNullViolation) {
          const { data: withYearMonth, error: withYearMonthError } =
            await supabase
              .from("hrm_months")
              .insert({
                month_key: monthKey,
                start_date: startDateISO,
                end_date: endDateISO,
                year_month: startDateISO,
              })
              .select("id")
              .single();

          if (withYearMonthError) {
            if (withYearMonthError.code === "23505") {
              const { data: raceMonth, error: raceMonthError } = await supabase
                .from("hrm_months")
                .select("id")
                .eq("month_key", monthKey)
                .single();

              if (raceMonthError) throw raceMonthError;
              monthId = raceMonth.id;
            } else {
              throw withYearMonthError;
            }
          } else {
            monthId = withYearMonth.id;
          }
        } else if (missingStartOrEndDateColumn) {
          const { data: fallbackMonth, error: fallbackError } = await supabase
            .from("hrm_months")
            .insert({
              month_key: monthKey,
              year_month: startDateISO,
            })
            .select("id")
            .single();

          if (fallbackError) {
            if (fallbackError.code === "23505") {
              const { data: raceMonth, error: raceMonthError } = await supabase
                .from("hrm_months")
                .select("id")
                .eq("month_key", monthKey)
                .single();

              if (raceMonthError) throw raceMonthError;
              monthId = raceMonth.id;
            } else {
              throw fallbackError;
            }
          } else {
            monthId = fallbackMonth.id;
          }
        } else if (monthError.code === "23505") {
          const { data: raceMonth, error: raceMonthError } = await supabase
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
    const { data: weeks, error: weeksError } = await supabase
      .from("hrm_weeks")
      .select("id, week_key")
      .in("week_key", fridayWeekKeys);

    if (weeksError) {
      throw weeksError;
    }

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

    const sortedWeeks = [...weeks].sort((a, b) =>
      a.week_key.localeCompare(b.week_key),
    );
    const weekIds = sortedWeeks.map((w) => w.id);

    // Get all weekly results for these weeks
    const { data: weeklyResults, error: weeklyResultsError } = await supabase
      .from("hrm_weekly_results")
      .select("subject_user_id, weekly_avg_score")
      .in("week_id", weekIds);

    if (weeklyResultsError) {
      throw weeklyResultsError;
    }

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
    const monthlyResultErrors: string[] = [];

    for (const subjectId of Object.keys(subjectWeeklyScores)) {
      const { scores } = subjectWeeklyScores[subjectId];
      const numericScores = scores
        .map((score) => Number(score))
        .filter((score) => Number.isFinite(score));
      const weeksCountUsed = numericScores.length;

      if (weeksCountUsed === 0) {
        continue;
      }

      const monthlyScore =
        numericScores.reduce((sum, score) => sum + score, 0) / weeksCountUsed;
      const isCompleteMonth = weeksCountUsed === expectedWeeksCount;

      // Get previous month state
      const { data: monthStateRows, error: monthStateError } = await supabase
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
        monthlyResultErrors.push(`${subjectId}: ${resultError.message}`);
        continue;
      }

      // Update subject month state
      const newConsecutiveCount = updateConsecutiveImprovementMonths(
        result.tier,
        monthState?.consecutive_improvement_months || 0,
      );

      const { error: monthStateUpsertError } = await supabase
        .from("hrm_subject_month_states")
        .upsert(
          {
            subject_user_id: subjectId,
            last_month_key: monthKey,
            last_month_tier: result.tier,
            consecutive_improvement_months: newConsecutiveCount,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "subject_user_id" },
        );

      if (monthStateUpsertError) {
        console.error(
          "Error upserting subject month state:",
          monthStateUpsertError,
        );
      }

      computedCount++;
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
    // PostgrestError is a plain object, not an Error instance
    const message =
      error instanceof Error
        ? error.message
        : (error as { message?: string })?.message ||
          JSON.stringify(error) ||
          "Unknown error";
    return NextResponse.json(
      { error: "Failed to compute/lock month", details: message },
      { status: 500 },
    );
  }
}
