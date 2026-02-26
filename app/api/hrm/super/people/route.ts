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
  const role = searchParams.get("role");
  const search = searchParams.get("search");
  // Note: is_active is no longer on hrm_users (dropped in schema simplification)
  // Users are fully removed from hrm_users when deactivated

  try {
    let hrmQuery = supabase
      .from("hrm_users")
      .select("id, hrm_role, created_at")
      .order("created_at", { ascending: false });

    if (role && ["SUPER_ADMIN", "ADMIN", "EMPLOYEE"].includes(role)) {
      hrmQuery = hrmQuery.eq("hrm_role", role);
    }

    const { data: hrmUsers, error } = await hrmQuery;
    if (error) throw error;

    if (!hrmUsers || hrmUsers.length === 0) {
      return NextResponse.json({ users: [] });
    }

    // Enrich with profile data (full_name, email from profiles table)
    const userIds = hrmUsers.map((u) => u.id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", userIds);

    const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

    let users = hrmUsers.map((u) => {
      const profile = profileMap.get(u.id);
      return {
        id: u.id,
        hrm_role: u.hrm_role,
        created_at: u.created_at,
        full_name: profile?.full_name || null,
        email: profile?.email || null,
      };
    });

    // Apply search filter after enrichment
    if (search) {
      const lowerSearch = search.toLowerCase();
      users = users.filter(
        (u) =>
          u.full_name?.toLowerCase().includes(lowerSearch) ||
          u.email?.toLowerCase().includes(lowerSearch),
      );
    }

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error("Error fetching people:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch people" },
      { status: 500 },
    );
  }
}
