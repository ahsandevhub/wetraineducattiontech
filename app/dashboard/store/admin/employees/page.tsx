import { getAllStoreUsers } from "../../_actions/users";
import { StoreEmployeesClient } from "./employees-client";

export default async function StoreEmployeesPage() {
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
    />
  );
}
