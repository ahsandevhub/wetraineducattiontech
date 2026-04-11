"use server";

import { requireStoreAdmin } from "@/app/utils/auth/require";
import { getCurrentUserWithRoles } from "@/app/utils/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

type StoreRole = "USER" | "ADMIN";

interface LinkUserToStoreData {
  userId: string;
  role: StoreRole;
}

async function ensureStoreAdminAccess() {
  await requireStoreAdmin();
  const roles = await getCurrentUserWithRoles();

  if (!roles) {
    return { error: "Not authenticated", roles: null };
  }

  return { error: null, roles };
}

export async function getAllStoreUsers() {
  const auth = await ensureStoreAdminAccess();
  if (auth.error || !auth.roles) {
    return { data: null, error: auth.error ?? "Not authorized" };
  }

  try {
    const supabaseAdmin = createAdminClient();

    const { data: storeUsers, error: storeError } = await supabaseAdmin
      .from("store_users")
      .select("id, store_role, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (storeError) {
      return { data: null, error: storeError.message };
    }

    if (!storeUsers || storeUsers.length === 0) {
      return {
        data: {
          users: [],
          currentUserId: auth.roles.userId,
        },
        error: null,
      };
    }

    const userIds = storeUsers.map((u) => u.id);
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email")
      .in("id", userIds);

    if (profilesError) {
      return { data: null, error: profilesError.message };
    }

    const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

    const combined = storeUsers.map((storeUser) => {
      const profile = profileMap.get(storeUser.id);
      return {
        id: storeUser.id,
        store_role: storeUser.store_role as StoreRole,
        created_at: storeUser.created_at,
        updated_at: storeUser.updated_at,
        full_name: profile?.full_name || "Unknown",
        email: profile?.email || "Unknown",
      };
    });

    return {
      data: {
        users: combined,
        currentUserId: auth.roles.userId,
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

export async function linkUserToStore(data: LinkUserToStoreData) {
  const auth = await ensureStoreAdminAccess();
  if (auth.error || !auth.roles) {
    return { error: auth.error ?? "Not authorized" };
  }

  const supabaseAdmin = createAdminClient();

  try {
    const { data: existing } = await supabaseAdmin
      .from("store_users")
      .select("id")
      .eq("id", data.userId)
      .maybeSingle();

    if (existing) {
      return { error: "User already has Store access" };
    }

    const { error } = await supabaseAdmin.from("store_users").insert({
      id: data.userId,
      store_role: data.role,
    });

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/dashboard/store/admin/employees");
    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateStoreUserRole({
  userId,
  newRole,
}: {
  userId: string;
  newRole: StoreRole;
}) {
  const auth = await ensureStoreAdminAccess();
  if (auth.error || !auth.roles) {
    return { error: auth.error ?? "Not authorized" };
  }

  if (userId === auth.roles.userId) {
    return { error: "You cannot change your own Store role" };
  }

  const supabaseAdmin = createAdminClient();

  try {
    const { data: existing, error: existingError } = await supabaseAdmin
      .from("store_users")
      .select("store_role")
      .eq("id", userId)
      .maybeSingle();

    if (existingError) {
      return { error: existingError.message };
    }

    if (!existing) {
      return { error: "Store user not found" };
    }

    const { error } = await supabaseAdmin
      .from("store_users")
      .update({ store_role: newRole })
      .eq("id", userId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/dashboard/store/admin/employees");
    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function unlinkUserFromStore(userId: string) {
  const auth = await ensureStoreAdminAccess();
  if (auth.error || !auth.roles) {
    return { error: auth.error ?? "Not authorized" };
  }

  if (userId === auth.roles.userId) {
    return { error: "You cannot remove your own Store access" };
  }

  const supabaseAdmin = createAdminClient();

  try {
    const { data: existing, error: existingError } = await supabaseAdmin
      .from("store_users")
      .select("store_role")
      .eq("id", userId)
      .maybeSingle();

    if (existingError) {
      return { error: existingError.message };
    }

    if (!existing) {
      return { error: "Store user not found" };
    }

    const { error } = await supabaseAdmin
      .from("store_users")
      .delete()
      .eq("id", userId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/dashboard/store/admin/employees");
    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
