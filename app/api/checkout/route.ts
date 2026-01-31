import { createAdminClient } from "@/app/utils/supabase/admin";
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

    const admin = createAdminClient();
    const serverClient = await createClient();
    const {
      data: { user },
    } = await serverClient.auth.getUser();

    let userId = user?.id ?? null;
    let customerEmail = user?.email ?? email;

    if (!userId) {
      const { data: profile } = await admin
        .from("profiles")
        .select("id, email")
        .eq("email", email)
        .single();

      if (!profile?.id) {
        // Instantly register new user with magic link
        try {
          let authUserId: string | null = null;
          let isNewUser = false;

          // Try to create a new auth user first (optimistic approach)
          const { data: authData, error: authError } =
            await admin.auth.admin.createUser({
              email: email,
              email_confirm: false, // User will confirm via magic link
            });

          if (authError) {
            // Check if error is due to user already existing
            if (
              authError.message?.includes("already") ||
              authError.message?.includes("duplicate") ||
              authError.status === 422
            ) {
              // User already exists, query auth.users to get ID
              const { data: users, error: listError } =
                await admin.auth.admin.listUsers();

              if (listError) {
                console.error("List users error:", listError);
                return NextResponse.json(
                  { error: "Failed to retrieve user information." },
                  { status: 500 },
                );
              }

              const existingUser = users?.users?.find((u) => u.email === email);
              if (existingUser?.id) {
                authUserId = existingUser.id;
              } else {
                console.error("User exists but cannot be found:", email);
                return NextResponse.json(
                  { error: "Failed to retrieve user information." },
                  { status: 500 },
                );
              }
            } else {
              // Other error
              console.error("Auth creation error:", authError);
              return NextResponse.json(
                { error: "Failed to register user. Please try again." },
                { status: 500 },
              );
            }
          } else if (authData?.user?.id) {
            // New user created successfully
            authUserId = authData.user.id;
            isNewUser = true;
          }

          if (!authUserId) {
            return NextResponse.json(
              { error: "Failed to retrieve user ID. Please try again." },
              { status: 500 },
            );
          }

          userId = authUserId;

          // Check if profile already exists (might be auto-created by database trigger)
          const { data: existingProfile } = await admin
            .from("profiles")
            .select("id")
            .eq("id", userId)
            .single();

          // Only create profile if it doesn't exist
          if (!existingProfile) {
            const { error: profileError } = await admin
              .from("profiles")
              .insert({
                id: userId,
                email: email,
                full_name: "", // Empty for now, user can update later
                role: "customer",
              });

            if (profileError && profileError.code !== "23505") {
              // Ignore duplicate key errors, but log other errors
              console.error("Profile creation error:", profileError);
              return NextResponse.json(
                { error: "Failed to create user profile. Please try again." },
                { status: 500 },
              );
            }
          }

          // Only send welcome email for newly created users
          if (isNewUser) {
            // Generate invite link for password setup
            const { data: signInData, error: signInError } =
              await admin.auth.admin.generateLink({
                type: "invite",
                email: email,
                options: {
                  redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback?next=/set-password`,
                },
              });

            if (signInError || !signInData?.properties?.action_link) {
              console.error("Generate link error:", signInError);
              return NextResponse.json(
                { error: "Failed to generate login link. Please try again." },
                { status: 500 },
              );
            }

            const magicLink = signInData.properties.action_link;

            // Send welcome email with magic link
            const transporter = nodemailer.createTransport({
              host: process.env.SMTP_HOST,
              port: parseInt(process.env.SMTP_PORT || "587"),
              secure: process.env.SMTP_SECURE === "true",
              auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
              },
            });

            await transporter.sendMail({
              from: `WeTrainEducation <${process.env.SMTP_FROM}>`,
              to: email,
              subject: "Welcome to WeTrainEducation - Confirm your email",
              html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">🎉 Welcome to WeTrainEducation!</h2>
                <p style="color: #555;">Your account has been created automatically when you started your purchase.</p>
                <p style="color: #555;">Click the link below to confirm your email and set your password:</p>
                <p><a href="${magicLink}" style="display: inline-block; background-color: #facc15; color: #000; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 20px 0;">Confirm Email & Set Password</a></p>
                <p style="color: #555; margin-top: 20px;">Or copy and paste this link in your browser:</p>
                <p style="color: #0066cc; word-break: break-all; font-size: 12px;">${magicLink}</p>
                <p style="color: #999; font-size: 12px; margin-top: 20px;">This link expires in 24 hours. If you didn't create this account, please ignore this email.</p>
              </div>`,
              text: `Welcome to WeTrainEducation! Confirm your email and set your password: ${magicLink}`,
            });
          }
        } catch (error) {
          console.error("User registration error:", error);
          return NextResponse.json(
            { error: "Failed to register user. Please try again." },
            { status: 500 },
          );
        }
      } else {
        userId = profile.id;
        customerEmail = profile.email ?? email;
      }
    }

    // Create order record
    const { data: order, error: orderError } = await admin
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

    const { error: paymentError } = await admin.from("payments").insert({
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
