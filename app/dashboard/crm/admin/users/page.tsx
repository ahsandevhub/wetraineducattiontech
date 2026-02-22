import { requireCrmAdmin } from "@/app/utils/auth/require";
import { getCurrentUserWithRoles } from "@/app/utils/auth/roles";
import { redirect } from "next/navigation";
import { getAllUsers } from "../../_actions/users";
import { UsersPageClient } from "./users-client";

export default async function UsersPage() {
  await requireCrmAdmin();
  const userWithRoles = await getCurrentUserWithRoles();

  if (!userWithRoles) {
    redirect("/login");
  }

  const { userId } = userWithRoles;
  const { data: users, error } = await getAllUsers();

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-600">Error loading users: {error}</div>
      </div>
    );
  }

  return <UsersPageClient users={users || []} currentUserId={userId} />;
}
