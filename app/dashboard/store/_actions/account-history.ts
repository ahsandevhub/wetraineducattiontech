"use server";

import { requireStoreAccess } from "@/app/utils/auth/require";
import { getCurrentUserWithRoles } from "@/app/utils/auth/roles";
import { createClient } from "@/app/utils/supabase/server";

type StoreAccountCategory =
  | "MONTHLY_ALLOCATION"
  | "EMPLOYEE_PAYMENT"
  | "PURCHASE"
  | "REFUND"
  | "REVERSAL"
  | "CORRECTION"
  | "PENALTY"
  | "BONUS_OR_REWARD"
  | "OTHER";

type StoreAccountHistoryEntry = {
  id: string;
  entry_date: string;
  month_key: string;
  amount: number;
  category: StoreAccountCategory;
  reason: string;
  invoice_id: string | null;
  created_at: string;
};

const STORE_ACCOUNT_CATEGORIES: StoreAccountCategory[] = [
  "MONTHLY_ALLOCATION",
  "EMPLOYEE_PAYMENT",
  "PURCHASE",
  "REFUND",
  "REVERSAL",
  "CORRECTION",
  "PENALTY",
  "BONUS_OR_REWARD",
  "OTHER",
];

export async function getStoreAccountHistory() {
  await requireStoreAccess();
  const roles = await getCurrentUserWithRoles();

  if (!roles) {
    return { data: null, error: "Not authenticated" };
  }

  try {
    const supabase = await createClient();
    const { data: entries, error } = await supabase
      .from("store_account_entries")
      .select(
        "id, entry_date, month_key, amount, category, reason, invoice_id, created_at",
      )
      .eq("user_id", roles.userId)
      .order("created_at", { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    const history = ((entries ?? []) as StoreAccountHistoryEntry[]).map(
      (entry) => ({
        ...entry,
        amount: Number(entry.amount),
      }),
    );

    const currentBalance = history.reduce((sum, entry) => sum + entry.amount, 0);

    return {
      data: {
        currentBalance: Number(currentBalance.toFixed(2)),
        entries: history,
        categories: STORE_ACCOUNT_CATEGORIES,
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
