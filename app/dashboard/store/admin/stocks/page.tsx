import { getStoreStockOverview } from "../../_actions/stocks";
import { StoreStocksClient } from "./stocks-client";

export default async function StoreStocksPage() {
  const { data, error } = await getStoreStockOverview();

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
      movementHistory={data.movementHistory}
    />
  );
}
