import { createClient } from "@/app/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

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
    .select("hrm_role")
    .eq("id", user.id)
    .single();

  if (!hrmUser || hrmUser.hrm_role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const monthKey = searchParams.get("monthKey");

  if (!monthKey) {
    return NextResponse.json(
      { error: "monthKey is required (format: YYYY-MM)" },
      { status: 400 },
    );
  }

  try {
    // Update month status to OPEN
    const { data, error } = await supabase
      .from("hrm_months")
      .update({ status: "OPEN", updated_at: new Date().toISOString() })
      .eq("month_key", monthKey)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json({ error: "Month not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      monthKey,
      status: "OPEN",
      message: `Month ${monthKey} has been unlocked`,
    });
  } catch (error) {
    console.error("Error unlocking month:", error);
    const message =
      error instanceof Error ? error.message : "Failed to unlock month";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

