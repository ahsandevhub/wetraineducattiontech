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
      const error = params.get("error");
      const errorCode = params.get("error_code");
      const errorDescription = params.get("error_description");
      const type = params.get("type");

      if (error || errorCode || errorDescription) {
        const errorParams = new URLSearchParams();
        errorParams.set("error", errorCode || error || "auth_error");
        if (errorDescription) {
          errorParams.set("error_description", errorDescription);
        }

        window.location.replace(`/auth/error?${errorParams.toString()}`);
        return;
      }

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
