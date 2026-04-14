"use server";

import { requireStoreAdmin } from "@/app/utils/auth/require";
import { getCurrentUserWithRoles } from "@/app/utils/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import {
  getStoreOwnerMonthClosuresOverview,
  ensureStoreOwnerPurchaseMonthSnapshot,
  ensureStoreMonthOpen,
} from "./month-closures";
import {
  normalizeOptionalText,
  normalizeStoreMonthKey,
  parsePositiveMoney,
  startOfMonth,
} from "../_lib/store-domain";

type OwnerPurchaseInput = {
  purchaseDate: string;
  monthKey: string;
  title: string;
  amount: string;
  vendor?: string;
  note?: string;
};

type StoreOwnerPurchaseRow = {
  id: string;
  purchase_date: string;
  month_key: string;
  title: string;
  amount: number;
  vendor: string | null;
  note: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  actor_name: string;
};

async function ensureStoreAdminAccess() {
  await requireStoreAdmin();
  const roles = await getCurrentUserWithRoles();

  if (!roles) {
    return { error: "Not authenticated", roles: null };
  }

  return { error: null, roles };
}

export async function getStoreOwnerPurchasesOverview() {
  const auth = await ensureStoreAdminAccess();
  if (auth.error || !auth.roles) {
    return { data: null, error: auth.error ?? "Not authorized" };
  }

  try {
    const currentMonthKey = new Date().toISOString().slice(0, 7) + "-01";
    const supabaseAdmin = createAdminClient();

    await ensureStoreOwnerPurchaseMonthSnapshot(currentMonthKey, supabaseAdmin);

    const [{ data: purchases, error: purchasesError }, closuresResult] =
      await Promise.all([
        supabaseAdmin
          .from("store_owner_purchases")
          .select(
            "id, purchase_date, month_key, title, amount, vendor, note, created_by, created_at, updated_at",
          )
          .order("purchase_date", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(300),
        getStoreOwnerMonthClosuresOverview(),
      ]);

    if (purchasesError) {
      return { data: null, error: purchasesError.message };
    }

    if (closuresResult.error) {
      return { data: null, error: closuresResult.error };
    }

    const creatorIds = Array.from(
      new Set(
        (purchases ?? [])
          .map((purchase) => purchase.created_by)
          .filter((value): value is string => Boolean(value)),
      ),
    );

    const { data: profiles, error: profilesError } = creatorIds.length
      ? await supabaseAdmin
          .from("profiles")
          .select("id, full_name, email")
          .in("id", creatorIds)
      : { data: [], error: null };

    if (profilesError) {
      return { data: null, error: profilesError.message };
    }

    const profileMap = new Map(
      (profiles ?? []).map((profile) => [profile.id, profile]),
    );

    const entries: StoreOwnerPurchaseRow[] = (purchases ?? []).map((purchase) => {
      const actor = purchase.created_by
        ? profileMap.get(purchase.created_by)
        : null;

      return {
        ...purchase,
        amount: Number(purchase.amount),
        actor_name: actor?.full_name || actor?.email || "System",
      };
    });

    const monthOptions = Array.from(
      new Set(
        [currentMonthKey]
          .concat(entries.map((entry) => entry.month_key))
          .concat((closuresResult.data ?? []).map((closure) => closure.month_key)),
      ),
    ).sort((left, right) => right.localeCompare(left));

    return {
      data: {
        currentMonthKey,
        monthOptions,
        entries,
        monthClosures: closuresResult.data ?? [],
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

export async function createStoreOwnerPurchase(data: OwnerPurchaseInput) {
  const auth = await ensureStoreAdminAccess();
  if (auth.error || !auth.roles) {
    return { error: auth.error ?? "Not authorized" };
  }

  const title = data.title.trim();
  if (!title) {
    return { error: "Title is required" };
  }

  const parsedAmount = parsePositiveMoney(data.amount);
  if (parsedAmount.error || parsedAmount.value === null) {
    return { error: parsedAmount.error ?? "Invalid amount" };
  }

  const purchaseDate = data.purchaseDate || new Date().toISOString().slice(0, 10);
  const effectiveMonth = data.monthKey
    ? normalizeStoreMonthKey(data.monthKey)
    : startOfMonth(purchaseDate);

  if (!effectiveMonth) {
    return { error: "A valid month is required" };
  }

  const derivedMonthFromDate = startOfMonth(purchaseDate);
  if (!derivedMonthFromDate) {
    return { error: "Purchase date is invalid" };
  }

  if (derivedMonthFromDate !== effectiveMonth) {
    return {
      error: "Purchase date and selected month must belong to the same month",
    };
  }

  const monthStatus = await ensureStoreMonthOpen(effectiveMonth);
  if (monthStatus.error) {
    return { error: monthStatus.error };
  }

  const supabaseAdmin = createAdminClient();
  const snapshotResult = await ensureStoreOwnerPurchaseMonthSnapshot(
    effectiveMonth,
    supabaseAdmin,
  );
  if (snapshotResult.error) {
    return { error: snapshotResult.error };
  }

  try {
    const { error } = await supabaseAdmin.from("store_owner_purchases").insert({
      purchase_date: purchaseDate,
      month_key: effectiveMonth,
      title,
      amount: parsedAmount.value,
      vendor: normalizeOptionalText(data.vendor),
      note: normalizeOptionalText(data.note),
      created_by: auth.roles.userId,
    });

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/dashboard/store/admin");
    revalidatePath("/dashboard/store/admin/owner-purchases");
    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
