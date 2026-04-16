"use server";

import { requireStoreAdmin } from "@/app/utils/auth/require";
import {
  getCurrentUserWithRoles,
  hasStorePermission,
} from "@/app/utils/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import {
  getMonthRange,
  normalizeOptionalText,
  normalizeStoreMonthKey,
} from "../_lib/store-domain";

type StoreMonthStatus = "OPEN" | "CLOSED";

type CloseStoreMonthInput = {
  monthKey: string;
  note?: string;
};

type StoreMonthClosureRow = {
  id: string;
  month_key: string;
  status: StoreMonthStatus;
  opening_balance: number;
  closing_balance: number | null;
  closed_at: string | null;
  closed_by: string | null;
  note: string | null;
  closed_by_name: string | null;
};

type StoreOwnerMonthClosureRow = {
  id: string;
  month_key: string;
  status: StoreMonthStatus;
  opening_amount: number;
  closing_amount: number | null;
  closed_at: string | null;
  closed_by: string | null;
  note: string | null;
  closed_by_name: string | null;
};

async function ensureStoreAdminAccess() {
  await requireStoreAdmin();
  const roles = await getCurrentUserWithRoles();

  if (!roles) {
    return { error: "Not authenticated", roles: null };
  }

  return { error: null, roles };
}

export async function getStoreMonthStatus(monthKey: string) {
  const normalizedMonth = normalizeStoreMonthKey(monthKey);
  if (!normalizedMonth) {
    return { data: null, error: "Invalid month" };
  }

  const supabaseAdmin = createAdminClient();
  const { data, error } = await supabaseAdmin
    .from("store_month_closures")
    .select(
      "id, month_key, status, opening_balance, closing_balance, closed_at, closed_by, note",
    )
    .eq("month_key", normalizedMonth)
    .maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function ensureStoreMonthOpen(monthKey: string) {
  const result = await getStoreMonthStatus(monthKey);
  if (result.error) {
    return { error: result.error };
  }

  if (result.data?.status === "CLOSED") {
    const label = result.data.month_key.slice(0, 7);
    return {
      error: `The month ${label} is already closed. Reopen is not supported, so new postings are blocked.`,
    };
  }

  return { error: null };
}

export async function ensureStoreOwnerPurchaseMonthSnapshot(
  monthKey: string,
  supabaseAdmin = createAdminClient(),
) {
  const normalizedMonth = normalizeStoreMonthKey(monthKey);
  if (!normalizedMonth) {
    return { data: null, error: "Invalid month" };
  }

  const { data: existingSnapshot, error: existingSnapshotError } =
    await supabaseAdmin
      .from("store_owner_month_closures")
      .select(
        "id, month_key, status, opening_amount, closing_amount, closed_at, closed_by, note",
      )
      .eq("month_key", normalizedMonth)
      .maybeSingle();

  if (existingSnapshotError) {
    return { data: null, error: existingSnapshotError.message };
  }

  if (existingSnapshot) {
    return {
      data: {
        ...existingSnapshot,
        status: existingSnapshot.status as StoreMonthStatus,
        opening_amount: Number(existingSnapshot.opening_amount ?? 0),
        closing_amount:
          existingSnapshot.closing_amount === null
            ? null
            : Number(existingSnapshot.closing_amount),
      },
      error: null,
    };
  }

  const previousMonth = new Date(`${normalizedMonth}T00:00:00.000Z`);
  previousMonth.setUTCMonth(previousMonth.getUTCMonth() - 1);
  const previousMonthKey = previousMonth.toISOString().slice(0, 10);

  const { data: previousSnapshot, error: previousSnapshotError } =
    await supabaseAdmin
      .from("store_owner_month_closures")
      .select("closing_amount")
      .eq("month_key", previousMonthKey)
      .maybeSingle();

  if (previousSnapshotError) {
    return { data: null, error: previousSnapshotError.message };
  }

  const openingAmount = Number(previousSnapshot?.closing_amount ?? 0);

  const { data: createdSnapshot, error: createSnapshotError } =
    await supabaseAdmin
      .from("store_owner_month_closures")
      .insert({
        month_key: normalizedMonth,
        status: "OPEN",
        opening_amount: openingAmount,
      })
      .select(
        "id, month_key, status, opening_amount, closing_amount, closed_at, closed_by, note",
      )
      .single();

  if (createSnapshotError) {
    return { data: null, error: createSnapshotError.message };
  }

  return {
    data: {
      ...createdSnapshot,
      status: createdSnapshot.status as StoreMonthStatus,
      opening_amount: Number(createdSnapshot.opening_amount ?? 0),
      closing_amount:
        createdSnapshot.closing_amount === null
          ? null
          : Number(createdSnapshot.closing_amount),
    },
    error: null,
  };
}

export async function getStoreMonthClosuresOverview() {
  const auth = await ensureStoreAdminAccess();
  if (auth.error || !auth.roles) {
    return { data: null, error: auth.error ?? "Not authorized" };
  }

  try {
    const supabaseAdmin = createAdminClient();
    const { data: closures, error: closuresError } = await supabaseAdmin
      .from("store_month_closures")
      .select(
        "id, month_key, status, opening_balance, closing_balance, closed_at, closed_by, note",
      )
      .order("month_key", { ascending: false })
      .limit(12);

    if (closuresError) {
      return { data: null, error: closuresError.message };
    }

    const actorIds = Array.from(
      new Set(
        (closures ?? [])
          .map((closure) => closure.closed_by)
          .filter((value): value is string => Boolean(value)),
      ),
    );

    const { data: profiles, error: profilesError } = actorIds.length
      ? await supabaseAdmin
          .from("profiles")
          .select("id, full_name, email")
          .in("id", actorIds)
      : { data: [], error: null };

    if (profilesError) {
      return { data: null, error: profilesError.message };
    }

    const profileMap = new Map(
      (profiles ?? []).map((profile) => [profile.id, profile]),
    );

    const monthClosures: StoreMonthClosureRow[] = (closures ?? []).map(
      (closure) => {
        const actor = closure.closed_by
          ? profileMap.get(closure.closed_by)
          : null;

        return {
          ...closure,
          status: closure.status as StoreMonthStatus,
          opening_balance: Number(closure.opening_balance ?? 0),
          closing_balance:
            closure.closing_balance === null
              ? null
              : Number(closure.closing_balance),
          closed_by_name: actor?.full_name || actor?.email || null,
        };
      },
    );

    return { data: monthClosures, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getStoreOwnerMonthClosuresOverview() {
  const auth = await ensureStoreAdminAccess();
  if (auth.error || !auth.roles) {
    return { data: null, error: auth.error ?? "Not authorized" };
  }

  try {
    const supabaseAdmin = createAdminClient();
    const { data: closures, error: closuresError } = await supabaseAdmin
      .from("store_owner_month_closures")
      .select(
        "id, month_key, status, opening_amount, closing_amount, closed_at, closed_by, note",
      )
      .order("month_key", { ascending: false })
      .limit(12);

    if (closuresError) {
      return { data: null, error: closuresError.message };
    }

    const actorIds = Array.from(
      new Set(
        (closures ?? [])
          .map((closure) => closure.closed_by)
          .filter((value): value is string => Boolean(value)),
      ),
    );

    const { data: profiles, error: profilesError } = actorIds.length
      ? await supabaseAdmin
          .from("profiles")
          .select("id, full_name, email")
          .in("id", actorIds)
      : { data: [], error: null };

    if (profilesError) {
      return { data: null, error: profilesError.message };
    }

    const profileMap = new Map(
      (profiles ?? []).map((profile) => [profile.id, profile]),
    );

    const monthClosures: StoreOwnerMonthClosureRow[] = (closures ?? []).map(
      (closure) => {
        const actor = closure.closed_by
          ? profileMap.get(closure.closed_by)
          : null;

        return {
          ...closure,
          status: closure.status as StoreMonthStatus,
          opening_amount: Number(closure.opening_amount ?? 0),
          closing_amount:
            closure.closing_amount === null
              ? null
              : Number(closure.closing_amount),
          closed_by_name: actor?.full_name || actor?.email || null,
        };
      },
    );

    return { data: monthClosures, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function closeStoreOwnerPurchaseMonth(
  monthKey: string,
  nextMonthKey: string,
  closedBy: string,
  note: string | null,
  supabaseAdmin = createAdminClient(),
) {
  const snapshotResult = await ensureStoreOwnerPurchaseMonthSnapshot(
    monthKey,
    supabaseAdmin,
  );
  if (snapshotResult.error || !snapshotResult.data) {
    return { error: snapshotResult.error ?? "Unable to prepare owner month" };
  }

  const { data: ownerPurchases, error: ownerPurchasesError } =
    await supabaseAdmin
      .from("store_owner_purchases")
      .select("amount")
      .eq("month_key", monthKey);

  if (ownerPurchasesError) {
    return { error: ownerPurchasesError.message };
  }

  const openingAmount = Number(snapshotResult.data.opening_amount ?? 0);
  const closingAmount = Number(
    (
      openingAmount +
      (ownerPurchases ?? []).reduce(
        (sum, row) => sum + Number(row.amount ?? 0),
        0,
      )
    ).toFixed(2),
  );

  const now = new Date().toISOString();

  const { error: closeError } = await supabaseAdmin
    .from("store_owner_month_closures")
    .upsert(
      {
        month_key: monthKey,
        status: "CLOSED",
        opening_amount: openingAmount,
        closing_amount: closingAmount,
        closed_at: now,
        closed_by: closedBy,
        note,
      },
      { onConflict: "month_key" },
    );

  if (closeError) {
    return { error: closeError.message };
  }

  const { data: nextMonthSnapshot, error: nextMonthLookupError } =
    await supabaseAdmin
      .from("store_owner_month_closures")
      .select("id, status")
      .eq("month_key", nextMonthKey)
      .maybeSingle();

  if (nextMonthLookupError) {
    return { error: nextMonthLookupError.message };
  }

  if (!nextMonthSnapshot) {
    const { error: createNextMonthError } = await supabaseAdmin
      .from("store_owner_month_closures")
      .insert({
        month_key: nextMonthKey,
        status: "OPEN",
        opening_amount: closingAmount,
      });

    if (createNextMonthError) {
      return { error: createNextMonthError.message };
    }
  } else if (nextMonthSnapshot.status === "OPEN") {
    const { error: updateNextMonthError } = await supabaseAdmin
      .from("store_owner_month_closures")
      .update({
        opening_amount: closingAmount,
      })
      .eq("id", nextMonthSnapshot.id);

    if (updateNextMonthError) {
      return { error: updateNextMonthError.message };
    }
  }

  return { error: null };
}

export async function closeStoreMonth(data: CloseStoreMonthInput) {
  const auth = await ensureStoreAdminAccess();
  if (auth.error || !auth.roles) {
    return { error: auth.error ?? "Not authorized" };
  }

  if (!hasStorePermission(auth.roles, "balance_add")) {
    return { error: "You do not have permission to close Store months" };
  }

  const range = getMonthRange(data.monthKey);
  if (!range) {
    return { error: "A valid month is required" };
  }

  const supabaseAdmin = createAdminClient();

  const { data: existingClosure, error: existingClosureError } =
    await supabaseAdmin
      .from("store_month_closures")
      .select("id, status")
      .eq("month_key", range.monthKey)
      .maybeSingle();

  if (existingClosureError) {
    return { error: existingClosureError.message };
  }

  if (existingClosure?.status === "CLOSED") {
    return {
      error: `The month ${range.monthKey.slice(0, 7)} is already closed`,
    };
  }

  const [
    { data: openingRows, error: openingError },
    { data: closingRows, error: closingError },
  ] = await Promise.all([
    supabaseAdmin
      .from("store_account_entries")
      .select("amount")
      .lt("entry_date", range.startDate),
    supabaseAdmin
      .from("store_account_entries")
      .select("amount")
      .lte("entry_date", range.endDate),
  ]);

  if (openingError) {
    return { error: openingError.message };
  }

  if (closingError) {
    return { error: closingError.message };
  }

  const openingBalance = Number(
    (openingRows ?? [])
      .reduce((sum, row) => sum + Number(row.amount ?? 0), 0)
      .toFixed(2),
  );
  const closingBalance = Number(
    (closingRows ?? [])
      .reduce((sum, row) => sum + Number(row.amount ?? 0), 0)
      .toFixed(2),
  );

  const now = new Date().toISOString();
  const note = normalizeOptionalText(data.note);

  const { error: closeError } = await supabaseAdmin
    .from("store_month_closures")
    .upsert(
      {
        month_key: range.monthKey,
        status: "CLOSED",
        opening_balance: openingBalance,
        closing_balance: closingBalance,
        closed_at: now,
        closed_by: auth.roles.userId,
        note,
      },
      { onConflict: "month_key" },
    );

  if (closeError) {
    return { error: closeError.message };
  }

  const { data: nextMonthClosure, error: nextMonthLookupError } =
    await supabaseAdmin
      .from("store_month_closures")
      .select("id, status")
      .eq("month_key", range.nextMonthKey)
      .maybeSingle();

  if (nextMonthLookupError) {
    return { error: nextMonthLookupError.message };
  }

  if (!nextMonthClosure) {
    const { error: createNextMonthError } = await supabaseAdmin
      .from("store_month_closures")
      .insert({
        month_key: range.nextMonthKey,
        status: "OPEN",
        opening_balance: closingBalance,
      });

    if (createNextMonthError) {
      return { error: createNextMonthError.message };
    }
  } else if (nextMonthClosure.status === "OPEN") {
    const { error: updateNextMonthError } = await supabaseAdmin
      .from("store_month_closures")
      .update({
        opening_balance: closingBalance,
      })
      .eq("id", nextMonthClosure.id);

    if (updateNextMonthError) {
      return { error: updateNextMonthError.message };
    }
  }

  const ownerMonthClose = await closeStoreOwnerPurchaseMonth(
    range.monthKey,
    range.nextMonthKey,
    auth.roles.userId,
    note,
    supabaseAdmin,
  );
  if (ownerMonthClose.error) {
    return { error: ownerMonthClose.error };
  }

  revalidatePath("/dashboard/store/admin");
  revalidatePath("/dashboard/store/admin/accounts");
  revalidatePath("/dashboard/store/admin/owner-purchases");
  revalidatePath("/dashboard/store/accounts");
  revalidatePath("/dashboard/store");

  return { error: null };
}
