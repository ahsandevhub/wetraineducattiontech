import { createClient } from "@/app/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ monthKey: string }> },
) {
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

  const { monthKey } = await params;

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

    // Get monthly result for this employee
    const { data: result } = await supabase
      .from("hrm_monthly_results")
      .select("*")
      .eq("month_id", month.id)
      .eq("subject_user_id", hrmUser.id)
      .single();

    if (!result) {
      return NextResponse.json(
        {
          monthKey,
          status: month.status,
          message: "Monthly result not computed yet for this user",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      monthKey,
      status: month.status,
      result: {
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
      },
    });
  } catch (error) {
    console.error("Error fetching monthly result:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch monthly result";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
