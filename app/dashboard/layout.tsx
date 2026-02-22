import DashboardShell from "@/app/dashboard/DashboardShell";
import { getCurrentUserWithRoles } from "@/app/utils/auth/roles";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

type Role = "customer" | "admin";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Use unified role resolver - single DB call for education + CRM + HRM roles
  const roles = await getCurrentUserWithRoles();

  if (!roles) {
    redirect("/login");
  }

  // Ensure user has access to at least one app
  if (!roles.hasEducationAccess && !roles.hasCrmAccess && !roles.hasHrmAccess) {
    redirect("/unauthorized");
  }

  const educationRole = (roles.profileRole as Role) ?? "customer";

  return (
    <DashboardShell
      role={educationRole}
      crmRole={roles.crmRole}
      hrmRole={roles.hrmRole}
      userId={roles.userId}
      hasEducationAccess={roles.hasEducationAccess}
    >
      {children}
    </DashboardShell>
  );
}
