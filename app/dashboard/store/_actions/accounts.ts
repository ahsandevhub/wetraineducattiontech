"use server";

import { requireStoreAdmin } from "@/app/utils/auth/require";
import {
  getCurrentUserWithRoles,
  hasStorePermission,
} from "@/app/utils/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import {
  ensureValidCategory,
  ensureValidManualCategory,
  parsePositiveMoney,
  startOfMonth,
  STORE_ACCOUNT_CATEGORIES,
  type StoreAccountCategory,
} from "../_lib/store-domain";
import {
  ensureStoreMonthOpen,
  getStoreMonthClosuresOverview,
} from "./month-closures";

type AccountEntryDirection = "CREDIT" | "DEBIT";

type AccountEntryInput = {
  userId: string;
  amount: string;
  direction: AccountEntryDirection;
  category: StoreAccountCategory;
  reason: string;
  entryDate: string;
  monthKey: string;
};

type StoreUserRow = {
  id: string;
  full_name: string;
  email: string;
  store_role: "USER" | "ADMIN";
  current_balance: number;
};

type StoreAccountEntryRow = {
  id: string;
  user_id: string;
  entry_date: string;
  month_key: string;
  amount: number;
  category: StoreAccountCategory;
  reason: string;
  invoice_id: string | null;
  reversed_from_entry_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_email: string;
  actor_name: string;
};

type AdminDepositSummaryRow = {
  admin_id: string;
  admin_name: string;
  admin_email: string;
  total_deposited: number;
  entry_count: number;
};

async function ensureStoreAdminAccess() {
  await requireStoreAdmin();
  const roles = await getCurrentUserWithRoles();

  if (!roles) {
    return { error: "Not authenticated", roles: null };
  }

  return { error: null, roles };
}

