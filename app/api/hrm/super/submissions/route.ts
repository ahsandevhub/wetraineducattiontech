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
  const search = searchParams.get("search") || "";

  try {
    // Build query
    let query = supabase
      .from("hrm_kpi_submissions")
      .select(
        `
        id,
        total_score,
        comment,
        submitted_at,
        marker_admin_id,
        subject_user_id,
        week_id,
        hrm_weeks!inner(
          id,
          week_key,
          friday_date,
          status
        ),
        marker_admin:hrm_users!hrm_kpi_submissions_marker_admin_id_fkey(
          id,
          hrm_role
        ),
        subject:hrm_users!hrm_kpi_submissions_subject_user_id_fkey(
          id,
          hrm_role
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
      .order("submitted_at", { ascending: false });

    // Apply weekKey filter if provided
    if (weekKey) {
      query = query.eq("hrm_weeks.week_key", weekKey);
    }

    // Apply markerAdminId filter if provided
    if (markerAdminId) {
      query = query.eq("marker_admin_id", markerAdminId);
    }

    // Apply subjectUserId filter if provided
    if (subjectUserId) {
      query = query.eq("subject_user_id", subjectUserId);
    }

    const { data: submissions, error } = await query;

    if (error) throw error;

    // Enrich with profile data (names/emails)
    const allUserIds = [
      ...new Set([
        ...(submissions || [])
          .map((s: any) => s.marker_admin_id)
          .filter(Boolean),
        ...(submissions || [])
          .map((s: any) => s.subject_user_id)
          .filter(Boolean),
      ]),
    ];
    const { data: subProfiles } = allUserIds.length
      ? await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", allUserIds)
      : { data: [] };
    const subProfileMap = new Map(
      (subProfiles || []).map((p: any) => [p.id, p]),
    );

    // Filter by month if monthKey provided
    let filteredSubmissions = submissions || [];
    if (monthKey && filteredSubmissions.length > 0) {
      filteredSubmissions = filteredSubmissions.filter((sub: any) => {
        const weekKeyValue = sub.hrm_weeks.week_key;
        const subMonthKey = weekKeyValue.substring(0, 7); // Extract YYYY-MM
        return subMonthKey === monthKey;
      });
    }

    // Apply search filter (admin name or subject name)
    if (search && filteredSubmissions.length > 0) {
      const searchLower = search.toLowerCase();
      filteredSubmissions = filteredSubmissions.filter((sub: any) => {
        const adminName =
          subProfileMap.get(sub.marker_admin_id)?.full_name?.toLowerCase() ||
          "";
        const subjectName =
          subProfileMap.get(sub.subject_user_id)?.full_name?.toLowerCase() ||
          "";
        return (
          adminName.includes(searchLower) || subjectName.includes(searchLower)
        );
      });
    }

    // Format response
    const formattedSubmissions = filteredSubmissions.map((sub: any) => ({
      id: sub.id,
      weekKey: sub.hrm_weeks.week_key,
      weekFridayDate: sub.hrm_weeks.friday_date,
      weekStatus: sub.hrm_weeks.status,
      markerAdmin: {
        id: sub.marker_admin?.id,
        fullName: subProfileMap.get(sub.marker_admin_id)?.full_name || null,
        email: subProfileMap.get(sub.marker_admin_id)?.email || null,
      },
      subject: {
        id: sub.subject?.id,
        fullName: subProfileMap.get(sub.subject_user_id)?.full_name || null,
        email: subProfileMap.get(sub.subject_user_id)?.email || null,
        role: sub.subject?.hrm_role || null,
      },
      totalScore: sub.total_score,
      comment: sub.comment,
      submittedAt: sub.submitted_at,
      items: sub.hrm_kpi_submission_items.map((item: any) => ({
        id: item.id,
        criteriaId: item.criteria_id,
        criteriaKey: item.hrm_criteria.key,
        criteriaName: item.hrm_criteria.name,
        scoreRaw: item.score_raw,
      })),
    }));

    return NextResponse.json({
      submissions: formattedSubmissions,
      count: formattedSubmissions.length,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch submissions";
    console.error("Error fetching submissions:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
