"use client";

import type { CrmRole, HrmRole, StoreRole } from "@/app/utils/auth/roles";
import { ReactNode } from "react";
import AdminLayout, { type Role } from "./_components/AdminLayout";
import { DashboardScrollManager } from "./_components/DashboardScrollManager";

export type { Role };

type DashboardShellProps = {
  children: ReactNode;
  role: Role;
  crmRole: CrmRole | null;
  hrmRole: HrmRole | null;
  storeRole: StoreRole | null;
  userId: string; // Keep for future use
  hasEducationAccess?: boolean;
};

export default function DashboardShell({
  children,
  role,
  crmRole,
  hrmRole,
  storeRole,
  hasEducationAccess,
}: DashboardShellProps) {
  return (
    <>
      <DashboardScrollManager />
      <AdminLayout
        role={role}
        crmRole={crmRole}
        hrmRole={hrmRole}
        storeRole={storeRole}
        hasEducationAccess={hasEducationAccess}
      >
        {children}
      </AdminLayout>
    </>
  );
}
