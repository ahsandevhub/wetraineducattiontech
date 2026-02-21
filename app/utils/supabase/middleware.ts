import { getSupabasePublicKey, getSupabaseUrl } from "@/lib/supabase/env";
import { type CookieOptions, createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Update session middleware for authentication
 * Uses publishable/anon key (respects RLS policies)
 */
export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams;

  // ========================================
  // SUPABASE AUTH CALLBACK DETECTION
  // ========================================
  // GUARD 1: Never redirect if already at /auth routes
  if (pathname.startsWith("/auth")) {
    // Skip all auth route processing - let them handle themselves
    // This prevents loops from /auth/callback → /login with errors → middleware catching again
  }
  // GUARD 2: Never redirect if at /login (even with error params)
  // Error params should stay on /login to display friendly messages
  else if (pathname === "/login" || pathname === "/(landing)/login") {
    // Skip - let login page handle error display
  }
  // GUARD 3: Never redirect if already marked as handled
  else if (searchParams.has("cb")) {
    // This request came from a callback redirect, don't loop
  }
  // GUARD 4: Only route to /auth/callback if this is a VALID auth param combo
  else {
    const hasCode = searchParams.has("code");
    const hasTokenHash = searchParams.has("token_hash");
    const hasAccessToken = searchParams.has("access_token");
    const hasRefreshToken = searchParams.has("refresh_token");
    const hasTokenPair = hasAccessToken && hasRefreshToken;

    // Only redirect if we have actual auth credentials to process
    // Do NOT treat error params alone as auth callbacks
    const isValidAuthCallback = hasCode || hasTokenHash || hasTokenPair;

    if (isValidAuthCallback && !pathname.startsWith("/auth/callback")) {
      const callbackUrl = new URL("/auth/callback", request.url);
      // Preserve all query params
      searchParams.forEach((value, key) => {
        callbackUrl.searchParams.set(key, value);
      });
      return NextResponse.redirect(callbackUrl);
    }
  }

  const supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    getSupabaseUrl(),
    getSupabasePublicKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: Array<{
            name: string;
            value: string;
            options: CookieOptions;
          }>,
        ) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isLoginRoute = pathname.startsWith("/login");

  const applyCookies = (response: NextResponse) => {
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie);
    });
    return response;
  };

  // Check if user exists but hasn't confirmed email
  if (user && !user.email_confirmed_at && isDashboardRoute) {
    // Redirect unconfirmed emails away from dashboard
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/verify-email";
    return applyCookies(NextResponse.redirect(redirectUrl));
  }

  if (!user && isDashboardRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    return applyCookies(NextResponse.redirect(redirectUrl));
  }

  if (user && isLoginRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    return applyCookies(NextResponse.redirect(redirectUrl));
  }

  if (user && isDashboardRoute) {
    // Fetch education profile (optional - CRM/HRM-only users may not have this)
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    // Fetch CRM profile (optional - education/HRM-only users may not have this)
    const { data: crmUser } = await supabase
      .from("crm_users")
      .select("id")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    // Fetch HRM profile (optional - education/CRM-only users may not have this)
    const { data: hrmUser } = await supabase
      .from("hrm_users")
      .select("id, is_active")
      .eq("profile_id", user.id)
      .maybeSingle();

    const hasEducationAccess = profile !== null;
    const hasCrmAccess = crmUser !== null;
    const hasHrmAccess = hrmUser !== null && hrmUser.is_active;
    const role = profile?.role ?? null;

    // Redirect /dashboard based on user access
    // Priority: Education > CRM > HRM
    if (pathname === "/dashboard") {
      const redirectUrl = request.nextUrl.clone();
      if (hasEducationAccess) {
        // User has education access
        if (role === "admin") {
          redirectUrl.pathname = "/dashboard/admin";
        } else {
          redirectUrl.pathname = "/dashboard/customer";
        }
      } else if (hasCrmAccess) {
        // User has CRM access but no education
        redirectUrl.pathname = "/dashboard/crm";
      } else if (hasHrmAccess) {
        // User has HRM access but no education or CRM
        redirectUrl.pathname = "/dashboard/hrm";
      } else {
        // User has no access to any application
        redirectUrl.pathname = "/unauthorized";
      }
      return applyCookies(NextResponse.redirect(redirectUrl));
    }

    // Prevent non-admin users from accessing /dashboard/admin
    if (pathname.startsWith("/dashboard/admin") && role !== "admin") {
      const redirectUrl = request.nextUrl.clone();
      // Redirect based on priority: CRM > HRM
      if (hasCrmAccess) {
        redirectUrl.pathname = "/dashboard/crm";
      } else if (hasHrmAccess) {
        redirectUrl.pathname = "/dashboard/hrm";
      } else {
        redirectUrl.pathname = "/dashboard/customer";
      }
      return applyCookies(NextResponse.redirect(redirectUrl));
    }

    // Prevent admin users from accessing /dashboard/customer
    // CRM/HRM-only users without profiles should also be redirected appropriately
    if (pathname.startsWith("/dashboard/customer")) {
      if (role === "admin") {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/dashboard/admin";
        return applyCookies(NextResponse.redirect(redirectUrl));
      }
      // Users without education access trying to access customer dashboard
      if (!hasEducationAccess && (hasCrmAccess || hasHrmAccess)) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = hasCrmAccess
          ? "/dashboard/crm"
          : "/dashboard/hrm";
        return applyCookies(NextResponse.redirect(redirectUrl));
      }
    }

    // Note: /dashboard/crm access control is handled by requireCrmAccess() in the layout
    // Middleware allows it through, layout enforces security
  }

  return supabaseResponse;
}
