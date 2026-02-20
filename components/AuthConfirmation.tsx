"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AuthConfirmationProps {
  /** Page title */
  title: string;
  /** Main message to display */
  message: string;
  /** Type of confirmation: loading, success, or error */
  type: "loading" | "success" | "error";
  /** URL to redirect to (optional) */
  redirectUrl?: string;
  /** Countdown seconds before redirect (default: 3) */
  redirectDelay?: number;
  /** Show manual redirect button */
  showRedirectButton?: boolean;
  /** Custom action button */
  actionButton?: {
    text: string;
    onClick: () => void;
  };
}

export default function AuthConfirmation({
  title,
  message,
  type,
  redirectUrl,
  redirectDelay = 3,
  showRedirectButton = true,
  actionButton,
}: AuthConfirmationProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(redirectDelay);

  useEffect(() => {
    if (type === "success" && redirectUrl && redirectDelay > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push(redirectUrl);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [type, redirectUrl, redirectDelay, router]);

  const handleManualRedirect = () => {
    if (redirectUrl) {
      router.push(redirectUrl);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-yellow-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg border border-gray-200 p-8">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          {type === "loading" && (
            <Loader2 className="w-16 h-16 text-yellow-500 animate-spin" />
          )}
          {type === "success" && (
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          )}
          {type === "error" && <XCircle className="w-16 h-16 text-red-500" />}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">
          {title}
        </h1>

        {/* Message */}
        <p className="text-center text-gray-600 mb-6">{message}</p>

        {/* Countdown */}
        {type === "success" && redirectUrl && countdown > 0 && (
          <p className="text-center text-sm text-gray-500 mb-4">
            Redirecting in {countdown} second{countdown !== 1 ? "s" : ""}...
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          {/* Custom Action Button */}
          {actionButton && (
            <button
              onClick={actionButton.onClick}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 py-3 px-4 rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-md"
            >
              {actionButton.text}
            </button>
          )}

          {/* Manual Redirect Button */}
          {type === "success" && redirectUrl && showRedirectButton && (
            <button
              onClick={handleManualRedirect}
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-all"
            >
              Continue Now
            </button>
          )}

          {/* Error - Back to Login */}
          {type === "error" && (
            <button
              onClick={() => router.push("/login")}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 py-3 px-4 rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-md"
            >
              Back to Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
