"use client";

import { createClient } from "@/app/utils/supabase/client";
import { motion } from "framer-motion";
import { AlertCircle, Lock, Mail, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [emailNotFound, setEmailNotFound] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      const userId = data.user?.id;

      if (!userId) {
        router.push("/dashboard");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", userId)
        .maybeSingle();

      if (profileError) {
        const isMissingProfile =
          profileError.code === "PGRST116" ||
          profileError.message?.toLowerCase().includes("0 rows");

        if (isMissingProfile) {
          const fullName =
            data.user?.user_metadata?.name ||
            data.user?.email?.split("@")[0] ||
            "New User";

          const { error: insertError } = await supabase
            .from("profiles")
            .insert({
              id: userId,
              full_name: fullName,
              email: data.user?.email ?? null,
              avatar_url: data.user?.user_metadata?.avatar_url ?? null,
              role: "customer",
            });

          if (insertError) {
            setError(
              insertError.message ||
                "Unable to create your profile. Please try again.",
            );
            return;
          }
        } else {
          setError(
            profileError.message ||
              "Unable to access your profile. Please try again.",
          );
          return;
        }
      }

      const { data: finalProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

      const role = finalProfile?.role ?? profile?.role ?? "customer";
      router.push(
        role === "admin" ? "/dashboard/admin" : "/dashboard/customer",
      );
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(false);
    setEmailNotFound(false);
    setResetLoading(true);

    try {
      // Trim and normalize email
      const normalizedEmail = resetEmail.trim().toLowerCase();

      if (!normalizedEmail) {
        setResetError("Please enter your email address.");
        setResetLoading(false);
        return;
      }

      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedEmail)) {
        setResetError("Please enter a valid email address.");
        setResetLoading(false);
        return;
      }

      // Check if the email exists via API route (bypasses RLS)
      const checkResponse = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      if (!checkResponse.ok) {
        setResetError("Unable to verify email. Please try again.");
        setResetLoading(false);
        return;
      }

      const { exists } = await checkResponse.json();

      if (!exists) {
        setEmailNotFound(true);
        setResetLoading(false);
        return;
      }

      // Email exists, proceed with password reset
      const { error } = await supabase.auth.resetPasswordForEmail(
        normalizedEmail,
        {
          redirectTo: `${window.location.origin}/set-password`,
        },
      );

      if (error) {
        setResetError(error.message);
      } else {
        setResetSuccess(true);
      }
    } catch {
      setResetError("An unexpected error occurred. Please try again.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--tertiary-yellow)] to-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl border border-yellow-200/50 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600">Sign in to your WeTrain account</p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-start gap-3 rounded-lg bg-red-50 p-4 border border-red-200"
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSignIn} className="space-y-4 mb-6">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-yellow)] focus:border-transparent"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-yellow)] focus:border-transparent"
                />
              </div>
            </div>

            {/* Sign In Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--primary-yellow)] text-gray-900 py-2 rounded-lg font-bold hover:bg-[var(--secondary-yellow)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                New to WeTrain?
              </span>
            </div>
          </div>

          {/* Sign Up Link */}
          <Link href="/register">
            <motion.button
              whileHover={{ scale: 1.02 }}
              className="w-full border-2 border-[var(--primary-yellow)] text-gray-900 py-2 rounded-lg font-bold hover:bg-[var(--primary-yellow)]/5 transition-colors"
              type="button"
            >
              Create an Account
            </motion.button>
          </Link>

          {/* Forgot Password Link */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-[var(--primary-yellow)] hover:underline"
            >
              Forgot your password?
            </button>
          </div>
        </div>

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => {
              if (!resetLoading) {
                setShowForgotPassword(false);
                setResetError(null);
                setResetSuccess(false);
                setEmailNotFound(false);
                setResetEmail("");
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl shadow-xl border border-yellow-200/50 p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Reset Password
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    if (!resetLoading) {
                      setShowForgotPassword(false);
                      setResetError(null);
                      setResetSuccess(false);
                      setEmailNotFound(false);
                      setResetEmail("");
                    }
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {resetSuccess ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 text-sm font-medium mb-2">
                      ✅ Password reset email sent!
                    </p>
                    <p className="text-green-700 text-sm">
                      Check your inbox at <strong>{resetEmail.trim()}</strong>
                    </p>
                    <p className="text-green-600/80 text-xs mt-2">
                      💡 Don&apos;t see it? Check your spam folder or wait a few
                      minutes.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetError(null);
                      setResetSuccess(false);
                      setEmailNotFound(false);
                      setResetEmail("");
                    }}
                    className="w-full bg-[var(--primary-yellow)] text-gray-900 py-2 rounded-lg font-bold hover:bg-[var(--secondary-yellow)] transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : emailNotFound ? (
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-amber-800 text-sm font-medium mb-2">
                      ⚠️ No account found
                    </p>
                    <p className="text-amber-700 text-sm">
                      We couldn&apos;t find an account with{" "}
                      <strong>{resetEmail.trim()}</strong>
                    </p>
                    <p className="text-amber-600/80 text-xs mt-2">
                      Double-check the email or create a new account.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEmailNotFound(false);
                        setResetEmail("");
                      }}
                      className="flex-1 border-2 border-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Try Again
                    </button>
                    <Link href="/register" className="flex-1">
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgotPassword(false);
                          setResetError(null);
                          setResetSuccess(false);
                          setEmailNotFound(false);
                          setResetEmail("");
                        }}
                        className="w-full bg-[var(--primary-yellow)] text-gray-900 py-2 rounded-lg font-bold hover:bg-[var(--secondary-yellow)] transition-colors"
                      >
                        Create Account
                      </button>
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <p className="text-gray-600 text-sm">
                    Enter your email address and we&apos;ll send you a link to
                    reset your password.
                  </p>

                  {resetError && (
                    <div className="flex items-start gap-3 rounded-lg bg-red-50 p-4 border border-red-200">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-600">{resetError}</p>
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="reset-email"
                      className="block text-sm font-medium text-gray-900 mb-2"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        id="reset-email"
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-yellow)] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full bg-[var(--primary-yellow)] text-gray-900 py-2 rounded-lg font-bold hover:bg-[var(--secondary-yellow)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resetLoading ? "Sending..." : "Send Reset Link"}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
