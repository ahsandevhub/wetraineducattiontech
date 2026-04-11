"use server";

import { requireStoreAccess } from "@/app/utils/auth/require";
import { getCurrentUserWithRoles } from "@/app/utils/auth/roles";
import { createClient } from "@/app/utils/supabase/server";

type StorePurchaseItem = {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  product_name: string;
};

type StorePurchaseInvoice = {
  id: string;
  invoice_date: string;
  month_key: string;
  status: "CONFIRMED" | "REVERSED";
  total_amount: number;
  confirmed_at: string;
  items: StorePurchaseItem[];
};

export async function getStorePurchaseHistory() {
  await requireStoreAccess();
  const roles = await getCurrentUserWithRoles();

  if (!roles) {
    return { data: null, error: "Not authenticated" };
  }

  try {
    const supabase = await createClient();
    const { data: invoices, error: invoicesError } = await supabase
      .from("store_invoices")
      .select("id, invoice_date, month_key, status, total_amount, confirmed_at")
      .eq("user_id", roles.userId)
      .order("confirmed_at", { ascending: false });

    if (invoicesError) {
      return { data: null, error: invoicesError.message };
    }

    const invoiceIds = (invoices ?? []).map((invoice) => invoice.id);

    const { data: invoiceItems, error: itemsError } = invoiceIds.length
      ? await supabase
          .from("store_invoice_items")
          .select(
            "id, invoice_id, product_id, quantity, unit_price, line_total, product:store_products(name)",
          )
          .in("invoice_id", invoiceIds)
      : { data: [], error: null };

    if (itemsError) {
      return { data: null, error: itemsError.message };
    }

    const itemMap = new Map<string, StorePurchaseItem[]>();

    for (const item of invoiceItems ?? []) {
      const product = Array.isArray(item.product) ? item.product[0] : item.product;
      const mappedItem: StorePurchaseItem = {
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: Number(item.unit_price),
        line_total: Number(item.line_total),
        product_name: product?.name ?? "Unknown product",
      };

      const current = itemMap.get(item.invoice_id) ?? [];
      current.push(mappedItem);
      itemMap.set(item.invoice_id, current);
    }

    const purchaseHistory: StorePurchaseInvoice[] = (invoices ?? []).map(
      (invoice) => ({
        id: invoice.id,
        invoice_date: invoice.invoice_date,
        month_key: invoice.month_key,
        status: invoice.status,
        total_amount: Number(invoice.total_amount),
        confirmed_at: invoice.confirmed_at,
        items: itemMap.get(invoice.id) ?? [],
      }),
    );

    return { data: purchaseHistory, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
