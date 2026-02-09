import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Check profiles count
    const { count: profileCount, error: profileError } = await supabase
      .from("profiles")
      .select("*", { count: "exact" });

    // Check services count
    const { count: serviceCount, error: serviceError } = await supabase
      .from("services")
      .select("*", { count: "exact" });

    // Check payments count
    const { count: paymentCount, error: paymentError } = await supabase
      .from("payments")
      .select("*", { count: "exact" });

    // Check orders count
    const { count: orderCount, error: orderError } = await supabase
      .from("orders")
      .select("*", { count: "exact" });

    // Check certifications count
    const { count: certCount, error: certError } = await supabase
      .from("certifications")
      .select("*", { count: "exact" });

    // Check projects count
    const { count: projectCount, error: projectError } = await supabase
      .from("featured_projects")
      .select("*", { count: "exact" });

    // Check stories count
    const { count: storyCount, error: storyError } = await supabase
      .from("client_stories")
      .select("*", { count: "exact" });

    return NextResponse.json({
      success: true,
      tables: {
        profiles: {
          count: profileCount,
          error: profileError?.message,
          exists: !profileError,
        },
        services: {
          count: serviceCount,
          error: serviceError?.message,
          exists: !serviceError,
        },
        payments: {
          count: paymentCount,
          error: paymentError?.message,
          exists: !paymentError,
        },
        orders: {
          count: orderCount,
          error: orderError?.message,
          exists: !orderError,
        },
        certifications: {
          count: certCount,
          error: certError?.message,
          exists: !certError,
        },
        featured_projects: {
          count: projectCount,
          error: projectError?.message,
          exists: !projectError,
        },
        client_stories: {
          count: storyCount,
          error: storyError?.message,
          exists: !storyError,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
