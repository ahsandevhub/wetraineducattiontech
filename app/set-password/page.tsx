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

export default function SetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const parsed = parseAuthParams(
          window.location.search,
          window.location.hash,
        );

        const parsedError = getAuthErrorMessage(parsed);
        if (parsedError) {
          setAuthError(parsedError);
          return;
        }

        if (parsed.tokenHash && parsed.type) {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            type: parsed.type as EmailOtpType,
            token_hash: parsed.tokenHash,
          });

          if (verifyError) {
            setAuthError(
              verifyError.message || "Invalid or expired password reset link.",
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
            setAuthError(
              setSessionError.message ||
                "Unable to validate your reset link. Please request a new one.",
            );
            return;
          }
        }

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          setAuthError(
            "Session not found. Please request a new password reset link.",
          );
          return;
        }

        setAuthReady(true);
      } catch {
        setAuthError("Failed to verify your link. Please request a new one.");
      }
    };

    initializeAuth();
  }, [supabase]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError("Failed to update password. Please try again.");
    } else {
      setSuccess("Password updated successfully. Redirecting...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    }

    setLoading(false);
  };

  if (!authReady && !authError) {
    return (
      <AuthConfirmation
        type="loading"
        title="Verifying Reset Link"
        message="Please wait while we validate your password reset link..."
      />
    );
  }

  if (authError) {
    return (
      <AuthConfirmation
        type="error"
        title="Invalid Reset Link"
        message={authError}
        actionButton={{
          text: "Back to Login",
          onClick: () => router.push("/login"),
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--tertiary-yellow)] to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-yellow-200/50">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Set your password
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          Create a secure password to protect your account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-yellow)] focus:border-transparent"
              placeholder="At least 8 characters"
              minLength={8}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-yellow)] focus:border-transparent"
              placeholder="Confirm your password"
              minLength={8}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[var(--primary-yellow)] py-2 font-bold text-gray-900 hover:bg-[var(--secondary-yellow)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Set Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
