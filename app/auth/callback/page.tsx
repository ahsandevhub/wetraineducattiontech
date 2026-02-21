"use client";

import { createClient } from "@/app/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

/**
 * Unified Auth Callback Handler
 * Handles all Supabase auth flows: PKCE, Hash Tokens, Errors
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const handledRef = useRef(false);

  const ensureProfileExists = useCallback(
    async (user: any) => {
      try {
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();

        if (!existingProfile) {
          await supabase.from("profiles").insert({
            id: user.id,
            full_name:
              user.user_metadata?.name ||
              user.user_metadata?.full_name ||
              "New User",
            email: user.email || null,
            avatar_url: user.user_metadata?.avatar_url || null,
            role: "customer",
          });
        }
      } catch {
        // Continue anyway
      }
    },
    [supabase],
  );

  const determineRedirectUrl = useCallback(
    async (userId: string, next?: string | null): Promise<string> => {
      try {
        if (next && next.startsWith("/")) {
          return next;
        }

        // Fetch education profile (optional - CRM/HRM-only users may not have this)
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .maybeSingle();

        // Fetch CRM profile (optional - education/HRM-only users may not have this)
        const { data: crmUser } = await supabase
          .from("crm_users")
          .select("id")
          .eq("auth_user_id", userId)
          .maybeSingle();

        // Fetch HRM profile (optional - education/CRM-only users may not have this)
        const { data: hrmUser } = await supabase
          .from("hrm_users")
          .select("id, is_active")
          .eq("profile_id", userId)
          .maybeSingle();

        const hasEducationAccess = profile !== null;
        const hasCrmAccess = crmUser !== null;
        const hasHrmAccess = hrmUser !== null && hrmUser.is_active;
        const role = profile?.role;

        // Redirect priority: Education > CRM > HRM
        if (hasEducationAccess) {
          // User has education access
          if (role === "admin") {
            return "/dashboard/admin";
          } else {
            return "/dashboard/customer";
          }
        } else if (hasCrmAccess) {
          // User has CRM access but no education
          return "/dashboard/crm";
        } else if (hasHrmAccess) {
          // User has HRM access but no education or CRM
          return "/dashboard/hrm";
        } else {
          // Fallback to dashboard
          return "/dashboard";
        }
      } catch (error) {
        console.error("[CALLBACK] Error in determineRedirectUrl:", error);
        return "/dashboard";
      }
    },
    [supabase],
  );

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (handledRef.current) return;
      handledRef.current = true;

      try {
        const errorParam = searchParams.get("error");
        const errorCode = searchParams.get("error_code");
        const codeParam = searchParams.get("code");

        const hash = window.location.hash.slice(1);
        const hashParams = new URLSearchParams(hash);
        const hashError = hashParams.get("error");
        const hashErrorCode = hashParams.get("error_code");
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const type = hashParams.get("type");

        // Handle errors
        if (errorParam || hashError) {
          const detectedCode = errorCode || hashErrorCode;
          let mappedError = "auth_failed";

          if (
            detectedCode === "otp_expired" ||
            detectedCode === "invalid_otp"
          ) {
            mappedError = "otp_expired";
          } else if (
            detectedCode === "invalid_callback" ||
            detectedCode === "access_denied"
          ) {
            mappedError = "invalid_link";
          } else if (detectedCode === "user_not_found") {
            mappedError = "user_not_found";
          }

          setTimeout(
            () => router.replace(`/login?auth_error=${mappedError}&cb=1`),
            1500,
          );
          return;
        }

        // PKCE Code Exchange
        if (codeParam) {
          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(codeParam);
          if (exchangeError) {
            setTimeout(
              () => router.replace("/login?auth_error=auth_failed&cb=1"),
              2000,
            );
            return;
          }

          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (!session) throw new Error("No session after PKCE exchange");

          await ensureProfileExists(session.user);
          const redirectUrl = await determineRedirectUrl(
            session.user.id,
            searchParams.get("next"),
          );

          router.replace(redirectUrl);
          return;
        }

        // Hash Token Exchange
        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            setTimeout(
              () => router.replace("/login?auth_error=auth_failed&cb=1"),
              2000,
            );
            return;
          }

          const {
            data: { session },
            error: verifyError,
          } = await supabase.auth.getSession();

          if (verifyError || !session) {
            setTimeout(
              () => router.replace("/login?auth_error=auth_failed&cb=1"),
              2000,
            );
            return;
          }

          // Route based on type
          switch (type) {
            case "invite":
              router.replace(`/auth/accept-invite${window.location.hash}`);
              return;

            case "recovery":
              router.replace(`/set-password${window.location.hash}`);
              return;

            case "email_change":
              const emailRedirect = await determineRedirectUrl(session.user.id);
              router.replace(emailRedirect);
              return;

            case "magiclink":
            default:
              await ensureProfileExists(session.user);
              const dashRedirect = await determineRedirectUrl(session.user.id);
              router.replace(dashRedirect);
              return;
          }
        }

        // No valid auth parameters
        setTimeout(
          () => router.replace("/login?auth_error=invalid_link&cb=1"),
          2000,
        );
      } catch {
        setTimeout(
          () => router.replace("/login?auth_error=auth_failed&cb=1"),
          2000,
        );
      }
    };

    handleAuthCallback();
  }, [
    searchParams,
    router,
    supabase,
    ensureProfileExists,
    determineRedirectUrl,
  ]);

  return null;
}
