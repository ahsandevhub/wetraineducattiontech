import { getSupabaseUrl } from "@/lib/supabase/env";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function createAdminClient() {
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("SUPABASE_SECRET_KEY is not set in environment");
  }

  return createSupabaseClient(getSupabaseUrl(), secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
