import { getCurrentUserWithRoles } from "@/app/utils/auth/roles";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const roles = await getCurrentUserWithRoles();

  if (!roles) {
    redirect("/login");
  }

  // Priority: Education > CRM > HRM
  if (roles.hasEducationAccess) {
    // Education takes priority
    redirect(
      roles.profileRole === "admin"
        ? "/dashboard/admin"
        : "/dashboard/customer",
    );
  } else if (roles.hasCrmAccess) {
    // CRM second priority
    redirect("/dashboard/crm");
  } else if (roles.hasHrmAccess) {
    // HRM third priority - redirect to role-specific dashboard
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
  } else {
    // User has no access to any application
    redirect("/unauthorized");
  }
}
