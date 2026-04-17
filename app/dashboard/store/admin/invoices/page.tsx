import { requireStorePermission } from "@/app/utils/auth/require";
import { getStoreAdminInvoiceHistory } from "../../_actions/invoices";
import { StoreAdminInvoicesClient } from "./store-admin-invoices-client";

export default async function StoreAdminInvoicesPage() {
  await requireStorePermission("invoice_manage");
  const result = await getStoreAdminInvoiceHistory();
  const { data, error } = result;

  if (error || !data) {
    return (
      <div className="p-6">
        <div className="text-red-600">
          Error loading Store invoices: {error ?? "Unknown error"}
        </div>
      </div>
    );
  }

  return (
    <StoreAdminInvoicesClient invoices={data} canManageInvoices />
  );
}
