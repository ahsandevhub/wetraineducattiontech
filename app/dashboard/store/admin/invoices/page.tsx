import { getStoreAdminInvoiceHistory } from "../../_actions/invoices";
import { StoreAdminInvoicesClient } from "./store-admin-invoices-client";

export default async function StoreAdminInvoicesPage() {
  const { data, error } = await getStoreAdminInvoiceHistory();

  if (error || !data) {
    return (
      <div className="p-6">
        <div className="text-red-600">
          Error loading Store invoices: {error ?? "Unknown error"}
        </div>
      </div>
    );
  }

  return <StoreAdminInvoicesClient invoices={data} />;
}
