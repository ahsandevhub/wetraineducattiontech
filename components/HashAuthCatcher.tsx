"use client";

import { useEffect } from "react";

/**
 * Hash Auth Catcher
 *
 * Intercepts Supabase email links that land on "/" with hash tokens
 * and immediately redirects to /auth/callback before landing content renders.
 */
export function HashAuthCatcher() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const pathname = window.location.pathname;
    if (pathname.startsWith("/auth") || pathname.startsWith("/login")) {
      return;
    }

    const hash = window.location.hash;

    if (hash) {
      const params = new URLSearchParams(hash.slice(1));
      const hasAccessToken = params.has("access_token");
      const hasRefreshToken = params.has("refresh_token");

      if (hasAccessToken || hasRefreshToken) {
        window.location.replace(`/auth/callback?from_hash=1${hash}`);
        return;
      }
    }
  }, []);

  return null;
}
