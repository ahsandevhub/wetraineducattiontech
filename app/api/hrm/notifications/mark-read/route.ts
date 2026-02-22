/**
 * POST /api/hrm/notifications/mark-read
 * Mark notification(s) as read
 *
 * Request body:
 * - id?: string (mark single notification)
 * - markAll?: boolean (mark all notifications as read)
 *
 * At least one of id or markAll must be provided
 */

import { createClient } from "@/app/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

type MarkReadRequest = {
  id?: string;
  markAll?: boolean;
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check auth
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as MarkReadRequest;

    if (!body.id && !body.markAll) {
      return NextResponse.json(
        { error: "Either 'id' or 'markAll' must be provided" },
        { status: 400 },
      );
    }

    if (body.markAll) {
      // Mark all notifications as read for this user
      const { error } = await supabase
        .from("hrm_notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      // Gracefully handle missing table
      if (error) {
        if (
          error.message?.includes("relation") ||
          error.message?.includes("does not exist")
        ) {
          console.warn(
            "hrm_notifications table not found - Migration may not be applied",
          );
          return NextResponse.json(
            { success: false, message: "Notifications not available" },
            { status: 400 },
          );
        }
        console.error("Error marking all as read:", error);
        return NextResponse.json(
          { error: "Failed to mark notifications as read" },
          { status: 500 },
        );
      }

      return NextResponse.json({
        success: true,
        action: "marked_all",
        message: "All notifications marked as read",
      });
    }

    // Mark single notification as read
    const { error } = await supabase
      .from("hrm_notifications")
      .update({ is_read: true })
      .eq("id", body.id)
      .eq("user_id", user.id); // Ensure user owns this notification

    // Gracefully handle missing table
    if (error) {
      if (
        error.message?.includes("relation") ||
        error.message?.includes("does not exist")
      ) {
        console.warn(
          "hrm_notifications table not found - Migration may not be applied",
        );
        return NextResponse.json(
          { success: false, message: "Notifications not available" },
          { status: 400 },
        );
      }
      console.error("Error marking notification as read:", error);
      return NextResponse.json(
        { error: "Failed to mark notification as read" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      action: "marked_single",
      id: body.id,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("POST /api/hrm/notifications/mark-read error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal server error", details: message },
      { status: 500 },
    );
  }
}
