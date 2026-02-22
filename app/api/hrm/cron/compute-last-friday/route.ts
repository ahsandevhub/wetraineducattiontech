/**
 * POST /api/hrm/cron/compute-last-friday
 * Cron endpoint: Compute KPI for most recent Friday
 *
 * Authentication: Requires X-CRON-SECRET header
 * Idempotent: Safe to call multiple times (upsert logic)
 * Timezone: Uses Asia/Dhaka for determining current Friday
 *
 * Logic:
 * - Determines most recent Friday (today if Friday, else previous Friday)
 * - Skips if week is LOCKED (unless ?force=true)
 * - Calls existing compute-week logic
 *
 * Schedule: Run every Friday at 23:30 Dhaka time (17:30 UTC)
 */

import { createClient } from "@/app/utils/supabase/server";
import { verifyCronSecret } from "@/lib/hrm/cron-auth";
import { notifyAdminsMissedMarking } from "@/lib/hrm/notification-helpers";
import {
  getCurrentFridayDate,
  getWeekKeyFromFridayDate,
} from "@/lib/hrm/week-utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Verify cron secret
  const authError = verifyCronSecret(request);
  if (authError) return authError;

  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const force = searchParams.get("force") === "true";

    // Determine most recent Friday in Dhaka timezone
    const fridayDate = getCurrentFridayDate();
    const weekKey = getWeekKeyFromFridayDate(fridayDate);

    // Get week
    const { data: week } = await supabase
      .from("hrm_weeks")
      .select("id, status")
      .eq("week_key", weekKey)
      .maybeSingle();

    if (!week) {
      return NextResponse.json(
        {
          error: "Week not found",
          weekKey,
          message: `Week ${weekKey} does not exist. Run ensure-week first.`,
        },
        { status: 404 },
      );
    }

    // Check if locked
    if (week.status === "LOCKED" && !force) {
      return NextResponse.json({
        success: true,
        action: "skipped",
        weekKey,
        status: "LOCKED",
        message: `Week ${weekKey} is locked. Use ?force=true to recompute.`,
      });
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
        computed_at: new Date().toISOString(),
      });
    }

    // Upsert weekly results
    if (weeklyResults.length > 0) {
      const { error: resultsError } = await supabase
        .from("hrm_weekly_results")
        .upsert(weeklyResults, {
          onConflict: "week_id,subject_user_id",
        });

      if (resultsError) {
        console.error("Error upserting weekly results:", resultsError);
        throw resultsError;
      }
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

      if (complianceError) {
        console.error("Error upserting compliance:", complianceError);
        throw complianceError;
      }
    }

    // Notify admins who missed markings
    await notifyAdminsMissedMarking(weekKey);

    return NextResponse.json({
      success: true,
      action: "computed",
      weekKey,
      subjectsComputed: weeklyResults.length,
      adminsComputed: complianceRecords.length,
      message: `Week ${weekKey} computed successfully`,
    });
  } catch (error) {
    console.error("Cron compute-last-friday error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to compute week", details: message },
      { status: 500 },
    );
  }
}
