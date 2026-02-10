import { createClient } from "@/app/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

export async function POST(req: NextRequest) {
  try {
    const { sessionId, status } = await req.json();

    if (!sessionId || !status) {
      return NextResponse.json(
        { error: "Missing session or status." },
        { status: 400 },
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Create admin client for guest checkout (bypasses RLS)
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    // Use admin client if no user session (guest checkout)
    const dbClient = user ? supabase : adminClient;

    const paymentStatus = status === "success" ? "paid" : "canceled";
    const orderStatus = status === "success" ? "completed" : "canceled";

    const orderId = session.metadata?.order_id;
    const customerEmail = session.customer_email ?? session.metadata?.email;
    const paymentMethod = session.metadata?.payment_method ?? "Card";

    // Update payment status
    const { error: paymentError } = await dbClient
      .from("payments")
      .update({ status: paymentStatus, method: paymentMethod })
      .eq("reference", sessionId);

    if (paymentError) {
      console.error("Payment update error:", paymentError);
    }

    // Update order status
    if (orderId) {
      const { error: orderError } = await dbClient
        .from("orders")
        .update({ status: orderStatus })
        .eq("id", orderId);

      if (orderError) {
        console.error("Order update error:", orderError);
      }
    }

    if (customerEmail) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const adminEmail = "support@wetraineducation.com";
      const orderName = session.metadata?.service_id
        ? `${session.metadata?.service_type} - ${session.metadata?.service_id}`
        : (session.metadata?.service_type ?? "Service");

      const subject =
        status === "success" ? "Payment received" : "Payment was not completed";

      const htmlBody = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">${subject}</h2>
          <p><strong>Status:</strong> ${paymentStatus}</p>
          <p><strong>Order:</strong> ${orderName}</p>
          <p><strong>Payment method:</strong> ${paymentMethod}</p>
          <p><strong>Session:</strong> ${sessionId}</p>
        </div>`;

      await transporter.sendMail({
        from: `WeTrainEducation <${process.env.SMTP_FROM}>`,
        to: customerEmail,
        subject,
        html: htmlBody,
        text: `${subject}. Status: ${paymentStatus}. Order: ${orderName}. Payment method: ${paymentMethod}.`,
      });

      await transporter.sendMail({
        from: `WeTrainEducation <${process.env.SMTP_FROM}>`,
        to: adminEmail,
        subject: `Admin: ${subject}`,
        html: htmlBody,
        text: `${subject}. Status: ${paymentStatus}. Order: ${orderName}. Payment method: ${paymentMethod}.`,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Confirm error:", error);
    return NextResponse.json(
      { error: "Failed to update payment." },
      { status: 500 },
    );
  }
}
