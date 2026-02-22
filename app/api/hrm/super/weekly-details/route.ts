import { createClient } from "@/app/utils/supabase/server";
import {
  getMonthDateRange,
  listFridayWeekKeysForMonth,
} from "@/lib/hrm/week-utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
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
  const subjectUserId = searchParams.get("subjectUserId");
  const monthKey = searchParams.get("monthKey");

  if (!subjectUserId || !monthKey) {
    return NextResponse.json(
      { error: "subjectUserId and monthKey are required" },
      { status: 400 },
    );
  }

  try {
    // Get month dates and get all Friday week keys for this month
    getMonthDateRange(monthKey); // Validates monthKey format
    const weekKeys = listFridayWeekKeysForMonth(monthKey);

    // Get weekly results for subject for all weeks in month
    const { data: weeks } = await supabase
      .from("hrm_weeks")
      .select("id, week_key, friday_date")
      .in("week_key", weekKeys);

    const weekIds = (weeks || []).map((w) => w.id);

    // Get submissions for this subject in all weeks of the month
    const { data: submissions } = await supabase
      .from("hrm_kpi_submissions")
      .select(
        `
        id,
        week_id,
        total_score,
        comment,
        submitted_at,
        marker_admin:hrm_users!hrm_kpi_submissions_marker_admin_id_fkey(
          id,
          full_name,
          email
        ),
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
      .eq("subject_user_id", subjectUserId)
      .in("week_id", weekIds)
      .order("submitted_at", { ascending: false });

    // Get weekly results
    const { data: weeklyResults } = await supabase
      .from("hrm_weekly_results")
      .select("week_id, weekly_avg_score, is_complete, computed_at")
      .eq("subject_user_id", subjectUserId)
      .in("week_id", weekIds);

    // Group submissions by week
    const submissionsByWeek = new Map<string, any[]>();
    for (const sub of submissions || []) {
      const weekKey = (weeks || []).find((w) => w.id === sub.week_id)?.week_key;
      if (weekKey) {
        if (!submissionsByWeek.has(weekKey)) {
          submissionsByWeek.set(weekKey, []);
        }
        submissionsByWeek.get(weekKey)!.push(sub);
      }
    }

    // Build weekly details
    const weeklyDetails = (weeks || [])
      .sort((a, b) => a.friday_date.localeCompare(b.friday_date))
      .map((week) => {
        const subs = submissionsByWeek.get(week.week_key) || [];
        const result = weeklyResults?.find((r) => r.week_id === week.id);

        return {
          weekKey: week.week_key,
          fridayDate: week.friday_date,
          weeklyScore: result?.weekly_avg_score || 0,
          isComplete: result?.is_complete || false,
          computedAt: result?.computed_at,
          submissions: subs.map((sub) => ({
            id: sub.id,
            markerName: sub.marker_admin.full_name,
            markerEmail: sub.marker_admin.email,
            totalScore: sub.total_score,
            comment: sub.comment,
            submittedAt: sub.submitted_at,
            criteriaScores: (sub.hrm_kpi_submission_items || []).map(
              (item: any) => ({
                criteriaId: item.criteria_id,
                criteriaName: item.hrm_criteria.name,
                score: item.score_raw,
              }),
            ),
          })),
        };
      });

    return NextResponse.json({
      subjectUserId,
      monthKey,
      weeklyDetails,
    });
  } catch (error) {
    console.error("Error fetching weekly details:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch weekly details";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
