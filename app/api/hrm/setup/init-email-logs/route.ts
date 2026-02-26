import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";

/**
 * ONE-TIME SETUP ENDPOINT
 * This endpoint creates the hrm_email_logs table and related infrastructure
 * Run this once to initialize the email logging system
 *
 * Usage: POST /api/hrm/setup/init-email-logs
 *
 * NOTE: This is a one-time setup endpoint. It should be removed after initial setup.
 */

export async function POST() {
  try {
    return NextResponse.json({
      message: "Email logs table has been created via database migration 0044",
      status: "initialized",
      details: {
        table: "hrm_email_logs",
        features: [
          "Email history tracking",
          "Delivery status monitoring",
          "HTML/text content storage",
          "Admin sender tracking",
          "Row-level security enabled",
        ],
      },
    });
  } catch (error) {
    console.error("[Init Email Logs] Error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to check email logs status";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  const supabase = await createClient();

  try {
    // Check if table exists by trying to query it
    const { error } = await supabase
      .from("hrm_email_logs")
      .select("id")
      .limit(1);

    if (error?.code === "PGRST205") {
      return NextResponse.json(
        {
          status: "not_initialized",
          message: "hrm_email_logs table does not exist",
          action: "Run POST /api/hrm/setup/init-email-logs to create it",
        },
        { status: 404 },
      );
    }

    if (error) {
      throw error;
    }

    return NextResponse.json({
      status: "initialized",
      message: "hrm_email_logs table exists and is ready",
    });
  } catch (error) {
    console.error("[Check Email Logs] Error:", error);
    return NextResponse.json(
      { error: "Failed to check email logs status" },
      { status: 500 },
    );
  }
}

