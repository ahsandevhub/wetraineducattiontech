import { createClient } from "@/app/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
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
    const { data, error } = await supabase
      .from("hrm_criteria")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ criteria: data });
  } catch (error: any) {
    console.error("Error fetching criteria:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch criteria" },
      { status: 500 },
    );
  }
}

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

  if (hrmUser?.hrm_role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { key, name, defaultScaleMax, description } = body;

  // Validation
  if (!key || !name) {
    return NextResponse.json(
      { error: "Key and name are required" },
      { status: 400 },
    );
  }

  try {
    const { data, error } = await supabase
      .from("hrm_criteria")
      .insert({
        key,
        name,
        default_scale_max: defaultScaleMax || 10,
        description: description || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ criteria: data }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating criteria:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create criteria" },
      { status: 500 },
    );
  }
}

