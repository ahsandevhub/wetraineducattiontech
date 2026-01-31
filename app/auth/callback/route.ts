import { createClient } from "@/app/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/set-password";
  const error = requestUrl.searchParams.get("error");

  // Handle errors
  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error)}`, requestUrl.origin),
    );
  }

  // Exchange code for session
  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("Exchange code error:", exchangeError);
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent("exchange_failed")}`,
          requestUrl.origin,
        ),
      );
    }

    // Redirect to next page
    return NextResponse.redirect(new URL(next, requestUrl.origin));
  }

  // No code or error - something went wrong
  return NextResponse.redirect(
    new URL("/login?error=no_code", requestUrl.origin),
  );
}
