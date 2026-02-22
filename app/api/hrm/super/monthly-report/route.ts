import { createClient } from "@/app/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  // Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check SUPER_ADMIN role
  const { data: hrmUser } = await supabase
    .from("hrm_users")
    .select("hrm_role")
    .eq("profile_id", user.id)
    .single();

  if (!hrmUser || hrmUser.hrm_role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const monthKey = searchParams.get("monthKey");

  if (!monthKey) {
    return NextResponse.json(
      { error: "monthKey is required (format: YYYY-MM)" },
      { status: 400 },
    );
  }

  try {
    // Get month
    const { data: month } = await supabase
      .from("hrm_months")
      .select("id, month_key, start_date, end_date, status")
      .eq("month_key", monthKey)
      .single();

    if (!month) {
      return NextResponse.json({ error: "Month not found" }, { status: 404 });
    }

    // Get all monthly results for this month
    const { data: results, error } = await supabase
      .from("hrm_monthly_results")
      .select(
        `
        id,
        monthly_score,
        tier,
        action_type,
        base_fine,
        final_fine,
        gift_amount,
        weeks_count_used,
        expected_weeks_count,
        is_complete_month,
        computed_at,
        hrm_users!inner(
          id,
          full_name,
          email,
          hrm_role
        )
      `,
      )
      .eq("month_id", month.id)
      .order("monthly_score", { ascending: false });

    if (error) throw error;

    const monthlyResultIds = (results || []).map((result: any) => result.id);
    const { data: fundLogs, error: fundError } = monthlyResultIds.length
      ? await supabase
          .from("hrm_fund_logs")
          .select("monthly_result_id, entry_type, status, actual_amount")
          .in("monthly_result_id", monthlyResultIds)
      : { data: [], error: null };

    if (fundError) throw fundError;

    const fundMap = new Map<string, { fine?: string; bonus?: string }>();
    (fundLogs || []).forEach((log: any) => {
      const current = fundMap.get(log.monthly_result_id) || {};
      if (log.entry_type === "FINE") {
        current.fine = log.status;
      }
      if (log.entry_type === "BONUS") {
        current.bonus = log.status;
      }
      fundMap.set(log.monthly_result_id, current);
    });

    // Transform results
    const monthlyResults = (results || []).map((result: any) => ({
      fundFineStatus: fundMap.get(result.id)?.fine || "DUE",
      fundBonusStatus: fundMap.get(result.id)?.bonus || "DUE",
      id: result.id,
      subjectId: result.hrm_users.id,
      subjectName: result.hrm_users.full_name,
      subjectEmail: result.hrm_users.email,
      subjectRole: result.hrm_users.hrm_role,
      monthlyScore: result.monthly_score,
      tier: result.tier,
      actionType: result.action_type,
      baseFine: result.base_fine,
      finalFine: result.final_fine,
      giftAmount: result.gift_amount,
      weeksCountUsed: result.weeks_count_used,
      expectedWeeksCount: result.expected_weeks_count,
      isCompleteMonth: result.is_complete_month,
      computedAt: result.computed_at,
    }));

    return NextResponse.json({
      monthKey,
      status: month.status,
      results: monthlyResults,
      summary: {
        totalSubjects: monthlyResults.length,
        bonusTier: monthlyResults.filter((r) => r.tier === "BONUS").length,
        appreciationTier: monthlyResults.filter(
          (r) => r.tier === "APPRECIATION",
        ).length,
        improvementTier: monthlyResults.filter((r) => r.tier === "IMPROVEMENT")
          .length,
        fineTier: monthlyResults.filter((r) => r.tier === "FINE").length,
        completeMonths: monthlyResults.filter((r) => r.isCompleteMonth).length,
        totalFines: monthlyResults.reduce((sum, r) => sum + r.finalFine, 0),
      },
    });
  } catch (error) {
    console.error("Error fetching monthly report:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch monthly report";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
