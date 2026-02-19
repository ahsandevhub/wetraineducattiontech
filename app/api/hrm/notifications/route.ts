/**
 * GET /api/hrm/notifications
 * Fetch notifications for current user
 *
 * Query params:
 * - page: number (default 1)
 * - pageSize: number (default 20, max 100)
 * - unreadOnly: boolean (default false)
 */

import { createClient } from "@/app/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check auth
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query params
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("pageSize") || "20")),
    );
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const offset = (page - 1) * pageSize;

    // Build query
    let query = supabase
      .from("hrm_notifications")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (unreadOnly) {
      query = query.eq("is_read", false);
    }

    const { data: notifications, count, error } = await query;

    // If table doesn't exist (migration not applied), return empty state
    if (error) {
      if (
        error.message?.includes("relation") ||
        error.message?.includes("does not exist")
      ) {
        console.warn(
          "hrm_notifications table not found - Migration may not be applied",
        );
        return NextResponse.json({
          notifications: [],
          pagination: {
            page: 1,
            pageSize,
            total: 0,
            totalPages: 0,
          },
          unreadCount: 0,
        });
      }

      console.error("Error fetching notifications:", error);
      return NextResponse.json(
        { error: "Failed to fetch notifications", details: error.message },
        { status: 500 },
      );
    }

    // Get unread count
    let unreadCount = 0;
    const { count: countResult, error: countError } = await supabase
      .from("hrm_notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (!countError) {
      unreadCount = countResult || 0;
    }

    return NextResponse.json({
      notifications: notifications || [],
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
      unreadCount,
    });
  } catch (error) {
    console.error("GET /api/hrm/notifications error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal server error", details: message },
      { status: 500 },
    );
  }
}
