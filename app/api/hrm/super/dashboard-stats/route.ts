/**
 * /api/hrm/super/dashboard-stats
 * Get dashboard statistics for super admin
 * SUPER_ADMIN only
 */

import { requireHrmSuperAdmin } from "@/app/utils/auth/require";
import { createAdminClient } from "@/lib/supabase/admin";
import { getServiceSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Security: Require SUPER_ADMIN role
    await requireHrmSuperAdmin();

    const supabase = getServiceSupabase();

    // Get total employees count
    const { count: employeesCount } = await supabase
      .from("hrm_users")
      .select("*", { count: "exact", head: true })
      .eq("hrm_role", "EMPLOYEE");

    // Get total admins count (ADMIN + SUPER_ADMIN)
    const { count: adminsCount } = await supabase
      .from("hrm_users")
      .select("*", { count: "exact", head: true })
      .in("hrm_role", ["ADMIN", "SUPER_ADMIN"]);

    // Get active weeks count (OPEN status)
    const { count: activeWeeksCount } = await supabase
      .from("hrm_weeks")
      .select("*", { count: "exact", head: true })
      .eq("status", "OPEN");

    // Get latest month's performance distribution
    const { data: latestMonth } = await supabase
      .from("hrm_months")
      .select("id, month_key, status")
      .order("month_key", { ascending: false })
      .limit(1)
      .single();

    const tierDistribution: {
      BONUS: number;
      APPRECIATION: number;
      IMPROVEMENT: number;
      FINE: number;
    } = {
      BONUS: 0,
      APPRECIATION: 0,
      IMPROVEMENT: 0,
      FINE: 0,
    };

    let subjectPerformances: Array<{
      subjectId: string;
      subjectName: string;
      monthlyScore: number;
      tier: string;
    }> = [];

    if (latestMonth) {
      // New schema: hrm_users only has id, hrm_role - join just to filter by EMPLOYEE role
      const { data: monthlyResults } = await supabase
        .from("hrm_monthly_results")
        .select(
          `
          id,
          subject_user_id,
          monthly_score,
          tier,
          hrm_users!inner(
            id,
            hrm_role
          )
        `,
        )
        .eq("month_id", latestMonth.id)
        .eq("hrm_users.hrm_role", "EMPLOYEE")
        .order("monthly_score", { ascending: false });

      if (monthlyResults && monthlyResults.length > 0) {
        // Count tier distribution
        monthlyResults.forEach((result: any) => {
          const tier = result.tier as keyof typeof tierDistribution;
          if (tier in tierDistribution) {
            tierDistribution[tier]++;
          }
        });

        // Get user names from auth for subject performances
        const adminClient = createAdminClient();
        const { data: authData } = await adminClient.auth.admin.listUsers({
          perPage: 1000,
        });
        const authUserMap = new Map(
          authData?.users.map((u) => [u.id, u]) ?? [],
        );

        // Map subject performances with names from auth
        subjectPerformances = monthlyResults.map((result: any) => {
          const userId = result.subject_user_id ?? result.hrm_users?.id;
          const authUser = authUserMap.get(userId);
          const name =
            (authUser?.user_metadata?.name as string) ||
            authUser?.email?.split("@")[0] ||
            "Unknown";
          return {
            subjectId: userId,
            subjectName: name,
            monthlyScore: result.monthly_score,
            tier: result.tier,
          };
        });
      }
    }

    return NextResponse.json({
      stats: {
        employeesCount: employeesCount || 0,
        adminsCount: adminsCount || 0,
        activeWeeksCount: activeWeeksCount || 0,
      },
      latestMonth: latestMonth
        ? {
            monthKey: latestMonth.month_key,
            status: latestMonth.status,
          }
        : null,
      tierDistribution,
      subjectPerformances,
    });
  } catch (error) {
    console.error("GET /api/hrm/super/dashboard-stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
