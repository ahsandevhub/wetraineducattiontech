import { getSupabasePublicKey, getSupabaseUrl } from "@/lib/supabase/env";
import { type CookieOptions, createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Update session middleware for authentication
 * Uses publishable/anon key (respects RLS policies)
 */
export async function updateSession(request: NextRequest) {
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

  const pathname = request.nextUrl.pathname;
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isLoginRoute = pathname.startsWith("/login");

  const applyCookies = (response: NextResponse) => {
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie);
    });
    return response;
  };

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
    // Fetch both education profile and CRM access
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const { data: crmUser } = await supabase
      .from("crm_users")
      .select("id")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    const hasEducationAccess = profile !== null;
    const hasCrmAccess = crmUser !== null;
    const role = profile?.role ?? null;

    // Redirect /dashboard based on user access
    // Priority: CRM access > Admin > Customer
    if (pathname === "/dashboard") {
      const redirectUrl = request.nextUrl.clone();
      if (hasCrmAccess) {
        redirectUrl.pathname = "/dashboard/crm";
      } else if (role === "admin") {
        redirectUrl.pathname = "/dashboard/admin";
      } else if (hasEducationAccess) {
        redirectUrl.pathname = "/dashboard/customer";
      } else {
        // User has neither education nor CRM access
        redirectUrl.pathname = "/unauthorized";
      }
      return applyCookies(NextResponse.redirect(redirectUrl));
    }

    // Prevent non-admin users from accessing /dashboard/admin
    if (pathname.startsWith("/dashboard/admin") && role !== "admin") {
      const redirectUrl = request.nextUrl.clone();
      // CRM-only users should go to CRM, not customer dashboard
      redirectUrl.pathname = hasCrmAccess
        ? "/dashboard/crm"
        : "/dashboard/customer";
      return applyCookies(NextResponse.redirect(redirectUrl));
    }

    // Prevent admin users from accessing /dashboard/customer
    // CRM-only users without profiles should also be redirected to CRM
    if (pathname.startsWith("/dashboard/customer")) {
      if (role === "admin") {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/dashboard/admin";
        return applyCookies(NextResponse.redirect(redirectUrl));
      }
      // CRM-only users (no education access) trying to access customer dashboard
      if (!hasEducationAccess && hasCrmAccess) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/dashboard/crm";
        return applyCookies(NextResponse.redirect(redirectUrl));
      }
    }

    // Note: /dashboard/crm access control is handled by requireCrmAccess() in the layout
    // Middleware allows it through, layout enforces security
  }

  return supabaseResponse;
}
