import { requireHrmAdmin } from "@/app/utils/auth/require";
import type { ReactNode } from "react";

export default async function HrmAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // SECURITY: Block non-admin users at layout level
  await requireHrmAdmin();

  return children;
}
