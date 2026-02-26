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

  // Get HRM user
  const { data: hrmUser } = await supabase
    .from("hrm_users")
    .select("id, hrm_role")
    .eq("id", user.id)
    .single();

  if (!hrmUser) {
    return NextResponse.json({ error: "HRM user not found" }, { status: 404 });
  }

  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get("limit") || "6", 10);

  try {
    // Get monthly results for this employee
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
        hrm_months!inner(
          month_key,
          start_date,
          end_date,
          status
        )
      `,
      )
      .eq("subject_user_id", hrmUser.id)
      .order("hrm_months(month_key)", { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Transform results
    const monthlyResults = (results || []).map((result: any) => ({
      id: result.id,
      monthKey: result.hrm_months.month_key,
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
      status: result.hrm_months.status,
    }));

    return NextResponse.json({ results: monthlyResults });
  } catch (error) {
    console.error("Error fetching monthly results:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch monthly results";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

