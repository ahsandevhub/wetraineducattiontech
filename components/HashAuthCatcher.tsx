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
    if (
      pathname.startsWith("/auth") ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/set-password")
    ) {
      return;
    }

    const hash = window.location.hash;

    if (hash) {
      const params = new URLSearchParams(hash.slice(1));
      const hasAccessToken = params.has("access_token");
      const hasRefreshToken = params.has("refresh_token");
      const type = params.get("type");

      if (hasAccessToken || hasRefreshToken) {
        let redirectPath = "/auth/magic-link";

        switch (type) {
          case "invite":
          case "recovery":
            redirectPath = "/set-password";
            break;
          case "magiclink":
            redirectPath = "/auth/magic-link";
            break;
          case "email_change":
          case "email":
            redirectPath = "/auth/verify-email-change";
            break;
          case "signup":
            redirectPath = "/auth/magic-link";
            break;
          default:
            redirectPath = "/auth/magic-link";
        }

        window.location.replace(`${redirectPath}${hash}`);
        return;
      }
    }
  }, []);

  return null;
}
