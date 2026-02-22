import { createClient } from "@supabase/supabase-js";
import { getSupabaseSecretKey, getSupabaseUrl } from "./env";

/**
 * Create Supabase admin client for server-side privileged operations
 *
 * ⚠️ WARNING: This client uses the SECRET/SERVICE_ROLE key which bypasses RLS!
 *
 * Only use this for:
 * - User creation/deletion (auth.admin.*)
 * - Bulk operations that need to bypass RLS (imports, migrations)
 * - Admin-only operations protected by requireCrmAdmin() or requireAdmin()
 *
 * NEVER use in:
 * - Client components
 * - Public API routes
 * - Regular server components (use createClient from utils/supabase/server instead)
 *
 * Always protect admin client usage with proper authorization checks!
 */
export function createAdminClient() {
  return createClient(getSupabaseUrl(), getSupabaseSecretKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
