import DashboardShell from "@/app/dashboard/DashboardShell";
import {
  getCurrentUserWithRoles,
  type StoreCapabilities,
} from "@/app/utils/auth/roles";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

type Role = "customer" | "admin";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Use unified role resolver - single DB call for education + CRM + HRM + Store roles
  const roles = await getCurrentUserWithRoles();

  if (!roles) {
    redirect("/login");
  }

  // Ensure user has access to at least one app
  if (
    !roles.hasEducationAccess &&
    !roles.hasCrmAccess &&
    !roles.hasHrmAccess &&
    !roles.hasStoreAccess
  ) {
    redirect("/unauthorized");
  }

  const educationRole = (roles.profileRole as Role) ?? "customer";

  return (
    <DashboardShell
      role={educationRole}
      crmRole={roles.crmRole}
      canAccessCrmAdmin={roles.canAccessCrmAdmin}
      canActAsCrmMarketer={roles.canActAsCrmMarketer}
      hrmRole={roles.hrmRole}
      storeRole={roles.storeRole}
      storeCapabilities={roles.storeCapabilities as StoreCapabilities}
      userId={roles.userId}
      hasEducationAccess={roles.hasEducationAccess}
    >
      {children}
    </DashboardShell>
  );
}
