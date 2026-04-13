"use server";

import { requireStoreAccess, requireStoreAdmin } from "@/app/utils/auth/require";
import { getCurrentUserWithRoles } from "@/app/utils/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import {
  buildStoreInvoiceReversalReason,
  normalizeDraftItems,
  type InvoiceDraftItemInput,
} from "../_lib/store-domain";
import { ensureStoreMonthOpen } from "./month-closures";

type CreateStoreInvoiceInput = {
  items: InvoiceDraftItemInput[];
};

type StoreInvoiceStatus = "CONFIRMED" | "REVERSED";

type StoreInvoiceProduct = {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  unit_price: number;
  tracks_stock: boolean;
  stock_quantity: number | null;
};

type StoreInvoiceCustomer = {
  name: string;
  email: string | null;
};

type StoreAdminInvoiceItem = {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  product_name: string;
};

type StoreAdminInvoice = {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  invoice_date: string;
  month_key: string;
  status: StoreInvoiceStatus;
  total_amount: number;
  confirmed_at: string;
  reversed_at: string | null;
  reversed_by: string | null;
  reversed_by_name: string | null;
  reversal_reason: string | null;
  items: StoreAdminInvoiceItem[];
};

type ReverseStoreInvoiceInput = {
  invoiceId: string;
  reason: string;
};

async function getCurrentUserForStoreAction() {
  await requireStoreAccess();
  const roles = await getCurrentUserWithRoles();

  if (!roles) {
    return { error: "Not authenticated", roles: null };
  }

  return { error: null, roles };
}

async function getCurrentUserForStoreAdminAction() {
  await requireStoreAdmin();
  const roles = await getCurrentUserWithRoles();

  if (!roles) {
    return { error: "Not authenticated", roles: null };
  }

  return { error: null, roles };
}

