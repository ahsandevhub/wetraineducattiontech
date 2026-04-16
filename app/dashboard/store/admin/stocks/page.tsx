import { getCurrentUserWithRoles } from "@/app/utils/auth/roles";
import { getStoreStockOverview } from "../../_actions/stocks";
import { StoreStocksClient } from "./stocks-client";

export default async function StoreStocksPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const [result, roles] = await Promise.all([
    getStoreStockOverview(params),
    getCurrentUserWithRoles(),
  ]);
  const { data, error } = result;

  if (error || !data) {
    return (
      <div className="p-6">
        <div className="text-red-600">
          Error loading Store stock data: {error ?? "Unknown error"}
        </div>
      </div>
    );
  }

  return (
    <StoreStocksClient
      products={data.products}
      movementPage={data.movementPage}
      movementFilters={data.movementFilters}
      movementActors={data.movementActors}
      canManageStock={Boolean(roles?.storeCapabilities.canManageStock)}
    />
  );
}
