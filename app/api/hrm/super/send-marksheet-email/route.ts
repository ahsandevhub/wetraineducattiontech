import { createClient } from "@/app/utils/supabase/server";
import {
  formatMonthDisplay,
  getMonthDateRange,
  listFridayWeekKeysForMonth,
} from "@/lib/hrm/week-utils";
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
  const subjectUserId = searchParams.get("subjectUserId");
  const monthKey = searchParams.get("monthKey");

  if (!subjectUserId || !monthKey) {
    return NextResponse.json(
      { error: "subjectUserId and monthKey are required" },
      { status: 400 },
    );
  }

  try {
    // Get subject user details from profiles (hrm_users no longer has full_name/email)
    const { data: subject } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("id", subjectUserId)
      .single();

    if (!subject) {
      return NextResponse.json(
        { error: "Subject user not found" },
        { status: 404 },
      );
    }

    // Get month
    const { data: month } = await supabase
      .from("hrm_months")
      .select("id, month_key, start_date, end_date")
      .eq("month_key", monthKey)
      .single();

    if (!month) {
      return NextResponse.json({ error: "Month not found" }, { status: 404 });
    }

    // Get monthly result
    const { data: monthlyResult } = await supabase
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
        is_complete_month
      `,
      )
      .eq("month_id", month.id)
      .eq("subject_user_id", subjectUserId)
      .single();

    if (!monthlyResult) {
      return NextResponse.json(
        { error: "Monthly result not found" },
        { status: 404 },
      );
    }

    // Fetch weekly details directly from Supabase
    getMonthDateRange(monthKey); // Validate monthKey format
    const weekKeys = listFridayWeekKeysForMonth(monthKey);

    // Get all Friday week keys for this month
    const { data: weeks } = await supabase
      .from("hrm_weeks")
      .select("id, week_key, friday_date")
      .in("week_key", weekKeys);

    const weekIds = (weeks || []).map((w) => w.id);

    // Get submissions for this subject in all weeks of the month
    const { data: submissions } = await supabase
      .from("hrm_kpi_submissions")
      .select(
        `
        id,
        week_id,
        total_score,
        comment,
        submitted_at,
        hrm_kpi_submission_items(
          id,
          criteria_id,
          score_raw,
          hrm_criteria(
            id,
            key,
            name
          )
        )
      `,
      )
      .eq("subject_user_id", subjectUserId)
      .in("week_id", weekIds)
      .order("submitted_at", { ascending: false });

    // Get weekly results
    const { data: weeklyResults } = await supabase
      .from("hrm_weekly_results")
      .select("week_id, weekly_avg_score, is_complete, computed_at")
      .eq("subject_user_id", subjectUserId)
      .in("week_id", weekIds);

    // Group submissions by week
    const submissionsByWeek = new Map<string, any[]>();
    for (const sub of submissions || []) {
      const weekKey = (weeks || []).find((w) => w.id === sub.week_id)?.week_key;
      if (weekKey) {
        if (!submissionsByWeek.has(weekKey)) {
          submissionsByWeek.set(weekKey, []);
        }
        submissionsByWeek.get(weekKey)!.push(sub);
      }
    }

    // Build weekly details
    const weeklyDetails = (weeks || [])
      .sort((a, b) => a.friday_date.localeCompare(b.friday_date))
      .map((week) => {
        const subs = submissionsByWeek.get(week.week_key) || [];
        const result = weeklyResults?.find((r) => r.week_id === week.id);

        return {
          weekKey: week.week_key,
          fridayDate: week.friday_date,
          weeklyScore: result?.weekly_avg_score || 0,
          isComplete: result?.is_complete || false,
          computedAt: result?.computed_at,
          submissions: subs.map((sub) => ({
            id: sub.id,
            totalScore: sub.total_score,
            comment: sub.comment,
            submittedAt: sub.submitted_at,
            criteriaScores: (sub.hrm_kpi_submission_items || []).map(
              (item: any) => ({
                criteriaId: item.criteria_id,
                criteriaName: item.hrm_criteria.name,
                score: item.score_raw,
              }),
            ),
          })),
        };
      });

    // Generate HTML content
    const htmlContent = generateMarksheetHTML({
      subjectName: subject.full_name,
      monthKey,
      monthlyScore: monthlyResult.monthly_score,
      tier: monthlyResult.tier,
      actionType: monthlyResult.action_type,
      baseFine: monthlyResult.base_fine,
      finalFine: monthlyResult.final_fine,
      giftAmount: monthlyResult.gift_amount,
      isCompleteMonth: monthlyResult.is_complete_month,
      weeksUsed: monthlyResult.weeks_count_used,
      expectedWeeks: monthlyResult.expected_weeks_count,
      weeklyDetails,
    });

    const textContent = generateMarksheetText({
      subjectName: subject.full_name,
      monthKey,
      monthlyScore: monthlyResult.monthly_score,
      tier: monthlyResult.tier,
      actionType: monthlyResult.action_type,
      baseFine: monthlyResult.base_fine,
      finalFine: monthlyResult.final_fine,
      giftAmount: monthlyResult.gift_amount,
      isCompleteMonth: monthlyResult.is_complete_month,
      weeksUsed: monthlyResult.weeks_count_used,
      expectedWeeks: monthlyResult.expected_weeks_count,
      weeklyDetails,
    });

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

    const subjectLine = `Your ${formatMonthDisplay(monthKey)} Performance Marksheet - ${monthlyResult.tier}`;

    // Send email
    await transporter.sendMail({
      from: `WeTrainEducation HRM <${process.env.SMTP_FROM}>`,
      to: subject.email,
      subject: subjectLine,
      html: htmlContent,
      text: textContent,
    });

    // Log email in database
    const { data: emailLog, error: logError } = await supabase
      .from("hrm_email_logs")
      .insert({
        subject_user_id: subjectUserId,
        recipient_email: subject.email,
        month_id: month.id,
        email_type: "MARKSHEET",
        subject_line: subjectLine,
        html_content: htmlContent,
        text_content: textContent,
        sent_by_admin_id: hrmUser.id,
        delivery_status: "SENT",
      })
      .select()
      .single();

    if (logError) throw logError;

    return NextResponse.json({
      message: "Email sent successfully",
      emailLogId: emailLog.id,
      sentAt: emailLog.sent_at,
    });
  } catch (error) {
    console.error("[Send Marksheet Email] Error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to send email";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

interface WeeklyDetail {
  weekKey: string;
  fridayDate: string;
  weeklyScore: number;
  isComplete: boolean;
  submissions: any[];
}

interface MarksheetData {
  subjectName: string;
  monthKey: string;
  monthlyScore: number;
  tier: string;
  actionType: string;
  baseFine: number;
  finalFine: number;
  giftAmount: number | null;
  isCompleteMonth: boolean;
  weeksUsed: number;
  expectedWeeks: number;
  weeklyDetails: WeeklyDetail[];
}

function generateMarksheetHTML(data: MarksheetData): string {
  const tierColor =
    {
      BONUS: "#22c55e",
      APPRECIATION: "#3b82f6",
      IMPROVEMENT: "#f59e0b",
      FINE: "#ef4444",
    }[data.tier] || "#666";

  const tierLabel =
    {
      BONUS: "🎉 Bonus",
      APPRECIATION: "⭐ Appreciation",
      IMPROVEMENT: "📈 Improvement",
      FINE: "⚠️ Fine",
    }[data.tier] || data.tier;

  const rewardWarningSection =
    data.tier === "BONUS"
      ? `<p style="color: #22c55e; font-size: 16px; font-weight: bold;">🎉 Congratulations! You earned a bonus of <strong>৳${data.giftAmount || 0}</strong></p>`
      : data.tier === "APPRECIATION"
        ? `<p style="color: #3b82f6; font-size: 16px; font-weight: bold;">⭐ You received an appreciation with a gift of <strong>৳${data.giftAmount || 0}</strong></p>`
        : data.tier === "FINE"
          ? `<p style="color: #ef4444; font-size: 16px; font-weight: bold;">⚠️ Fine Applied: <strong>৳${data.finalFine}</strong></p>`
          : `<p style="color: #f59e0b; font-size: 16px; font-weight: bold;">📈 Keep improving! Base Fine: ৳${data.baseFine}</p>`;

  const weeklyCriteriaRows = data.weeklyDetails
    .map((week) => {
      const submissionRows = week.submissions
        .map(
          (sub, idx) => `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 10px; color: #666; font-size: 13px;">Submission ${idx + 1}</td>
          <td style="padding: 10px; text-align: center; color: #666; font-size: 13px;">${sub.totalScore.toFixed(2)}</td>
          <td style="padding: 10px; font-size: 12px;">
            ${sub.criteriaScores.map((c: any) => `<div style="color: #666; margin: 3px 0;">${c.criteriaName}: ${c.score.toFixed(2)}</div>`).join("")}
          </td>
        </tr>
      `,
        )
        .join("");

      return `
        <div style="margin: 15px 0; background: #f9f9f9; border-left: 4px solid #facc15; padding: 10px;">
          <div style="font-weight: bold; color: #333; margin-bottom: 10px;">
            Week Ending: ${new Date(week.fridayDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} (${week.weekKey})
          </div>
          <div style="margin-bottom: 10px; color: #666;">
            <strong>Weekly Average Score:</strong> <span style="color: #facc15; font-weight: bold; font-size: 16px;">${week.weeklyScore.toFixed(2)}</span>
            <span style="margin-left: 15px; ${week.isComplete ? "color: #22c55e;" : "color: #ef4444;"} font-weight: bold;">
              ${week.isComplete ? "✓ Complete" : "✗ Incomplete"}
            </span>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="background: #f0f0f0; border-bottom: 2px solid #ddd;">
                <th style="padding: 10px; text-align: left; font-weight: bold;">Submission</th>
                <th style="padding: 10px; text-align: center; font-weight: bold;">Score</th>
                <th style="padding: 10px; text-align: left; font-weight: bold;">Criteria Breakdown</th>
              </tr>
            </thead>
            <tbody>
              ${submissionRows}
            </tbody>
          </table>
        </div>
      `;
    })
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px;">
      <div style="max-width: 800px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0 0 10px 0; font-size: 28px;">WeTrainEducation HRM</h1>
          <p style="margin: 0; font-size: 16px; color: #facc15;">Performance Marksheet</p>
        </div>

        <!-- Content -->
        <div style="padding: 30px;">
          
          <!-- Subject Info -->
          <div style="background: #f9f9f9; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
            <h2 style="margin: 0 0 10px 0; color: #333;">Hello ${data.subjectName},</h2>
            <p style="margin: 0; color: #666;">Here is your performance marksheet for <strong>${formatMonthDisplay(data.monthKey)}</strong>.</p>
          </div>

          <!-- Summary Card -->
          <div style="background: #f0f7ff; border: 2px solid #facc15; border-radius: 6px; padding: 20px; margin-bottom: 25px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
              <div style="text-align: center;">
                <div style="color: #999; font-size: 12px; text-transform: uppercase; margin-bottom: 5px;">Monthly Score</div>
                <div style="color: #facc15; font-size: 32px; font-weight: bold;">${data.monthlyScore.toFixed(2)}</div>
              </div>
              <div style="text-align: center; border-left: 1px solid #ddd; border-right: 1px solid #ddd;">
                <div style="color: #999; font-size: 12px; text-transform: uppercase; margin-bottom: 5px;">Tier</div>
                <div style="color: ${tierColor}; font-size: 18px; font-weight: bold;">${tierLabel}</div>
              </div>
              <div style="text-align: center;">
                <div style="color: #999; font-size: 12px; text-transform: uppercase; margin-bottom: 5px;">Completeness</div>
                <div style="color: ${data.isCompleteMonth ? "#22c55e" : "#ef4444"}; font-size: 18px; font-weight: bold;">
                  ${data.weeksUsed}/${data.expectedWeeks}
                </div>
              </div>
            </div>
          </div>

          <!-- Reward/Fine/Warning -->
          <div style="background: #fafafa; padding: 15px; border-radius: 6px; margin-bottom: 25px; text-align: center;">
            ${rewardWarningSection}
            <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">Action Type: <strong>${data.actionType}</strong></p>
          </div>

          <!-- Weekly Details -->
          <div style="margin-bottom: 25px;">
            <h3 style="color: #333; border-bottom: 2px solid #facc15; padding-bottom: 10px; margin-bottom: 15px;">Weekly Performance Details</h3>
            ${weeklyCriteriaRows}
          </div>

          <!-- Footer -->
          <div style="border-top: 1px solid #eee; padding-top: 20px; color: #666; font-size: 12px; text-align: center;">
            <p style="margin: 5px 0;">For any questions, contact your HR administrator.</p>
            <p style="margin: 5px 0; color: #999;">WeTrainEducation © 2026 - All rights reserved</p>
          </div>

        </div>
      </div>
    </body>
    </html>
  `;
}

function generateMarksheetText(data: MarksheetData): string {
  let text = `WETRAINEDUCATION HRM - PERFORMANCE MARKSHEET\n`;
  text += `${"=".repeat(50)}\n\n`;
  text += `Subject: ${data.subjectName}\n`;
  text += `Month: ${formatMonthDisplay(data.monthKey)}\n\n`;

  text += `SUMMARY\n`;
  text += `${"-".repeat(50)}\n`;
  text += `Monthly Score: ${data.monthlyScore.toFixed(2)}\n`;
  text += `Tier: ${data.tier}\n`;
  text += `Completeness: ${data.weeksUsed}/${data.expectedWeeks}\n\n`;

  text += `REWARD/FINE INFORMATION\n`;
  text += `${"-".repeat(50)}\n`;
  if (data.tier === "BONUS") {
    text += `Bonus: ৳${data.giftAmount || 0}\n`;
  } else if (data.tier === "APPRECIATION") {
    text += `Appreciation Gift: ৳${data.giftAmount || 0}\n`;
  } else if (data.tier === "FINE") {
    text += `Fine: ৳${data.finalFine}\n`;
  }
  text += `Base Fine: ৳${data.baseFine}\n`;
  text += `Action Type: ${data.actionType}\n\n`;

  text += `WEEKLY DETAILS\n`;
  text += `${"-".repeat(50)}\n\n`;

  for (const week of data.weeklyDetails) {
    text += `Week Ending: ${new Date(week.fridayDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} (${week.weekKey})\n`;
    text += `Weekly Score: ${week.weeklyScore.toFixed(2)}\n`;
    text += `Status: ${week.isComplete ? "Complete" : "Incomplete"}\n`;
    text += `Submissions:\n`;

    week.submissions.forEach((sub, idx) => {
      text += `  - Submission ${idx + 1}: ${sub.totalScore.toFixed(2)}\n`;
      for (const criteria of sub.criteriaScores) {
        text += `    • ${criteria.criteriaName}: ${criteria.score.toFixed(2)}\n`;
      }
    });
    text += `\n`;
  }

  text += `${"-".repeat(50)}\n`;
  text += `For any questions, contact your HR administrator.\n`;
  text += `WeTrainEducation © 2026\n`;

  return text;
}
