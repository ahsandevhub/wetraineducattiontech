/**
 * HRM Cron Authentication Helper
 * Validates X-CRON-SECRET header against HRM_CRON_SECRET env variable
 */

import { NextRequest, NextResponse } from "next/server";

/**
 * Verify cron secret from request headers
 * Returns null if valid, NextResponse error if invalid
 */
export function verifyCronSecret(request: NextRequest): NextResponse | null {
  const cronSecret = process.env.HRM_CRON_SECRET;

  if (!cronSecret) {
    console.error("HRM_CRON_SECRET not configured in environment");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 },
    );
  }

  const providedSecret = request.headers.get("X-CRON-SECRET");

  if (!providedSecret) {
    return NextResponse.json(
      { error: "Missing X-CRON-SECRET header" },
      { status: 401 },
    );
  }

  if (providedSecret !== cronSecret) {
    return NextResponse.json({ error: "Invalid cron secret" }, { status: 403 });
  }

  // Valid secret
  return null;
}
