import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  // Check if user is admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Parse and validate request body
    const body = await request.json();
    const { userId, amount, method, status, service, reference } = body;

    // Validate required fields
    if (!userId || !amount || !method) {
      return NextResponse.json(
        { error: "Missing required fields: userId, amount, method" },
        { status: 400 },
      );
    }

    // Validate amount is a number
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 },
      );
    }

    // Build insert object with only provided fields
    const insertData: Record<string, unknown> = {
      user_id: userId,
      amount: parsedAmount,
      method,
      status: status || "pending",
    };

    // Only add optional fields if they have values
    if (service && service.trim()) insertData.service = service.trim();
    if (reference && reference.trim()) insertData.reference = reference.trim();

    const { data, error } = await supabase
      .from("payments")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Payment creation error:", error);

      // Provide helpful error messages based on error code
      if (error.code === "PGRST204") {
        return NextResponse.json(
          {
            error:
              "Database not initialized. Please run the migration: prisma/migrations/manual_migration.sql in Supabase SQL Editor.",
            code: error.code,
          },
          { status: 503 },
        );
      }

      if (error.code === "42501") {
        // Row-level security policy violation
        return NextResponse.json(
          {
            error:
              "Database access denied. Please disable RLS on the payments table in Supabase or create proper policies. See FIX_RLS_POLICY.md for details.",
            code: error.code,
          },
          { status: 403 },
        );
      }

      if (error.code === "23503") {
        // Foreign key violation
        return NextResponse.json(
          { error: "Invalid customer ID. Please select a valid customer." },
          { status: 400 },
        );
      }

      if (error.code === "23505") {
        // Unique violation
        return NextResponse.json(
          { error: "This payment record already exists." },
          { status: 409 },
        );
      }

      return NextResponse.json(
        {
          error:
            error.message ||
            "Failed to create payment. Please try again or contact support.",
          code: error.code,
        },
        { status: 500 },
      );
    }

    // Create corresponding order when payment is created
    try {
      const { error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: userId,
          package_name: service?.trim() || "Manual Payment",
          amount: parsedAmount,
          status: status || "pending",
        })
        .select();

      if (orderError) {
        console.error("Order creation error:", orderError);
        // Log but don't fail - payment creation is more critical
      }
    } catch (orderError) {
      console.error("Order creation exception:", orderError);
      // Log but don't fail - payment creation is more critical
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("Payment API error:", err);

    if (err instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 },
    );
  }
}

// GET endpoint for generating invoices/receipts
export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get("paymentId");

  if (!paymentId) {
    return NextResponse.json({ error: "Payment ID required" }, { status: 400 });
  }

  if (typeof paymentId !== "string" || paymentId.trim() === "") {
    return NextResponse.json(
      { error: "Invalid Payment ID format" },
      { status: 400 },
    );
  }

  try {
    // Fetch payment with customer details
    const { data: payment, error } = await supabase
      .from("payments")
      .select(
        `
        *,
        profiles:user_id (
          full_name,
          email,
          phone,
          address,
          city,
          state,
          postal_code,
          country
        )
      `,
      )
      .eq("id", paymentId)
      .single();

    if (error) {
      console.error("Payment fetch error:", error);

      if (error.code === "PGRST204") {
        return NextResponse.json(
          { error: "Database not initialized. Please run the migration." },
          { status: 503 },
        );
      }

      return NextResponse.json(
        { error: "Failed to fetch payment details" },
        { status: 500 },
      );
    }

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json(payment);
  } catch (err) {
    console.error("Payment API GET error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
