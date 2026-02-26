import { createClient } from "@/app/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// POST /api/hrm/super/weeks/[weekKey]/unlock - Unlock a week
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ weekKey: string }> },
) {
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

  try {
    const { weekKey } = await context.params;

    // Update week status to OPEN
    const { data, error } = await supabase
      .from("hrm_weeks")
      .update({ status: "OPEN", updated_at: new Date().toISOString() })
      .eq("week_key", weekKey)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json({ error: "Week not found" }, { status: 404 });
    }

    return NextResponse.json({
      week: data,
      message: "Week unlocked successfully",
    });
  } catch (error: any) {
    console.error("Error unlocking week:", error);
    return NextResponse.json(
      { error: error.message || "Failed to unlock week" },
      { status: 500 },
    );
  }
}
