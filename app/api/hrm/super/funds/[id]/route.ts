import { createClient } from "@/app/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

type FundEntryType = "FINE" | "BONUS";
type FundStatus = "DUE" | "COLLECTED" | "PAID";

function isValidStatusForType(type: FundEntryType, status: FundStatus) {
  if (status === "DUE") return true;
  if (type === "FINE" && status === "COLLECTED") return true;
  if (type === "BONUS" && status === "PAID") return true;
  return false;
}

async function requireSuperAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      supabase,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const { data: hrmUser } = await supabase
    .from("hrm_users")
    .select("id, hrm_role")
    .eq("profile_id", user.id)
    .single();

  if (!hrmUser || hrmUser.hrm_role !== "SUPER_ADMIN") {
    return {
      supabase,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { supabase, hrmUser };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireSuperAdmin();
  if ("error" in auth && auth.error) return auth.error;

  const { supabase, hrmUser } = auth;

  try {
    const { id } = await params;
    const body = await request.json();

    const status = body.status as FundStatus;
    const actualAmountInput = body.actualAmount as number | undefined;
    const note = (body.note as string | undefined)?.trim() || null;

    const { data: existing, error: existingError } = await supabase
      .from("hrm_fund_logs")
      .select("id, entry_type, expected_amount")
      .eq("id", id)
      .single();

    if (existingError || !existing) {
      return NextResponse.json(
        { error: "Fund log not found" },
        { status: 404 },
      );
    }

    const entryType = existing.entry_type as FundEntryType;

    if (!status || !["DUE", "COLLECTED", "PAID"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    if (!isValidStatusForType(entryType, status)) {
      return NextResponse.json(
        { error: `Invalid status ${status} for entry type ${entryType}` },
        { status: 400 },
      );
    }

    let actualAmount: number | null = null;
    if (status === "COLLECTED" && entryType === "FINE") {
      actualAmount = Number(existing.expected_amount || 0);
    }

    if (status === "PAID" && entryType === "BONUS") {
      if (!actualAmountInput || Number(actualAmountInput) <= 0) {
        return NextResponse.json(
          { error: "Bonus paid amount is required and must be > 0" },
          { status: 400 },
        );
      }
      actualAmount = Number(actualAmountInput);
    }

    const markedAt = status === "DUE" ? null : new Date().toISOString();

    const { data, error } = await supabase
      .from("hrm_fund_logs")
      .update({
        status,
        actual_amount: actualAmount,
        note,
        marked_by_id: hrmUser.id,
        marked_at: markedAt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error updating fund log:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update fund log";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireSuperAdmin();
  if ("error" in auth && auth.error) return auth.error;

  const { supabase } = auth;

  try {
    const { id } = await params;

    const { error } = await supabase
      .from("hrm_fund_logs")
      .delete()
      .eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting fund log:", error);
    const message =
      error instanceof Error ? error.message : "Failed to delete fund log";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
