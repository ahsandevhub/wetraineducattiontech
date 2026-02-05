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

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const searchQuery = request.nextUrl.searchParams.get("q") || "";

    if (!searchQuery.trim()) {
      return NextResponse.json([]);
    }

    const query = searchQuery.toLowerCase().trim();

    // Search by name or email with max 5 results
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("role", "customer")
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(5);

    if (error) {
      console.error("Search error:", error);
      return NextResponse.json(
        { error: "Failed to search customers" },
        { status: 500 },
      );
    }

    // Transform to match expected format
    const formatted =
      data?.map((customer) => ({
        id: customer.id,
        fullName: customer.full_name,
        email: customer.email,
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
