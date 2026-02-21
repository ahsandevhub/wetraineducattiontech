"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * AuthRedirectHandler
 * Handles auth tokens from Supabase that land on the homepage
 */
export function AuthRedirectHandler() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash;
    if (!hash) return;

    const params = new URLSearchParams(hash.slice(1));
    const accessToken = params.get("access_token");
    const type = params.get("type");
    const error = params.get("error");
    const errorCode = params.get("error_code");

    if (error) {
      if (
        errorCode === "otp_expired" ||
        errorCode === "otp_already_used" ||
        errorCode === "invalid_otp"
      ) {
        router.replace(`/auth/accept-invite${hash}`);
      }
      return;
    }

    if (accessToken && type) {
      let redirectPath = "";

      switch (type) {
        case "invite":
          redirectPath = "/auth/accept-invite";
          break;
        case "magiclink":
          redirectPath = "/auth/magic-link";
          break;
        case "recovery":
          redirectPath = "/set-password";
          break;
        case "signup":
          redirectPath = "/auth/callback";
          break;
        case "email_change":
          redirectPath = "/auth/verify-email-change";
          break;
        default:
          redirectPath = "/auth/callback";
      }

      router.replace(`${redirectPath}${hash}`);
    }
  }, [router]);

  return null;
}
