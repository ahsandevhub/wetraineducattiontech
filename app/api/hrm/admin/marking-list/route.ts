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
  const weekKey = searchParams.get("weekKey");

  if (!weekKey) {
    return NextResponse.json({ error: "weekKey is required" }, { status: 400 });
  }

  try {
    // Get week to verify it exists
    const { data: week } = await supabase
      .from("hrm_weeks")
      .select("id, friday_date, status")
      .eq("week_key", weekKey)
      .single();

    if (!week) {
      return NextResponse.json({ error: "Week not found" }, { status: 404 });
    }

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
    const { data: markingListProfiles } = subjectUserIds.length
      ? await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", subjectUserIds)
      : { data: [] };
    const markingProfileMap = new Map(
      (markingListProfiles || []).map((p) => [p.id, p]),
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

    // Get existing submissions for this week
    const { data: submissions } = await supabase
      .from("hrm_kpi_submissions")
      .select("id, subject_user_id, total_score, submitted_at")
      .eq("week_id", week.id)
      .eq("marker_admin_id", hrmUser.id);

    const submissionsMap = new Map(
      submissions?.map((s) => [s.subject_user_id, s]) || [],
    );

    // Build response
    const subjects = assignments?.map((assignment: any) => ({
      assignmentId: assignment.id,
      subjectUserId: assignment.subject_user_id,
      subjectName:
        markingProfileMap.get(assignment.subject_user_id)?.full_name || null,
      subjectEmail:
        markingProfileMap.get(assignment.subject_user_id)?.email || null,
      subjectRole: assignment.subject?.hrm_role || null,
      hasActiveCriteriaSet: subjectsWithCriteria.has(
        assignment.subject_user_id,
      ),
      submissionStatus: submissionsMap.has(assignment.subject_user_id)
        ? "submitted"
        : "pending",
      submissionId: submissionsMap.get(assignment.subject_user_id)?.id || null,
      totalScore:
        submissionsMap.get(assignment.subject_user_id)?.total_score || null,
      submittedAt:
        submissionsMap.get(assignment.subject_user_id)?.submitted_at || null,
    }));

    return NextResponse.json({
      weekKey,
      weekStatus: week.status,
      subjects: subjects || [],
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch marking list";
    console.error("Error fetching marking list:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
