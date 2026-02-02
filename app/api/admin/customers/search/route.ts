import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SECRET_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
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
