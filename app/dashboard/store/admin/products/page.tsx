import { requireStorePermission } from "@/app/utils/auth/require";
import { getAllStoreProducts } from "../../_actions/products";
import { StoreProductsClient } from "./products-client";

export default async function StoreProductsPage() {
  await requireStorePermission("product_manage");
  const result = await getAllStoreProducts();
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
    <StoreProductsClient products={data} canManageProducts />
  );
}
