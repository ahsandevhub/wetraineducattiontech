import { createClient } from "@/app/utils/supabase/server";
import {
  getMonthDateRange,
  listFridayWeekKeysForMonth,
} from "@/lib/hrm/week-utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: hrmUser } = await supabase
    .from("hrm_users")
    .select("id, hrm_role")
    .eq("id", user.id)
    .single();

  if (!hrmUser || !["EMPLOYEE", "ADMIN"].includes(hrmUser.hrm_role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const monthKey = request.nextUrl.searchParams.get("monthKey");

  if (!monthKey) {
    return NextResponse.json(
      { error: "monthKey is required" },
      { status: 400 },
    );
  }

  try {
    getMonthDateRange(monthKey);
    const weekKeys = listFridayWeekKeysForMonth(monthKey);

    const { data: weeks } = await supabase
      .from("hrm_weeks")
      .select("id, week_key, friday_date")
      .in("week_key", weekKeys);

    const weekIds = (weeks || []).map((week) => week.id);

    if (weekIds.length === 0) {
      return NextResponse.json({ monthKey, weeklyDetails: [] });
    }

    const { data: submissions } = await supabase
      .from("hrm_kpi_submissions")
      .select(
        `
        id,
        week_id,
        total_score,
        comment,
        submitted_at,
        hrm_kpi_submission_items(
          id,
          criteria_id,
          score_raw,
          hrm_criteria(
            id,
            key,
            name
          )
        )
      `,
      )
      .eq("subject_user_id", hrmUser.id)
      .in("week_id", weekIds)
      .order("submitted_at", { ascending: false });

    const { data: weeklyResults } = await supabase
      .from("hrm_weekly_results")
      .select("week_id, weekly_avg_score, is_complete, computed_at")
      .eq("subject_user_id", hrmUser.id)
      .in("week_id", weekIds);

    const submissionsByWeek = new Map<string, any[]>();
    for (const submission of submissions || []) {
      const weekKey = (weeks || []).find(
        (week) => week.id === submission.week_id,
      )?.week_key;

      if (weekKey) {
        if (!submissionsByWeek.has(weekKey)) {
          submissionsByWeek.set(weekKey, []);
        }
        submissionsByWeek.get(weekKey)!.push(submission);
      }
    }

    const weeklyDetails = (weeks || [])
      .sort((a, b) => a.friday_date.localeCompare(b.friday_date))
      .map((week) => {
        const weekSubmissions = submissionsByWeek.get(week.week_key) || [];
        const result = weeklyResults?.find(
          (weekly) => weekly.week_id === week.id,
        );

        return {
          weekKey: week.week_key,
          fridayDate: week.friday_date,
          weeklyScore: result?.weekly_avg_score || 0,
          isComplete: result?.is_complete || false,
          computedAt: result?.computed_at,
          submissions: weekSubmissions.map((submission) => ({
            id: submission.id,
            totalScore: submission.total_score,
            comment: submission.comment,
            submittedAt: submission.submitted_at,
            criteriaScores: (submission.hrm_kpi_submission_items || []).map(
              (item: any) => ({
                criteriaId: item.criteria_id,
                criteriaName: item.hrm_criteria?.name || "Unknown Criteria",
                score: item.score_raw,
              }),
            ),
          })),
        };
      });

    return NextResponse.json({
      monthKey,
      weeklyDetails,
    });
  } catch (error) {
    console.error("Error fetching employee weekly details:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch employee weekly details";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
