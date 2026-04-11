import { getStoreInvoiceBuilderData } from "../../_actions/invoices";
import { InvoiceBuilderClient } from "./invoice-builder-client";

export default async function StoreNewInvoicePage() {
  const { data, error } = await getStoreInvoiceBuilderData();

  if (error || !data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">New Invoice</h1>
          <p className="text-muted-foreground">
            Error loading invoice builder: {error ?? "Unknown error"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <InvoiceBuilderClient
      products={data.products}
      currentBalance={data.currentBalance}
    />
  );
}
