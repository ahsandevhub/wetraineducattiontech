import { requireHrmEmployee } from "@/app/utils/auth/require";
import type { ReactNode } from "react";

export default async function HrmEmployeeLayout({
  children,
}: {
  children: ReactNode;
}) {
  // SECURITY: Block non-employee users at layout level
  await requireHrmEmployee();

  return children;
}
