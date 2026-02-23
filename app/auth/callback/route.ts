import { createClient } from "@/app/utils/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

/**
 * Auth Callback Route Handler
 *
 * Handles OAuth and email confirmation callbacks from Supabase.
 *
 * Flow Types:
 * 1. **OAuth/Signup Confirmation** (query params):
 *    - URL: /auth/callback?code=...&next=/dashboard
 *    - Exchanges code for session
 *    - Creates user profile if needed
 *    - Redirects to dashboard
 *
 * 2. **Hash-based flows** (handled client-side on dedicated pages):
 *    - Invite: /auth/accept-invite#access_token=...&type=invite
 *    - Magic Link: /auth/magic-link#access_token=...
 *    - Email Change: /auth/verify-email-change#access_token=...&type=email_change
 *    - Password Reset: /set-password#access_token=...&type=recovery
 *
 * Note: Hash fragments (#) are not sent to the server, so hash-based flows
 * must be handled client-side. This route only handles code-based flows.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const nextParam = requestUrl.searchParams.get("next");
  const next = nextParam?.startsWith("/") ? nextParam : "/dashboard";
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  const resolveRedirect = (flowType: string | null) => {
    switch (flowType) {
      case "invite":
      case "recovery":
        return "/set-password";
      case "magiclink":
        return "/auth/magic-link";
      case "email_change":
      case "email":
        return "/auth/verify-email-change";
      case "signup":
        return next;
      default:
        return next;
    }
  };

  // Handle auth errors from Supabase
  if (error) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(
      new URL(
        `/auth/error?error=${encodeURIComponent(error)}${errorDescription ? `&error_description=${encodeURIComponent(errorDescription)}` : ""}`,
        requestUrl.origin,
      ),
    );
  }

  const supabase = await createClient();

  // Handle email OTP/token_hash based flows from Supabase email templates
  if (tokenHash && type) {
    const { error: verifyError } = await supabase.auth.verifyOtp({
      type: type as EmailOtpType,
      token_hash: tokenHash,
    });

    if (verifyError) {
      console.error("OTP verification error:", verifyError.message);
      return NextResponse.redirect(
        new URL(
          `/auth/error?error=${encodeURIComponent(verifyError.code || "invalid_otp")}&error_description=${encodeURIComponent(verifyError.message)}`,
          requestUrl.origin,
        ),
      );
    }

    return NextResponse.redirect(
      new URL(resolveRedirect(type), requestUrl.origin),
    );
  }

  // Exchange authorization code for session
  if (code) {
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("Code exchange error:", exchangeError.message);
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent("session_exchange_failed")}`,
          requestUrl.origin,
        ),
      );
    }

    // Verify session was created successfully
    const { data: session, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError || !session?.session) {
      console.error("Session verification failed:", sessionError?.message);
      return NextResponse.redirect(
        new URL("/login?error=no_session", requestUrl.origin),
      );
    }

    // Create or update user profile
    const user = session.session.user;
    if (user?.id) {
      try {
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();

        // If profile doesn't exist, create one
        if (!existingProfile) {
          await supabase.from("profiles").insert({
            id: user.id,
            full_name: user.user_metadata?.name ?? "New User",
            email: user.email ?? null,
            avatar_url: user.user_metadata?.avatar_url ?? null,
            role: "customer",
          });
        }
      } catch (profileError) {
        console.error("Error creating user profile:", profileError);
        // Continue to dashboard even if profile creation fails
      }
    }

    // Session established successfully - redirect to dashboard or next URL
    return NextResponse.redirect(new URL(next, requestUrl.origin));
  }

  // No code provided - invalid callback
  console.error("Auth callback: missing required auth params");
  return NextResponse.redirect(
    new URL(
      "/auth/error?error=invalid_callback&error_description=Missing+auth+parameters",
      requestUrl.origin,
    ),
  );
}
