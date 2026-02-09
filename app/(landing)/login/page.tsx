"use client";

import { createClient } from "@/app/utils/supabase/client";
import { motion } from "framer-motion";
import { AlertCircle, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
            <Link
              href="#"
              className="text-sm text-[var(--primary-yellow)] hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
