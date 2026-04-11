import { getStoreReportsData } from "../../_actions/reports";
import { StoreReportsClient } from "./store-reports-client";

export default async function StoreReportsPage() {
  const { data, error } = await getStoreReportsData();

  if (error || !data) {
    return (
      <div className="p-6">
        <div className="text-red-600">
          Error loading Store reports: {error ?? "Unknown error"}
        </div>
      </div>
    );
  }

  return <StoreReportsClient data={data} />;
}
