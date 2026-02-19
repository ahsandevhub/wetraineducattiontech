/**
 * HRM Notification Helpers
 * Functions to create notifications for admins and employees
 */

import { getServiceSupabase } from "@/lib/supabase/server";

export type NotificationType =
  | "ADMIN_PENDING_MARKING"
  | "ADMIN_MISSED_MARKING"
  | "MONTH_RESULT_READY";

export type CreateNotificationParams = {
  userId: string; // auth.users.id (profile_id)
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
};

/**
 * Create a notification for a user
 * Uses service role to bypass RLS
 */
export async function createNotification(
  params: CreateNotificationParams,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getServiceSupabase();

    const { error } = await supabase.from("hrm_notifications").insert({
      user_id: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link,
      is_read: false,
    });

    if (error) {
      console.error("Error creating notification:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to create notification:", message);
    return { success: false, error: message };
  }
}

/**
 * Create notifications for admins with pending markings
 * Called from ensure-week cron
 */
export async function notifyAdminsPendingMarking(weekKey: string) {
  const supabase = getServiceSupabase();

  // Get all active assignments
  const { data: assignments } = await supabase
    .from("hrm_assignments")
    .select(
      `
      marker_admin_id,
      subject_user_id,
      hrm_users!hrm_assignments_marker_admin_id_fkey(profile_id, full_name)
    `,
    )
    .eq("is_active", true);

  if (!assignments || assignments.length === 0) return;

  // Get week ID
  const { data: week } = await supabase
    .from("hrm_weeks")
    .select("id")
    .eq("week_key", weekKey)
    .maybeSingle();

  if (!week) return;

  // Get existing submissions
  const { data: submissions } = await supabase
    .from("hrm_kpi_submissions")
    .select("marker_admin_id, subject_user_id")
    .eq("week_id", week.id);

  // Group by admin
  const adminAssignments = new Map<string, number>();
  const adminSubmissions = new Map<string, Set<string>>();

  for (const assignment of assignments) {
    const adminId = assignment.marker_admin_id;
    adminAssignments.set(adminId, (adminAssignments.get(adminId) || 0) + 1);
  }

  for (const submission of submissions || []) {
    if (!adminSubmissions.has(submission.marker_admin_id)) {
      adminSubmissions.set(submission.marker_admin_id, new Set());
    }
    adminSubmissions
      .get(submission.marker_admin_id)!
      .add(submission.subject_user_id);
  }

  // Create notifications for admins with pending items
  const notifications: CreateNotificationParams[] = [];

  for (const [adminId, expectedCount] of adminAssignments) {
    const submittedCount = adminSubmissions.get(adminId)?.size || 0;
    const pendingCount = expectedCount - submittedCount;

    if (pendingCount > 0) {
      // Get admin's auth user ID
      const { data: admin } = await supabase
        .from("hrm_users")
        .select("profile_id, full_name")
        .eq("id", adminId)
        .single();

      if (admin) {
        notifications.push({
          userId: admin.profile_id,
          type: "ADMIN_PENDING_MARKING",
          title: "Pending KPI Markings",
          message: `You have ${pendingCount} pending marking(s) for week ${weekKey}. Please submit before Friday end.`,
          link: "/dashboard/hrm/admin/marking",
        });
      }
    }
  }

  // Bulk insert notifications
  for (const notif of notifications) {
    await createNotification(notif);
  }

  return { created: notifications.length };
}

/**
 * Create notifications for admins who missed markings
 * Called from compute-last-friday cron
 */
export async function notifyAdminsMissedMarking(weekKey: string) {
  const supabase = getServiceSupabase();

  // Get week ID
  const { data: week } = await supabase
    .from("hrm_weeks")
    .select("id")
    .eq("week_key", weekKey)
    .maybeSingle();

  if (!week) return;

  // Get admin compliance records with missed submissions
  const { data: complianceRecords } = await supabase
    .from("hrm_admin_compliance")
    .select(
      `
      admin_user_id,
      missed_count,
      hrm_users!hrm_admin_compliance_admin_user_id_fkey(profile_id, full_name)
    `,
    )
    .eq("week_id", week.id)
    .gt("missed_count", 0);

  if (!complianceRecords || complianceRecords.length === 0) return;

  const notifications: CreateNotificationParams[] = [];

  for (const record of complianceRecords) {
    const admin = record.hrm_users as unknown as {
      profile_id: string;
      full_name: string;
    };

    notifications.push({
      userId: admin.profile_id,
      type: "ADMIN_MISSED_MARKING",
      title: "Missed KPI Markings",
      message: `You missed ${record.missed_count} marking(s) for week ${weekKey}. This may affect your compliance record.`,
      link: "/dashboard/hrm/admin/marking",
    });
  }

  // Bulk insert notifications
  for (const notif of notifications) {
    await createNotification(notif);
  }

  return { created: notifications.length };
}

/**
 * Create notifications for employees about monthly results
 * Called from compute-month cron
 */
export async function notifyEmployeesMonthResult(monthKey: string) {
  const supabase = getServiceSupabase();

  // Get month ID
  const { data: month } = await supabase
    .from("hrm_months")
    .select("id")
    .eq("month_key", monthKey)
    .maybeSingle();

  if (!month) return;

  // Get all monthly results for this month
  const { data: results } = await supabase
    .from("hrm_monthly_results")
    .select(
      `
      subject_user_id,
      tier,
      monthly_score,
      hrm_users!hrm_monthly_results_subject_user_id_fkey(profile_id, full_name)
    `,
    )
    .eq("month_id", month.id);

  if (!results || results.length === 0) return;

  const notifications: CreateNotificationParams[] = [];

  for (const result of results) {
    const employee = result.hrm_users as unknown as {
      profile_id: string;
      full_name: string;
    };

    const tierEmoji =
      result.tier === "BONUS"
        ? "🎁"
        : result.tier === "APPRECIATION"
          ? "⭐"
          : result.tier === "IMPROVEMENT"
            ? "📈"
            : "⚠️";

    notifications.push({
      userId: employee.profile_id,
      type: "MONTH_RESULT_READY",
      title: "Monthly KPI Results Ready",
      message: `Your ${monthKey} results are ready! ${tierEmoji} Tier: ${result.tier} | Score: ${result.monthly_score.toFixed(2)}`,
      link: "/dashboard/hrm/employee",
    });
  }

  // Bulk insert notifications
  for (const notif of notifications) {
    await createNotification(notif);
  }

  return { created: notifications.length };
}
