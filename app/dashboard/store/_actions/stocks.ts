"use server";

import { requireStoreAdmin } from "@/app/utils/auth/require";
import { getCurrentUserWithRoles } from "@/app/utils/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import {
  buildQuantityDelta,
  isValidStockActionType,
  normalizeOptionalText,
  parseNonNegativeInteger,
  parseOptionalMoney,
  parsePositiveInteger,
  type StockActionType,
} from "../_lib/store-domain";
import { ensureStoreMonthOpen } from "./month-closures";

type StockActionInput = {
  productId: string;
  actionType: StockActionType;
  quantity: string;
  unitCost?: string;
  reason: string;
  referenceType?: string;
  referenceNumber?: string;
};

type StockProductRow = {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  unit_price: number;
  is_active: boolean;
  tracks_stock: boolean;
  created_at: string;
  updated_at: string;
};

type StockMovementRow = {
  id: string;
  product_id: string;
  stock_entry_id: string | null;
  invoice_item_id: string | null;
  reversed_from_movement_id: string | null;
  movement_type: "RESTOCK" | "SALE" | "ADJUSTMENT" | "REVERSAL";
  quantity_delta: number;
  reason: string | null;
  actor_user_id: string | null;
  created_at: string;
};


async function ensureStoreAdminAccess() {
  await requireStoreAdmin();
  const roles = await getCurrentUserWithRoles();

  if (!roles) {
    return { error: "Not authenticated", roles: null };
  }

  return { error: null, roles };
}

async function getTrackedProduct(productId: string) {
  const supabaseAdmin = createAdminClient();
  const { data, error } = await supabaseAdmin
    .from("store_products")
    .select("id, name, tracks_stock, is_active")
    .eq("id", productId)
    .maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }

  if (!data) {
    return { data: null, error: "Product not found" };
  }

  if (!data.tracks_stock) {
    return {
      data: null,
      error: "This product does not track stock and cannot use stock actions",
    };
  }

  if (!data.is_active) {
    return {
      data: null,
      error: "Inactive products cannot receive new stock actions",
    };
  }

  return { data, error: null };
}

async function getCurrentOnHand(productId: string) {
  const supabaseAdmin = createAdminClient();
  const { data, error } = await supabaseAdmin
    .from("store_stock_movements")
    .select("quantity_delta")
    .eq("product_id", productId);

  if (error) {
    return { quantity: null, error: error.message };
  }

  const quantity = (data ?? []).reduce(
    (sum, row) => sum + Number(row.quantity_delta ?? 0),
    0,
  );

  return { quantity, error: null };
}

