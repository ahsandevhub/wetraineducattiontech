"use server";

import { createClient } from "@/app/utils/supabase/server";

type StoreDashboardAccountEntry = {
  id: string;
  entry_date: string;
  month_key: string;
  amount: number;
  category:
    | "MONTHLY_ALLOCATION"
    | "EMPLOYEE_PAYMENT"
    | "PURCHASE"
    | "REFUND"
    | "REVERSAL"
    | "CORRECTION"
    | "PENALTY"
    | "BONUS_OR_REWARD"
    | "OTHER";
  reason: string;
  created_at: string;
};

type StoreDashboardInvoice = {
  id: string;
  invoice_date: string;
  month_key: string;
  total_amount: number;
  status: "CONFIRMED" | "REVERSED";
  confirmed_at: string;
  created_at: string;
};

export async function getStoreDashboardData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "Not authenticated" };
  }

  const currentMonthKey = new Date(
    Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1),
  )
    .toISOString()
    .slice(0, 10);

  try {
    const [{ data: accountEntries, error: accountError }, { data: invoices, error: invoicesError }] =
      await Promise.all([
        supabase
          .from("store_account_entries")
          .select(
            "id, entry_date, month_key, amount, category, reason, created_at",
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(8),
        supabase
          .from("store_invoices")
          .select(
            "id, invoice_date, month_key, total_amount, status, confirmed_at, created_at",
          )
          .eq("user_id", user.id)
          .order("confirmed_at", { ascending: false })
          .limit(6),
      ]);

    if (accountError) {
      return { data: null, error: accountError.message };
    }

    if (invoicesError) {
      return { data: null, error: invoicesError.message };
    }

    const [{ data: balanceRows, error: balanceError }, { data: monthInvoices, error: monthInvoicesError }] =
      await Promise.all([
        supabase
          .from("store_account_entries")
          .select("amount")
          .eq("user_id", user.id),
        supabase
          .from("store_invoices")
          .select("total_amount")
          .eq("user_id", user.id)
          .eq("month_key", currentMonthKey)
          .eq("status", "CONFIRMED"),
      ]);

    if (balanceError) {
      return { data: null, error: balanceError.message };
    }

    if (monthInvoicesError) {
      return { data: null, error: monthInvoicesError.message };
    }

    const currentBalance = (balanceRows ?? []).reduce(
      (sum, row) => sum + Number(row.amount ?? 0),
      0,
    );

    const currentMonthPurchaseTotal = (monthInvoices ?? []).reduce(
      (sum, row) => sum + Number(row.total_amount ?? 0),
      0,
    );

    return {
      data: {
        currentBalance: Number(currentBalance.toFixed(2)),
        currentMonthPurchaseTotal: Number(currentMonthPurchaseTotal.toFixed(2)),
        currentMonthPurchaseCount: monthInvoices?.length ?? 0,
        recentAccountEntries:
          ((accountEntries ?? []) as StoreDashboardAccountEntry[]).map((entry) => ({
            ...entry,
            amount: Number(entry.amount),
          })),
        recentInvoices:
          ((invoices ?? []) as StoreDashboardInvoice[]).map((invoice) => ({
            ...invoice,
            total_amount: Number(invoice.total_amount),
          })),
      },
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
