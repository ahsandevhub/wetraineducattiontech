import { getCurrentUserWithRoles } from "@/app/utils/auth/roles";
import { getAllStoreProducts } from "../../_actions/products";
import { StoreProductsClient } from "./products-client";

export default async function StoreProductsPage() {
  const [result, roles] = await Promise.all([
    getAllStoreProducts(),
    getCurrentUserWithRoles(),
  ]);
  const { data, error } = result;

  if (error || !data) {
    return (
      <div className="p-6">
        <div className="text-red-600">
          Error loading Store products: {error ?? "Unknown error"}
        </div>
      </div>
    );
  }

  return (
    <StoreProductsClient
      products={data}
      canManageProducts={Boolean(roles?.storeCapabilities.canManageProducts)}
    />
  );
}
