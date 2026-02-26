import { createClient } from "@/app/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
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

  const { userId } = await params;
  const body = await request.json();
  const { hrmRole } = body;
  // Note: isActive is no longer supported - hrm_users no longer has is_active column
  // To deactivate a user, remove them from hrm_users entirely

  try {
    const updateData: any = {};
    if (hrmRole && ["SUPER_ADMIN", "ADMIN", "EMPLOYEE"].includes(hrmRole)) {
      updateData.hrm_role = hrmRole;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("hrm_users")
      .update(updateData)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ user: data });
  } catch (error: any) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update user" },
      { status: 500 },
    );
  }
}
