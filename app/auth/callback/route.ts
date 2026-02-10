import { createClient } from "@/app/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";
  const error = requestUrl.searchParams.get("error");

  // Handle auth errors from Supabase
  if (error) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error)}`, requestUrl.origin),
    );
  }

  // Exchange authorization code for session
  if (code) {
    const supabase = await createClient();

    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("Code exchange error:", exchangeError.message);
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent("session_exchange_failed")}`,
          requestUrl.origin,
        ),
      );
    }

    // Verify session was created successfully
    const { data: session, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError || !session?.session) {
      console.error("Session verification failed:", sessionError?.message);
      return NextResponse.redirect(
        new URL("/login?error=no_session", requestUrl.origin),
      );
    }

    // Create or update user profile
    const user = session.session.user;
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
      } catch (profileError) {
        console.error("Error creating user profile:", profileError);
        // Continue to dashboard even if profile creation fails
      }
    }

    // Session established successfully - redirect to dashboard or next URL
    return NextResponse.redirect(new URL(next, requestUrl.origin));
  }

  // No code provided - invalid callback
  console.error("Auth callback: no code parameter");
  return NextResponse.redirect(
    new URL("/login?error=invalid_callback", requestUrl.origin),
  );
}
