/**
 * POST /api/hrm/cron/ensure-week
 * Cron endpoint: Ensure current Friday's HrmWeek exists with status OPEN
 *
 * Authentication: Requires X-CRON-SECRET header
 * Idempotent: Safe to call multiple times
 * Timezone: Uses Asia/Dhaka for determining current Friday
 *
 * Schedule: Run daily at 00:01 Dhaka time (18:01 UTC previous day)
 */

import { createClient } from "@/app/utils/supabase/server";
import { verifyCronSecret } from "@/lib/hrm/cron-auth";
import { notifyAdminsPendingMarking } from "@/lib/hrm/notification-helpers";
import {
  getCurrentFridayDate,
  getWeekKeyFromFridayDate,
} from "@/lib/hrm/week-utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Verify cron secret
  const authError = verifyCronSecret(request);
  if (authError) return authError;

  try {
    const supabase = await createClient();

    // Determine current Friday in Dhaka timezone
    const fridayDate = getCurrentFridayDate();
    const weekKey = getWeekKeyFromFridayDate(fridayDate);

    // Check if week already exists
    const { data: existingWeek } = await supabase
      .from("hrm_weeks")
      .select("id, status, week_key")
      .eq("week_key", weekKey)
      .maybeSingle();

    if (existingWeek) {
      // Notify admins about pending markings (idempotent)
      await notifyAdminsPendingMarking(weekKey);

      return NextResponse.json({
        success: true,
        action: "exists",
        weekKey,
        status: existingWeek.status,
        message: `Week ${weekKey} already exists with status ${existingWeek.status}`,
      });
    }

    // Create new week
    const { data: newWeek, error: createError } = await supabase
      .from("hrm_weeks")
      .insert({
        week_key: weekKey,
        friday_date: fridayDate.toISOString().split("T")[0],
        status: "OPEN",
      })
      .select()
      .single();

    if (createError) {
      console.error("Error creating week:", createError);
      return NextResponse.json(
        { error: "Failed to create week", details: createError.message },
        { status: 500 },
      );
    }
    // Notify admins about pending markings for new week
    await notifyAdminsPendingMarking(weekKey);
    return NextResponse.json({
      success: true,
      action: "created",
      weekKey,
      weekId: newWeek.id,
      status: "OPEN",
      message: `Week ${weekKey} created successfully`,
    });
  } catch (error) {
    console.error("Cron ensure-week error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal server error", details: message },
      { status: 500 },
    );
  }
}
