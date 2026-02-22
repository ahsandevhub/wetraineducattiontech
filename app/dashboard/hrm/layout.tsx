/**
 * HRM KPI Layout
 * SERVER-SIDE SECURITY: requireHrmAccess() enforced here
 * Only users with HRM access can access /dashboard/hrm/*
 */

import { requireHrmAccess } from "@/app/utils/auth/require";
import type { ReactNode } from "react";

export default async function HrmLayout({ children }: { children: ReactNode }) {
  // SECURITY: Block non-HRM users at layout level
  await requireHrmAccess();

  return <>{children}</>;
}
