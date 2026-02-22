import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: hrmUser } = await supabase
    .from("hrm_users")
    .select("id")
    .eq("profile_id", user.id)
    .single();

  if (!hrmUser) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Get all fine and bonus fund logs for this user
    const { data: fundLogs, error: fundError } = await supabase
      .from("hrm_fund_logs")
      .select("entry_type, status, expected_amount, actual_amount")
      .eq("subject_user_id", hrmUser.id);

    if (fundError) throw fundError;

    // Calculate summary
    let fineCollected = 0;
    let fineDue = 0;
    let bonusPaid = 0;
    let bonusDue = 0;

    (fundLogs || []).forEach((log) => {
      const amount = log.actual_amount ?? log.expected_amount ?? 0;

      if (log.entry_type === "FINE") {
        if (log.status === "COLLECTED") {
          fineCollected += amount;
        } else if (log.status === "DUE") {
          fineDue += amount;
        }
      } else if (log.entry_type === "BONUS") {
        if (log.status === "PAID") {
          bonusPaid += amount;
        } else if (log.status === "DUE") {
          bonusDue += amount;
        }
      }
    });

    return NextResponse.json({
      fineCollected,
      fineDue,
      bonusPaid,
      bonusDue,
      totalFineAmount: fineCollected + fineDue,
      totalBonusAmount: bonusPaid + bonusDue,
    });
  } catch (error) {
    console.error("Error fetching fund stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch fund stats" },
      { status: 500 },
    );
  }
}
