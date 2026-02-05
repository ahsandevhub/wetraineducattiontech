import { createClient } from "@/app/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

export async function POST(req: NextRequest) {
  try {
    const { name, price, email, service, id, method } = await req.json();
    if (!name || !price || !email) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 },
      );
    }

    const allowedMethods = ["Bank", "Nagad", "bKash", "Card"];
    const paymentMethod = allowedMethods.includes(method) ? method : "Bank";

    // Convert price to cents (Stripe expects integer)
    // Handle different currency formats: ৳15,999 or Custom Quote
    let priceInCents = 0;

    if (price.toLowerCase().includes("custom")) {
      // For custom quotes, set a placeholder amount or redirect to proposal
      return NextResponse.json(
        { error: "Please request a custom quote for this service." },
        { status: 400 },
      );
    }

    // Remove currency symbols and commas: ৳15,999 -> 15999
    const cleanPrice = price.replace(/[৳$,\s]/g, "");
    const priceValue = parseFloat(cleanPrice);

    if (!priceValue || isNaN(priceValue)) {
      return NextResponse.json({ error: "Invalid price." }, { status: 400 });
    }

    // Convert BDT to USD (approximate rate: 1 USD = 110 BDT)
    // You should use a real-time conversion API for production
    const priceInUSD = priceValue / 110;
    priceInCents = Math.round(priceInUSD * 100);

    const serverClient = await createClient();
    const {
      data: { user },
    } = await serverClient.auth.getUser();

    if (!user?.id || !user.email) {
      return NextResponse.json(
        { error: "Please sign in before checkout." },
        { status: 401 },
      );
    }

    const userId = user.id;
    const customerEmail = user.email;

    // Create order record
    const { data: order, error: orderError } = await serverClient
      .from("orders")
      .insert({
        user_id: userId,
        package_name: name,
        amount: priceValue,
        status: "pending",
      })
      .select("id")
      .single();

    if (orderError || !order?.id) {
      return NextResponse.json(
        { error: "Unable to create order." },
        { status: 500 },
      );
    }

    // Create product description based on service type
    let description = `${name}`;
    if (service) {
      description += ` (${service})`;
    }
    if (id) {
      description += ` - ID: ${id}`;
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: name,
              description: description,
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: customerEmail,
      metadata: {
        service_type: service || "general",
        service_id: id || "",
        original_price: price,
        order_id: order.id,
        user_id: userId,
        payment_method: paymentMethod,
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout?canceled=true&session_id={CHECKOUT_SESSION_ID}`,
    });

    const { error: paymentError } = await serverClient.from("payments").insert({
      user_id: userId,
      amount: priceValue,
      method: paymentMethod,
      status: "pending",
      reference: session.id,
    });

    if (paymentError) {
      console.error("Payment insert error:", paymentError);
    }

    // Notify customer and admin about order creation
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
    const orderSummary = `${name} (${price})`;

    await transporter.sendMail({
      from: `WeTrainEducation <${process.env.SMTP_FROM}>`,
      to: customerEmail,
      subject: "We received your order",
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Order received</h2>
          <p style="color: #555;">Thanks for your order. We have received your request and are preparing your checkout.</p>
          <p style="color: #555;"><strong>Order:</strong> ${orderSummary}</p>
          <p style="color: #555;"><strong>Payment method:</strong> ${paymentMethod}</p>
        </div>`,
      text: `Order received: ${orderSummary}. Payment method: ${paymentMethod}.`,
    });

    await transporter.sendMail({
      from: `WeTrainEducation <${process.env.SMTP_FROM}>`,
      to: adminEmail,
      subject: "New order created",
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New order created</h2>
          <p><strong>Customer:</strong> ${customerEmail}</p>
          <p><strong>Order:</strong> ${orderSummary}</p>
          <p><strong>Payment method:</strong> ${paymentMethod}</p>
          <p><strong>Order ID:</strong> ${order.id}</p>
        </div>`,
      text: `New order created. Customer: ${customerEmail}. Order: ${orderSummary}. Payment method: ${paymentMethod}. Order ID: ${order.id}.`,
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (error) {
    console.error("Stripe error:", error);
    return NextResponse.json(
      { error: "Stripe checkout failed." },
      { status: 500 },
    );
  }
}
