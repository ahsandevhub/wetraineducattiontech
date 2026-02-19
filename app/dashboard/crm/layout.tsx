/**
 * CRM Module Layout
 * SERVER-SIDE SECURITY: requireCrmAccess() enforced here
 * Only users with crm_users.crm_role can access /dashboard/crm/*
 */

import { requireCrmAccess } from "@/app/utils/auth/require";
import type { ReactNode } from "react";

export default async function CrmLayout({ children }: { children: ReactNode }) {
  // SECURITY: Block non-CRM users at layout level
  // This runs on every CRM route before rendering
  await requireCrmAccess();

  return <>{children}</>;
}
