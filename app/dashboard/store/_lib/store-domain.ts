export type StoreAccountCategory =
  | "MONTHLY_ALLOCATION"
  | "EMPLOYEE_PAYMENT"
  | "PURCHASE"
  | "REFUND"
  | "REVERSAL"
  | "CORRECTION"
  | "PENALTY"
  | "BONUS_OR_REWARD"
  | "OTHER";

export type StockActionType = "RESTOCK" | "DEDUCT" | "ADJUST";

export type InvoiceDraftItemInput = {
  productId: string;
  quantity: number;
};

export type ProductFormData = {
  name: string;
  sku?: string;
  barcode?: string;
  imageUrl?: string;
  unitPrice: string;
  isActive: boolean;
  tracksStock: boolean;
};

export const STORE_ACCOUNT_CATEGORIES: StoreAccountCategory[] = [
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

export const MANUAL_STORE_ACCOUNT_CATEGORIES: StoreAccountCategory[] = [
  "MONTHLY_ALLOCATION",
  "EMPLOYEE_PAYMENT",
  "REFUND",
  "CORRECTION",
  "PENALTY",
  "BONUS_OR_REWARD",
  "OTHER",
];

export function normalizeOptionalText(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function parsePositiveInteger(value: string) {
  const normalized = value.trim();
  if (!normalized) {
    return { value: null, error: "Quantity is required" };
  }

  const parsed = Number(normalized);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return {
      value: null,
      error: "Quantity must be a whole number greater than zero",
    };
  }

  return { value: parsed, error: null };
}

export function parseNonNegativeInteger(value: string) {
  const normalized = value.trim();
  if (!normalized) {
    return { value: null, error: "Quantity is required" };
  }

  const parsed = Number(normalized);
  if (!Number.isInteger(parsed) || parsed < 0) {
    return {
      value: null,
      error: "Quantity must be a whole number zero or greater",
    };
  }

  return { value: parsed, error: null };
}

export function parsePositiveMoney(value: string) {
  const normalized = value.trim();
  if (!normalized) {
    return { value: null, error: "Amount is required" };
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return { value: null, error: "Amount must be greater than zero" };
  }

  return { value: Number(parsed.toFixed(2)), error: null };
}

export function parseOptionalMoney(value?: string) {
  const normalized = value?.trim();
  if (!normalized) {
    return { value: null, error: null };
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return {
      value: null,
      error: "Unit cost must be zero or a positive number",
    };
  }

  return { value: Number(parsed.toFixed(2)), error: null };
}

export function parseUnitPrice(value: string) {
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

export function startOfMonth(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
    .toISOString()
    .slice(0, 10);
}

export function normalizeStoreMonthKey(monthKey: string) {
  const normalized = monthKey.trim();
  if (!normalized) {
    return null;
  }

  const withDay = /^\d{4}-\d{2}$/.test(normalized)
    ? `${normalized}-01`
    : normalized;
  const date = new Date(withDay);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
    .toISOString()
    .slice(0, 10);
}

export function getMonthRange(monthKey: string) {
  const normalizedMonth = normalizeStoreMonthKey(monthKey);
  if (!normalizedMonth) {
    return null;
  }

  const start = new Date(`${normalizedMonth}T00:00:00.000Z`);
  const end = new Date(start);
  end.setUTCMonth(end.getUTCMonth() + 1);
  end.setUTCDate(0);

  const nextMonth = new Date(start);
  nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);

  return {
    monthKey: normalizedMonth,
    startDate: normalizedMonth,
    endDate: end.toISOString().slice(0, 10),
    nextMonthKey: nextMonth.toISOString().slice(0, 10),
  };
}

export function buildQuantityDelta(
  actionType: StockActionType,
  quantity: number,
  currentOnHand: number,
) {
  if (actionType === "RESTOCK") {
    return quantity;
  }

  if (actionType === "DEDUCT") {
    return quantity * -1;
  }

  return quantity - currentOnHand;
}

export function isValidStockActionType(
  value: string,
): value is StockActionType {
  return value === "RESTOCK" || value === "DEDUCT" || value === "ADJUST";
}

export function ensureValidCategory(
  category: string,
): category is StoreAccountCategory {
  return STORE_ACCOUNT_CATEGORIES.includes(category as StoreAccountCategory);
}

export function ensureValidManualCategory(
  category: string,
): category is StoreAccountCategory {
  return MANUAL_STORE_ACCOUNT_CATEGORIES.includes(
    category as StoreAccountCategory,
  );
}

export function normalizeDraftItems(items: InvoiceDraftItemInput[]) {
  const grouped = new Map<string, number>();

  for (const item of items) {
    if (
      !item.productId ||
      !Number.isInteger(item.quantity) ||
      item.quantity <= 0
    ) {
      return {
        items: null,
        error: "Each invoice item must have a valid quantity",
      };
    }

    grouped.set(
      item.productId,
      (grouped.get(item.productId) ?? 0) + item.quantity,
    );
  }

  return {
    items: Array.from(grouped.entries()).map(([productId, quantity]) => ({
      productId,
      quantity,
    })),
    error: null,
  };
}

export function buildStoreInvoiceReversalReason(
  invoiceId: string,
  reason: string,
) {
  const trimmedReason = reason.trim();

  return trimmedReason
    ? `Invoice reversal for ${invoiceId}: ${trimmedReason}`
    : `Invoice reversal for ${invoiceId}`;
}

export function buildStoreLowBalanceMessage(
  currentBalance: number,
  invoiceTotal: number,
) {
  if (!Number.isFinite(currentBalance) || !Number.isFinite(invoiceTotal)) {
    return "Low balance. Please recharge your balance from the authority before purchasing.";
  }

  if (invoiceTotal <= 0 || currentBalance >= invoiceTotal) {
    return null;
  }

  const shortfall = Number((invoiceTotal - currentBalance).toFixed(2));

  return `Low balance. Please recharge your balance from the authority before purchasing. You need ${shortfall.toFixed(2)} BDT more.`;
}

export function buildProductPayload(
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
    image_url: normalizeOptionalText(data.imageUrl),
    unit_price: parsedPrice.value,
    is_active: data.isActive,
    tracks_stock: data.tracksStock,
    ...(mode === "create"
      ? { created_by: currentUserId, updated_by: currentUserId }
      : { updated_by: currentUserId }),
  };

  return { payload, error: null };
}
