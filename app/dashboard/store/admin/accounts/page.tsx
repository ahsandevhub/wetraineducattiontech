import { getCurrentUserWithRoles } from "@/app/utils/auth/roles";
import { getStoreAccountsOverview } from "../../_actions/accounts";
import { StoreAccountsAdminClient } from "./store-accounts-admin-client";

export default async function StoreAdminAccountsPage() {
  const [result, roles] = await Promise.all([
    getStoreAccountsOverview(),
    getCurrentUserWithRoles(),
  ]);
  const { data, error } = result;

  if (error || !data) {
    return (
      <div className="p-6">
        <div className="text-red-600">
          Error loading Store accounts: {error ?? "Unknown error"}
        </div>
      </div>
    );
  }

  return (
    <StoreAccountsAdminClient
      users={data.users}
      entries={data.entries}
      categories={data.categories}
      summary={data.summary}
      monthClosures={data.monthClosures}
      canAddBalance={Boolean(roles?.storeCapabilities.canAddBalance)}
    />
  );
}
