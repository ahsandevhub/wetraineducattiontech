/**
 * HRM KPI Dashboard Home
 * Shows role-specific dashboard with redirect:
 * - SUPER_ADMIN: Redirects to /dashboard/hrm/super
 * - ADMIN: Redirects to /dashboard/hrm/admin
 * - EMPLOYEE: Redirects to /dashboard/hrm/employee
 *
 * Auto-linking: On first access, checks for pending HRM profile by email
 * and creates hrm_users if found.
 */

import { getCurrentUserWithRoles } from "@/app/utils/auth/roles";
import { createClient } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function HrmDashboardPage() {
  // Get authenticated user
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user roles
  const roles = await getCurrentUserWithRoles();

  if (!roles?.hrmRole) {
    redirect("/unauthorized");
  }

  // Role-based redirect
  switch (roles.hrmRole) {
    case "SUPER_ADMIN":
      redirect("/dashboard/hrm/super");
    case "ADMIN":
      redirect("/dashboard/hrm/admin");
    case "EMPLOYEE":
      redirect("/dashboard/hrm/employee");
    default:
      redirect("/unauthorized");
  }
}
