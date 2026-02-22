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

  const pathname = request.nextUrl.pathname;

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
    // Fetch education profile, CRM access, and HRM access
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const { data: crmUser } = await supabase
      .from("crm_users")
      .select("id, crm_role")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    const { data: hrmUser } = await supabase
      .from("hrm_users")
      .select("id, hrm_role, is_active")
      .eq("profile_id", user.id)
      .maybeSingle();

    const hasEducationAccess = profile !== null;
    const hasCrmAccess = crmUser !== null;
    const hasHrmAccess = hrmUser !== null && hrmUser.is_active;
    const role = profile?.role ?? null;
    const hrmRole = hrmUser?.hrm_role ?? null;

    // Redirect /dashboard based on user access
    // Priority: Education > CRM > HRM
    // This ONLY applies at initial entry point (/dashboard)
    if (pathname === "/dashboard") {
      const redirectUrl = request.nextUrl.clone();
      if (hasEducationAccess) {
        // Education takes priority
        redirectUrl.pathname =
          role === "admin" ? "/dashboard/admin" : "/dashboard/customer";
      } else if (hasCrmAccess) {
        // CRM second priority
        redirectUrl.pathname = "/dashboard/crm";
      } else if (hasHrmAccess) {
        // HRM third priority - redirect to role-specific dashboard
        switch (hrmRole) {
          case "SUPER_ADMIN":
            redirectUrl.pathname = "/dashboard/hrm/super";
            break;
          case "ADMIN":
            redirectUrl.pathname = "/dashboard/hrm/admin";
            break;
          case "EMPLOYEE":
            redirectUrl.pathname = "/dashboard/hrm/employee";
            break;
          default:
            redirectUrl.pathname = "/unauthorized";
        }
      } else {
        // User has no access to any application
        redirectUrl.pathname = "/unauthorized";
      }
      return applyCookies(NextResponse.redirect(redirectUrl));
    }

    // Prevent non-admin users from accessing /dashboard/admin
    if (pathname.startsWith("/dashboard/admin") && role !== "admin") {
      const redirectUrl = request.nextUrl.clone();
      // Priority: CRM > HRM > Customer
      if (hasCrmAccess) {
        redirectUrl.pathname = "/dashboard/crm";
      } else if (hasHrmAccess) {
        // Redirect to role-specific HRM dashboard
        redirectUrl.pathname =
          hrmRole === "SUPER_ADMIN"
            ? "/dashboard/hrm/super"
            : hrmRole === "ADMIN"
              ? "/dashboard/hrm/admin"
              : "/dashboard/hrm/employee";
      } else {
        redirectUrl.pathname = "/dashboard/customer";
      }
      return applyCookies(NextResponse.redirect(redirectUrl));
    }

    // Prevent invalid access to /dashboard/customer
    if (pathname.startsWith("/dashboard/customer")) {
      // Admin users should go to admin dashboard
      if (role === "admin") {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/dashboard/admin";
        return applyCookies(NextResponse.redirect(redirectUrl));
      }
      // Users without education access should be redirected to available app
      if (!hasEducationAccess) {
        const redirectUrl = request.nextUrl.clone();
        if (hasCrmAccess) {
          redirectUrl.pathname = "/dashboard/crm";
        } else if (hasHrmAccess) {
          redirectUrl.pathname =
            hrmRole === "SUPER_ADMIN"
              ? "/dashboard/hrm/super"
              : hrmRole === "ADMIN"
                ? "/dashboard/hrm/admin"
                : "/dashboard/hrm/employee";
        } else {
          redirectUrl.pathname = "/unauthorized";
        }
        return applyCookies(NextResponse.redirect(redirectUrl));
      }
    }

    // Note: /dashboard/crm access control is handled by requireCrmAccess() in the layout
    // Middleware allows it through, layout enforces security

    // Prevent non-HRM users from accessing /dashboard/hrm
    if (pathname.startsWith("/dashboard/hrm")) {
      if (!hasHrmAccess) {
        const redirectUrl = request.nextUrl.clone();
        // Route to appropriate app based on priority: Education > CRM > HRM
        if (hasEducationAccess) {
          redirectUrl.pathname =
            role === "admin" ? "/dashboard/admin" : "/dashboard/customer";
        } else if (hasCrmAccess) {
          redirectUrl.pathname = "/dashboard/crm";
        } else {
          redirectUrl.pathname = "/unauthorized";
        }
        return applyCookies(NextResponse.redirect(redirectUrl));
      }

      // For /dashboard/hrm base path, redirect to role-specific dashboard
      if (pathname === "/dashboard/hrm") {
        const redirectUrl = request.nextUrl.clone();
        switch (hrmRole) {
          case "SUPER_ADMIN":
            redirectUrl.pathname = "/dashboard/hrm/super";
            break;
          case "ADMIN":
            redirectUrl.pathname = "/dashboard/hrm/admin";
            break;
          case "EMPLOYEE":
            redirectUrl.pathname = "/dashboard/hrm/employee";
            break;
          default:
            redirectUrl.pathname = "/unauthorized";
        }
        return applyCookies(NextResponse.redirect(redirectUrl));
      }
    }
  }

  return supabaseResponse;
}
