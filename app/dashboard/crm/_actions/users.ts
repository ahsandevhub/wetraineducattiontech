"use server";

import { requireCrmAccess, requireCrmAdmin } from "@/app/utils/auth/require";
import { createClient } from "@/app/utils/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

interface CreateUserData {
  email: string;
  password: string;
  fullName: string;
  crmRole: "ADMIN" | "MARKETER";
}

interface UpdateUserData {
  fullName?: string;
  role?: "ADMIN" | "MARKETER";
  isActive?: boolean;
}

/**
 * Get all users (admin only)
 */
export async function getAllUsers() {
  await requireCrmAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("crm_users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching users:", error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

/**
 * Create a new user (admin only)
 */
export async function createUser(userData: CreateUserData) {
  try {
    await requireCrmAdmin();
  } catch (error) {
    console.error("Authorization failed:", error);
    return { data: null, error: "Not authorized" };
  }

  // Use admin client for user creation (requires secret/service role key)
  const supabaseAdmin = createAdminClient();

  try {
    console.log("Creating user:", userData.email);

    // Create auth user
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          full_name: userData.fullName,
        },
      });

    if (authError) {
      console.error("Auth creation failed:", authError.message);
      return { data: null, error: authError.message };
    }

    if (!authData.user) {
      return { data: null, error: "Failed to create user" };
    }

    console.log("Auth user created successfully:", authData.user.id);

    // Create CRM user profile
    const { error: crmUserError } = await supabaseAdmin
      .from("crm_users")
      .insert({
        auth_user_id: authData.user.id,
        email: userData.email,
        full_name: userData.fullName,
        crm_role: userData.crmRole,
        is_active: true,
      });

    if (crmUserError) {
      console.error("Failed to create CRM user profile:", crmUserError.message);
      // Rollback auth user creation
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return { data: null, error: crmUserError.message };
    }

    console.log("CRM user profile created successfully");

    revalidatePath("/dashboard/crm/admin/users");
    return { data: authData.user, error: null };
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update user (admin only)
 */
export async function updateUser(userId: string, updates: UpdateUserData) {
  try {
    await requireCrmAdmin();
  } catch (error) {
    console.error("Authorization failed:", error);
    return { error: "Not authorized" };
  }

  // Use admin client for user updates (requires secret/service role key)
  const supabaseAdmin = createAdminClient();

  try {
    console.log("Updating user:", userId);

    // Get the CRM user to find auth_user_id
    const { data: crmUser, error: fetchError } = await supabaseAdmin
      .from("crm_users")
      .select("auth_user_id")
      .eq("id", userId)
      .single();

    if (fetchError || !crmUser) {
      return { error: "CRM user not found" };
    }

    // Update user metadata in auth
    if (updates.fullName !== undefined) {
      const { error: metadataError } =
        await supabaseAdmin.auth.admin.updateUserById(crmUser.auth_user_id, {
          user_metadata: {
            full_name: updates.fullName,
          },
        });

      if (metadataError) {
        console.error("Failed to update user metadata:", metadataError);
        return { error: metadataError.message };
      }
    }

    // Update CRM user profile
    const dbUpdate: Record<string, unknown> = {};
    if (updates.fullName !== undefined) dbUpdate.full_name = updates.fullName;
    if (updates.role !== undefined) dbUpdate.crm_role = updates.role;
    if (updates.isActive !== undefined) dbUpdate.is_active = updates.isActive;

    if (Object.keys(dbUpdate).length > 0) {
      const { error: dbError } = await supabaseAdmin
        .from("crm_users")
        .update(dbUpdate)
        .eq("id", userId);

      if (dbError) {
        console.error("Failed to update CRM user:", dbError.message);
        return { error: dbError.message };
      }
    }

    console.log("User updated successfully:", userId);
    revalidatePath("/dashboard/crm/admin/users");
    return { error: null };
  } catch (error) {
    console.error("Error updating user:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Delete user (admin only)
 */
export async function deleteUser(userId: string) {
  try {
    await requireCrmAdmin();
  } catch (error) {
    console.error("Authorization failed:", error);
    return { error: "Not authorized" };
  }

  // Use admin client for user deletion (requires secret/service role key)
  const supabaseAdmin = createAdminClient();

  try {
    console.log("Attempting to delete user:", userId);

    // Get the CRM user to find auth_user_id
    const { data: crmUser } = await supabaseAdmin
      .from("crm_users")
      .select("auth_user_id")
      .eq("id", userId)
      .single();

    if (!crmUser?.auth_user_id) {
      // If no auth_user_id, just delete the orphaned CRM user
      console.log("Deleting orphaned CRM user record...");
      const { error: dbError } = await supabaseAdmin
        .from("crm_users")
        .delete()
        .eq("id", userId);

      if (dbError) {
        console.error("Failed to delete orphaned user:", dbError);
        return { error: dbError.message };
      }

      console.log("Orphaned user record deleted successfully");
      revalidatePath("/dashboard/crm/admin/users");
      return { error: null };
    }

    // Delete auth user
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
      crmUser.auth_user_id,
    );

    if (authError) {
      console.log("Auth deletion failed:", authError.message);

      // If auth user doesn't exist, just delete from CRM users table
      if (authError.message.includes("User not found")) {
        console.log("Deleting orphaned CRM user record...");
        const { error: dbError } = await supabaseAdmin
          .from("crm_users")
          .delete()
          .eq("id", userId);

        if (dbError) {
          console.error("Failed to delete orphaned user:", dbError);
          return { error: dbError.message };
        }

        console.log("Orphaned user record deleted successfully");
        revalidatePath("/dashboard/crm/admin/users");
        return { error: null };
      }

      return { error: authError.message };
    }

    // Also delete CRM user profile explicitly
    const { error: dbDeleteError } = await supabaseAdmin
      .from("crm_users")
      .delete()
      .eq("id", userId);

    if (dbDeleteError) {
      console.warn("Failed to delete CRM user record:", dbDeleteError.message);
    } else {
      console.log("CRM user record deleted for:", userId);
    }

    console.log("User deleted successfully");
    revalidatePath("/dashboard/crm/admin/users");
    return { error: null };
  } catch (error) {
    console.error("Unexpected error in deleteUser:", error);
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Toggle user active status (admin only)
 */
export async function toggleUserStatus(userId: string) {
  try {
    await requireCrmAdmin();
  } catch (error) {
    console.error("Authorization failed:", error);
    return { error: "Not authorized" };
  }

  // Use admin client for status toggle (requires secret/service role key)
  const supabaseAdmin = createAdminClient();

  // Get current status using service role
  const { data: user, error: fetchError } = await supabaseAdmin
    .from("crm_users")
    .select("is_active")
    .eq("id", userId)
    .single();

  if (fetchError || !user) {
    console.error("User not found:", fetchError);
    return { error: "User not found" };
  }

  // Toggle status using service role (bypass RLS)
  const { error } = await supabaseAdmin
    .from("crm_users")
    .update({ is_active: !user.is_active })
    .eq("id", userId);

  if (error) {
    console.error("Failed to toggle user status:", error);
    return { error: error.message };
  }

  console.log(
    "User status toggled successfully:",
    userId,
    "active:",
    !user.is_active,
  );
  revalidatePath("/dashboard/crm/admin/users");
  return { error: null };
}

/**
 * Get marketers for lead assignment
 */
export async function getMarketers() {
  await requireCrmAccess();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("crm_users")
    .select("id, email, full_name")
    .eq("crm_role", "MARKETER")
    .eq("is_active", true)
    .order("full_name");

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

/**
 * Change current user's password
 */
export async function changePassword(newPassword: string) {
  try {
    await requireCrmAccess();
  } catch (error) {
    console.error("Authorization failed:", error);
    return { error: "Not authorized" };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error("Failed to change password:", error);
      return { error: error.message };
    }

    return { error: null };
  } catch (e) {
    console.error("Unexpected error changing password:", e);
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }
}

/**
 * Admin: reset a user's password (service role)
 */
export async function resetUserPassword(userId: string, newPassword: string) {
  try {
    await requireCrmAdmin();
  } catch (error) {
    console.error("Authorization failed:", error);
    return { error: "Not authorized" };
  }

  // Use admin client for password reset (requires secret/service role key)
  const supabaseAdmin = createAdminClient();

  try {
    // Get the CRM user to find auth_user_id
    const { data: crmUser, error: fetchError } = await supabaseAdmin
      .from("crm_users")
      .select("auth_user_id")
      .eq("id", userId)
      .single();

    if (fetchError || !crmUser) {
      return { error: "CRM user not found" };
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      crmUser.auth_user_id,
      {
        password: newPassword,
      },
    );

    if (error) {
      console.error("Failed to reset user password:", error);
      return { error: error.message };
    }

    return { error: null };
  } catch (e) {
    console.error("Unexpected error resetting user password:", e);
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }
}
