import { getStorePurchaseHistory } from "../_actions/purchases";
import { StorePurchasesClient } from "./purchases-client";

export default async function StorePurchasesPage() {
  const { data, error } = await getStorePurchaseHistory();

  if (error || !data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Purchases</h1>
          <p className="text-muted-foreground">
            Error loading purchase history: {error ?? "Unknown error"}
          </p>
        </div>
      </div>
    );
  }

  return <StorePurchasesClient invoices={data} />;
}
