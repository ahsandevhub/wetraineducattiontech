/**
 * Unified Supabase Environment Configuration
 *
 * This module provides a single source of truth for Supabase API keys
 * following official Supabase best practices:
 *
 * NEW KEYS (Recommended):
 * - PUBLISHABLE_KEY: Safe for browser use with RLS, JWT-based
 * - SECRET_KEY: Server-only, bypasses RLS (use with caution)
 *
 * LEGACY KEYS (Fallback):
 * - ANON_KEY: Safe for browser use with RLS
 * - SERVICE_ROLE_KEY: Server-only, bypasses RLS
 *
 * Reference: https://supabase.com/docs/guides/api#api-keys
 */

const isDev = process.env.NODE_ENV === "development";

/**
 * Get Supabase project URL
 * Required for all Supabase operations
 */
export function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!url) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL environment variable. " +
        "Get this from: Supabase Dashboard → Settings → API → Project URL",
    );
  }

  if (isDev) {
    console.log(`[Supabase] Using URL: ${url.split(".")[0]}...`);
  }

  return url;
}

/**
 * Get Supabase publishable/anon key (for client-side and normal server operations)
 *
 * Priority:
 * 1. NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (new, preferred)
 * 2. NEXT_PUBLIC_SUPABASE_ANON_KEY (legacy)
 * 3. NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY (backward compatibility)
 *
 * This key is safe to use in browser code as it respects RLS policies.
 */
export function getSupabasePublicKey(): string {
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const legacyKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  const key = publishableKey || anonKey || legacyKey;

  if (!key) {
    throw new Error(
      "Missing Supabase public key. Set one of:\n" +
        "  - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (new, preferred)\n" +
        "  - NEXT_PUBLIC_SUPABASE_ANON_KEY (legacy)\n" +
        "Get from: Supabase Dashboard → Settings → API",
    );
  }

  if (isDev) {
    const keyType = publishableKey
      ? "publishable"
      : anonKey
        ? "anon (legacy)"
        : "legacy fallback";
    const preview = key.substring(0, 20) + "...";
    console.log(`[Supabase] Using ${keyType} key: ${preview}`);
  }

  return key;
}

/**
 * Get Supabase secret/service role key (server-only, bypasses RLS)
 *
 * Priority:
 * 1. SUPABASE_SECRET_KEY (new, preferred)
 * 2. SUPABASE_SERVICE_ROLE_KEY (legacy)
 *
 * ⚠️ WARNING: This key bypasses RLS and should ONLY be used in:
 * - Server-side admin operations (protected by requireCrmAdmin)
 * - Database migrations/seeding
 * - Bulk operations that need to bypass RLS
 *
 * NEVER expose this key to the client!
 */
export function getSupabaseSecretKey(): string {
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const key = secretKey || serviceRoleKey;

  if (!key) {
    throw new Error(
      "Missing Supabase secret key. Set one of:\n" +
        "  - SUPABASE_SECRET_KEY (new, preferred)\n" +
        "  - SUPABASE_SERVICE_ROLE_KEY (legacy)\n" +
        "Get from: Supabase Dashboard → Settings → API → service_role key\n" +
        "⚠️ Keep this secret! Never commit to git or expose to client.",
    );
  }

  if (isDev) {
    const keyType = secretKey ? "secret" : "service_role (legacy)";
    const preview = key.substring(0, 20) + "...";
    console.log(`[Supabase] Using ${keyType} key: ${preview}`);
  }

  return key;
}

/**
 * Validate all required Supabase environment variables
 * Useful for startup checks
 */
export function validateSupabaseEnv(): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check URL
  try {
    getSupabaseUrl();
  } catch (error) {
    errors.push((error as Error).message);
  }

  // Check public key
  try {
    getSupabasePublicKey();
    // Warn if using legacy naming
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
    ) {
      warnings.push(
        "Using legacy NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY. " +
          "Consider migrating to NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY",
      );
    }
  } catch (error) {
    errors.push((error as Error).message);
  }

  // Check secret key (warn if missing, don't fail)
  try {
    getSupabaseSecretKey();
    // Warn if using legacy naming
    if (
      !process.env.SUPABASE_SECRET_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      warnings.push(
        "Using legacy SUPABASE_SERVICE_ROLE_KEY. " +
          "Consider migrating to SUPABASE_SECRET_KEY",
      );
    }
  } catch {
    warnings.push(
      "No server secret key found. Admin operations will fail. " +
        "Set SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY if needed.",
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get database URL for Prisma (if used)
 * This is separate from Supabase JS client keys
 */
export function getDatabaseUrl(): string | undefined {
  return process.env.DATABASE_URL;
}
