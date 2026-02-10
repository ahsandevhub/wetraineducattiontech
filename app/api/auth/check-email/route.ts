import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 },
      );
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "Invalid email format." },
        { status: 400 },
      );
    }

    // Create admin client to bypass RLS
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    // Check if email exists in profiles
    const { data: existingProfile, error: checkError } = await adminClient
      .from("profiles")
      .select("id")
      .ilike("email", normalizedEmail)
      .maybeSingle();

    if (checkError) {
      console.error("Email check error:", checkError);
      return NextResponse.json(
        { error: "Unable to verify email." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      exists: !!existingProfile,
    });
  } catch (error) {
    console.error("Email check error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 },
    );
  }
}
