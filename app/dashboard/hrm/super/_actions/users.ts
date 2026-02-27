"use server";

import { createClient } from "@/app/utils/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

interface LinkUserToHRMData {
  userId: string;
  role: "SUPER_ADMIN" | "ADMIN" | "EMPLOYEE";
}

/**
 * Link auth user to HRM (SUPER_ADMIN only)
 */
export async function linkUserToHRM(data: LinkUserToHRMData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Check if user is SUPER_ADMIN
  const { data: hrmUser } = await supabase
    .from("hrm_users")
    .select("hrm_role")
    .eq("id", user.id)
    .maybeSingle();

  if (hrmUser?.hrm_role !== "SUPER_ADMIN") {
    return { error: "Only SUPER_ADMIN can manage HRM users" };
  }

  const supabaseAdmin = createAdminClient();

  try {
    // Check if already linked to HRM
    const { data: existing } = await supabaseAdmin
      .from("hrm_users")
      .select("id")
      .eq("id", data.userId)
      .maybeSingle();

    if (existing) {
      return { error: "User already linked to HRM" };
    }

    // Insert into hrm_users
    const { error } = await supabaseAdmin.from("hrm_users").insert({
      id: data.userId,
      hrm_role: data.role,
    });

    if (error) {
      console.error("Failed to link HRM user:", error.message);
      return { error: error.message };
    }

    revalidatePath("/dashboard/hrm/super/people");
    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Unlink user from HRM (SUPER_ADMIN only)
 */
export async function unlinkUserFromHRM(userId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: hrmUser } = await supabase
    .from("hrm_users")
    .select("hrm_role")
    .eq("id", user.id)
    .maybeSingle();

  if (hrmUser?.hrm_role !== "SUPER_ADMIN") {
    return { error: "Only SUPER_ADMIN can remove HRM users" };
  }

  const supabaseAdmin = createAdminClient();

  try {
    // Check for assignments
    const { count } = await supabaseAdmin
      .from("hrm_assignments")
      .select("id", { count: "exact" })
      .or(`marker_admin_id.eq.${userId},subject_user_id.eq.${userId}`);

    if (count && count > 0) {
      return {
        error: `Cannot remove user - has ${count} assignments. Reassign first.`,
      };
    }

    const { error } = await supabaseAdmin
      .from("hrm_users")
      .delete()
      .eq("id", userId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/dashboard/hrm/super/people");
    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update HRM user role (SUPER_ADMIN only)
 */
export async function updateHRMUserRole({
  userId,
  newRole,
}: {
  userId: string;
  newRole: "SUPER_ADMIN" | "ADMIN" | "EMPLOYEE";
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: hrmUser } = await supabase
    .from("hrm_users")
    .select("hrm_role")
    .eq("id", user.id)
    .maybeSingle();

  if (hrmUser?.hrm_role !== "SUPER_ADMIN") {
    return { error: "Only SUPER_ADMIN can change roles" };
  }

  const supabaseAdmin = createAdminClient();

  try {
    const { error } = await supabaseAdmin
      .from("hrm_users")
      .update({ hrm_role: newRole })
      .eq("id", userId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/dashboard/hrm/super/people");
    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get all HRM users (SUPER_ADMIN only)
 */
export async function getAllHRMUsers() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "Not authenticated" };
  }

  const { data: hrmUser } = await supabase
    .from("hrm_users")
    .select("hrm_role")
    .eq("id", user.id)
    .maybeSingle();

  if (hrmUser?.hrm_role !== "SUPER_ADMIN") {
    return { data: null, error: "Only SUPER_ADMIN can view all users" };
  }

  try {
    const supabaseAdmin = createAdminClient();

    // Fetch all hrm_users (new schema: only id, hrm_role, timestamps)
    const { data: hrmUsers, error: hrmError } = await supabaseAdmin
      .from("hrm_users")
      .select("id, hrm_role, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (hrmError) {
      return { data: null, error: hrmError.message };
    }

    if (!hrmUsers || hrmUsers.length === 0) {
      return { data: [], error: null };
    }

    // Fetch profile data for names and emails
    const userIds = hrmUsers.map((u) => u.id);
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email")
      .in("id", userIds);

    if (profilesError) {
      return { data: null, error: profilesError.message };
    }

    const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

    // Combine hrm_users with profile data
    const combined = hrmUsers.map((hrmUser) => {
      const profile = profileMap.get(hrmUser.id);
      return {
        id: hrmUser.id,
        hrm_role: hrmUser.hrm_role as "SUPER_ADMIN" | "ADMIN" | "EMPLOYEE",
        created_at: hrmUser.created_at,
        updated_at: hrmUser.updated_at,
        full_name: profile?.full_name || "Unknown",
        email: profile?.email || "Unknown",
      };
    });

    return { data: combined, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
