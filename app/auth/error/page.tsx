"use client";

import AuthConfirmation from "@/components/AuthConfirmation";
import { getAuthError, getErrorMessage } from "@/lib/supabase/auth-handlers";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthErrorPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const authError = getAuthError();

    if (authError.error) {
      const message = getErrorMessage(
        authError.error,
        authError.code,
        authError.description,
      );
      setError(message);
    } else {
      setError("An authentication error occurred. Please try again.");
    }

    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <AuthConfirmation
        type="loading"
        title="Processing..."
        message="Please wait..."
      />
    );
  }

  return (
    <AuthConfirmation
      type="error"
      title="Authentication Error"
      message={error || "An unexpected error occurred"}
      actionButton={{
        text: "Back to Login",
        onClick: () => router.push("/login"),
      }}
    />
  );
}
