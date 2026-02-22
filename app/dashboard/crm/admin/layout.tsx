/**
 * CRM Admin Layout
 * SERVER-SIDE SECURITY: requireCrmAdmin() enforced here
 * Only users with crm_role='ADMIN' can access /dashboard/crm/admin/*
 * Marketers (crm_role='MARKETER') are blocked
 */

import { requireCrmAdmin } from "@/app/utils/auth/require";
import type { ReactNode } from "react";

export default async function CrmAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // SECURITY: Block non-CRM-admin users at layout level
  // CRM marketers will be redirected to /unauthorized
  await requireCrmAdmin();

  return <>{children}</>;
}
