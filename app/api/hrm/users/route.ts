import { createClient } from "@/app/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  // Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get query parameters
  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role");

  try {
    if (!role || (role !== "ADMIN" && role !== "USER")) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const { data: users, error } = await supabase
      .from("hrm_users")
      .select("id, full_name")
      .eq("hrm_role", role)
      .order("full_name");

    if (error) {
      throw error;
    }

    return NextResponse.json({ users: users || [] });
  } catch (error) {
    console.error("[HRM Users] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch users",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
