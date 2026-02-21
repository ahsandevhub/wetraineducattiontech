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

export default function VerifyEmailChangePage() {
  const router = useRouter();
  const supabase = createClient();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("Verifying your new email address...");
  const [error, setError] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState<string | null>(null);

  useEffect(() => {
    async function handleEmailChange() {
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
          setError(
            "Invalid email change link. Please try again from your profile settings.",
          );
          return;
        }

        const parsed = parseAuthHash(hash);
        const validation = validateAuthData(parsed);

        if (!validation.valid) {
          setStatus("error");
          setError(validation.error || "Invalid email change link");
          return;
        }

        // Verify email change token type
        if (parsed.type && parsed.type !== "email_change") {
          setStatus("error");
          setError("This link is not for email change verification.");
          return;
        }

        // Get current session to verify email change
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          setStatus("error");
          setError("Failed to verify email change. Please try again.");
          return;
        }

        // Email change successful - session now has new email
        setNewEmail(session.user.email || null);
        setStatus("success");
        setMessage(
          `Your email address has been successfully updated${newEmail ? ` to ${newEmail}` : ""}!`,
        );
      } catch (err: any) {
        console.error("Error handling email change:", err);
        setStatus("error");
        setError(err.message || "An unexpected error occurred");
      }
    }

    handleEmailChange();
  }, [supabase, newEmail]);

  if (status === "loading") {
    return (
      <AuthConfirmation
        type="loading"
        title="Verifying Email Change"
        message={message}
      />
    );
  }

  if (status === "error") {
    return (
      <AuthConfirmation
        type="error"
        title="Verification Failed"
        message={error || "Failed to verify email change"}
        actionButton={{
          text: "Go to Profile Settings",
          onClick: () => router.push("/dashboard/profile"),
        }}
      />
    );
  }

  return (
    <AuthConfirmation
      type="success"
      title="Email Updated! 📧"
      message={message}
      redirectUrl="/dashboard"
      redirectDelay={3}
    />
  );
}
