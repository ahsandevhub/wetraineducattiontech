"use client";

import AuthConfirmation from "@/components/AuthConfirmation";
import { formatAuthError } from "@/lib/supabase/auth-handlers";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    const description = searchParams.get("error_description");

    if (errorParam) {
      const message = formatAuthError(errorParam);
      setError(description || message);
    } else {
      setError("An authentication error occurred. Please try again.");
    }

    setLoaded(true);
  }, [searchParams]);

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
