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
    .eq("profile_id", user.id)
    .single();

  if (hrmUser?.hrm_role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { name, defaultScaleMax, description } = body;

  try {
    const updateData: any = {};
    if (name) updateData.name = name;
    if (defaultScaleMax) updateData.default_scale_max = defaultScaleMax;
    if (description !== undefined) updateData.description = description;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("hrm_criteria")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ criteria: data });
  } catch (error: any) {
    console.error("Error updating criteria:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update criteria" },
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
    .eq("profile_id", user.id)
    .single();

  if (hrmUser?.hrm_role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    // Check if criteria is in use
    const { count } = await supabase
      .from("hrm_subject_criteria_items")
      .select("*", { count: "exact", head: true })
      .eq("criteria_id", id);

    if (count && count > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete criteria: it is used in ${count} subject criteria set(s)`,
        },
        { status: 400 },
      );
    }

    // Delete criteria
    const { error } = await supabase.from("hrm_criteria").delete().eq("id", id);

    if (error) throw error;

    return NextResponse.json({ message: "Criteria deleted" });
  } catch (error: any) {
    console.error("Error deleting criteria:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete criteria" },
      { status: 500 },
    );
  }
}
