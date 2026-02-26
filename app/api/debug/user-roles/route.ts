import { getCurrentUserWithRoles } from "@/app/utils/auth/roles";
import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";

/**
 * Debug endpoint to check user roles and access
 * GET /api/debug/user-roles
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get all role data
    const roles = await getCurrentUserWithRoles();

    // Query raw data directly
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    const { data: crmData, error: crmError } = await supabase
      .from("crm_users")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    const { data: hrmData, error: hrmError } = await supabase
      .from("hrm_users")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    // Log errors to console for debugging
    if (profileError) console.error("Profile query error:", profileError);
    if (crmError) console.error("CRM query error:", crmError);
    if (hrmError) console.error("HRM query error:", hrmError);

    return NextResponse.json({
      auth: {
        userId: user.id,
        email: user.email,
      },
      roles,
      rawData: {
        profile: { data: profileData, error: profileError?.message },
        crm: { data: crmData, error: crmError?.message },
        hrm: { data: hrmData, error: hrmError?.message },
      },
      diagnostics: {
        hasProfileData: !!profileData,
        hasCrmData: !!crmData,
        hasHrmData: !!hrmData,
        rolesObject: {
          hasEducationAccess: roles?.hasEducationAccess,
          hasCrmAccess: roles?.hasCrmAccess,
          hasHrmAccess: roles?.hasHrmAccess,
          profileRole: roles?.profileRole,
          crmRole: roles?.crmRole,
          hrmRole: roles?.hrmRole,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
