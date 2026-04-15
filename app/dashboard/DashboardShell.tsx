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
  canAccessCrmAdmin: boolean;
  canActAsCrmMarketer: boolean;
  hrmRole: HrmRole | null;
  storeRole: StoreRole | null;
  userId: string; // Keep for future use
  hasEducationAccess?: boolean;
};

export default function DashboardShell({
  children,
  role,
  crmRole,
  canAccessCrmAdmin,
  canActAsCrmMarketer,
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
        canAccessCrmAdmin={canAccessCrmAdmin}
        canActAsCrmMarketer={canActAsCrmMarketer}
        hrmRole={hrmRole}
        storeRole={storeRole}
        hasEducationAccess={hasEducationAccess}
      >
        {children}
      </AdminLayout>
    </>
  );
}
