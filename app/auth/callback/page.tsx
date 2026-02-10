import { createClient } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";

/**
 * Auth Callback Server Component
 *
 * This page verifies the session after the user clicks the email confirmation link.
 * The route.ts handler processes the authorization code exchange.
 * This page component serves as a fallback and can verify the session state.
 *
 * Flow:
 * 1. User clicks email confirmation link with code parameter
 * 2. route.ts intercepts and exchanges code for session
 * 3. Session is set in cookies
 * 4. Redirects to /dashboard or this page
 */
export default async function AuthCallbackPage() {
  const supabase = await createClient();

  // Verify session exists
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  // If no session exists, redirect to login
  if (sessionError || !session) {
    console.warn("No session found in auth callback page");
    redirect("/login?error=no_session");
  }

  // Create or update user profile if needed
  const user = session.user;
  if (user?.id) {
    try {
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      // If profile doesn't exist, create one
      if (!existingProfile) {
        await supabase.from("profiles").insert({
          id: user.id,
          full_name: user.user_metadata?.name ?? "New User",
          email: user.email ?? null,
          avatar_url: user.user_metadata?.avatar_url ?? null,
          role: "customer",
        });
      }
    } catch (error) {
      console.error("Error syncing user profile:", error);
      // Continue to dashboard even if profile sync fails
    }
  }

  // Session verified - redirect to dashboard
  redirect("/dashboard");
}
