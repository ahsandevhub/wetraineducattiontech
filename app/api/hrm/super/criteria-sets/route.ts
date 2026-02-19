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
    .eq("profile_id", user.id)
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
    let usersQuery = supabase
      .from("hrm_users")
      .select("id, full_name, email, hrm_role")
      .in("hrm_role", ["ADMIN", "EMPLOYEE"])
      .order("full_name");

    if (search) {
      usersQuery = usersQuery.or(
        `full_name.ilike.%${search}%,email.ilike.%${search}%`,
      );
    }

    if (role && ["ADMIN", "EMPLOYEE"].includes(role)) {
      usersQuery = usersQuery.eq("hrm_role", role);
    }

    const { data: users, error: usersError } = await usersQuery;
    if (usersError) throw usersError;

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
    const result = users?.map((user) => ({
      userId: user.id,
      fullName: user.full_name,
      email: user.email,
      hasActiveCriteriaSet: activeSetsMap.has(user.id),
    }));

    return NextResponse.json({ subjects: result });
  } catch (error: any) {
    console.error("Error fetching criteria sets:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch criteria sets" },
      { status: 500 },
    );
  }
}
