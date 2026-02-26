import { createClient } from "@/app/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const searchQuery = request.nextUrl.searchParams.get("q") || "";

    if (!searchQuery.trim()) {
      return NextResponse.json([]);
    }

    const query = searchQuery.toLowerCase().trim();

    // Search from profiles table (has email, full_name linked to auth.users)
    const { data: users, error } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(10);

    if (error) {
      console.error("Search error:", error);
      return NextResponse.json(
        { error: "Failed to search users" },
        { status: 500 },
      );
    }

    // Transform to match expected format
    const formatted =
      users?.map((u) => ({
        id: u.id,
        fullName: u.full_name || "",
        email: u.email || "",
      })) || [];

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
