import { createClient } from "@/app/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/hrm/super/weeks - List weeks with pagination and filters
export async function GET(request: NextRequest) {
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

  // Get query params
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "50");
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  try {
    // Build query
    let query = supabase
      .from("hrm_weeks")
      .select("*", { count: "exact" })
      .order("friday_date", { ascending: false });

    if (status && ["OPEN", "LOCKED"].includes(status)) {
      query = query.eq("status", status);
    }

    if (search) {
      query = query.ilike("week_key", `%${search}%`);
    }

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      weeks: data,
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
    });
  } catch (error: any) {
    console.error("Error fetching weeks:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch weeks" },
      { status: 500 },
    );
  }
}

// POST /api/hrm/super/weeks - Create a new week
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
    .eq("profile_id", user.id)
    .single();

  if (hrmUser?.hrm_role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { fridayDate } = body;

    if (!fridayDate) {
      return NextResponse.json(
        { error: "fridayDate is required" },
        { status: 400 },
      );
    }

    // Validate Friday date format
    const date = new Date(fridayDate);
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 },
      );
    }

    // Check if it's actually a Friday
    const dhakaDayOfWeek = new Date(
      date.toLocaleString("en-US", { timeZone: "Asia/Dhaka" }),
    ).getDay();
    if (dhakaDayOfWeek !== 5) {
      return NextResponse.json(
        { error: "Date must be a Friday" },
        { status: 400 },
      );
    }

    // Generate week_key (YYYY-MM-DD format)
    const weekKey = fridayDate.split("T")[0]; // Use the date part only

    // Attempt to insert (idempotent - will fail silently if exists)
    const { data: existingWeek } = await supabase
      .from("hrm_weeks")
      .select("*")
      .eq("week_key", weekKey)
      .single();

    if (existingWeek) {
      return NextResponse.json({
        week: existingWeek,
        message: "Week already exists",
      });
    }

    const { data, error } = await supabase
      .from("hrm_weeks")
      .insert({
        week_key: weekKey,
        friday_date: fridayDate,
        status: "OPEN",
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ week: data, message: "Week created" });
  } catch (error: any) {
    console.error("Error creating week:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create week" },
      { status: 500 },
    );
  }
}
