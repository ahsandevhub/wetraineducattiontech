/**
 * HRM Super Admin Layout
 * SERVER-SIDE SECURITY: requireHrmSuperAdmin() enforced here
 * Only users with hrmRole='SUPER_ADMIN' can access /dashboard/hrm/super/*
 */

import { requireHrmSuperAdmin } from "@/app/utils/auth/require";
import type { ReactNode } from "react";

export default async function HrmSuperAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // SECURITY: Block non-super-admin users at layout level
  await requireHrmSuperAdmin();

  return children;
}
