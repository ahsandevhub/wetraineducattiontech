"use server";

import { requireStoreAdmin } from "@/app/utils/auth/require";
import {
  getCurrentUserWithRoles,
  hasStorePermission,
  STORE_PERMISSION_KEYS,
  type StorePermission,
} from "@/app/utils/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

type StoreRole = "USER" | "ADMIN";

interface LinkUserToStoreData {
  userId: string;
  role: StoreRole;
  permissions?: StorePermission[];
}

type StorePermissionRow = {
  user_id: string;
  permission_key: StorePermission;
};

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
          canManagePermissions: hasStorePermission(
            auth.roles,
            "permissions_manage",
          ),
        },
        error: null,
      };
    }

    const userIds = storeUsers.map((u) => u.id);
    const [
      { data: profiles, error: profilesError },
      { data: permissionRows, error: permissionsError },
    ] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds),
      supabaseAdmin
        .from("store_admin_permissions")
        .select("user_id, permission_key")
        .in("user_id", userIds),
    ]);

    if (profilesError) {
      return { data: null, error: profilesError.message };
    }

    if (permissionsError) {
      return { data: null, error: permissionsError.message };
    }

    const profileMap = new Map((profiles || []).map((p) => [p.id, p]));
    const permissionMap = new Map<string, StorePermission[]>();

    for (const row of (permissionRows ?? []) as StorePermissionRow[]) {
      const current = permissionMap.get(row.user_id) ?? [];
      current.push(row.permission_key);
      permissionMap.set(row.user_id, current);
    }

    const combined = storeUsers.map((storeUser) => {
      const profile = profileMap.get(storeUser.id);
      return {
        id: storeUser.id,
        store_role: storeUser.store_role as StoreRole,
        created_at: storeUser.created_at,
        updated_at: storeUser.updated_at,
        full_name: profile?.full_name || "Unknown",
        email: profile?.email || "Unknown",
        permissions: permissionMap.get(storeUser.id) ?? [],
      };
    });

    return {
      data: {
        users: combined,
        currentUserId: auth.roles.userId,
        canManagePermissions: hasStorePermission(
          auth.roles,
          "permissions_manage",
        ),
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

  if (!hasStorePermission(auth.roles, "permissions_manage")) {
    return { error: "You do not have permission to manage Store access" };
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

    const { error: permissionCleanupError } = await supabaseAdmin
      .from("store_admin_permissions")
      .delete()
      .eq("user_id", data.userId);

    if (permissionCleanupError) {
      return { error: permissionCleanupError.message };
    }

    const normalizedPermissions = Array.from(
      new Set(
        (data.permissions ?? []).filter(
          (permission): permission is StorePermission =>
            STORE_PERMISSION_KEYS.includes(permission),
        ),
      ),
    );

    if (data.role === "ADMIN" && normalizedPermissions.length > 0) {
      const { error: insertError } = await supabaseAdmin
        .from("store_admin_permissions")
        .insert(
          normalizedPermissions.map((permission) => ({
            user_id: data.userId,
            permission_key: permission,
            granted_by: auth.roles.userId,
          })),
        );

      if (insertError) {
        return { error: insertError.message };
      }
    }

    revalidatePath("/dashboard/store/admin");
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

  if (!hasStorePermission(auth.roles, "permissions_manage")) {
    return { error: "You do not have permission to manage Store access" };
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

    if (newRole === "USER") {
      const { error: permissionCleanupError } = await supabaseAdmin
        .from("store_admin_permissions")
        .delete()
        .eq("user_id", userId);

      if (permissionCleanupError) {
        return { error: permissionCleanupError.message };
      }
    }

    revalidatePath("/dashboard/store/admin");
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

  if (!hasStorePermission(auth.roles, "permissions_manage")) {
    return { error: "You do not have permission to manage Store access" };
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

    const { error: permissionCleanupError } = await supabaseAdmin
      .from("store_admin_permissions")
      .delete()
      .eq("user_id", userId);

    if (permissionCleanupError) {
      return { error: permissionCleanupError.message };
    }

    revalidatePath("/dashboard/store/admin");
    revalidatePath("/dashboard/store/admin/employees");
    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateStoreUserPermissions({
  userId,
  permissions,
}: {
  userId: string;
  permissions: StorePermission[];
}) {
  const auth = await ensureStoreAdminAccess();
  if (auth.error || !auth.roles) {
    return { error: auth.error ?? "Not authorized" };
  }

  if (!hasStorePermission(auth.roles, "permissions_manage")) {
    return { error: "You do not have permission to manage Store permissions" };
  }

  if (userId === auth.roles.userId) {
    return { error: "You cannot change your own Store permissions" };
  }

  const normalizedPermissions = Array.from(
    new Set(
      permissions.filter((permission): permission is StorePermission =>
        STORE_PERMISSION_KEYS.includes(permission),
      ),
    ),
  );

  const supabaseAdmin = createAdminClient();

  try {
    const { data: storeUser, error: storeUserError } = await supabaseAdmin
      .from("store_users")
      .select("id, store_role")
      .eq("id", userId)
      .maybeSingle();

    if (storeUserError) {
      return { error: storeUserError.message };
    }

    if (!storeUser) {
      return { error: "Store user not found" };
    }

    if (storeUser.store_role !== "ADMIN") {
      return { error: "Only Store admins can receive admin permissions" };
    }

    const { error: deleteError } = await supabaseAdmin
      .from("store_admin_permissions")
      .delete()
      .eq("user_id", userId);

    if (deleteError) {
      return { error: deleteError.message };
    }

    if (normalizedPermissions.length > 0) {
      const { error: insertError } = await supabaseAdmin
        .from("store_admin_permissions")
        .insert(
          normalizedPermissions.map((permission) => ({
            user_id: userId,
            permission_key: permission,
            granted_by: auth.roles.userId,
          })),
        );

      if (insertError) {
        return { error: insertError.message };
      }
    }

    revalidatePath("/dashboard/store/admin");
    revalidatePath("/dashboard/store/admin/employees");
    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
