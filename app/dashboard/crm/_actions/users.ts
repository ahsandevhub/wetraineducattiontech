"use server";

import { requireCrmAccess, requireCrmAdmin } from "@/app/utils/auth/require";
import { createClient } from "@/app/utils/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

interface LinkUserToCRMData {
  userId: string;
  crmRole: "ADMIN" | "MARKETER";
}

/**
 * Get all CRM users with their auth profile info (admin only)
 */
export async function getAllUsers() {
  await requireCrmAdmin();
  const supabase = await createClient();

  const { data: crmUsers, error: crmError } = await supabase
    .from("crm_users")
    .select("id, crm_role, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (crmError) {
    console.error("Error fetching users:", crmError);
    return { data: null, error: crmError.message };
  }

  // Fetch profiles for enrichment
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in(
      "id",
      (crmUsers || []).map((u) => u.id),
    );

  if (profileError) {
    console.error("Error fetching profiles:", profileError);
    return { data: null, error: profileError.message };
  }

  // Build profile map for O(1) lookup
  const profileMap = new Map(
    (profiles || []).map((p) => [
      p.id,
      { full_name: p.full_name, email: p.email },
    ]),
  );

  // Merge crm_users with profiles
  const flattened = (crmUsers || []).map((u) => {
    const profile = profileMap.get(u.id);
    return {
      id: u.id,
      crm_role: u.crm_role as "ADMIN" | "MARKETER",
      created_at: u.created_at,
      updated_at: u.updated_at,
      full_name: profile?.full_name ?? null,
      email: profile?.email ?? null,
    };
  });

  return { data: flattened, error: null };
}

/**
 * Link existing auth user to CRM (admin only)
 */
export async function linkUserToCRM(data: LinkUserToCRMData) {
  try {
    await requireCrmAdmin();
  } catch (error) {
    console.error("Authorization failed:", error);
    return { data: null, error: "Not authorized" };
  }

  const supabaseAdmin = createAdminClient();

  try {
    // Check if already linked to CRM
    const { data: existing } = await supabaseAdmin
      .from("crm_users")
      .select("id")
      .eq("id", data.userId)
      .maybeSingle();

    if (existing) {
      return { data: null, error: "User already linked to CRM" };
    }

    // Insert into crm_users
    const { error } = await supabaseAdmin.from("crm_users").insert({
      id: data.userId,
      crm_role: data.crmRole,
    });

    if (error) {
      console.error("Failed to link user:", error);
      return { data: null, error: error.message };
    }

    revalidatePath("/dashboard/crm/admin/users");
    return { data: { success: true }, error: null };
  } catch (error) {
    console.error("Error linking user:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update CRM user role (admin only)
 */
export async function updateCRMUserRole(
  userId: string,
  newRole: "ADMIN" | "MARKETER",
) {
  try {
    await requireCrmAdmin();
  } catch {
    return { error: "Not authorized" };
  }

  const supabaseAdmin = createAdminClient();

  try {
    const { error } = await supabaseAdmin
      .from("crm_users")
      .update({ crm_role: newRole })
      .eq("id", userId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/dashboard/crm/admin/users");
    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Unlink user from CRM (admin only)
 */
export async function unlinkUserFromCRM(userId: string) {
  try {
    await requireCrmAdmin();
  } catch {
    return { error: "Not authorized" };
  }

  const supabaseAdmin = createAdminClient();

  try {
    // Check for active leads
    const { count } = await supabaseAdmin
      .from("crm_leads")
      .select("id", { count: "exact" })
      .eq("owner_id", userId);

    if (count && count > 0) {
      return {
        error: `Cannot remove user with ${count} active leads. Reassign them first.`,
      };
    }

    const { error } = await supabaseAdmin
      .from("crm_users")
      .delete()
      .eq("id", userId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/dashboard/crm/admin/users");
    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get marketers for lead assignment
 */
export async function getMarketers() {
  await requireCrmAccess();
  const supabase = await createClient();

  const { data: crmUsers, error: crmError } = await supabase
    .from("crm_users")
    .select("id, crm_role")
    .eq("crm_role", "MARKETER");

  if (crmError) {
    console.error("Error fetching marketers:", crmError);
    return { data: null, error: crmError.message };
  }

  // Fetch profiles for enrichment
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in(
      "id",
      (crmUsers || []).map((u) => u.id),
    );

  if (profileError) {
    console.error("Error fetching profiles:", profileError);
    return { data: null, error: profileError.message };
  }

  // Build profile map for O(1) lookup
  const profileMap = new Map(
    (profiles || []).map((p) => [
      p.id,
      { full_name: p.full_name, email: p.email },
    ]),
  );

  // Merge and sort by full_name
  const flattened = (crmUsers || [])
    .map((u) => {
      const profile = profileMap.get(u.id);
      return {
        id: u.id,
        crm_role: u.crm_role as "ADMIN" | "MARKETER",
        full_name: profile?.full_name ?? null,
        email: profile?.email ?? null,
      };
    })
    .sort((a, b) => (a.full_name || "").localeCompare(b.full_name || ""));

  return { data: flattened, error: null };
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
