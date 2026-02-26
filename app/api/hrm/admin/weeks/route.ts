import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";

// GET /api/hrm/admin/weeks - List all weeks for admin
export async function GET() {
  const supabase = await createClient();

  // Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check ADMIN role
  const { data: hrmUser } = await supabase
    .from("hrm_users")
    .select("hrm_role")
    .eq("id", user.id)
    .single();

  if (!hrmUser || hrmUser.hrm_role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Fetch all weeks ordered by friday_date descending
    const { data, error } = await supabase
      .from("hrm_weeks")
      .select("week_key, friday_date, status")
      .order("friday_date", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ weeks: data || [] });
  } catch (error: any) {
    console.error("Error fetching weeks:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch weeks" },
      { status: 500 },
    );
  }
}