export async function getStoreAccountsOverview() {
  const auth = await ensureStoreAdminAccess();
  if (auth.error || !auth.roles) {
    return { data: null, error: auth.error ?? "Not authorized" };
  }

  try {
    const supabaseAdmin = createAdminClient();
    const [
      { data: storeUsers, error: storeUsersError },
      { data: entries, error: entriesError },
      { data: monthClosures, error: monthClosuresError },
    ] = await Promise.all([
      supabaseAdmin
        .from("store_users")
        .select("id, store_role, created_at")
        .order("created_at", { ascending: true }),
      supabaseAdmin
        .from("store_account_entries")
        .select(
          "id, user_id, entry_date, month_key, amount, category, reason, invoice_id, reversed_from_entry_id, created_by, created_at, updated_at",
        )
        .order("created_at", { ascending: false })
        .limit(200),
      getStoreMonthClosuresOverview(),
    ]);

    if (storeUsersError) {
      return { data: null, error: storeUsersError.message };
    }

    if (entriesError) {
      return { data: null, error: entriesError.message };
    }

    if (monthClosuresError) {
      return { data: null, error: monthClosuresError };
    }

    const userIds = (storeUsers ?? []).map((user) => user.id);
    const allAccountRows = userIds.length
      ? await supabaseAdmin
          .from("store_account_entries")
          .select(
            "user_id, amount, category, reversed_from_entry_id, created_by",
          )
          .in("user_id", userIds)
      : { data: [], error: null };

    if (allAccountRows.error) {
      return { data: null, error: allAccountRows.error.message };
    }

    const actorIds = Array.from(
      new Set(
        [...(entries ?? []), ...(allAccountRows.data ?? [])]
          .map((entry) => entry.created_by)
          .filter((value): value is string => Boolean(value)),
      ),
    );

    const allProfileIds = Array.from(new Set([...userIds, ...actorIds]));

    const { data: profiles, error: profilesError } = allProfileIds.length
      ? await supabaseAdmin
          .from("profiles")
          .select("id, full_name, email")
          .in("id", allProfileIds)
      : { data: [], error: null };

    if (profilesError) {
      return { data: null, error: profilesError.message };
    }

    const profileMap = new Map(
      (profiles ?? []).map((profile) => [profile.id, profile]),
    );

    const balanceMap = new Map<string, number>();
    const adminDepositMap = new Map<
      string,
      { total_deposited: number; entry_count: number }
    >();

    for (const row of allAccountRows.data ?? []) {
      balanceMap.set(
        row.user_id,
        (balanceMap.get(row.user_id) ?? 0) + Number(row.amount ?? 0),
      );

      const amount = Number(row.amount ?? 0);
      if (
        amount > 0 &&
        row.created_by &&
        row.category !== "REFUND" &&
        row.category !== "REVERSAL" &&
        !row.reversed_from_entry_id
      ) {
        const current = adminDepositMap.get(row.created_by) ?? {
          total_deposited: 0,
          entry_count: 0,
        };
        current.total_deposited += amount;
        current.entry_count += 1;
        adminDepositMap.set(row.created_by, current);
      }
    }

    const adminDepositSummary: AdminDepositSummaryRow[] = Array.from(
      adminDepositMap.entries(),
    )
      .map(([adminId, summary]) => {
        const profile = profileMap.get(adminId);
        return {
          admin_id: adminId,
          admin_name: profile?.full_name || profile?.email || "Unknown",
          admin_email: profile?.email || "Unknown",
          total_deposited: Number(summary.total_deposited.toFixed(2)),
          entry_count: summary.entry_count,
        };
      })
      .sort((a, b) => b.total_deposited - a.total_deposited);

    const users: StoreUserRow[] = (storeUsers ?? []).map((user) => {
      const profile = profileMap.get(user.id);
      return {
        id: user.id,
        full_name: profile?.full_name || "Unknown",
        email: profile?.email || "Unknown",
        store_role: user.store_role,
        current_balance: Number((balanceMap.get(user.id) ?? 0).toFixed(2)),
      };
    });

    const entriesWithNames: StoreAccountEntryRow[] = (entries ?? []).map(
      (entry) => {
        const subject = profileMap.get(entry.user_id);
        const actor = entry.created_by
          ? profileMap.get(entry.created_by)
          : null;

        return {
          ...entry,
          amount: Number(entry.amount),
          category: entry.category as StoreAccountCategory,
          user_name: subject?.full_name || "Unknown",
          user_email: subject?.email || "Unknown",
          actor_name: actor?.full_name || actor?.email || "System",
        };
      },
    );

    const totalBalance = users.reduce(
      (sum, user) => sum + user.current_balance,
      0,
    );
    const positiveBalanceCount = users.filter(
      (user) => user.current_balance > 0,
    ).length;
    const negativeBalanceCount = users.filter(
      (user) => user.current_balance < 0,
    ).length;

    return {
      data: {
        users,
        entries: entriesWithNames,
        categories: STORE_ACCOUNT_CATEGORIES,
        summary: {
          totalBalance: Number(totalBalance.toFixed(2)),
          positiveBalanceCount,
          negativeBalanceCount,
          adminDepositSummary,
        },
        monthClosures: monthClosures ?? [],
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

export async function createStoreAccountEntry(data: AccountEntryInput) {
  const auth = await ensureStoreAdminAccess();
  if (auth.error || !auth.roles) {
    return { error: auth.error ?? "Not authorized" };
  }

  if (!hasStorePermission(auth.roles, "balance_add")) {
    return { error: "You do not have permission to add Store balance entries" };
  }

  if (!ensureValidCategory(data.category)) {
    return { error: "Invalid category" };
  }

  if (!ensureValidManualCategory(data.category)) {
    return {
      error:
        "Manual entries cannot use system-managed categories like Purchase or Reversal.",
    };
  }

  const reason = data.reason.trim();

  const parsedAmount = parsePositiveMoney(data.amount);
  if (parsedAmount.error || parsedAmount.value === null) {
    return { error: parsedAmount.error ?? "Invalid amount" };
  }

  const entryDate = data.entryDate || new Date().toISOString().slice(0, 10);
  const effectiveMonth = data.monthKey
    ? `${data.monthKey}-01`
    : startOfMonth(entryDate);

  if (!effectiveMonth) {
    return { error: "A valid effective date or month is required" };
  }

  const derivedMonthFromEntryDate = startOfMonth(entryDate);
  if (!derivedMonthFromEntryDate) {
    return { error: "Effective date is invalid" };
  }

  if (derivedMonthFromEntryDate !== effectiveMonth) {
    return {
      error: "Effective date and effective month must belong to the same month",
    };
  }

  const monthStatus = await ensureStoreMonthOpen(effectiveMonth);
  if (monthStatus.error) {
    return { error: monthStatus.error };
  }

  const signedAmount =
    data.direction === "DEBIT" ? parsedAmount.value * -1 : parsedAmount.value;

  try {
    const supabaseAdmin = createAdminClient();

    const { data: existingStoreUser, error: storeUserError } =
      await supabaseAdmin
        .from("store_users")
        .select("id")
        .eq("id", data.userId)
        .maybeSingle();

    if (storeUserError) {
      return { error: storeUserError.message };
    }

    if (!existingStoreUser) {
      return { error: "Selected employee does not have Store access" };
    }

    const { error } = await supabaseAdmin.from("store_account_entries").insert({
      user_id: data.userId,
      entry_date: entryDate,
      month_key: effectiveMonth,
      amount: signedAmount,
      category: data.category,
      reason,
      created_by: auth.roles.userId,
    });

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/dashboard/store/admin");
    revalidatePath("/dashboard/store/admin/accounts");
    revalidatePath("/dashboard/store/accounts");
    revalidatePath("/dashboard/store");
    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
