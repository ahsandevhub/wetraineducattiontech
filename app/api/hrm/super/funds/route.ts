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

export async function GET(request: NextRequest) {
  const auth = await requireSuperAdmin();
  if ("error" in auth && auth.error) return auth.error;

  const { supabase } = auth;
  const searchParams = request.nextUrl.searchParams;
  const monthKey = searchParams.get("monthKey") || "";
  const status = searchParams.get("status") || "all";
  const entryType = searchParams.get("entryType") || "all";
  const search = searchParams.get("search") || "";

  try {
    let query = supabase
      .from("hrm_fund_logs")
      .select(
        `
        id,
        monthly_result_id,
        month_id,
        subject_user_id,
        entry_type,
        status,
        expected_amount,
        actual_amount,
        note,
        marked_at,
        created_at,
        updated_at,
        month:hrm_months!hrm_fund_logs_month_id_fkey(month_key),
        subject:hrm_users!hrm_fund_logs_subject_user_id_fkey(id, full_name, email),
        markedBy:hrm_users!hrm_fund_logs_marked_by_id_fkey(id, full_name, email)
      `,
      )
      .order("created_at", { ascending: false });

    if (status !== "all") query = query.eq("status", status);
    if (entryType !== "all") query = query.eq("entry_type", entryType);

    if (monthKey) {
      const { data: month } = await supabase
        .from("hrm_months")
        .select("id")
        .eq("month_key", monthKey)
        .single();
      if (month?.id) {
        query = query.eq("month_id", month.id);
      } else {
        return NextResponse.json({
          entries: [],
          summary: {
            fineCollected: 0,
            bonusPaid: 0,
            dueFine: 0,
            dueBonus: 0,
            currentBalance: 0,
          },
        });
      }
    }

    const { data, error } = await query;
    if (error) throw error;

    let entries = data || [];

    if (search) {
      const q = search.toLowerCase();
      entries = entries.filter((entry: any) => {
        const name = entry.subject?.full_name?.toLowerCase() || "";
        const email = entry.subject?.email?.toLowerCase() || "";
        return name.includes(q) || email.includes(q);
      });
    }

    const { data: allLogs, error: allLogsError } = await supabase
      .from("hrm_fund_logs")
      .select("entry_type, status, expected_amount, actual_amount");

    if (allLogsError) throw allLogsError;

    const summary = (allLogs || []).reduce(
      (acc: any, row: any) => {
        const actual = row.actual_amount ?? row.expected_amount ?? 0;
        const expected = row.expected_amount ?? 0;

        if (row.entry_type === "FINE") {
          if (row.status === "COLLECTED") acc.fineCollected += actual;
          if (row.status === "DUE") acc.dueFine += expected;
        }

        if (row.entry_type === "BONUS") {
          if (row.status === "PAID") acc.bonusPaid += actual;
          if (row.status === "DUE") acc.dueBonus += expected;
        }

        return acc;
      },
      {
        fineCollected: 0,
        bonusPaid: 0,
        dueFine: 0,
        dueBonus: 0,
      },
    );

    return NextResponse.json({
      entries,
      summary: {
        ...summary,
        currentBalance: summary.fineCollected - summary.bonusPaid,
      },
    });
  } catch (error) {
    console.error("Error fetching fund logs:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch fund logs";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireSuperAdmin();
  if ("error" in auth && auth.error) return auth.error;

  const { supabase, hrmUser } = auth;

  try {
    const body = await request.json();
    const monthlyResultId = body.monthlyResultId as string;
    const entryType = body.entryType as FundEntryType;
    const status = body.status as FundStatus;
    const actualAmountInput = body.actualAmount as number | undefined;
    const note = (body.note as string | undefined)?.trim() || null;

    if (!monthlyResultId || !entryType || !status) {
      return NextResponse.json(
        { error: "monthlyResultId, entryType and status are required" },
        { status: 400 },
      );
    }

    if (!["FINE", "BONUS"].includes(entryType)) {
      return NextResponse.json({ error: "Invalid entryType" }, { status: 400 });
    }

    if (!["DUE", "COLLECTED", "PAID"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    if (!isValidStatusForType(entryType, status)) {
      return NextResponse.json(
        { error: `Invalid status ${status} for entry type ${entryType}` },
        { status: 400 },
      );
    }

    const { data: monthlyResult, error: monthlyError } = await supabase
      .from("hrm_monthly_results")
      .select("id, month_id, subject_user_id, final_fine, gift_amount")
      .eq("id", monthlyResultId)
      .single();

    if (monthlyError || !monthlyResult) {
      return NextResponse.json(
        { error: "Monthly result not found" },
        { status: 404 },
      );
    }

    const expectedAmount =
      entryType === "FINE"
        ? Number(monthlyResult.final_fine || 0)
        : Number(monthlyResult.gift_amount || 0);

    if (entryType === "FINE" && expectedAmount <= 0) {
      return NextResponse.json(
        { error: "No fine amount available for this row" },
        { status: 400 },
      );
    }

    let actualAmount: number | null = null;
    if (status === "COLLECTED" && entryType === "FINE") {
      actualAmount = expectedAmount;
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
      .upsert(
        {
          monthly_result_id: monthlyResult.id,
          month_id: monthlyResult.month_id,
          subject_user_id: monthlyResult.subject_user_id,
          entry_type: entryType,
          status,
          expected_amount: expectedAmount,
          actual_amount: actualAmount,
          note,
          marked_by_id: hrmUser.id,
          marked_at: markedAt,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "monthly_result_id,entry_type", ignoreDuplicates: false },
      )
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("Error upserting fund log:", error);
    const message =
      error instanceof Error ? error.message : "Failed to save fund log";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
