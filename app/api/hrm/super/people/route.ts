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
  const role = searchParams.get("role");
  const active = searchParams.get("active");
  const search = searchParams.get("search");

  try {
    let query = supabase
      .from("hrm_users")
      .select("*")
      .order("created_at", { ascending: false });

    if (role && ["SUPER_ADMIN", "ADMIN", "EMPLOYEE"].includes(role)) {
      query = query.eq("hrm_role", role);
    }

    if (active !== null) {
      query = query.eq("is_active", active === "true");
    }

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ users: data });
  } catch (error: any) {
    console.error("Error fetching people:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch people" },
      { status: 500 },
    );
  }
}
