import { getCurrentUserWithRoles } from "@/app/utils/auth/roles";
import { getStoreAdminInvoiceHistory } from "../../_actions/invoices";
import { StoreAdminInvoicesClient } from "./store-admin-invoices-client";

export default async function StoreAdminInvoicesPage() {
  const [result, roles] = await Promise.all([
    getStoreAdminInvoiceHistory(),
    getCurrentUserWithRoles(),
  ]);
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
    <StoreAdminInvoicesClient
      invoices={data}
      canManageInvoices={Boolean(roles?.storeCapabilities.canManageInvoices)}
    />
  );
}
