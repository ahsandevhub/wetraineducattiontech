import { requireStorePermission } from "@/app/utils/auth/require";
import { getStoreStockOverview } from "../../_actions/stocks";
import { StoreStocksClient } from "./stocks-client";

export default async function StoreStocksPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireStorePermission("stock_manage");
  const params = await searchParams;
  const result = await getStoreStockOverview(params);
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
      canManageStock
    />
  );
}
