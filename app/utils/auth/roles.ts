/**
 * Unified Role Resolver
 * Returns education profile role, CRM role, and HRM role in one call
 * to prevent repeated DB hits across layouts, switcher, and guards
 */

import { createClient } from "../supabase/server";

export type EducationRole = "customer" | "admin";
export type CrmRole = "ADMIN" | "MARKETER";
export type HrmRole = "SUPER_ADMIN" | "ADMIN" | "EMPLOYEE";

export interface UserWithRoles {
  userId: string;
  email: string;
  profileRole: EducationRole | null;
  crmRole: CrmRole | null;
  hrmRole: HrmRole | null;
  hasEducationAccess: boolean;
  hasCrmAccess: boolean;
  hasHrmAccess: boolean;
}

/**
 * Get current user with education, CRM, and HRM roles
 * Optimized queries to prevent repeated lookups
 *
 * Auth.users is the single source of truth for user identity.
 * Each module (CRM, HRM, Education) has their own users table:
 * - profiles.id (FK to auth.users.id) - Education system
 * - crm_users.id (FK to auth.users.id) - CRM system
 * - hrm_users.id (FK to auth.users.id) - HRM system
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

  // Fetch education profile (optional - CRM/HRM-only users may not have this)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  // Fetch CRM user (optional - education/HRM-only users may not have this)
  // New schema: crm_users.id IS auth.users.id (FK), no need for separate lookup
  const { data: crmUser } = await supabase
    .from("crm_users")
    .select("crm_role")
    .eq("id", user.id)
    .maybeSingle();

  // Fetch HRM user (optional - education/CRM-only users may not have this)
  // New schema: hrm_users.id IS auth.users.id (FK), no need for separate lookup
  const { data: hrmUser } = await supabase
    .from("hrm_users")
    .select("hrm_role")
    .eq("id", user.id)
    .maybeSingle();

  const hasEducationAccess = profile !== null;
  const hasCrmAccessFlag = crmUser !== null;
  const hasHrmAccessFlag = hrmUser !== null;

  return {
    userId: user.id,
    email: user.email || "",
    profileRole: profile?.role || null,
    crmRole: crmUser?.crm_role || null,
    hrmRole: hrmUser?.hrm_role || null,
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
