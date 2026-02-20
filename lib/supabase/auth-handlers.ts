/**
 * Supabase Auth Flow Handlers
 * Utilities for parsing and handling different email auth flows
 */

import type { AuthFlowType } from "./auth-config";

/**
 * Parsed auth token data from URL hash
 */
export interface ParsedAuthHash {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  expiresIn: number | null;
  tokenHash: string | null;
  type: AuthFlowType | null;
  error: string | null;
  errorDescription: string | null;
}

/**
 * Parse authentication data from URL hash fragment
 * Supabase sends tokens in the hash (#) not query params (?)
 *
 * Example URLs:
 * - Invite: #access_token=...&type=invite&expires_at=...
 * - Magic Link: #access_token=...&expires_at=...
 * - Recovery: #access_token=...&type=recovery
 */
export function parseAuthHash(hash: string): ParsedAuthHash {
  // Remove leading # if present
  const cleanHash = hash.startsWith("#") ? hash.slice(1) : hash;

  // Parse hash into URLSearchParams
  const params = new URLSearchParams(cleanHash);

  return {
    accessToken: params.get("access_token"),
    refreshToken: params.get("refresh_token"),
    expiresAt: params.get("expires_at")
      ? parseInt(params.get("expires_at")!, 10)
      : null,
    expiresIn: params.get("expires_in")
      ? parseInt(params.get("expires_in")!, 10)
      : null,
    tokenHash: params.get("token_hash"),
    type: params.get("type") as AuthFlowType | null,
    error: params.get("error"),
    errorDescription: params.get("error_description"),
  };
}

/**
 * Check if auth token is expired
 */
export function isTokenExpired(expiresAt: number | null): boolean {
  if (!expiresAt) return false;

  // expiresAt is Unix timestamp in seconds
  const now = Math.floor(Date.now() / 1000);
  return now >= expiresAt;
}

/**
 * Detect auth flow type from parsed hash
 * Falls back to heuristics if type is not explicitly provided
 */
export function detectFlowType(parsed: ParsedAuthHash): AuthFlowType | null {
  // Use explicit type if provided
  if (parsed.type) {
    return parsed.type;
  }

  // Heuristic detection based on available tokens
  if (parsed.tokenHash && parsed.accessToken) {
    // Has both token_hash and access_token - likely invite or recovery
    return "invite";
  }

  if (parsed.accessToken && !parsed.tokenHash) {
    // Only has access_token - likely magic link
    return "magiclink";
  }

  return null;
}

/**
 * Format error message for display to users
 */
export function formatAuthError(error: string | null): string {
  if (!error) return "An unknown error occurred";

  switch (error) {
    case "access_denied":
      return "Access was denied. Please try again.";
    case "server_error":
      return "A server error occurred. Please try again later.";
    case "temporarily_unavailable":
      return "The service is temporarily unavailable. Please try again.";
    case "invalid_request":
      return "Invalid request. Please check the link and try again.";
    case "unauthorized_client":
      return "Unauthorized. Please contact support.";
    case "invalid_grant":
      return "The link has expired or is invalid. Please request a new one.";
    case "invalid_token":
      return "The token is invalid. Please request a new link.";
    case "expired_token":
      return "The link has expired. Please request a new one.";
    default:
      return `Authentication error: ${error}`;
  }
}

/**
 * Build error redirect URL with message
 */
export function buildErrorRedirect(
  basePath: string,
  error: string,
  description?: string,
): string {
  const params = new URLSearchParams();
  params.set("error", error);
  if (description) {
    params.set("error_description", description);
  }
  return `${basePath}?${params.toString()}`;
}

/**
 * Validate that required auth data is present
 */
export function validateAuthData(parsed: ParsedAuthHash): {
  valid: boolean;
  error?: string;
} {
  // Check for errors first
  if (parsed.error) {
    return {
      valid: false,
      error: formatAuthError(parsed.error),
    };
  }

  // Check for expired token
  if (parsed.expiresAt && isTokenExpired(parsed.expiresAt)) {
    return {
      valid: false,
      error: "This link has expired. Please request a new one.",
    };
  }

  // Must have access token
  if (!parsed.accessToken) {
    return {
      valid: false,
      error: "Invalid authentication link. No token found.",
    };
  }

  return { valid: true };
}
