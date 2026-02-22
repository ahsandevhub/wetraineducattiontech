import { createClient } from "@/app/utils/supabase/server";
import { getCurrentWeekKey } from "@/lib/hrm/week-utils";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  // Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check ADMIN or SUPER_ADMIN role
  const { data: hrmUser } = await supabase
    .from("hrm_users")
    .select("hrm_role")
    .eq("profile_id", user.id)
    .single();

  if (!hrmUser || !["ADMIN", "SUPER_ADMIN"].includes(hrmUser.hrm_role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const weekKey = getCurrentWeekKey();

    // Ensure week exists in database
    const { data: existingWeek } = await supabase
      .from("hrm_weeks")
      .select("*")
      .eq("week_key", weekKey)
      .single();

    if (!existingWeek) {
      // Create week with OPEN status
      const { data: newWeek, error: createError } = await supabase
        .from("hrm_weeks")
        .insert({
          week_key: weekKey,
          friday_date: new Date(weekKey).toISOString().split("T")[0],
          status: "OPEN",
        })
        .select()
        .single();

      if (createError) throw createError;

      return NextResponse.json({
        weekKey,
        fridayDate: weekKey,
        status: newWeek.status,
        isLocked: false,
      });
    }

    return NextResponse.json({
      weekKey,
      fridayDate: weekKey,
      status: existingWeek.status,
      isLocked: existingWeek.status === "LOCKED",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to get current week";
    console.error("Error getting current week:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
