import { createClient } from "@/app/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
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
    .select("id, hrm_role")
    .eq("id", user.id)
    .single();

  if (!hrmUser || hrmUser.hrm_role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const emailLogId = searchParams.get("emailLogId");

  if (!emailLogId) {
    return NextResponse.json(
      { error: "emailLogId is required" },
      { status: 400 },
    );
  }

  try {
    // Get email log
    const { data: emailLog } = await supabase
      .from("hrm_email_logs")
      .select(
        `
        id,
        email_type,
        subject_line,
        html_content,
        text_content,
        recipient_email,
        subject_user_id,
        month_id
      `,
      )
      .eq("id", emailLogId)
      .single();

    if (!emailLog) {
      return NextResponse.json(
        { error: "Email log not found" },
        { status: 404 },
      );
    }

    // Initialize email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Resend email
    await transporter.sendMail({
      from: `WeTrainEducation HRM <${process.env.SMTP_FROM}>`,
      to: emailLog.recipient_email,
      subject: `[RESENT] ${emailLog.subject_line}`,
      html: emailLog.html_content,
      text: emailLog.text_content,
    });

    // Create new email log entry for resend
    const { data: newLog, error: logError } = await supabase
      .from("hrm_email_logs")
      .insert({
        subject_user_id: emailLog.subject_user_id,
        recipient_email: emailLog.recipient_email,
        month_id: emailLog.month_id,
        email_type: emailLog.email_type,
        subject_line: `[RESENT] ${emailLog.subject_line}`,
        html_content: emailLog.html_content,
        text_content: emailLog.text_content,
        sent_by_admin_id: hrmUser.id,
        delivery_status: "SENT",
      })
      .select()
      .single();

    if (logError) throw logError;

    return NextResponse.json({
      message: "Email resent successfully",
      emailLogId: newLog.id,
      sentAt: newLog.sent_at,
    });
  } catch (error) {
    console.error("[Resend Email] Error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to resend email";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

