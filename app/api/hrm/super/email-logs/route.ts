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
  const subjectUserId = searchParams.get("subjectUserId");
  const monthKey = searchParams.get("monthKey");

  if (!subjectUserId || !monthKey) {
    return NextResponse.json(
      { error: "subjectUserId and monthKey are required" },
      { status: 400 },
    );
  }

  try {
    // Get month
    const { data: month } = await supabase
      .from("hrm_months")
      .select("id")
      .eq("month_key", monthKey)
      .single();

    if (!month) {
      return NextResponse.json({ error: "Month not found" }, { status: 404 });
    }

    // Get email logs for this subject and month
    const { data: emailLogs, error } = await supabase
      .from("hrm_email_logs")
      .select(
        `
        id,
        email_type,
        subject_line,
        html_content,
        text_content,
        sent_at,
        recipient_email,
        delivery_status,
        sent_by_admin:hrm_users!sent_by_admin_id(
          id,
          full_name,
          email
        )
      `,
      )
      .eq("subject_user_id", subjectUserId)
      .eq("month_id", month.id)
      .order("sent_at", { ascending: false });

    if (error) throw error;

    // Transform response
    const logs = (emailLogs || []).map((log: any) => ({
      id: log.id,
      emailType: log.email_type,
      subjectLine: log.subject_line,
      htmlContent: log.html_content,
      textContent: log.text_content,
      sentAt: log.sent_at,
      recipientEmail: log.recipient_email,
      deliveryStatus: log.delivery_status,
      sentByAdmin: log.sent_by_admin,
    }));

    return NextResponse.json({
      subjectUserId,
      monthKey,
      emailLogs: logs,
      hasEmails: logs.length > 0,
      latestEmail: logs[0] || null,
    });
  } catch (error) {
    console.error("Error fetching email logs:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch email logs";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
