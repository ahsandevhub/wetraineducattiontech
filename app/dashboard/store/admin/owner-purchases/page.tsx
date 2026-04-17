import { requireStorePermission } from "@/app/utils/auth/require";
import { getStoreOwnerPurchasesOverview } from "../../_actions/owner-purchases";
import { StoreOwnerPurchasesClient } from "./store-owner-purchases-client";

export default async function StoreOwnerPurchasesPage() {
  await requireStorePermission("owner_purchase_manage");
  const result = await getStoreOwnerPurchasesOverview();
  const { data, error } = result;

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
      salesByMonth={data.salesByMonth}
      stockValuation={data.stockValuation}
      monthClosures={data.monthClosures}
      canManageOwnerPurchases
    />
  );
}
