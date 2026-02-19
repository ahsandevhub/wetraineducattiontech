/**
 * PATCH /api/hrm/super/pending-profiles/[id]
 * Update a pending profile (toggle active, edit role/name)
 * SUPER_ADMIN only
 */

import { requireHrmSuperAdmin } from "@/app/utils/auth/require";
import { getServiceSupabase } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

type UpdatePayload = {
  fullName?: string;
  role?: "ADMIN" | "EMPLOYEE";
  isActive?: boolean;
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Security: Require SUPER_ADMIN role
    await requireHrmSuperAdmin();

    const { id } = await params;
    const body = (await request.json()) as UpdatePayload;

    // Validation
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    if (body.role && !["ADMIN", "EMPLOYEE"].includes(body.role)) {
      return NextResponse.json(
        { error: "role must be ADMIN or EMPLOYEE" },
        { status: 400 },
      );
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.fullName !== undefined) {
      updateData.full_name = body.fullName.trim();
    }
    if (body.role !== undefined) {
      updateData.desired_role = body.role;
    }
    if (body.isActive !== undefined) {
      updateData.is_active = body.isActive;
    }

    // Update pending profile
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("hrm_pending_profiles")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating pending profile:", error);
      return NextResponse.json(
        { error: "Failed to update pending profile" },
        { status: 500 },
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Pending profile not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/hrm/super/pending-profiles/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE - Optional delete endpoint
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Security: Require SUPER_ADMIN role
    await requireHrmSuperAdmin();

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    const { error } = await supabase
      .from("hrm_pending_profiles")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting pending profile:", error);
      return NextResponse.json(
        { error: "Failed to delete pending profile" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/hrm/super/pending-profiles/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
