import { createClient } from "@/app/utils/supabase/server";

export async function createAdminClient() {
  return createClient();
}
