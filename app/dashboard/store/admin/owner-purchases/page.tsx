import { getStoreOwnerPurchasesOverview } from "../../_actions/owner-purchases";
import { StoreOwnerPurchasesClient } from "./store-owner-purchases-client";

export default async function StoreOwnerPurchasesPage() {
  const { data, error } = await getStoreOwnerPurchasesOverview();

  if (error || !data) {
    return (
      <div className="p-6">
        <div className="text-red-600">
          Error loading owner purchases: {error ?? "Unknown error"}
        </div>
      </div>
    );
  }

  return (
    <StoreOwnerPurchasesClient
      currentMonthKey={data.currentMonthKey}
      monthOptions={data.monthOptions}
      entries={data.entries}
      monthClosures={data.monthClosures}
    />
  );
}
