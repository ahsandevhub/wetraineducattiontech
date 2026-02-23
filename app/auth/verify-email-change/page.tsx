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

        // Verify email change token type
        if (
          parsed.type &&
          parsed.type !== "email_change" &&
          parsed.type !== "email"
        ) {
          setStatus("error");
          setError("This link is not for email change verification.");
          return;
        }

        if (parsed.tokenHash && parsed.type) {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            type: parsed.type as EmailOtpType,
            token_hash: parsed.tokenHash,
          });

          if (verifyError) {
            setStatus("error");
            setError(
              verifyError.message ||
                "Invalid or expired email verification link.",
            );
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
                "Unable to verify email change. Please try again.",
            );
            return;
          }
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
        const updatedEmail = session.user.email || null;
        setNewEmail(updatedEmail);
        setStatus("success");
        setMessage(
          `Your email address has been successfully updated${updatedEmail ? ` to ${updatedEmail}` : ""}!`,
        );
      } catch (err: any) {
        console.error("Error handling email change:", err);
        setStatus("error");
        setError(err.message || "An unexpected error occurred");
      }
    }

    handleEmailChange();
  }, [supabase]);

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
