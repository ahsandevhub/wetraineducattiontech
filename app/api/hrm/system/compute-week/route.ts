import { createClient } from "@/app/utils/supabase/server";
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
  const weekKey = searchParams.get("weekKey");

  if (!weekKey) {
    return NextResponse.json({ error: "weekKey is required" }, { status: 400 });
  }

  try {
    // Get week
    const { data: week } = await supabase
      .from("hrm_weeks")
      .select("id")
      .eq("week_key", weekKey)
      .single();

    if (!week) {
      return NextResponse.json({ error: "Week not found" }, { status: 404 });
    }

    // Get all submissions for this week
    const { data: submissions } = await supabase
      .from("hrm_kpi_submissions")
      .select("subject_user_id, marker_admin_id, total_score")
      .eq("week_id", week.id);

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

    // Get all subjects with active assignments
    const { data: assignments } = await supabase
      .from("hrm_assignments")
      .select("subject_user_id, marker_admin_id")
      .eq("is_active", true);

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

    // Compute weekly results for each subject
    const weeklyResults = [];
    const allSubjectIds = new Set([
      ...subjectSubmissions.keys(),
      ...subjectMarkers.keys(),
    ]);

    for (const subjectUserId of allSubjectIds) {
      const subs = subjectSubmissions.get(subjectUserId) || [];
      const expectedMarkers = subjectMarkers.get(subjectUserId) || new Set();

      const weeklyAvgScore =
        subs.length > 0
          ? subs.reduce((sum, s) => sum + s.totalScore, 0) / subs.length
          : 0;

      const expectedMarkersCount = expectedMarkers.size;
      const submittedMarkersCount = subs.length;
      const isComplete = submittedMarkersCount >= expectedMarkersCount;

      weeklyResults.push({
        week_id: week.id,
        subject_user_id: subjectUserId,
        weekly_avg_score: Math.round(weeklyAvgScore * 100) / 100,
        expected_markers_count: expectedMarkersCount,
        submitted_markers_count: submittedMarkersCount,
        is_complete: isComplete,
      });
    }

    // Upsert weekly results
    if (weeklyResults.length > 0) {
      const { error: resultsError } = await supabase
        .from("hrm_weekly_results")
        .upsert(weeklyResults, {
          onConflict: "week_id,subject_user_id",
        });

      if (resultsError) throw resultsError;
    }

    // Compute admin compliance
    const adminAssignments = new Map<string, Set<string>>();
    for (const assignment of assignments || []) {
      if (!adminAssignments.has(assignment.marker_admin_id)) {
        adminAssignments.set(assignment.marker_admin_id, new Set());
      }
      adminAssignments
        .get(assignment.marker_admin_id)!
        .add(assignment.subject_user_id);
    }

    const adminSubmissions = new Map<string, Set<string>>();
    for (const sub of submissions || []) {
      if (!adminSubmissions.has(sub.marker_admin_id)) {
        adminSubmissions.set(sub.marker_admin_id, new Set());
      }
      adminSubmissions.get(sub.marker_admin_id)!.add(sub.subject_user_id);
    }

    const complianceRecords = [];
    for (const [adminId, expectedSubjects] of adminAssignments) {
      const submittedSubjects = adminSubmissions.get(adminId) || new Set();
      const expectedCount = expectedSubjects.size;
      const submittedCount = submittedSubjects.size;
      const missedCount = Math.max(0, expectedCount - submittedCount);

      complianceRecords.push({
        week_id: week.id,
        admin_user_id: adminId,
        expected_count: expectedCount,
        submitted_count: submittedCount,
        missed_count: missedCount,
        status: missedCount === 0 ? "OK" : "MISSED",
      });
    }

    // Upsert compliance records
    if (complianceRecords.length > 0) {
      const { error: complianceError } = await supabase
        .from("hrm_admin_compliance")
        .upsert(complianceRecords, {
          onConflict: "week_id,admin_user_id",
        });

      if (complianceError) throw complianceError;
    }

    return NextResponse.json({
      weekKey,
      subjectsComputed: weeklyResults.length,
      adminsComputed: complianceRecords.length,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to compute week";
    console.error("Error computing week:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
