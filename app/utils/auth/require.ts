/**
 * Server-side authorization guards
 * These MUST be called in server components/actions for security
 * Client-side guards are for UX only, never for security
 */

import { redirect } from "next/navigation";
import {
  getCurrentUserWithRoles,
  hasAnyAccess,
  hasCrmAccess,
  hasHrmAccess,
  isCrmAdmin,
  isEducationAdmin,
  isHrmAdmin,
  isHrmEmployee,
  isHrmSuperAdmin,
  type UserWithRoles,
} from "./roles";

/**
 * Require authenticated user with access to at least one app
 * Use in pages that need auth but not specific role
 */
export async function requireAuth(): Promise<UserWithRoles> {
  const roles = await getCurrentUserWithRoles();

  if (!roles) {
    redirect("/login");
  }

  // User must have access to at least one app (education, CRM, or HRM)
  if (!hasAnyAccess(roles)) {
    redirect("/unauthorized");
  }

  return roles;
}

/**
 * Require education admin role
 * Use in /dashboard/admin/* layouts
 */
export async function requireAdmin(): Promise<UserWithRoles> {
  const roles = await requireAuth();

  if (!isEducationAdmin(roles)) {
    redirect("/unauthorized");
  }

  return roles;
}

/**
 * Require CRM access (any CRM role: ADMIN or MARKETER)
 * Use in /dashboard/crm/* layout
 */
export async function requireCrmAccess(): Promise<UserWithRoles> {
  const roles = await requireAuth();

  if (!hasCrmAccess(roles)) {
    redirect("/unauthorized");
  }

  return roles;
}

/**
 * Require CRM admin role
 * Use in /dashboard/crm/admin/* layout
 */
export async function requireCrmAdmin(): Promise<UserWithRoles> {
  const roles = await requireAuth();

  if (!isCrmAdmin(roles)) {
    redirect("/unauthorized");
  }

  return roles;
}

/**
 * Require HRM access (any HRM role: SUPER_ADMIN, ADMIN, or EMPLOYEE)
 * Use in /dashboard/hrm/* layout
 */
export async function requireHrmAccess(): Promise<UserWithRoles> {
  const roles = await requireAuth();

  if (!hasHrmAccess(roles)) {
    redirect("/unauthorized");
  }

  return roles;
}

/**
 * Require HRM super admin role
 * Use in /dashboard/hrm/super/* layout
 */
export async function requireHrmSuperAdmin(): Promise<UserWithRoles> {
  const roles = await requireAuth();

  if (!isHrmSuperAdmin(roles)) {
    redirect("/unauthorized");
  }

  return roles;
}

/**
 * Require HRM admin role (SUPER_ADMIN or ADMIN)
 * Use in /dashboard/hrm/admin/* layout
 */
export async function requireHrmAdmin(): Promise<UserWithRoles> {
  const roles = await requireAuth();

  if (!isHrmAdmin(roles)) {
    redirect("/unauthorized");
  }

  return roles;
}

/**
 * Require HRM employee role
 * Use in /dashboard/hrm/employee/* layout
 */
export async function requireHrmEmployee(): Promise<UserWithRoles> {
  const roles = await requireAuth();

  if (!isHrmEmployee(roles)) {
    redirect("/unauthorized");
  }

  return roles;
}

/**
 * Optional: Get current user without redirecting
 * Use for conditional rendering where auth is optional
 */
export async function getOptionalUser(): Promise<UserWithRoles | null> {
  return await getCurrentUserWithRoles();
}
