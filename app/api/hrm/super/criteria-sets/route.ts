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
  const search = searchParams.get("search");
  const role = searchParams.get("role");

  try {
    // Get all users (admins + employees)
    let hrmUsersQuery = supabase
      .from("hrm_users")
      .select("id, hrm_role")
      .in("hrm_role", ["ADMIN", "EMPLOYEE"]);

    if (role && ["ADMIN", "EMPLOYEE"].includes(role)) {
      hrmUsersQuery = hrmUsersQuery.eq("hrm_role", role);
    }

    const { data: hrmUsers, error: usersError } = await hrmUsersQuery;
    if (usersError) throw usersError;

    if (!hrmUsers || hrmUsers.length === 0) {
      return NextResponse.json({ subjects: [] });
    }

    // Enrich with profile data
    const userIds = hrmUsers.map((u) => u.id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", userIds);

    const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

    // Get active criteria sets for all users
    const { data: activeSets, error: setsError } = await supabase
      .from("hrm_subject_criteria_sets")
      .select("subject_user_id, updated_at")
      .is("active_to", null);

    if (setsError) throw setsError;

    // Map active sets by subject user id
    const activeSetsMap = new Map(
      activeSets?.map((set) => [set.subject_user_id, set.updated_at]) || [],
    );

    // Combine data
    let result = hrmUsers.map((u) => {
      const profile = profileMap.get(u.id);
      return {
        userId: u.id,
        fullName: profile?.full_name || null,
        email: profile?.email || null,
        hasActiveCriteriaSet: activeSetsMap.has(u.id),
      };
    });

    // Apply search filter on enriched data
    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.fullName?.toLowerCase().includes(lowerSearch) ||
          u.email?.toLowerCase().includes(lowerSearch),
      );
    }

    // Sort by fullName
    result.sort((a, b) => (a.fullName || "").localeCompare(b.fullName || ""));

    return NextResponse.json({ subjects: result });
  } catch (error: any) {
    console.error("Error fetching criteria sets:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch criteria sets" },
      { status: 500 },
    );
  }
}
