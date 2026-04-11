"use server";

import { requireStoreAdmin } from "@/app/utils/auth/require";
import { getCurrentUserWithRoles } from "@/app/utils/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

type ProductFormData = {
  name: string;
  sku?: string;
  barcode?: string;
  unitPrice: string;
  isActive: boolean;
  tracksStock: boolean;
};

type StoreProductRow = {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  unit_price: number;
  is_active: boolean;
  tracks_stock: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

function normalizeOptionalText(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function parseUnitPrice(value: string) {
  const normalized = value.trim();

  if (!normalized) {
    return { value: null, error: "Unit price is required" };
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) {
    return { value: null, error: "Unit price must be a valid number" };
  }

  if (parsed < 0) {
    return { value: null, error: "Unit price cannot be negative" };
  }

  return { value: Number(parsed.toFixed(2)), error: null };
}

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

function buildProductPayload(
  currentUserId: string,
  data: ProductFormData,
  mode: "create" | "update",
) {
  const name = data.name.trim();
  if (!name) {
    return { payload: null, error: "Product name is required" };
  }

  const parsedPrice = parseUnitPrice(data.unitPrice);
  if (parsedPrice.error || parsedPrice.value === null) {
    return { payload: null, error: parsedPrice.error ?? "Invalid unit price" };
  }

  const payload = {
    name,
    sku: normalizeOptionalText(data.sku),
    barcode: normalizeOptionalText(data.barcode),
    unit_price: parsedPrice.value,
    is_active: data.isActive,
    tracks_stock: data.tracksStock,
    ...(mode === "create"
      ? { created_by: currentUserId, updated_by: currentUserId }
      : { updated_by: currentUserId }),
  };

  return { payload, error: null };
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
        "id, name, sku, barcode, unit_price, is_active, tracks_stock, created_at, updated_at, created_by, updated_by",
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

  const built = buildProductPayload(auth.roles.userId, data, "create");
  if (built.error || !built.payload) {
    return { error: built.error ?? "Invalid product data" };
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
    const { error } = await supabaseAdmin
      .from("store_products")
      .insert(built.payload);

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

export async function updateStoreProduct(
  productId: string,
  data: ProductFormData,
) {
  const auth = await ensureStoreAdminAccess();
  if (auth.error || !auth.roles) {
    return { error: auth.error ?? "Not authorized" };
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

    const [{ count: invoiceItemCount, error: invoiceItemError }, { count: stockEntryCount, error: stockEntryError }, { count: stockMovementCount, error: stockMovementError }] =
      await Promise.all([
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

    if ((invoiceItemCount ?? 0) > 0 || (stockEntryCount ?? 0) > 0 || (stockMovementCount ?? 0) > 0) {
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
