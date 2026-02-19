/**
 * /api/hrm/super/pending-profiles
 * CRUD endpoints for pending HRM profiles
 * SUPER_ADMIN only
 */

import { requireHrmSuperAdmin } from "@/app/utils/auth/require";
import { getServiceSupabase } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

type PendingProfilePayload = {
  email: string;
  fullName: string;
  role: "ADMIN" | "EMPLOYEE";
  isActive?: boolean;
};

/**
 * GET - List pending profiles with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    // Security: Require SUPER_ADMIN role
    await requireHrmSuperAdmin();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const roleFilter = searchParams.get("role") || "";
    const activeFilter = searchParams.get("active") || "";

    const supabase = getServiceSupabase();
    let query = supabase
      .from("hrm_pending_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    // Apply search filter (email or full_name)
    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    // Apply role filter
    if (roleFilter && ["ADMIN", "EMPLOYEE"].includes(roleFilter)) {
      query = query.eq("desired_role", roleFilter);
    }

    // Apply active filter
    if (activeFilter === "true") {
      query = query.eq("is_active", true);
    } else if (activeFilter === "false") {
      query = query.eq("is_active", false);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching pending profiles:", error);
      return NextResponse.json(
        { error: "Failed to fetch pending profiles" },
        { status: 500 },
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("GET /api/hrm/super/pending-profiles error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST - Create or update pending profile
 */

export async function POST(request: NextRequest) {
  try {
    // Security: Require SUPER_ADMIN role
    const currentUser = await requireHrmSuperAdmin();

    const body = (await request.json()) as PendingProfilePayload;
    const { email, fullName, role, isActive = true } = body;

    // Validation
    if (!email || !fullName || !role) {
      return NextResponse.json(
        { error: "email, fullName, and role are required" },
        { status: 400 },
      );
    }

    if (!["ADMIN", "EMPLOYEE"].includes(role)) {
      return NextResponse.json(
        { error: "role must be ADMIN or EMPLOYEE" },
        { status: 400 },
      );
    }

    // Normalize email to lowercase
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    // Upsert pending profile
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("hrm_pending_profiles")
      .upsert(
        {
          email: normalizedEmail,
          full_name: fullName.trim(),
          desired_role: role,
          is_active: isActive,
          created_by: currentUser.userId,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "email",
          ignoreDuplicates: false,
        },
      )
      .select()
      .single();

    if (error) {
      console.error("Error upserting pending profile:", error);
      return NextResponse.json(
        { error: "Failed to create pending profile" },
        { status: 500 },
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("POST /api/hrm/super/pending-profiles error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
