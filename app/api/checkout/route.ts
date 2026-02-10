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
    // Handle different currency formats: ৳15,999 or Custom Quote or number
    let priceInCents = 0;
    let priceValue = 0;

    // Handle if price is already a number
    if (typeof price === "number") {
      if (!price || isNaN(price)) {
        return NextResponse.json({ error: "Invalid price." }, { status: 400 });
      }
      priceValue = price;
      // Convert BDT to USD (approximate rate: 1 USD = 110 BDT)
      const priceInUSD = priceValue / 110;
      priceInCents = Math.round(priceInUSD * 100);
    } else if (typeof price === "string") {
      if (price.toLowerCase().includes("custom")) {
        // For custom quotes, set a placeholder amount or redirect to proposal
        return NextResponse.json(
          { error: "Please request a custom quote for this service." },
          { status: 400 },
        );
      }

      // Remove currency symbols and commas: ৳15,999 -> 15999
      const cleanPrice = price.replace(/[৳$,\s]/g, "");
      priceValue = parseFloat(cleanPrice);

      if (!priceValue || isNaN(priceValue)) {
        return NextResponse.json({ error: "Invalid price." }, { status: 400 });
      }

      // Convert BDT to USD (approximate rate: 1 USD = 110 BDT)
      const priceInUSD = priceValue / 110;
      priceInCents = Math.round(priceInUSD * 100);
    } else {
      return NextResponse.json(
        { error: "Invalid price format." },
        { status: 400 },
      );
    }

    const serverClient = await createClient();

    // Create admin client for guest checkout operations (bypasses RLS)
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

    // Check if user is already authenticated
    const {
      data: { user },
    } = await serverClient.auth.getUser();

    let userId: string;
    let customerEmail: string;
    let isNewUser = false;

    if (user?.id && user.email) {
      // User is already authenticated
      userId = user.id;
      customerEmail = user.email;
    } else {
      // Guest checkout - create user account or use existing
      customerEmail = email;

      // Check if user already exists using admin client to bypass RLS
      const { data: existingProfile } = await adminClient
        .from("profiles")
        .select("id, email")
        .eq("email", email)
        .maybeSingle();

      if (existingProfile?.id) {
        // User exists, use their ID
        userId = existingProfile.id;
      } else {
        // Create new user with Supabase Auth (using admin to skip confirmation email)
        try {
          const tempPassword =
            Math.random().toString(36).slice(-12) + "Temp@123";

          const { data: newUser, error: signUpError } =
            await adminClient.auth.admin.createUser({
              email: email,
              password: tempPassword,
              email_confirm: true, // Mark email as confirmed to skip confirmation email
              user_metadata: {
                name: email.split("@")[0],
              },
            });

          if (signUpError || !newUser.user?.id) {
            console.error("Sign up error:", signUpError);
            return NextResponse.json(
              { error: "Unable to create account. Please try again." },
              { status: 500 },
            );
          }

          userId = newUser.user.id;

          // Check if profile already exists (might be auto-created by trigger or already exists)
          const { data: profileCheck } = await adminClient
            .from("profiles")
            .select("id")
            .eq("id", userId)
            .maybeSingle();

          if (!profileCheck) {
            // Profile doesn't exist, create it
            const { error: profileError } = await adminClient
              .from("profiles")
              .insert({
                id: userId,
                full_name: email.split("@")[0],
                email: email,
                role: "customer",
              });

            if (profileError && profileError.code !== "23505") {
              // Ignore duplicate key errors (23505), fail on other errors
              console.error("Profile creation error:", profileError);
              return NextResponse.json(
                { error: "Unable to create user profile." },
                { status: 500 },
              );
            }

            isNewUser = true;

            // Send password reset email so user can set their own password
            try {
              const { error: resetError } =
                await serverClient.auth.resetPasswordForEmail(email, {
                  redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/set-password`,
                });

              if (resetError) {
                console.error("Password reset email error:", resetError);
                // Don't fail the order, just log the error
              }
            } catch (resetErr) {
              console.error("Failed to send password reset email:", resetErr);
              // Don't fail the order
            }
          } else {
            // Profile already exists (possibly from previous signup)
            console.log("Profile already exists for user:", userId);
          }
        } catch (createError) {
          console.error("User creation error:", createError);
          return NextResponse.json(
            { error: "Unable to create account." },
            { status: 500 },
          );
        }
      }
    }

    // Use admin client for guest checkout (unauthenticated), regular client for authenticated users
    // This is important because RLS policies require auth.uid() to match user_id
    const isAuthenticated = !!user?.id;
    const dbClient = isAuthenticated ? serverClient : adminClient;

    // Create order record
    const { data: order, error: orderError } = await dbClient
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
      console.error("Order creation error:", orderError);
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

    // Create payment record using admin client for guest checkout
    const { error: paymentError } = await dbClient.from("payments").insert({
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
    const orderSummary = `${name} (${priceValue} BDT)`;

    // Customer email - different content for new vs existing users
    const customerEmailHtml = isNewUser
      ? `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">🎉 Welcome & Order Received!</h2>
          <p style="color: #555;">Thank you for your order! We've created an account for you.</p>
          <p style="color: #555;"><strong>Order:</strong> ${orderSummary}</p>
          <p style="color: #555;"><strong>Payment method:</strong> ${paymentMethod}</p>
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
            <h3 style="color: #92400e; margin-top: 0;">🔒 Set Your Password</h3>
            <p style="color: #92400e; margin: 0; font-weight: bold;">IMPORTANT: Check your email for a password reset link.</p>
            <p style="color: #78350f; margin: 10px 0 0 0;">You'll receive a separate email from us with a link to set your password. Click that link to create your password and access your account.</p>
            <p style="color: #64748b; margin: 10px 0 0 0; font-size: 14px;">Email: <strong>${customerEmail}</strong> • Check spam folder if you don't see it.</p>
          </div>
          <p style="color: #555;">After setting your password, you can login to track your order and access your dashboard.</p>
        </div>`
      : `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Order Received</h2>
          <p style="color: #555;">Thanks for your order. We have received your request and are preparing your checkout.</p>
          <p style="color: #555;"><strong>Order:</strong> ${orderSummary}</p>
          <p style="color: #555;"><strong>Payment method:</strong> ${paymentMethod}</p>
        </div>`;

    const customerEmailText = isNewUser
      ? `Welcome & Order received: ${orderSummary}. Payment method: ${paymentMethod}. IMPORTANT: Check your email at ${customerEmail} for a PASSWORD RESET link to set your password and access your account.`
      : `Order received: ${orderSummary}. Payment method: ${paymentMethod}.`;

    await transporter.sendMail({
      from: `WeTrainEducation <${process.env.SMTP_FROM}>`,
      to: customerEmail,
      subject: isNewUser
        ? "Welcome! Order Received - Set Your Password"
        : "We received your order",
      html: customerEmailHtml,
      text: customerEmailText,
    });

    await transporter.sendMail({
      from: `WeTrainEducation <${process.env.SMTP_FROM}>`,
      to: adminEmail,
      subject: isNewUser
        ? "New order + New customer account"
        : "New order created",
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">${isNewUser ? "🆕 New Order + New Customer" : "New Order Created"}</h2>
          ${isNewUser ? '<p style="color: #16a34a; font-weight: bold;">✅ New account created via guest checkout</p>' : ""}
          <p><strong>Customer:</strong> ${customerEmail}</p>
          <p><strong>Order:</strong> ${orderSummary}</p>
          <p><strong>Payment method:</strong> ${paymentMethod}</p>
          <p><strong>Order ID:</strong> ${order.id}</p>
          ${isNewUser ? '<p style="color: #64748b; font-size: 14px;">Customer will receive a password reset email to set their password and access their account.</p>' : ""}
        </div>`,
      text: `${isNewUser ? "New order + New customer account. " : ""}Customer: ${customerEmail}. Order: ${orderSummary}. Payment method: ${paymentMethod}. Order ID: ${order.id}.`,
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
