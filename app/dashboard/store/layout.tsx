/**
 * Store Module Layout
 * SERVER-SIDE SECURITY: requireStoreAccess() enforced here
 * Only users with Store access can access /dashboard/store/*
 */

import { requireStoreAccess } from "@/app/utils/auth/require";
import type { ReactNode } from "react";

export default async function StoreLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireStoreAccess();

  return children;
}
