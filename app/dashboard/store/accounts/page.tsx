import { getStoreAccountHistory } from "../_actions/account-history";
import { StoreAccountsClient } from "./accounts-client";

export default async function StoreAccountsPage() {
  const { data, error } = await getStoreAccountHistory();

  if (error || !data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Account</h1>
          <p className="text-muted-foreground">
            Error loading account history: {error ?? "Unknown error"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <StoreAccountsClient
      currentBalance={data.currentBalance}
      entries={data.entries}
      categories={data.categories}
    />
  );
}
