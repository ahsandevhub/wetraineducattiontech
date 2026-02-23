"use client";

import { createClient } from "@/app/utils/supabase/client";
import AuthConfirmation from "@/components/AuthConfirmation";
import {
  getAuthErrorMessage,
  parseAuthParams,
} from "@/lib/supabase/auth-handlers";
import type { EmailOtpType } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function MagicLinkPage() {
  const router = useRouter();
  const supabase = createClient();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("Signing you in...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleMagicLink() {
      try {
        const parsed = parseAuthParams(
          window.location.search,
          window.location.hash,
        );

        const parsedError = getAuthErrorMessage(parsed);
        if (parsedError) {
          setStatus("error");
          setError(parsedError);
          return;
        }

        if (
          parsed.type &&
          parsed.type !== "magiclink" &&
          parsed.type !== "signup"
        ) {
          setStatus("error");
          setError("This link is not a valid magic sign-in link.");
          return;
        }

        if (parsed.tokenHash && parsed.type) {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            type: parsed.type as EmailOtpType,
            token_hash: parsed.tokenHash,
          });

          if (verifyError) {
            setStatus("error");
            setError(verifyError.message || "Invalid or expired sign-in link.");
            return;
          }
        }

        if (parsed.accessToken && parsed.refreshToken) {
          const { error: setSessionError } = await supabase.auth.setSession({
            access_token: parsed.accessToken,
            refresh_token: parsed.refreshToken,
          });

          if (setSessionError) {
            setStatus("error");
            setError(
              setSessionError.message ||
                "Failed to establish session. Please request a new link.",
            );
            return;
          }
        }

        // Verify session was created by Supabase
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          setStatus("error");
          setError(
            "Failed to establish session. Please try clicking the link again.",
          );
          return;
        }

        // Success! Session is active
        setStatus("success");
        setMessage("Successfully signed in! Redirecting to your dashboard...");

        // Redirect after a brief moment
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } catch (err: any) {
        console.error("Error handling magic link:", err);
        setStatus("error");
        setError(err.message || "An unexpected error occurred");
      }
    }

    handleMagicLink();
  }, [supabase, router]);

  if (status === "loading") {
    return (
      <AuthConfirmation
        type="loading"
        title="Magic Link Sign In"
        message={message}
      />
    );
  }

  if (status === "error") {
    return (
      <AuthConfirmation
        type="error"
        title="Sign In Failed"
        message={error || "Failed to sign in with magic link"}
        actionButton={{
          text: "Request New Magic Link",
          onClick: () => router.push("/login"),
        }}
      />
    );
  }

  return (
    <AuthConfirmation
      type="success"
      title="Welcome Back! ✨"
      message={message}
      redirectUrl="/dashboard"
      redirectDelay={2}
    />
  );
}
