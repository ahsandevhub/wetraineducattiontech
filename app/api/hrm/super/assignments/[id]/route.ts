import { createClient } from "@/app/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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

  const { id } = await params;
  const body = await request.json();
  const { isActive } = body;

  if (typeof isActive !== "boolean") {
    return NextResponse.json(
      { error: "isActive (boolean) is required" },
      { status: 400 },
    );
  }

  try {
    const { data, error } = await supabase
      .from("hrm_assignments")
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ assignment: data });
  } catch (error: any) {
    console.error("Error updating assignment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update assignment" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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

  const { id } = await params;

  try {
    const { error } = await supabase
      .from("hrm_assignments")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ message: "Assignment deleted" });
  } catch (error: any) {
    console.error("Error deleting assignment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete assignment" },
      { status: 500 },
    );
  }
}