export async function getStoreStockOverview() {
  const auth = await ensureStoreAdminAccess();
  if (auth.error || !auth.roles) {
    return { data: null, error: auth.error ?? "Not authorized" };
  }

  try {
    const supabaseAdmin = createAdminClient();
    const [
      { data: products, error: productsError },
      { data: allMovements, error: allMovementsError },
      { data: recentMovements, error: recentMovementsError },
    ] =
      await Promise.all([
        supabaseAdmin
          .from("store_products")
          .select(
            "id, name, sku, barcode, unit_price, is_active, tracks_stock, created_at, updated_at",
          )
          .eq("tracks_stock", true)
          .order("name", { ascending: true }),
        supabaseAdmin
          .from("store_stock_movements")
          .select("product_id, quantity_delta"),
        supabaseAdmin
          .from("store_stock_movements")
          .select(
            "id, product_id, stock_entry_id, invoice_item_id, reversed_from_movement_id, movement_type, quantity_delta, reason, actor_user_id, created_at",
          )
          .order("created_at", { ascending: false })
          .limit(100),
      ]);

    if (productsError) {
      return { data: null, error: productsError.message };
    }

    if (allMovementsError) {
      return { data: null, error: allMovementsError.message };
    }

    if (recentMovementsError) {
      return { data: null, error: recentMovementsError.message };
    }

    const typedProducts = (products ?? []) as StockProductRow[];
    const typedRecentMovements = (recentMovements ?? []) as StockMovementRow[];

    const movementSums = new Map<string, number>();
    for (const movement of allMovements ?? []) {
      movementSums.set(
        movement.product_id,
        (movementSums.get(movement.product_id) ?? 0) +
          Number(movement.quantity_delta ?? 0),
      );
    }

    for (const product of typedProducts) {
      if (!movementSums.has(product.id)) {
        movementSums.set(product.id, 0);
      }
    }

    const actorIds = Array.from(
      new Set(
        typedRecentMovements
          .map((movement) => movement.actor_user_id)
          .filter((value): value is string => Boolean(value)),
      ),
    );

    let actorMap = new Map<string, string>();
    if (actorIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabaseAdmin
        .from("profiles")
        .select("id, full_name, email")
        .in("id", actorIds);

      if (profilesError) {
        return { data: null, error: profilesError.message };
      }

      actorMap = new Map(
        (profiles ?? []).map((profile) => [
          profile.id,
          profile.full_name || profile.email || "Unknown user",
        ]),
      );
    }

    const productMap = new Map(
      typedProducts.map((product) => [product.id, product]),
    );

    const productStock = typedProducts.map((product) => ({
      ...product,
      on_hand: movementSums.get(product.id) ?? 0,
    }));

    const movementHistory = typedRecentMovements.map((movement) => ({
      ...movement,
      product_name: productMap.get(movement.product_id)?.name ?? "Unknown product",
      actor_name: movement.actor_user_id
        ? (actorMap.get(movement.actor_user_id) ?? "Unknown user")
        : "System",
      reference_id:
        movement.stock_entry_id ??
        movement.invoice_item_id ??
        movement.reversed_from_movement_id ??
        null,
    }));

    return {
      data: {
        products: productStock,
        movementHistory,
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

export async function recordStoreStockAction(data: StockActionInput) {
  const auth = await ensureStoreAdminAccess();
  if (auth.error || !auth.roles) {
    return { error: auth.error ?? "Not authorized" };
  }

  if (!data.productId.trim()) {
    return { error: "Product is required" };
  }

  if (!isValidStockActionType(data.actionType)) {
    return { error: "Invalid stock action type" };
  }

  const reason = data.reason.trim();

  const parsedQuantity =
    data.actionType === "ADJUST"
      ? parseNonNegativeInteger(data.quantity)
      : parsePositiveInteger(data.quantity);
  if (parsedQuantity.error || parsedQuantity.value === null) {
    return { error: parsedQuantity.error ?? "Invalid quantity" };
  }

  const parsedUnitCost = parseOptionalMoney(data.unitCost);
  if (parsedUnitCost.error) {
    return { error: parsedUnitCost.error };
  }

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthStatus = await ensureStoreMonthOpen(currentMonth);
  if (monthStatus.error) {
    return { error: monthStatus.error };
  }

  const productCheck = await getTrackedProduct(data.productId);
  if (productCheck.error || !productCheck.data) {
    return {
      error: productCheck.error ?? "Product not available for stock actions",
    };
  }

  const currentOnHand = await getCurrentOnHand(data.productId);
  if (currentOnHand.error || currentOnHand.quantity === null) {
    return { error: currentOnHand.error ?? "Unable to read current stock" };
  }

  const quantityDelta = buildQuantityDelta(
    data.actionType,
    parsedQuantity.value,
    currentOnHand.quantity,
  );

  if (quantityDelta === 0) {
    return data.actionType === "ADJUST"
      ? { error: "Adjusted quantity matches the current on-hand stock" }
      : { error: "Stock change cannot be zero" };
  }

  if (currentOnHand.quantity + quantityDelta < 0) {
    return {
      error: `This change would make stock negative for ${productCheck.data.name}.`,
    };
  }

  try {
    const supabaseAdmin = createAdminClient();

    let stockEntryId: string | null = null;
    if (data.actionType === "RESTOCK") {
      const { data: insertedEntry, error: entryError } = await supabaseAdmin
        .from("store_stock_entries")
        .insert({
          product_id: data.productId,
          quantity: parsedQuantity.value,
          unit_cost: parsedUnitCost.value,
          note: normalizeOptionalText(reason),
          reference_type: normalizeOptionalText(data.referenceType),
          reference_number: normalizeOptionalText(data.referenceNumber),
          entered_by: auth.roles.userId,
        })
        .select("id")
        .single();

      if (entryError) {
        return { error: entryError.message };
      }

      stockEntryId = insertedEntry.id;
    }

    const movementType =
      data.actionType === "RESTOCK" ? "RESTOCK" : "ADJUSTMENT";

    const { error: movementError } = await supabaseAdmin
      .from("store_stock_movements")
      .insert({
        product_id: data.productId,
        stock_entry_id: stockEntryId,
        movement_type: movementType,
        quantity_delta: quantityDelta,
        reason: normalizeOptionalText(reason),
        actor_user_id: auth.roles.userId,
      });

    if (movementError) {
      return { error: movementError.message };
    }

    revalidatePath("/dashboard/store/admin");
    revalidatePath("/dashboard/store/admin/stocks");
    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
