"use server";

import { requireStoreAdmin } from "@/app/utils/auth/require";
import {
  getCurrentUserWithRoles,
  hasStorePermission,
} from "@/app/utils/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import {
  buildProductPayload,
  normalizeOptionalText,
  parseNonNegativeInteger,
  type ProductFormData,
} from "../_lib/store-domain";
import { ensureStoreMonthOpen } from "./month-closures";

type StoreProductRow = {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  image_url: string | null;
  unit_price: number;
  is_active: boolean;
  tracks_stock: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

async function ensureStoreAdminAccess() {
  await requireStoreAdmin();
  const roles = await getCurrentUserWithRoles();

  if (!roles) {
    return { error: "Not authenticated", roles: null };
  }

  return { error: null, roles };
}

async function ensureUniqueFields(
  productId: string | null,
  values: { sku: string | null; barcode: string | null },
) {
  const supabaseAdmin = createAdminClient();

  if (values.sku) {
    const { data, error } = await supabaseAdmin
      .from("store_products")
      .select("id")
      .eq("sku", values.sku)
      .maybeSingle();

    if (error) {
      return { error: error.message };
    }

    if (data && data.id !== productId) {
      return { error: "Another product already uses this SKU" };
    }
  }

  if (values.barcode) {
    const { data, error } = await supabaseAdmin
      .from("store_products")
      .select("id")
      .eq("barcode", values.barcode)
      .maybeSingle();

    if (error) {
      return { error: error.message };
    }

    if (data && data.id !== productId) {
      return { error: "Another product already uses this barcode" };
    }
  }

  return { error: null };
}

export async function getAllStoreProducts() {
  const auth = await ensureStoreAdminAccess();
  if (auth.error || !auth.roles) {
    return { data: null, error: auth.error ?? "Not authorized" };
  }

  try {
    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin
      .from("store_products")
      .select(
        "id, name, sku, barcode, image_url, unit_price, is_active, tracks_stock, created_at, updated_at, created_by, updated_by",
      )
      .order("created_at", { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: (data ?? []) as StoreProductRow[], error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function createStoreProduct(data: ProductFormData) {
  const auth = await ensureStoreAdminAccess();
  if (auth.error || !auth.roles) {
    return { error: auth.error ?? "Not authorized" };
  }

  if (!hasStorePermission(auth.roles, "product_manage")) {
    return { error: "You do not have permission to manage Store products" };
  }

  const built = buildProductPayload(auth.roles.userId, data, "create");
  if (built.error || !built.payload) {
    return { error: built.error ?? "Invalid product data" };
  }

  const parsedInitialQuantity = data.initialQuantity?.trim()
    ? parseNonNegativeInteger(data.initialQuantity)
    : { value: 0, error: null };
  if (
    parsedInitialQuantity.error ||
    parsedInitialQuantity.value === null
  ) {
    return {
      error: parsedInitialQuantity.error ?? "Invalid initial stock quantity",
    };
  }

  if (parsedInitialQuantity.value > 0 && !data.tracksStock) {
    return { error: "Initial quantity can only be set for stock-tracked products" };
  }

  const uniqueness = await ensureUniqueFields(null, {
    sku: built.payload.sku,
    barcode: built.payload.barcode,
  });
  if (uniqueness.error) {
    return { error: uniqueness.error };
  }

  try {
    const supabaseAdmin = createAdminClient();
    if (parsedInitialQuantity.value > 0) {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const monthStatus = await ensureStoreMonthOpen(currentMonth);
      if (monthStatus.error) {
        return { error: monthStatus.error };
      }
    }

    const { data: insertedProduct, error } = await supabaseAdmin
      .from("store_products")
      .insert(built.payload)
      .select("id, name")
      .single();

    if (error) {
      return { error: error.message };
    }

    if (parsedInitialQuantity.value > 0) {
      const { data: insertedEntry, error: entryError } = await supabaseAdmin
        .from("store_stock_entries")
        .insert({
          product_id: insertedProduct.id,
          quantity: parsedInitialQuantity.value,
          unit_cost: null,
          note: normalizeOptionalText(
            `Initial stock for ${insertedProduct.name}`,
          ),
          reference_type: "INITIAL_STOCK",
          reference_number: null,
          entered_by: auth.roles.userId,
        })
        .select("id")
        .single();

      if (entryError) {
        return { error: entryError.message };
      }

      const { error: movementError } = await supabaseAdmin
        .from("store_stock_movements")
        .insert({
          product_id: insertedProduct.id,
          stock_entry_id: insertedEntry.id,
          movement_type: "RESTOCK",
          quantity_delta: parsedInitialQuantity.value,
          reason: normalizeOptionalText(
            `Initial stock for ${insertedProduct.name}`,
          ),
          actor_user_id: auth.roles.userId,
        });

      if (movementError) {
        return { error: movementError.message };
      }
    }

    revalidatePath("/dashboard/store/admin");
    revalidatePath("/dashboard/store/admin/products");
    revalidatePath("/dashboard/store/admin/stocks");
    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateStoreProduct(
  productId: string,
  data: ProductFormData,
) {
  const auth = await ensureStoreAdminAccess();
  if (auth.error || !auth.roles) {
    return { error: auth.error ?? "Not authorized" };
  }

  if (!hasStorePermission(auth.roles, "product_manage")) {
    return { error: "You do not have permission to manage Store products" };
  }

  const built = buildProductPayload(auth.roles.userId, data, "update");
  if (built.error || !built.payload) {
    return { error: built.error ?? "Invalid product data" };
  }

  const uniqueness = await ensureUniqueFields(productId, {
    sku: built.payload.sku,
    barcode: built.payload.barcode,
  });
  if (uniqueness.error) {
    return { error: uniqueness.error };
  }

  try {
    const supabaseAdmin = createAdminClient();
    const { data: existing, error: existingError } = await supabaseAdmin
      .from("store_products")
      .select("id")
      .eq("id", productId)
      .maybeSingle();

    if (existingError) {
      return { error: existingError.message };
    }

    if (!existing) {
      return { error: "Product not found" };
    }

    const { error } = await supabaseAdmin
      .from("store_products")
      .update(built.payload)
      .eq("id", productId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/dashboard/store/admin");
    revalidatePath("/dashboard/store/admin/products");
    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteStoreProduct(productId: string) {
  const auth = await ensureStoreAdminAccess();
  if (auth.error || !auth.roles) {
    return { error: auth.error ?? "Not authorized" };
  }

  if (!hasStorePermission(auth.roles, "product_manage")) {
    return { error: "You do not have permission to manage Store products" };
  }

  try {
    const supabaseAdmin = createAdminClient();
    const { data: product, error: productError } = await supabaseAdmin
      .from("store_products")
      .select("id, name")
      .eq("id", productId)
      .maybeSingle();

    if (productError) {
      return { error: productError.message };
    }

    if (!product) {
      return { error: "Product not found" };
    }

    const [
      { count: invoiceItemCount, error: invoiceItemError },
      { count: stockEntryCount, error: stockEntryError },
      { count: stockMovementCount, error: stockMovementError },
    ] = await Promise.all([
      supabaseAdmin
        .from("store_invoice_items")
        .select("*", { count: "exact", head: true })
        .eq("product_id", productId),
      supabaseAdmin
        .from("store_stock_entries")
        .select("*", { count: "exact", head: true })
        .eq("product_id", productId),
      supabaseAdmin
        .from("store_stock_movements")
        .select("*", { count: "exact", head: true })
        .eq("product_id", productId),
    ]);

    if (invoiceItemError || stockEntryError || stockMovementError) {
      return {
        error:
          invoiceItemError?.message ??
          stockEntryError?.message ??
          stockMovementError?.message ??
          "Failed to validate product usage",
      };
    }

    if (
      (invoiceItemCount ?? 0) > 0 ||
      (stockEntryCount ?? 0) > 0 ||
      (stockMovementCount ?? 0) > 0
    ) {
      return {
        error:
          "This product already has purchase or stock history. Mark it inactive instead of deleting it.",
      };
    }

    const { error } = await supabaseAdmin
      .from("store_products")
      .delete()
      .eq("id", productId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/dashboard/store/admin");
    revalidatePath("/dashboard/store/admin/products");
    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
