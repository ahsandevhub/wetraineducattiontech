"use client";

import { createClient } from "@/app/utils/supabase/client";
import AuthConfirmation from "@/components/AuthConfirmation";
import {
  getAuthError,
  getErrorMessage,
  parseAuthHash,
  validateAuthData,
} from "@/lib/supabase/auth-handlers";
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
        // Check for Supabase errors first
        const authError = getAuthError();
        if (authError.error) {
          setStatus("error");
          setError(
            getErrorMessage(
              authError.error,
              authError.code,
              authError.description,
            ),
          );
          return;
        }

        // Parse hash from URL
        const hash = window.location.hash;
        if (!hash) {
          setStatus("error");
          setError("Invalid magic link. Please request a new one.");
          return;
        }

        const parsed = parseAuthHash(hash);
        const validation = validateAuthData(parsed);

        if (!validation.valid) {
          setStatus("error");
          setError(validation.error || "Invalid magic link");
          return;
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
