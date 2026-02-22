/**
 * Server-side Supabase clients
 * - createClient: For authenticated user operations (uses session)
 * - getServiceSupabase: For service_role operations (bypasses RLS)
 */

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Get service role client (bypasses RLS)
 * Use only in server-side code where admin operations are needed
 * Supports both new (SUPABASE_SECRET_KEY) and legacy (SUPABASE_SERVICE_ROLE_KEY) key formats
 */
export function getServiceSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  // Support both new format (sb_secret_...) and legacy format (JWT)
  const supabaseServiceKey =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseServiceKey) {
    throw new Error(
      "Service key is required. Set either SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY in environment variables.",
    );
  }

  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
