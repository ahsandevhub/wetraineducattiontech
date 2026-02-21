/**
 * Unified Role Resolver
 * Returns education profile role, CRM role, and HRM role in one call
 * to prevent repeated DB hits across layouts, switcher, and guards
 */

import { getServiceSupabase } from "@/lib/supabase/server";
import { createClient } from "../supabase/server";

export type EducationRole = "customer" | "admin";
export type CrmRole = "ADMIN" | "MARKETER";
export type HrmRole = "SUPER_ADMIN" | "ADMIN" | "EMPLOYEE";

export interface UserWithRoles {
  userId: string;
  email: string;
  profileRole: EducationRole | null;
  crmRole: CrmRole | null;
  crmUserId: string | null;
  hrmRole: HrmRole | null;
  hrmUserId: string | null;
  hasEducationAccess: boolean;
  hasCrmAccess: boolean;
  hasHrmAccess: boolean;
}

/**
 * Get current user with education, CRM, and HRM roles
 * Optimized queries to prevent repeated lookups
 */
export async function getCurrentUserWithRoles(): Promise<UserWithRoles | null> {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Check if email is confirmed
  if (!user.email_confirmed_at) {
    return null;
  }

  // Fetch education profile (optional - CRM/HRM-only users may not have this)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  // Fetch CRM profile (optional - education/HRM-only users may not have this)
  const { data: crmUser } = await supabase
    .from("crm_users")
    .select("id, crm_role")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  // Fetch HRM profile (optional - education/CRM-only users may not have this)
  const { data: hrmUser } = await supabase
    .from("hrm_users")
    .select("id, hrm_role, is_active")
    .eq("profile_id", user.id)
    .maybeSingle();

  const hasEducationAccess = profile !== null;
  const hasCrmAccessFlag = crmUser !== null;
  const hasHrmAccessFlag = hrmUser !== null && hrmUser.is_active;

  return {
    userId: user.id,
    email: user.email || "",
    profileRole: profile?.role || null,
    crmRole: crmUser?.crm_role || null,
    crmUserId: crmUser?.id || null,
    hrmRole: hrmUser?.hrm_role || null,
    hrmUserId: hrmUser?.id || null,
    hasEducationAccess,
    hasCrmAccess: hasCrmAccessFlag,
    hasHrmAccess: hasHrmAccessFlag,
  };
}

/**
 * Check if user has CRM access (any CRM role)
 */
export function hasCrmAccess(roles: UserWithRoles | null): boolean {
  return roles?.hasCrmAccess === true;
}

/**
 * Check if user has education access (has profile)
 */
export function hasEducationAccess(roles: UserWithRoles | null): boolean {
  return roles?.hasEducationAccess === true;
}

/**
 * Check if user has HRM access (any HRM role)
 */
export function hasHrmAccess(roles: UserWithRoles | null): boolean {
  return roles?.hasHrmAccess === true;
}

/**
 * Check if user has access to any app (education, CRM, or HRM)
 */
export function hasAnyAccess(roles: UserWithRoles | null): boolean {
  return (
    roles !== null &&
    (roles.hasEducationAccess || roles.hasCrmAccess || roles.hasHrmAccess)
  );
}

/**
 * Check if user is CRM admin
 */
export function isCrmAdmin(roles: UserWithRoles | null): boolean {
  return roles?.crmRole === "ADMIN";
}

/**
 * Check if user is education admin
 */
export function isEducationAdmin(roles: UserWithRoles | null): boolean {
  return roles?.profileRole === "admin";
}

/**
 * Check if user is HRM super admin
 */
export function isHrmSuperAdmin(roles: UserWithRoles | null): boolean {
  return roles?.hrmRole === "SUPER_ADMIN";
}

/**
 * Check if user is HRM admin (SUPER_ADMIN or ADMIN)
 */
export function isHrmAdmin(roles: UserWithRoles | null): boolean {
  return roles?.hrmRole === "SUPER_ADMIN" || roles?.hrmRole === "ADMIN";
}

/**
 * Check if user is HRM employee
 */
export function isHrmEmployee(roles: UserWithRoles | null): boolean {
  return roles?.hrmRole === "EMPLOYEE";
}

/**
 * Auto-link pending HRM profile to authenticated user on first access
 * Called from /dashboard/hrm page before role-based redirect
 *
 * Process:
 * 1. Check if hrm_users exists for auth user
 * 2. If not, lookup pending profile by email (case-insensitive)
 * 3. If found and active, create hrm_users and mark pending as linked
 *
 * Returns: true if linking occurred, false if user already existed or no pending profile
 */
export async function ensureHrmUserLinked(
  authUserId: string,
  authUserEmail: string,
): Promise<boolean> {
  const supabase = getServiceSupabase();

  // Check if hrm_users already exists
  const { data: existingUser } = await supabase
    .from("hrm_users")
    .select("id")
    .eq("profile_id", authUserId)
    .maybeSingle();

  if (existingUser) {
    // User already exists, no linking needed
    return false;
  }

  // Lookup pending profile by email (normalized to lowercase)
  const normalizedEmail = authUserEmail.toLowerCase();
  const { data: pendingProfile } = await supabase
    .from("hrm_pending_profiles")
    .select("*")
    .eq("email", normalizedEmail)
    .eq("is_active", true)
    .is("linked_auth_id", null)
    .maybeSingle();

  if (!pendingProfile) {
    // No pending profile found
    return false;
  }

  // Create hrm_users row from pending profile
  const { error: createError } = await supabase
    .from("hrm_users")
    .insert({
      profile_id: authUserId,
      hrm_role: pendingProfile.desired_role,
      full_name: pendingProfile.full_name,
      email: normalizedEmail,
      is_active: true,
    })
    .select()
    .single();

  if (createError) {
    console.error(
      "Error creating hrm_users from pending profile:",
      createError,
    );
    return false;
  }

  // Mark pending profile as linked
  const { error: updateError } = await supabase
    .from("hrm_pending_profiles")
    .update({
      linked_auth_id: authUserId,
      linked_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", pendingProfile.id);

  if (updateError) {
    console.error("Error updating pending profile link status:", updateError);
  }

  console.log(
    `Auto-linked HRM user: ${authUserEmail} -> ${pendingProfile.desired_role}`,
  );
  return true;
}
