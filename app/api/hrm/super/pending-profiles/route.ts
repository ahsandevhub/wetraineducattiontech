/**
 * /api/hrm/super/pending-profiles
 * REMOVED: pending profiles workflow replaced by direct user linking
 */
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      error:
        "Pending profiles have been removed. Use direct user linking instead.",
    },
    { status: 410 },
  );
}

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Pending profiles have been removed. Use direct user linking instead.",
    },
    { status: 410 },
  );
}
