"use server";

import { requireStoreAdmin } from "@/app/utils/auth/require";
import { getCurrentUserWithRoles } from "@/app/utils/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";

type DashboardLowStockItem = {
  product_id: string;
  product_name: string;
  on_hand: number;
};

type DashboardEmployeeBalanceUser = {
  user_id: string;
  user_name: string;
  user_email: string;
  balance: number;
};

type DashboardLedgerAction = {
  id: string;
  entry_date: string;
  amount: number;
  category: string;
  reason: string;
  user_name: string;
  actor_name: string;
};

type DashboardAdminDepositSummary = {
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

export async function getStoreAdminDashboardData() {
  const auth = await ensureStoreAdminAccess();
  if (auth.error || !auth.roles) {
    return { data: null, error: auth.error ?? "Not authorized" };
  }

  try {
    const supabaseAdmin = createAdminClient();
    const currentMonthKey = new Date(
      Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1),
    )
      .toISOString()
      .slice(0, 10);

    const [
      { data: products, error: productsError },
      { data: stockMovements, error: stockError },
      { data: monthInvoices, error: monthInvoicesError },
      { data: storeUsers, error: storeUsersError },
      { data: accountEntries, error: accountEntriesError },
      { data: allAccountEntries, error: allAccountEntriesError },
    ] = await Promise.all([
      supabaseAdmin
        .from("store_products")
        .select("id, name, tracks_stock, is_active")
        .eq("tracks_stock", true)
        .order("name", { ascending: true }),
      supabaseAdmin
        .from("store_stock_movements")
        .select("product_id, quantity_delta"),
      supabaseAdmin
        .from("store_invoices")
        .select("id, total_amount")
        .eq("month_key", currentMonthKey)
        .eq("status", "CONFIRMED"),
      supabaseAdmin
        .from("store_users")
        .select("id, store_role, created_at")
        .order("created_at", { ascending: true }),
      supabaseAdmin
        .from("store_account_entries")
        .select(
          "id, user_id, entry_date, amount, category, reason, created_by, created_at",
        )
        .order("created_at", { ascending: false })
        .limit(10),
      supabaseAdmin
        .from("store_account_entries")
        .select("user_id, amount, category, reversed_from_entry_id, created_by"),
    ]);

    if (productsError) {
      return { data: null, error: productsError.message };
    }

    if (stockError) {
      return { data: null, error: stockError.message };
    }

    if (monthInvoicesError) {
      return { data: null, error: monthInvoicesError.message };
    }

    if (storeUsersError) {
      return { data: null, error: storeUsersError.message };
    }

    if (accountEntriesError) {
      return { data: null, error: accountEntriesError.message };
    }

    if (allAccountEntriesError) {
      return { data: null, error: allAccountEntriesError.message };
    }

    const userIds = (storeUsers ?? []).map((user) => user.id);
    const actorIds = Array.from(
      new Set(
        [...(accountEntries ?? []), ...(allAccountEntries ?? [])]
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

    const stockMap = new Map<string, number>();
    for (const movement of stockMovements ?? []) {
      stockMap.set(
        movement.product_id,
        (stockMap.get(movement.product_id) ?? 0) +
          Number(movement.quantity_delta ?? 0),
      );
    }

    const lowStockItems: DashboardLowStockItem[] = (products ?? [])
      .map((product) => ({
        product_id: product.id,
        product_name: product.name,
        on_hand: stockMap.get(product.id) ?? 0,
      }))
      .filter((product) => product.on_hand <= 5)
      .sort((a, b) => a.on_hand - b.on_hand)
      .slice(0, 6);

    const balanceMap = new Map<string, number>();
    const adminDepositMap = new Map<
      string,
      { total_deposited: number; entry_count: number }
    >();

    for (const row of allAccountEntries ?? []) {
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

    const adminDepositSummary: DashboardAdminDepositSummary[] = Array.from(
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
      .sort((a, b) => b.total_deposited - a.total_deposited)
      .slice(0, 6);

    const allEmployeeBalances: DashboardEmployeeBalanceUser[] = (storeUsers ?? [])
      .map((user) => {
        const profile = profileMap.get(user.id);
        return {
          user_id: user.id,
          user_name: profile?.full_name || profile?.email || "Unknown",
          user_email: profile?.email || "Unknown",
          balance: Number((balanceMap.get(user.id) ?? 0).toFixed(2)),
        };
      })
      .sort((a, b) => a.balance - b.balance);

    const negativeBalanceCount = allEmployeeBalances.filter(
      (user) => user.balance < 0,
    ).length;

    const recentLedgerActions: DashboardLedgerAction[] = (accountEntries ?? []).map(
      (entry) => {
        const subject = profileMap.get(entry.user_id);
        const actor = entry.created_by ? profileMap.get(entry.created_by) : null;

        return {
          id: entry.id,
          entry_date: entry.entry_date,
          amount: Number(entry.amount),
          category: entry.category,
          reason: entry.reason,
          user_name: subject?.full_name || subject?.email || "Unknown",
          actor_name: actor?.full_name || actor?.email || "System",
        };
      },
    );

    const currentMonthSales = Number(
      (monthInvoices ?? [])
        .reduce((sum, invoice) => sum + Number(invoice.total_amount ?? 0), 0)
        .toFixed(2),
    );

    return {
      data: {
        currentMonthKey,
        summary: {
          lowStockCount: lowStockItems.length,
          currentMonthSales,
          negativeBalanceCount,
          recentLedgerCount: recentLedgerActions.length,
        },
        lowStockItems,
        employeeBalances: allEmployeeBalances,
        adminDepositSummary,
        recentLedgerActions,
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