export async function getStoreInvoiceBuilderData() {
  const auth = await getCurrentUserForStoreAction();
  if (auth.error || !auth.roles) {
    return { data: null, error: auth.error ?? "Not authorized" };
  }

  try {
    const supabaseAdmin = createAdminClient();
    const [
      { data: products, error: productsError },
      { data: balanceRows, error: balanceError },
      { data: profile, error: profileError },
    ] = await Promise.all([
        supabaseAdmin
          .from("store_products")
          .select("id, name, sku, barcode, unit_price, tracks_stock")
          .eq("is_active", true)
          .order("name", { ascending: true }),
        supabaseAdmin
          .from("store_account_entries")
          .select("amount")
          .eq("user_id", auth.roles.userId),
        supabaseAdmin
          .from("profiles")
          .select("full_name, email")
          .eq("id", auth.roles.userId)
          .maybeSingle(),
      ]);

    if (productsError) {
      return { data: null, error: productsError.message };
    }

    if (balanceError) {
      return { data: null, error: balanceError.message };
    }

    if (profileError) {
      return { data: null, error: profileError.message };
    }

    const trackedProductIds = (products ?? [])
      .filter((product) => product.tracks_stock)
      .map((product) => product.id);

    const { data: stockMovements, error: stockMovementsError } =
      trackedProductIds.length > 0
        ? await supabaseAdmin
            .from("store_stock_movements")
            .select("product_id, quantity_delta")
            .in("product_id", trackedProductIds)
        : { data: [], error: null };

    if (stockMovementsError) {
      return { data: null, error: stockMovementsError.message };
    }

    const currentBalance = (balanceRows ?? []).reduce(
      (sum, row) => sum + Number(row.amount ?? 0),
      0,
    );

    const stockMap = new Map<string, number>();
    for (const movement of stockMovements ?? []) {
      stockMap.set(
        movement.product_id,
        (stockMap.get(movement.product_id) ?? 0) +
          Number(movement.quantity_delta ?? 0),
      );
    }

    const customer: StoreInvoiceCustomer = {
      name:
        profile?.full_name?.trim() ||
        profile?.email?.trim() ||
        "Store User",
      email: profile?.email?.trim() || null,
    };

    return {
      data: {
        products: ((products ?? []) as StoreInvoiceProduct[]).map((product) => ({
          ...product,
          unit_price: Number(product.unit_price),
          stock_quantity: product.tracks_stock
            ? stockMap.get(product.id) ?? 0
            : null,
        })),
        currentBalance: Number(currentBalance.toFixed(2)),
        customer,
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

export async function createStoreInvoice(data: CreateStoreInvoiceInput) {
  const auth = await getCurrentUserForStoreAction();
  if (auth.error || !auth.roles) {
    return { error: auth.error ?? "Not authorized" };
  }

  const normalized = normalizeDraftItems(data.items);
  if (normalized.error || !normalized.items || normalized.items.length === 0) {
    return { error: normalized.error ?? "Add at least one item to the invoice" };
  }

  const userId = auth.roles.userId;
  const productIds = normalized.items.map((item) => item.productId);

  const supabaseAdmin = createAdminClient();
  const { data: products, error: productsError } = await supabaseAdmin
    .from("store_products")
    .select("id, name, unit_price, is_active, tracks_stock")
    .in("id", productIds);

  if (productsError) {
    return { error: productsError.message };
  }

  const productMap = new Map((products ?? []).map((product) => [product.id, product]));

  for (const item of normalized.items) {
    const product = productMap.get(item.productId);
    if (!product) {
      return { error: "One or more selected products no longer exist" };
    }

    if (!product.is_active) {
      return { error: `${product.name} is inactive and cannot be purchased` };
    }
  }

  const trackedProductIds = normalized.items
    .filter((item) => productMap.get(item.productId)?.tracks_stock)
    .map((item) => item.productId);

  if (trackedProductIds.length > 0) {
    const { data: movementRows, error: movementError } = await supabaseAdmin
      .from("store_stock_movements")
      .select("product_id, quantity_delta")
      .in("product_id", trackedProductIds);

    if (movementError) {
      return { error: movementError.message };
    }

    const stockMap = new Map<string, number>();
    for (const row of movementRows ?? []) {
      stockMap.set(
        row.product_id,
        (stockMap.get(row.product_id) ?? 0) + Number(row.quantity_delta ?? 0),
      );
    }

    for (const item of normalized.items) {
      const product = productMap.get(item.productId);
      if (!product?.tracks_stock) continue;

      const onHand = stockMap.get(item.productId) ?? 0;
      if (onHand < item.quantity) {
        return {
          error: `Insufficient stock for ${product.name}. Available: ${onHand}, requested: ${item.quantity}.`,
        };
      }
    }
  }

  const invoiceDate = new Date().toISOString().slice(0, 10);
  const monthKey = `${invoiceDate.slice(0, 7)}-01`;
  const monthStatus = await ensureStoreMonthOpen(monthKey);
  if (monthStatus.error) {
    return { error: monthStatus.error };
  }

  const totalAmount = normalized.items.reduce((sum, item) => {
    const product = productMap.get(item.productId);
    return sum + Number(product?.unit_price ?? 0) * item.quantity;
  }, 0);

  let createdInvoiceId: string | null = null;
  let createdEntryId: string | null = null;
  let createdInvoiceItems:
    | Array<{ id: string; product_id: string; quantity: number }>
    | null = null;

  try {
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from("store_invoices")
      .insert({
        user_id: userId,
        invoice_date: invoiceDate,
        month_key: monthKey,
        total_amount: Number(totalAmount.toFixed(2)),
        status: "CONFIRMED",
      })
      .select("id")
      .single();

    if (invoiceError) {
      return { error: invoiceError.message };
    }

    createdInvoiceId = invoice.id;

    const invoiceItemsPayload = normalized.items.map((item) => {
      const product = productMap.get(item.productId)!;
      const unitPrice = Number(product.unit_price);
      return {
        invoice_id: createdInvoiceId,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: unitPrice,
        line_total: Number((unitPrice * item.quantity).toFixed(2)),
      };
    });

    const { data: insertedItems, error: itemsError } = await supabaseAdmin
      .from("store_invoice_items")
      .insert(invoiceItemsPayload)
      .select("id, product_id, quantity");

    if (itemsError) {
      throw new Error(itemsError.message);
    }

    createdInvoiceItems = (insertedItems ?? []).map((item) => ({
      id: item.id,
      product_id: item.product_id,
      quantity: item.quantity,
    }));

    const { data: accountEntry, error: accountError } = await supabaseAdmin
      .from("store_account_entries")
      .insert({
        user_id: userId,
        entry_date: invoiceDate,
        month_key: monthKey,
        amount: Number((totalAmount * -1).toFixed(2)),
        category: "PURCHASE",
        reason: `Store invoice ${createdInvoiceId}`,
        invoice_id: createdInvoiceId,
        created_by: userId,
      })
      .select("id")
      .single();

    if (accountError) {
      throw new Error(accountError.message);
    }

    createdEntryId = accountEntry.id;

    const stockMovementsPayload = (createdInvoiceItems ?? [])
      .filter((item) => productMap.get(item.product_id)?.tracks_stock)
      .map((item) => ({
        product_id: item.product_id,
        invoice_item_id: item.id,
        movement_type: "SALE" as const,
        quantity_delta: item.quantity * -1,
        reason: `Sold via invoice ${createdInvoiceId}`,
        actor_user_id: userId,
      }));

    if (stockMovementsPayload.length > 0) {
      const { error: stockMovementError } = await supabaseAdmin
        .from("store_stock_movements")
        .insert(stockMovementsPayload);

      if (stockMovementError) {
        throw new Error(stockMovementError.message);
      }
    }

    revalidatePath("/dashboard/store");
    revalidatePath("/dashboard/store/invoices/new");
    revalidatePath("/dashboard/store/purchases");
    revalidatePath("/dashboard/store/accounts");
    revalidatePath("/dashboard/store/admin");
    revalidatePath("/dashboard/store/admin/stocks");
    revalidatePath("/dashboard/store/admin/accounts");

    return { error: null, data: { invoiceId: createdInvoiceId } };
  } catch (error) {
    if (createdInvoiceItems && createdInvoiceItems.length > 0) {
      const invoiceItemIds = createdInvoiceItems.map((item) => item.id);
      await supabaseAdmin
        .from("store_stock_movements")
        .delete()
        .in("invoice_item_id", invoiceItemIds);
    }

    if (createdEntryId) {
      await supabaseAdmin
        .from("store_account_entries")
        .delete()
        .eq("id", createdEntryId);
    }

    if (createdInvoiceId) {
      await supabaseAdmin.from("store_invoices").delete().eq("id", createdInvoiceId);
    }

    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to save invoice. Any partial records were rolled back.",
    };
  }
}

export async function getStoreAdminInvoiceHistory() {
  const auth = await getCurrentUserForStoreAdminAction();
  if (auth.error || !auth.roles) {
    return { data: null, error: auth.error ?? "Not authorized" };
  }

  try {
    const supabaseAdmin = createAdminClient();
    const { data: invoices, error: invoicesError } = await supabaseAdmin
      .from("store_invoices")
      .select(
        "id, user_id, invoice_date, month_key, status, total_amount, confirmed_at, reversed_at, reversed_by, reversal_reason",
      )
      .order("confirmed_at", { ascending: false })
      .limit(200);

    if (invoicesError) {
      return { data: null, error: invoicesError.message };
    }

    const invoiceIds = (invoices ?? []).map((invoice) => invoice.id);

    const { data: invoiceItems, error: itemsError } = invoiceIds.length
      ? await supabaseAdmin
          .from("store_invoice_items")
          .select(
            "id, invoice_id, product_id, quantity, unit_price, line_total, product:store_products(name)",
          )
          .in("invoice_id", invoiceIds)
      : { data: [], error: null };

    if (itemsError) {
      return { data: null, error: itemsError.message };
    }

    const profileIds = Array.from(
      new Set(
        (invoices ?? [])
          .flatMap((invoice) => [invoice.user_id, invoice.reversed_by])
          .filter((value): value is string => Boolean(value)),
      ),
    );

    const { data: profiles, error: profilesError } = profileIds.length
      ? await supabaseAdmin
          .from("profiles")
          .select("id, full_name, email")
          .in("id", profileIds)
      : { data: [], error: null };

    if (profilesError) {
      return { data: null, error: profilesError.message };
    }

    const profileMap = new Map(
      (profiles ?? []).map((profile) => [profile.id, profile]),
    );
    const itemMap = new Map<string, StoreAdminInvoiceItem[]>();

    for (const item of invoiceItems ?? []) {
      const product = Array.isArray(item.product) ? item.product[0] : item.product;
      const mappedItem: StoreAdminInvoiceItem = {
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

    const history: StoreAdminInvoice[] = (invoices ?? []).map((invoice) => {
      const userProfile = profileMap.get(invoice.user_id);
      const reversalActor = invoice.reversed_by
        ? profileMap.get(invoice.reversed_by)
        : null;

      return {
        id: invoice.id,
        user_id: invoice.user_id,
        user_name: userProfile?.full_name || userProfile?.email || "Unknown",
        user_email: userProfile?.email || "Unknown",
        invoice_date: invoice.invoice_date,
        month_key: invoice.month_key,
        status: invoice.status as StoreInvoiceStatus,
        total_amount: Number(invoice.total_amount),
        confirmed_at: invoice.confirmed_at,
        reversed_at: invoice.reversed_at,
        reversed_by: invoice.reversed_by,
        reversed_by_name:
          reversalActor?.full_name || reversalActor?.email || null,
        reversal_reason: invoice.reversal_reason,
        items: itemMap.get(invoice.id) ?? [],
      };
    });

    return { data: history, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function reverseStoreInvoice(data: ReverseStoreInvoiceInput) {
  const auth = await getCurrentUserForStoreAdminAction();
  if (auth.error || !auth.roles) {
    return { error: auth.error ?? "Not authorized" };
  }

  const invoiceId = data.invoiceId.trim();
  if (!invoiceId) {
    return { error: "Invoice is required" };
  }

  const reason = data.reason.trim();

  const supabaseAdmin = createAdminClient();

  const { data: invoice, error: invoiceError } = await supabaseAdmin
    .from("store_invoices")
    .select("id, user_id, status, total_amount, reversed_at, month_key")
    .eq("id", invoiceId)
    .maybeSingle();

  if (invoiceError) {
    return { error: invoiceError.message };
  }

  if (!invoice) {
    return { error: "Invoice not found" };
  }

  if (invoice.status !== "CONFIRMED" || invoice.reversed_at) {
    return { error: "This invoice has already been reversed" };
  }

  const originalMonthStatus = await ensureStoreMonthOpen(invoice.month_key);
  if (originalMonthStatus.error) {
    return {
      error:
        "This invoice belongs to a closed month and can no longer be reversed.",
    };
  }

  const { data: purchaseEntry, error: purchaseEntryError } = await supabaseAdmin
    .from("store_account_entries")
    .select("id, amount")
    .eq("invoice_id", invoiceId)
    .eq("category", "PURCHASE")
    .is("reversed_from_entry_id", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (purchaseEntryError) {
    return { error: purchaseEntryError.message };
  }

  if (!purchaseEntry) {
    return { error: "The original purchase ledger entry could not be found" };
  }

  const { data: existingReversalEntry, error: reversalLookupError } =
    await supabaseAdmin
      .from("store_account_entries")
      .select("id")
      .eq("reversed_from_entry_id", purchaseEntry.id)
      .limit(1)
      .maybeSingle();

  if (reversalLookupError) {
    return { error: reversalLookupError.message };
  }

  if (existingReversalEntry) {
    return { error: "A reversal entry already exists for this invoice" };
  }

  const { data: invoiceItems, error: invoiceItemsError } = await supabaseAdmin
    .from("store_invoice_items")
    .select("id")
    .eq("invoice_id", invoiceId);

  if (invoiceItemsError) {
    return { error: invoiceItemsError.message };
  }

  const invoiceItemIds = (invoiceItems ?? []).map((item) => item.id);

  const { data: saleMovements, error: saleMovementsError } = invoiceItemIds.length
    ? await supabaseAdmin
        .from("store_stock_movements")
        .select("id, product_id, invoice_item_id, quantity_delta")
        .in("invoice_item_id", invoiceItemIds)
        .eq("movement_type", "SALE")
        .is("reversed_from_movement_id", null)
    : { data: [], error: null };

  if (saleMovementsError) {
    return { error: saleMovementsError.message };
  }

  if (saleMovements && saleMovements.length > 0) {
    const saleMovementIds = saleMovements.map((movement) => movement.id);
    const { data: existingStockReversal, error: stockReversalLookupError } =
      await supabaseAdmin
        .from("store_stock_movements")
        .select("id")
        .in("reversed_from_movement_id", saleMovementIds)
        .limit(1)
        .maybeSingle();

    if (stockReversalLookupError) {
      return { error: stockReversalLookupError.message };
    }

    if (existingStockReversal) {
      return { error: "A stock reversal already exists for this invoice" };
    }
  }

  const now = new Date().toISOString();
  const currentMonthStatus = await ensureStoreMonthOpen(now.slice(0, 7));
  if (currentMonthStatus.error) {
    return { error: currentMonthStatus.error };
  }

  const reversalAmount = Math.abs(Number(purchaseEntry.amount));
  const reversalReason = buildStoreInvoiceReversalReason(invoiceId, reason);

  let createdReversalEntryId: string | null = null;
  let createdStockReversalIds: string[] = [];

  try {
    const { data: reversalEntry, error: reversalEntryError } = await supabaseAdmin
      .from("store_account_entries")
      .insert({
        user_id: invoice.user_id,
        entry_date: now.slice(0, 10),
        month_key: now.slice(0, 7) + "-01",
        amount: Number(reversalAmount.toFixed(2)),
        category: "REVERSAL",
        reason: reversalReason,
        invoice_id: invoiceId,
        reversed_from_entry_id: purchaseEntry.id,
        created_by: auth.roles.userId,
      })
      .select("id")
      .single();

    if (reversalEntryError) {
      throw new Error(reversalEntryError.message);
    }

    createdReversalEntryId = reversalEntry.id;

    if (saleMovements && saleMovements.length > 0) {
      const stockReversalPayload = saleMovements.map((movement) => ({
        product_id: movement.product_id,
        invoice_item_id: movement.invoice_item_id,
        reversed_from_movement_id: movement.id,
        movement_type: "REVERSAL" as const,
        quantity_delta: Math.abs(Number(movement.quantity_delta)),
        reason: reversalReason,
        actor_user_id: auth.roles.userId,
      }));

      const { data: insertedReversals, error: stockReversalError } =
        await supabaseAdmin
          .from("store_stock_movements")
          .insert(stockReversalPayload)
          .select("id");

      if (stockReversalError) {
        throw new Error(stockReversalError.message);
      }

      createdStockReversalIds = (insertedReversals ?? []).map((row) => row.id);
    }

    const { error: updateInvoiceError } = await supabaseAdmin
      .from("store_invoices")
      .update({
        status: "REVERSED",
        reversed_at: now,
        reversed_by: auth.roles.userId,
        reversal_reason: reason || null,
      })
      .eq("id", invoiceId)
      .eq("status", "CONFIRMED");

    if (updateInvoiceError) {
      throw new Error(updateInvoiceError.message);
    }

    revalidatePath("/dashboard/store");
    revalidatePath("/dashboard/store/purchases");
    revalidatePath("/dashboard/store/accounts");
    revalidatePath("/dashboard/store/admin");
    revalidatePath("/dashboard/store/admin/accounts");
    revalidatePath("/dashboard/store/admin/stocks");
    revalidatePath("/dashboard/store/admin/invoices");

    return { error: null };
  } catch (error) {
    if (createdStockReversalIds.length > 0) {
      await supabaseAdmin
        .from("store_stock_movements")
        .delete()
        .in("id", createdStockReversalIds);
    }

    if (createdReversalEntryId) {
      await supabaseAdmin
        .from("store_account_entries")
        .delete()
        .eq("id", createdReversalEntryId);
    }

    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to reverse invoice. Any partial reversal records were rolled back.",
    };
  }
}
