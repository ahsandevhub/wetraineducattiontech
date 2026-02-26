import { createClient } from "@/app/utils/supabase/server";
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

  // Check ADMIN role
  const { data: hrmUser } = await supabase
    .from("hrm_users")
    .select("id, hrm_role")
    .eq("id", user.id)
    .single();

  if (!hrmUser || hrmUser.hrm_role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const monthKey = searchParams.get("monthKey");

  if (!monthKey) {
    return NextResponse.json(
      { error: "monthKey is required" },
      { status: 400 },
    );
  }

  try {
    // Get all weeks for this month
    const { data: weeks, error: weeksError } = await supabase
      .from("hrm_weeks")
      .select("id, week_key, friday_date, status")
      .gte("week_key", `${monthKey}-01`)
      .lt("week_key", getNextMonthKey(monthKey))
      .order("week_key", { ascending: true });

    if (weeksError) throw weeksError;

    if (!weeks || weeks.length === 0) {
      return NextResponse.json({
        monthKey,
        weeks: [],
        subjects: [],
      });
    }

    const weekIds = weeks.map((w) => w.id);

    // Get assigned subjects for this admin
    const { data: assignments, error: assignmentsError } = await supabase
      .from("hrm_assignments")
      .select(
        `
        id,
        subject_user_id,
        subject:hrm_users!hrm_assignments_subject_user_id_fkey(
          id,
          hrm_role
        )
      `,
      )
      .eq("marker_admin_id", hrmUser.id)
      .eq("is_active", true);

    if (assignmentsError) throw assignmentsError;

    // Enrich subjects with profile data
    const subjectUserIds = assignments?.map((a) => a.subject_user_id) || [];
    const { data: monthMarkingProfiles } = subjectUserIds.length
      ? await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", subjectUserIds)
      : { data: [] };
    const monthMarkingProfileMap = new Map(
      (monthMarkingProfiles || []).map((p) => [p.id, p]),
    );

    // Get active criteria sets for these subjects
    const { data: criteriaSets } = await supabase
      .from("hrm_subject_criteria_sets")
      .select("subject_user_id")
      .in("subject_user_id", subjectUserIds)
      .is("active_to", null);

    const subjectsWithCriteria = new Set(
      criteriaSets?.map((s) => s.subject_user_id) || [],
    );

    // Get ALL submissions for these weeks in one query (optimized)
    const { data: allSubmissions } = await supabase
      .from("hrm_kpi_submissions")
      .select("id, week_id, subject_user_id, total_score, submitted_at")
      .in("week_id", weekIds)
      .eq("marker_admin_id", hrmUser.id);

    // Group submissions by subject and week
    const submissionsBySubject = new Map<
      string,
      Map<number, { id: string; score: number | null; submittedAt: string }>
    >();

    allSubmissions?.forEach((sub) => {
      if (!submissionsBySubject.has(sub.subject_user_id)) {
        submissionsBySubject.set(sub.subject_user_id, new Map());
      }
      submissionsBySubject.get(sub.subject_user_id)!.set(sub.week_id, {
        id: sub.id,
        score: sub.total_score,
        submittedAt: sub.submitted_at,
      });
    });

    // Build response with weekly breakdowns
    const subjects = assignments?.map((assignment: any) => {
      const subjectWeekData = submissionsBySubject.get(
        assignment.subject_user_id,
      );

      const weekly = weeks.map((week) => {
        const submission = subjectWeekData?.get(week.id);
        return {
          weekKey: week.week_key,
          weekStatus: week.status,
          submissionStatus: submission ? "submitted" : "pending",
          submissionId: submission?.id || null,
          totalScore: submission?.score || null,
          submittedAt: submission?.submittedAt || null,
        };
      });

      // Determine overall status
      const allSubmitted = weekly.every(
        (w) => w.submissionStatus === "submitted",
      );
      const anySubmitted = weekly.some(
        (w) => w.submissionStatus === "submitted",
      );
      const overallStatus = allSubmitted
        ? "submitted"
        : anySubmitted
          ? "partial"
          : "pending";

      return {
        assignmentId: assignment.id,
        subjectUserId: assignment.subject_user_id,
        subjectName:
          monthMarkingProfileMap.get(assignment.subject_user_id)?.full_name ||
          null,
        subjectEmail:
          monthMarkingProfileMap.get(assignment.subject_user_id)?.email || null,
        subjectRole: assignment.subject?.hrm_role || null,
        hasActiveCriteriaSet: subjectsWithCriteria.has(
          assignment.subject_user_id,
        ),
        submissionStatus: overallStatus,
        weekly,
      };
    });

    return NextResponse.json({
      monthKey,
      weeks: weeks.map((w) => ({
        week_key: w.week_key,
        status: w.status,
      })),
      subjects: subjects || [],
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch monthly marking list";
    console.error("Error fetching monthly marking list:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Helper to get next month key
function getNextMonthKey(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  if (month === 12) {
    return `${year + 1}-01-01`;
  }
  return `${year}-${String(month + 1).padStart(2, "0")}-01`;
}
