"use client";

import { createClient } from "@/app/utils/supabase/client";
import AuthConfirmation from "@/components/AuthConfirmation";
import { parseAuthHash, validateAuthData } from "@/lib/supabase/auth-handlers";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";

export default function AcceptInvitePage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [settingPassword, setSettingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [validToken, setValidToken] = useState(false);

  useEffect(() => {
    async function verifyInvite() {
      try {
        // Parse hash from URL
        const hash = window.location.hash;
        if (!hash) {
          setError("Invalid invitation link. Please request a new invite.");
          setLoading(false);
          return;
        }

        const parsed = parseAuthHash(hash);
        const validation = validateAuthData(parsed);

        if (!validation.valid) {
          setError(validation.error || "Invalid invitation link");
          setLoading(false);
          return;
        }

        // Verify invite token type
        if (parsed.type && parsed.type !== "invite") {
          setError("This link is not an invitation link.");
          setLoading(false);
          return;
        }

        // Session should already be created by Supabase
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          setError(
            "Session not found. Please click the invitation link again.",
          );
          setLoading(false);
          return;
        }

        setUserEmail(session.user.email || null);
        setValidToken(true);
        setLoading(false);
      } catch (err) {
        console.error("Error verifying invite:", err);
        setError("Failed to verify invitation. Please try again.");
        setLoading(false);
      }
    }

    verifyInvite();
  }, [supabase]);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSettingPassword(true);
    setError(null);

    try {
      // Update user password
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        throw updateError;
      }

      // Password set successfully
      setSuccess(true);
    } catch (err: any) {
      console.error("Error setting password:", err);
      setError(err.message || "Failed to set password. Please try again.");
      setSettingPassword(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <AuthConfirmation
        type="loading"
        title="Verifying Invitation"
        message="Please wait while we verify your invitation..."
      />
    );
  }

  // Error state
  if (error && !validToken) {
    return (
      <AuthConfirmation
        type="error"
        title="Invalid Invitation"
        message={error}
      />
    );
  }

  // Success state
  if (success) {
    return (
      <AuthConfirmation
        type="success"
        title="Welcome Aboard! 🎉"
        message="Your password has been set successfully. You're all set to start using WeTrainEducation."
        redirectUrl="/dashboard"
        redirectDelay={3}
      />
    );
  }

  // Password setup form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-yellow-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg border border-gray-200 p-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 -mx-8 -mt-8 p-6 rounded-t-lg mb-6">
          <h1 className="text-2xl font-bold text-gray-900 text-center">
            WeTrainEducation
          </h1>
          <p className="text-gray-700 text-center mt-2">
            You&apos;re Invited! 👋
          </p>
        </div>

        {/* Welcome Message */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome to the team!
          </h2>
          <p className="text-gray-600 text-sm">
            {userEmail && (
              <>
                Your account <strong>{userEmail}</strong> has been created.
              </>
            )}
            {!userEmail && "Your account has been created."} Set a password to
            complete your registration.
          </p>
        </div>

        {/* Password Form */}
        <form onSubmit={handleSetPassword} className="space-y-4">
          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent pr-10"
                placeholder="Enter your password"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent pr-10"
                placeholder="Confirm your password"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={settingPassword}
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 py-3 px-4 rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {settingPassword ? "Setting Password..." : "Complete Registration"}
          </button>
        </form>

        {/* Help Text */}
        <p className="text-xs text-gray-500 text-center mt-6">
          Questions? Email us at{" "}
          <a
            href="mailto:support@wetraineducation.com"
            className="text-yellow-600 hover:text-yellow-700 font-medium"
          >
            support@wetraineducation.com
          </a>
        </p>
      </div>
    </div>
  );
}
