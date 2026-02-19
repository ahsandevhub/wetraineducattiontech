import { getSupabasePublicKey, getSupabaseUrl } from "@/lib/supabase/env";
import { createBrowserClient } from "@supabase/ssr";

/**
 * Create Supabase client for browser use
 * Uses publishable/anon key (safe for client-side, respects RLS)
 */
export const createClient = () =>
  createBrowserClient(getSupabaseUrl(), getSupabasePublicKey());
