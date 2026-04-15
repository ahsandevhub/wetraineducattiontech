import { getStoreStockOverview } from "../../_actions/stocks";
import { StoreStocksClient } from "./stocks-client";

export default async function StoreStocksPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { data, error } = await getStoreStockOverview(await searchParams);

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
    />
  );
}
