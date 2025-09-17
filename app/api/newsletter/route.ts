import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Email to company
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.SMTP_TO,
      subject: "New Newsletter Subscriber",
      html: `<p>New subscriber: <strong>${email}</strong></p>`,
      text: `New subscriber: ${email}`,
    });

    // Confirmation email to subscriber
    await transporter.sendMail({
      from: `WeTrainEducation <${process.env.SMTP_FROM}>`,
      to: email,
      subject: "Newsletter Subscription Confirmed",
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #facc15; padding-bottom: 10px;">Welcome to WeTrainEducation Newsletter!</h2>
        <p style="color: #555;">Thank you for subscribing. You'll receive fresh marketing insights, case studies, and exclusive resources straight to your inbox.</p>
        <p style="color: #555;">If you have any questions, contact us at <a href="mailto:support@wetraineducation.com" style="color: #facc15; font-weight: bold;">support@wetraineducation.com</a>.</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">You can unsubscribe at any time.</p>
      </div>`,
      text: `Thank you for subscribing to WeTrainEducation Newsletter! You'll receive fresh marketing insights, case studies, and exclusive resources straight to your inbox. Contact support@wetraineducation.com for questions. You can unsubscribe at any time.`,
    });

    return NextResponse.json(
      { message: "Subscription successful!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Newsletter error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe. Please try again." },
      { status: 500 }
    );
  }
}
