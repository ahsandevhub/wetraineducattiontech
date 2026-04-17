"use client";

import type {
  CrmRole,
  HrmRole,
  StoreCapabilities,
  StoreRole,
} from "@/app/utils/auth/roles";
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
  storeCapabilities: StoreCapabilities;
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
  storeCapabilities,
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
        storeCapabilities={storeCapabilities}
        hasEducationAccess={hasEducationAccess}
      >
        {children}
      </AdminLayout>
    </>
  );
}
