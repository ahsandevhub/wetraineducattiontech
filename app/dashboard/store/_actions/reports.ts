"use server";

import { requireStoreAdmin } from "@/app/utils/auth/require";
import { getCurrentUserWithRoles } from "@/app/utils/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";

type ReportInvoice = {
  id: string;
  user_id: string;
  month_key: string;
  total_amount: number;
  status: "CONFIRMED" | "REVERSED";
};

type ReportInvoiceItem = {
  invoice_id: string;
  product_id: string;
  quantity: number;
  line_total: number;
};

type ReportAccountEntry = {
  user_id: string;
  month_key: string;
  amount: number;
  category: string;
};

type ReportStockMovement = {
  product_id: string;
  quantity_delta: number;
};

type ReportMonthClosure = {
  id: string;
  month_key: string;
  status: "OPEN" | "CLOSED";
  opening_balance: number;
  closing_balance: number | null;
  closed_at: string | null;
  closed_by: string | null;
  note: string | null;
};

async function ensureStoreAdminAccess() {
  await requireStoreAdmin();
  const roles = await getCurrentUserWithRoles();

  if (!roles) {
    return { error: "Not authenticated", roles: null };
  }

  return { error: null, roles };
}

export async function getStoreReportsData() {
  const auth = await ensureStoreAdminAccess();
  if (auth.error || !auth.roles) {
    return { data: null, error: auth.error ?? "Not authorized" };
  }

  try {
    const supabaseAdmin = createAdminClient();
    const [
      { data: invoices, error: invoicesError },
      { data: invoiceItems, error: itemsError },
      { data: accountEntries, error: accountEntriesError },
      { data: stockMovements, error: stockMovementsError },
      { data: products, error: productsError },
      { data: storeUsers, error: storeUsersError },
      { data: monthClosures, error: monthClosuresError },
    ] = await Promise.all([
      supabaseAdmin
        .from("store_invoices")
        .select("id, user_id, month_key, total_amount, status")
        .order("confirmed_at", { ascending: false }),
      supabaseAdmin
        .from("store_invoice_items")
        .select("invoice_id, product_id, quantity, line_total"),
      supabaseAdmin
        .from("store_account_entries")
        .select("user_id, month_key, amount, category"),
      supabaseAdmin
        .from("store_stock_movements")
        .select("product_id, quantity_delta"),
      supabaseAdmin
        .from("store_products")
        .select("id, name, image_url, is_active")
        .order("name", { ascending: true }),
      supabaseAdmin.from("store_users").select("id"),
      supabaseAdmin
        .from("store_month_closures")
        .select(
          "id, month_key, status, opening_balance, closing_balance, closed_at, closed_by, note",
        )
        .order("month_key", { ascending: false })
        .limit(24),
    ]);

    if (invoicesError) {
      return { data: null, error: invoicesError.message };
    }

    if (itemsError) {
      return { data: null, error: itemsError.message };
    }

    if (accountEntriesError) {
      return { data: null, error: accountEntriesError.message };
    }

    if (stockMovementsError) {
      return { data: null, error: stockMovementsError.message };
    }

    if (productsError) {
      return { data: null, error: productsError.message };
    }

    if (storeUsersError) {
      return { data: null, error: storeUsersError.message };
    }

    if (monthClosuresError) {
      return { data: null, error: monthClosuresError.message };
    }

    const userIds = (storeUsers ?? []).map((user) => user.id);
    const closureActorIds = Array.from(
      new Set(
        ((monthClosures ?? []) as ReportMonthClosure[])
          .map((closure) => closure.closed_by)
          .filter((value): value is string => Boolean(value)),
      ),
    );
    const allProfileIds = Array.from(new Set([...userIds, ...closureActorIds]));
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
    const productMap = new Map(
      (products ?? []).map((product) => [product.id, product]),
    );

    const typedInvoices = ((invoices ?? []) as ReportInvoice[]).map(
      (invoice) => ({
        ...invoice,
        total_amount: Number(invoice.total_amount),
      }),
    );

    const typedItems = ((invoiceItems ?? []) as ReportInvoiceItem[]).map(
      (item) => ({
        ...item,
        line_total: Number(item.line_total),
      }),
    );

    const typedEntries = ((accountEntries ?? []) as ReportAccountEntry[]).map(
      (entry) => ({
        ...entry,
        amount: Number(entry.amount),
      }),
    );

    const monthOptions = Array.from(
      new Set(
        typedInvoices
          .map((invoice) => invoice.month_key)
          .concat(typedEntries.map((entry) => entry.month_key))
          .concat(
            ((monthClosures ?? []) as ReportMonthClosure[]).map(
              (closure) => closure.month_key,
            ),
          ),
      ),
    ).sort((a, b) => b.localeCompare(a));

    const typedClosures = ((monthClosures ?? []) as ReportMonthClosure[]).map(
      (closure) => {
        const actor = closure.closed_by
          ? profileMap.get(closure.closed_by)
          : null;

        return {
          ...closure,
          opening_balance: Number(closure.opening_balance ?? 0),
          closing_balance:
            closure.closing_balance === null
              ? null
              : Number(closure.closing_balance),
          closed_by_name: actor?.full_name || actor?.email || null,
        };
      },
    );

    return {
      data: {
        monthOptions,
        invoices: typedInvoices,
        invoiceItems: typedItems,
        accountEntries: typedEntries,
        stockMovements: (stockMovements ?? []) as ReportStockMovement[],
        users: (storeUsers ?? []).map((user) => {
          const profile = profileMap.get(user.id);
          return {
            id: user.id,
            name: profile?.full_name || profile?.email || "Unknown",
            email: profile?.email || "Unknown",
          };
        }),
        products: (products ?? []).map((product) => ({
          id: product.id,
          name: product.name,
          image_url: product.image_url ?? null,
          is_active: product.is_active,
          on_hand: Number(
            ((stockMovements ?? []) as ReportStockMovement[])
              .filter((movement) => movement.product_id === product.id)
              .reduce(
                (sum, movement) => sum + Number(movement.quantity_delta ?? 0),
                0,
              )
              .toFixed(0),
          ),
        })),
        productNames: Object.fromEntries(
          Array.from(productMap.entries()).map(([id, product]) => [
            id,
            product.name,
          ]),
        ),
        monthClosures: typedClosures,
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
