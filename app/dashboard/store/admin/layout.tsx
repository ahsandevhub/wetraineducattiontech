import { requireStoreAdmin } from "@/app/utils/auth/require";
import type { ReactNode } from "react";

export default async function StoreAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireStoreAdmin();

  return children;
}
