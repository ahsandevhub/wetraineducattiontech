import { createClient } from "@/app/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

type PendingSubmission = {
  weekKey: string;
  fridayDate: string;
  markerAdminId: string;
  markerName: string;
  markerEmail: string;
  subjectUserId: string;
  subjectName: string;
  subjectEmail: string;
  daysOverdue: number;
};

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
    .select("id, hrm_role")
    .eq("id", user.id)
    .single();

  if (!hrmUser || hrmUser.hrm_role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get query parameters
  const { searchParams } = new URL(request.url);
  const monthKey = searchParams.get("monthKey");
  const weekKey = searchParams.get("weekKey");
  const markerAdminId = searchParams.get("markerAdminId");
  const subjectUserId = searchParams.get("subjectUserId");

  try {
    // Get today's date for finding past deadlines
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all past weeks (past deadline)
    let pastWeeksQuery = supabase
      .from("hrm_weeks")
      .select("id, week_key, friday_date")
      .lt("friday_date", today.toISOString());

    // Apply monthKey filter if provided
    if (monthKey) {
      pastWeeksQuery = pastWeeksQuery.filter(
        "week_key",
        "ilike",
        `${monthKey}-%`,
      );
    }

    // Apply weekKey filter if provided
    if (weekKey) {
      pastWeeksQuery = pastWeeksQuery.eq("week_key", weekKey);
    }

    const { data: pastWeeks, error: pastWeeksError } = await pastWeeksQuery;

    if (pastWeeksError) {
      console.error(
        "[Pending Submissions] Error fetching past weeks:",
        pastWeeksError,
      );
      throw pastWeeksError;
    }

    if (!pastWeeks || pastWeeks.length === 0) {
      return NextResponse.json({
        pendingCount: 0,
        submissions: [],
        message: "No past weeks found matching filters",
      });
    }

    const weekIds = pastWeeks.map((w) => w.id);

    // Get all active assignments
    let assignmentsQuery = supabase
      .from("hrm_assignments")
      .select("id, marker_admin_id, subject_user_id")
      .eq("is_active", true);

    // Apply marker filter if provided
    if (markerAdminId) {
      assignmentsQuery = assignmentsQuery.eq("marker_admin_id", markerAdminId);
    }

    // Apply subject filter if provided
    if (subjectUserId) {
      assignmentsQuery = assignmentsQuery.eq("subject_user_id", subjectUserId);
    }

    const { data: assignments, error: assignmentsError } =
      await assignmentsQuery;

    if (assignmentsError) {
      console.error(
        "[Pending Submissions] Error fetching assignments:",
        assignmentsError,
      );
      throw assignmentsError;
    }

    if (!assignments || assignments.length === 0) {
      return NextResponse.json({
        pendingCount: 0,
        submissions: [],
        message: "No active assignments found",
      });
    }

    // Get all submissions for these combinations (week + marker + subject)
    const { data: submissions, error: submissionsError } = await supabase
      .from("hrm_kpi_submissions")
      .select(
        `
        id,
        week_id,
        marker_admin_id,
        subject_user_id
      `,
      )
      .in("week_id", weekIds);

    if (submissionsError) {
      console.error(
        "[Pending Submissions] Error fetching submissions:",
        submissionsError,
      );
      throw submissionsError;
    }

    // Build a set of existing submission combinations
    const submittedCombos = new Set<string>();
    if (submissions) {
      submissions.forEach((sub) => {
        submittedCombos.add(
          `${sub.week_id}|${sub.marker_admin_id}|${sub.subject_user_id}`,
        );
      });
    }

    // Find pending submissions (assignments without submissions)
    const pendingList: PendingSubmission[] = [];
    const markerNameMap = new Map<string, string>();
    const markerEmailMap = new Map<string, string>();
    const subjectNameMap = new Map<string, string>();
    const subjectEmailMap = new Map<string, string>();

    // Fetch marker and subject emails
    const markerIds = [...new Set(assignments.map((a) => a.marker_admin_id))];
    const subjectIds = [...new Set(assignments.map((a) => a.subject_user_id))];

    if (markerIds.length > 0) {
      const { data: markerProfiles, error: markerEmailError } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", markerIds);

      if (markerEmailError) {
        console.error(
          "[Pending Submissions] Error fetching marker emails:",
          markerEmailError,
        );
      } else if (markerProfiles) {
        markerProfiles.forEach((p) => {
          markerNameMap.set(p.id, p.full_name || "Unknown");
          markerEmailMap.set(p.id, p.email || "");
        });
      }
    }

    if (subjectIds.length > 0) {
      const { data: subjectProfiles, error: subjectEmailError } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", subjectIds);

      if (subjectEmailError) {
        console.error(
          "[Pending Submissions] Error fetching subject emails:",
          subjectEmailError,
        );
      } else if (subjectProfiles) {
        subjectProfiles.forEach((p) => {
          subjectNameMap.set(p.id, p.full_name || "Unknown");
          subjectEmailMap.set(p.id, p.email || "");
        });
      }
    }

    // Build pending list
    for (const week of pastWeeks) {
      for (const assignment of assignments) {
        const comboKey = `${week.id}|${assignment.marker_admin_id}|${assignment.subject_user_id}`;
        if (!submittedCombos.has(comboKey)) {
          const fridayDate = new Date(week.friday_date);
          const daysOverdue = Math.floor(
            (today.getTime() - fridayDate.getTime()) / (1000 * 60 * 60 * 24),
          );

          pendingList.push({
            weekKey: week.week_key,
            fridayDate: week.friday_date,
            markerAdminId: assignment.marker_admin_id,
            markerName:
              markerNameMap.get(assignment.marker_admin_id) || "Unknown",
            markerEmail: markerEmailMap.get(assignment.marker_admin_id) || "",
            subjectUserId: assignment.subject_user_id,
            subjectName:
              subjectNameMap.get(assignment.subject_user_id) || "Unknown",
            subjectEmail: subjectEmailMap.get(assignment.subject_user_id) || "",
            daysOverdue,
          });
        }
      }
    }

    // Sort by daysOverdue descending (most overdue first)
    pendingList.sort((a, b) => b.daysOverdue - a.daysOverdue);

    return NextResponse.json({
      pendingCount: pendingList.length,
      submissions: pendingList,
    });
  } catch (error) {
    console.error("[Pending Submissions] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch pending submissions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
