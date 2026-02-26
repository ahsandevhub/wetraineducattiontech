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
    .select("hrm_role")
    .eq("id", user.id)
    .single();

  if (hrmUser?.hrm_role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get query params
  const searchParams = request.nextUrl.searchParams;
  const markerAdminId = searchParams.get("markerAdminId");
  const subjectUserId = searchParams.get("subjectUserId");
  const active = searchParams.get("active");

  try {
    let query = supabase
      .from("hrm_assignments")
      .select(
        `
        id,
        marker_admin_id,
        subject_user_id,
        is_active,
        created_at,
        markerAdmin:hrm_users!hrm_assignments_marker_admin_id_fkey(id, hrm_role),
        subjectUser:hrm_users!hrm_assignments_subject_user_id_fkey(id, hrm_role)
      `,
      )
      .order("created_at", { ascending: false });

    if (markerAdminId) {
      query = query.eq("marker_admin_id", markerAdminId);
    }

    if (subjectUserId) {
      query = query.eq("subject_user_id", subjectUserId);
    }

    if (active !== null) {
      query = query.eq("is_active", active === "true");
    }

    const { data, error } = await query;

    if (error) throw error;

    // Enrich with profile data (names/emails from profiles table)
    const allUserIds = [
      ...new Set(
        (data || []).flatMap((a: any) => [
          a.marker_admin_id,
          a.subject_user_id,
        ]),
      ),
    ];
    const { data: profiles } = allUserIds.length
      ? await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", allUserIds)
      : { data: [] };
    const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

    // Transform data to match expected format
    const transformed = data?.map((assignment: any) => ({
      id: assignment.id,
      marker_admin_id: assignment.marker_admin_id,
      subject_user_id: assignment.subject_user_id,
      is_active: assignment.is_active,
      created_at: assignment.created_at,
      marker: {
        id: assignment.markerAdmin?.id,
        hrm_role: assignment.markerAdmin?.hrm_role,
        full_name:
          profileMap.get(assignment.marker_admin_id)?.full_name || null,
        email: profileMap.get(assignment.marker_admin_id)?.email || null,
      },
      subject: {
        id: assignment.subjectUser?.id,
        hrm_role: assignment.subjectUser?.hrm_role,
        full_name:
          profileMap.get(assignment.subject_user_id)?.full_name || null,
        email: profileMap.get(assignment.subject_user_id)?.email || null,
      },
    }));

    return NextResponse.json({ assignments: transformed });
  } catch (error: any) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch assignments" },
      { status: 500 },
    );
  }
}

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
    .select("id, hrm_role")
    .eq("id", user.id)
    .single();

  if (hrmUser?.hrm_role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { markerAdminId, subjectUserIds } = body;

  // Validation
  if (!markerAdminId || !subjectUserIds || !Array.isArray(subjectUserIds)) {
    return NextResponse.json(
      { error: "markerAdminId and subjectUserIds (array) are required" },
      { status: 400 },
    );
  }

  if (subjectUserIds.length === 0) {
    return NextResponse.json(
      { error: "At least one subject user is required" },
      { status: 400 },
    );
  }

  try {
    let createdCount = 0;
    let skippedCount = 0;

    for (const subjectUserId of subjectUserIds) {
      // Try to insert, skip if duplicate
      const { error } = await supabase.from("hrm_assignments").insert({
        marker_admin_id: markerAdminId,
        subject_user_id: subjectUserId,
        is_active: true,
        created_by_id: hrmUser.id,
      });

      if (error) {
        // If unique constraint violation, skip
        if (error.code === "23505") {
          skippedCount++;
        } else {
          throw error;
        }
      } else {
        createdCount++;
      }
    }

    return NextResponse.json({
      createdCount,
      skippedCount,
      total: subjectUserIds.length,
    });
  } catch (error: any) {
    console.error("Error creating assignments:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create assignments" },
      { status: 500 },
    );
  }
}
