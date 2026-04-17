import { requireStorePermission } from "@/app/utils/auth/require";
import { getAllStoreUsers } from "../../_actions/users";
import { StoreEmployeesClient } from "./employees-client";

export default async function StoreEmployeesPage() {
  await requireStorePermission("permissions_manage");
  const { data, error } = await getAllStoreUsers();

  if (error || !data) {
    return (
      <div className="p-6">
        <div className="text-red-600">
          Error loading Store users: {error ?? "Unknown error"}
        </div>
      </div>
    );
  }

  return (
    <StoreEmployeesClient
      users={data.users}
      currentUserId={data.currentUserId}
      canManagePermissions={data.canManagePermissions}
    />
  );
}
