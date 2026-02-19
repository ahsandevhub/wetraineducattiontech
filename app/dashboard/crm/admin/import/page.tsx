import { requireCrmAdmin } from "@/app/utils/auth/require";
import { getMarketers } from "../../_actions/users";
import { ImportPageClient } from "./import-client";

export default async function ImportPage() {
  await requireCrmAdmin();

  const { data: marketers } = await getMarketers();

  return <ImportPageClient marketers={marketers || []} />;
}
