/**
 * Supabase Auth Configuration
 * Centralized configuration for auth redirects and settings
 */

// Get the site URL from environment or fallback to localhost
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : "http://localhost:3000";

/**
 * Auth redirect URLs for email templates
 * These should be added to Supabase Dashboard → Authentication → URL Configuration → Redirect URLs
 */
export const AUTH_REDIRECT_URLS = {
  /** OAuth and signup confirmation callback */
  CALLBACK: `${SITE_URL}/auth/callback`,
  /** Invite user acceptance page */
  INVITE: `${SITE_URL}/auth/accept-invite`,
  /** Magic link passwordless login */
  MAGIC_LINK: `${SITE_URL}/auth/magic-link`,
  /** Email change confirmation */
  EMAIL_CHANGE: `${SITE_URL}/auth/verify-email-change`,
  /** Password reset page */
  RESET_PASSWORD: `${SITE_URL}/set-password`,
  /** Reauthentication for sensitive operations */
  REAUTHENTICATE: `${SITE_URL}/auth/reauthenticate`,
  /** Default dashboard redirect after successful auth */
  DASHBOARD: `${SITE_URL}/dashboard`,
} as const;

/**
 * Auth flow types from Supabase
 */
export type AuthFlowType =
  | "invite"
  | "magiclink"
  | "recovery"
  | "signup"
  | "email_change"
  | "reauthentication";

/**
 * Get the appropriate redirect URL for an auth flow type
 */
export function getRedirectUrlForFlow(flowType: AuthFlowType): string {
  switch (flowType) {
    case "invite":
      return AUTH_REDIRECT_URLS.INVITE;
    case "magiclink":
      return AUTH_REDIRECT_URLS.MAGIC_LINK;
    case "recovery":
      return AUTH_REDIRECT_URLS.RESET_PASSWORD;
    case "signup":
      return AUTH_REDIRECT_URLS.CALLBACK;
    case "email_change":
      return AUTH_REDIRECT_URLS.EMAIL_CHANGE;
    case "reauthentication":
      return AUTH_REDIRECT_URLS.REAUTHENTICATE;
    default:
      return AUTH_REDIRECT_URLS.CALLBACK;
  }
}

/**
 * URLs that should be added to Supabase Dashboard
 * Copy these and add them to: Authentication → URL Configuration → Redirect URLs
 */
export const SUPABASE_REDIRECT_WHITELIST = Object.values(AUTH_REDIRECT_URLS);
