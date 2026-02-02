"use client";

import { ReactNode } from "react";
import AdminLayout, { type Role } from "./_components/AdminLayout";

export type { Role };

type DashboardShellProps = {
  children: ReactNode;
  role: Role;
};

export default function DashboardShell({
  children,
  role,
}: DashboardShellProps) {
  return <AdminLayout role={role}>{children}</AdminLayout>;
}
