/**
 * REMOVED: /api/hrm/super/pending-profiles/[id]
 * Pending profiles workflow has been replaced by direct user linking.
 */
import { NextResponse } from "next/server";

export async function PATCH() {
  return NextResponse.json(
    {
      error:
        "Pending profiles have been removed. Use direct user linking instead.",
    },
    { status: 410 },
  );
}

export async function DELETE() {
  return NextResponse.json(
    {
      error:
        "Pending profiles have been removed. Use direct user linking instead.",
    },
    { status: 410 },
  );
}
