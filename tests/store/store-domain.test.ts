import assert from "node:assert/strict";
import test from "node:test";

import {
  buildProductPayload,
  buildQuantityDelta,
  buildStoreInvoiceReversalReason,
  buildStoreLowBalanceMessage,
  ensureValidCategory,
  ensureValidManualCategory,
  getMonthRange,
  normalizeDraftItems,
  normalizeStoreMonthKey,
  parseNonNegativeInteger,
  parseOptionalMoney,
  parsePositiveInteger,
  parsePositiveMoney,
  parseUnitPrice,
  startOfMonth,
} from "@/app/dashboard/store/_lib/store-domain";
import {
  hasAnyAccess,
  hasStoreAccess,
  isStoreAdmin,
  type UserWithRoles,
} from "@/app/utils/auth/roles";

function buildRoles(overrides: Partial<UserWithRoles> = {}): UserWithRoles {
  return {
    userId: "user-1",
    email: "user@example.com",
    profileRole: null,
    crmRole: null,
    hrmRole: null,
    storeRole: null,
    hasEducationAccess: false,
    hasCrmAccess: false,
    hasHrmAccess: false,
    hasStoreAccess: false,
    storePermissions: [],
    storeCapabilities: {
      canManageOwnerPurchases: false,
      canAddBalance: false,
      canManageStock: false,
      canManageProducts: false,
      canManageInvoices: false,
      canManagePermissions: false,
    },
    canAccessCrmAdmin: false,
    canActAsCrmMarketer: false,
    isDualCapabilityCrmUser: false,
    ...overrides,
  };
}

test("role helpers grant Store access only when Store flags are present", () => {
  const noStoreRoles = buildRoles();
  const storeUserRoles = buildRoles({
    hasStoreAccess: true,
    storeRole: "USER",
  });
  const storeAdminRoles = buildRoles({
    hasStoreAccess: true,
    storeRole: "ADMIN",
  });

  assert.equal(hasStoreAccess(noStoreRoles), false);
  assert.equal(hasAnyAccess(noStoreRoles), false);

  assert.equal(hasStoreAccess(storeUserRoles), true);
  assert.equal(hasAnyAccess(storeUserRoles), true);
  assert.equal(isStoreAdmin(storeUserRoles), false);

  assert.equal(isStoreAdmin(storeAdminRoles), true);
});

test("normalizeDraftItems groups duplicate products and rejects invalid quantities", () => {
  const grouped = normalizeDraftItems([
    { productId: "chips", quantity: 1 },
    { productId: "drink", quantity: 2 },
    { productId: "chips", quantity: 3 },
  ]);

  assert.equal(grouped.error, null);
  assert.deepEqual(grouped.items, [
    { productId: "chips", quantity: 4 },
    { productId: "drink", quantity: 2 },
  ]);

  const invalid = normalizeDraftItems([{ productId: "chips", quantity: 0 }]);
  assert.equal(invalid.items, null);
  assert.equal(invalid.error, "Each invoice item must have a valid quantity");
});

test("stock quantity helpers enforce positive and non-negative rules", () => {
  assert.deepEqual(parsePositiveInteger("3"), { value: 3, error: null });
  assert.equal(
    parsePositiveInteger("0").error,
    "Quantity must be a whole number greater than zero",
  );

  assert.deepEqual(parseNonNegativeInteger("0"), { value: 0, error: null });
  assert.equal(
    parseNonNegativeInteger("-1").error,
    "Quantity must be a whole number zero or greater",
  );
});

test("buildQuantityDelta follows Store stock rules", () => {
  assert.equal(buildQuantityDelta("RESTOCK", 5, 7), 5);
  assert.equal(buildQuantityDelta("DEDUCT", 5, 7), -5);
  assert.equal(buildQuantityDelta("ADJUST", 4, 11), -7);
  assert.equal(buildQuantityDelta("ADJUST", 15, 11), 4);
});

test("money parsers validate amounts and round to two decimals", () => {
  assert.deepEqual(parsePositiveMoney("10.456"), {
    value: 10.46,
    error: null,
  });
  assert.equal(
    parsePositiveMoney("-1").error,
    "Amount must be greater than zero",
  );

  assert.deepEqual(parseOptionalMoney("12.345"), {
    value: 12.35,
    error: null,
  });
  assert.deepEqual(parseOptionalMoney(""), { value: null, error: null });

  assert.deepEqual(parseUnitPrice("20"), { value: 20, error: null });
  assert.equal(parseUnitPrice("-2").error, "Unit price cannot be negative");
});

test("account categories distinguish manual and system-managed values", () => {
  assert.equal(ensureValidCategory("PURCHASE"), true);
  assert.equal(ensureValidManualCategory("PURCHASE"), false);
  assert.equal(ensureValidManualCategory("MONTHLY_ALLOCATION"), true);
  assert.equal(ensureValidCategory("NOT_REAL"), false);
});

test("month helpers normalize month keys and compute carry-forward ranges", () => {
  assert.equal(normalizeStoreMonthKey("2026-04"), "2026-04-01");
  assert.equal(normalizeStoreMonthKey("2026-04-19"), "2026-04-01");
  assert.equal(normalizeStoreMonthKey("bad-input"), null);

  assert.equal(startOfMonth("2026-04-13"), "2026-04-01");

  assert.deepEqual(getMonthRange("2026-04"), {
    monthKey: "2026-04-01",
    startDate: "2026-04-01",
    endDate: "2026-04-30",
    nextMonthKey: "2026-05-01",
  });
});

test("product payload builder normalizes optional fields and actor metadata", () => {
  const built = buildProductPayload(
    "admin-1",
    {
      name: "  Potato Chips  ",
      sku: "  CHIP-01 ",
      barcode: " 12345 ",
      unitPrice: "25.5",
      isActive: true,
      tracksStock: true,
      imageUrl: " https://example.com/chips.jpg ",
    },
    "create",
  );

  assert.equal(built.error, null);
  assert.deepEqual(built.payload, {
    name: "Potato Chips",
    sku: "CHIP-01",
    barcode: "12345",
    unit_price: 25.5,
    is_active: true,
    tracks_stock: true,
    image_url: "https://example.com/chips.jpg",
    created_by: "admin-1",
    updated_by: "admin-1",
  });

  const invalid = buildProductPayload(
    "admin-1",
    {
      name: "   ",
      unitPrice: "10",
      isActive: true,
      tracksStock: true,
    },
    "update",
  );

  assert.equal(invalid.payload, null);
  assert.equal(invalid.error, "Product name is required");
});

test("invoice reversal reason falls back cleanly when notes are blank", () => {
  assert.equal(
    buildStoreInvoiceReversalReason("inv-123", "Damaged item"),
    "Invoice reversal for inv-123: Damaged item",
  );
  assert.equal(
    buildStoreInvoiceReversalReason("inv-123", "   "),
    "Invoice reversal for inv-123",
  );
});

test("low balance message blocks purchases that exceed available balance", () => {
  assert.equal(buildStoreLowBalanceMessage(200, 150), null);
  assert.equal(
    buildStoreLowBalanceMessage(80, 150),
    "Low balance. Please recharge your balance from the authority before purchasing. You need 70.00 BDT more.",
  );
  assert.equal(
    buildStoreLowBalanceMessage(-20, 50),
    "Low balance. Please recharge your balance from the authority before purchasing. You need 70.00 BDT more.",
  );
});
