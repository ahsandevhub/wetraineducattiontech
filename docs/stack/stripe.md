# Stripe Stack Documentation

## Overview

The platform integrates Stripe for payment processing across the Education module, handling course purchases, subscriptions, and payment management with secure webhook handling and comprehensive error management.

## Stripe Integration Architecture

### Core Libraries

- **Stripe.js**: Client-side Stripe integration
- **@stripe/stripe-js**: TypeScript support for Stripe.js
- **stripe**: Server-side Stripe API client
- **@stripe/react-stripe-js**: React components for Stripe Elements

### Environment Configuration

```typescript
// .env.local
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PRICE_ID_BASIC=price_...
NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM=price_...
```

### Stripe Client Setup

```typescript
// lib/stripe/client.ts
import { loadStripe } from "@stripe/stripe-js";

// Client-side Stripe instance
let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

// Server-side Stripe instance
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
  typescript: true,
});
```

## Payment Flow Implementation

### Checkout Session Creation

```typescript
// app/actions/create-checkout-session.ts
"use server";
import { stripe } from "@/lib/stripe/client";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function createCheckoutSession(courseId: string) {
  const supabase = createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Get course details
  const { data: course } = await supabase
    .from("courses")
    .select("id, title, price, stripe_price_id")
    .eq("id", courseId)
    .single();

  if (!course) throw new Error("Course not found");

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price: course.stripe_price_id,
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/customer/courses/${courseId}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/customer/courses/${courseId}`,
    metadata: {
      courseId: course.id,
      userId: user.id,
    },
    customer_email: user.email,
  });

  redirect(session.url!);
}
```

### Checkout Component

```tsx
// components/CheckoutButton.tsx
"use client";
import { useState } from "react";
import { createCheckoutSession } from "@/app/actions/create-checkout-session";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface CheckoutButtonProps {
  courseId: string;
  price: number;
}

export function CheckoutButton({ courseId, price }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      await createCheckoutSession(courseId);
    } catch (error) {
      console.error("Checkout error:", error);
      // Handle error (show toast, etc.)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleCheckout} disabled={isLoading}>
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Purchase Course - ${price}
    </Button>
  );
}
```

## Webhook Handling

### Webhook Endpoint

```typescript
// app/api/webhooks/stripe/route.ts
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/navigation";
import { stripe } from "@/lib/stripe/client";
import { createClient } from "@/lib/supabase/server";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = headers().get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;
      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(
          event.data.object as Stripe.Invoice,
        );
        break;
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const supabase = createClient();

  const courseId = session.metadata?.courseId;
  const userId = session.metadata?.userId;

  if (!courseId || !userId) {
    throw new Error("Missing metadata in checkout session");
  }

  // Record the purchase
  const { error } = await supabase.from("purchases").insert({
    user_id: userId,
    course_id: courseId,
    stripe_session_id: session.id,
    amount: session.amount_total! / 100, // Convert from cents
    currency: session.currency!,
    status: "completed",
  });

  if (error) throw error;

  // Update user's enrolled courses
  await supabase.from("user_courses").insert({
    user_id: userId,
    course_id: courseId,
    progress: 0,
    enrolled_at: new Date().toISOString(),
  });
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // Handle subscription payments
  const supabase = createClient();

  const subscriptionId = invoice.subscription as string;

  await supabase
    .from("subscriptions")
    .update({
      status: "active",
      current_period_end: new Date(invoice.period_end * 1000).toISOString(),
    })
    .eq("stripe_subscription_id", subscriptionId);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  // Handle failed subscription payments
  const supabase = createClient();

  const subscriptionId = invoice.subscription as string;

  await supabase
    .from("subscriptions")
    .update({
      status: "past_due",
    })
    .eq("stripe_subscription_id", subscriptionId);
}
```

### Webhook Security

```typescript
// lib/stripe/webhook-utils.ts
import { stripe } from "./client";

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
): Stripe.Event {
  try {
    return stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    throw new Error(`Webhook signature verification failed: ${error.message}`);
  }
}

export function isValidEventType(eventType: string): boolean {
  const validEvents = [
    "checkout.session.completed",
    "invoice.payment_succeeded",
    "invoice.payment_failed",
    "customer.subscription.created",
    "customer.subscription.updated",
    "customer.subscription.deleted",
  ];

  return validEvents.includes(eventType);
}
```

## Subscription Management

### Subscription Creation

```typescript
// app/actions/create-subscription.ts
"use server";
import { stripe } from "@/lib/stripe/client";
import { createClient } from "@/lib/supabase/server";

export async function createSubscription(priceId: string) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Create or retrieve Stripe customer
  let customer = await stripe.customers.list({
    email: user.email!,
    limit: 1,
  });

  let customerId: string;

  if (customer.data.length > 0) {
    customerId = customer.data[0].id;
  } else {
    const newCustomer = await stripe.customers.create({
      email: user.email!,
      metadata: {
        userId: user.id,
      },
    });
    customerId = newCustomer.id;
  }

  // Create subscription
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [
      {
        price: priceId,
      },
    ],
    payment_behavior: "default_incomplete",
    expand: ["latest_invoice.payment_intent"],
  });

  // Store subscription in database
  await supabase.from("subscriptions").insert({
    user_id: user.id,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    status: subscription.status,
    current_period_start: new Date(
      subscription.current_period_start * 1000,
    ).toISOString(),
    current_period_end: new Date(
      subscription.current_period_end * 1000,
    ).toISOString(),
    price_id: priceId,
  });

  return {
    subscriptionId: subscription.id,
    clientSecret: (subscription.latest_invoice as Stripe.Invoice)
      .payment_intent as Stripe.PaymentIntent,
  };
}
```

### Subscription Management Component

```tsx
// components/SubscriptionManager.tsx
"use client";
import { useState, useEffect } from "react";
import {
  createSubscription,
  cancelSubscription,
} from "@/app/actions/subscription";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Subscription {
  id: string;
  status: string;
  current_period_end: string;
  price_id: string;
}

export function SubscriptionManager({
  subscription,
}: {
  subscription: Subscription | null;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (priceId: string) => {
    setIsLoading(true);
    try {
      const result = await createSubscription(priceId);
      // Redirect to payment or handle client secret
      window.location.href = `/payment?client_secret=${result.clientSecret.client_secret}`;
    } catch (error) {
      console.error("Subscription error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      await cancelSubscription(subscription!.id);
      // Refresh page or update state
      window.location.reload();
    } catch (error) {
      console.error("Cancellation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Choose a Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() =>
              handleSubscribe(process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BASIC!)
            }
            disabled={isLoading}
          >
            Subscribe to Basic Plan
          </Button>
          <Button
            onClick={() =>
              handleSubscribe(process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM!)
            }
            disabled={isLoading}
          >
            Subscribe to Premium Plan
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Subscription</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Status: {subscription.status}</p>
        <p>
          Next billing:{" "}
          {new Date(subscription.current_period_end).toLocaleDateString()}
        </p>
        <Button
          variant="destructive"
          onClick={handleCancel}
          disabled={isLoading}
        >
          Cancel Subscription
        </Button>
      </CardContent>
    </Card>
  );
}
```

## Payment Method Management

### Payment Method Setup

```typescript
// components/PaymentMethodSetup.tsx
'use client';
import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';

export function PaymentMethodSetup({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setIsLoading(true);

    const { error } = await stripe.confirmSetup({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-methods`,
      },
    });

    if (error) {
      console.error('Setup error:', error);
    } else {
      onSuccess();
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <Button type="submit" disabled={!stripe || isLoading}>
        {isLoading ? 'Saving...' : 'Save Payment Method'}
      </Button>
    </form>
  );
}
```

### Payment Method List

```typescript
// components/PaymentMethods.tsx
'use client';
import { useState, useEffect } from 'react';
import { stripe } from '@/lib/stripe/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function PaymentMethods({ customerId }: { customerId: string }) {
  const [paymentMethods, setPaymentMethods] = useState<Stripe.PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      const methods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });
      setPaymentMethods(methods.data);
      setIsLoading(false);
    };

    fetchPaymentMethods();
  }, [customerId]);

  const handleDelete = async (paymentMethodId: string) => {
    await stripe.paymentMethods.detach(paymentMethodId);
    setPaymentMethods(methods => methods.filter(pm => pm.id !== paymentMethodId));
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      {paymentMethods.map((method) => (
        <Card key={method.id}>
          <CardContent className="flex justify-between items-center p-4">
            <div>
              **** **** **** {method.card?.last4}
              <span className="ml-2 text-sm text-muted-foreground">
                Expires {method.card?.exp_month}/{method.card?.exp_year}
              </span>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(method.id)}
            >
              Remove
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

## Error Handling and Recovery

### Payment Error Handling

```typescript
// lib/stripe/error-handling.ts
export function handleStripeError(error: Stripe.StripeError) {
  switch (error.type) {
    case "card_error":
      switch (error.code) {
        case "card_declined":
          return "Your card was declined. Please try a different card.";
        case "expired_card":
          return "Your card has expired. Please use a different card.";
        case "incorrect_cvc":
          return "The CVC number is incorrect. Please check and try again.";
        case "processing_error":
          return "An error occurred while processing your card. Please try again.";
        case "incorrect_number":
          return "The card number is incorrect. Please check and try again.";
        default:
          return error.message || "A card error occurred.";
      }
    case "validation_error":
      return "Please check your payment information and try again.";
    case "api_connection_error":
      return "Network error. Please check your connection and try again.";
    case "authentication_error":
      return "Authentication failed. Please refresh and try again.";
    case "rate_limit_error":
      return "Too many requests. Please wait and try again.";
    default:
      return "An unexpected error occurred. Please try again.";
  }
}

// Usage in components
export function CheckoutForm() {
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    try {
      // Payment logic
    } catch (err) {
      if (err instanceof Stripe.StripeError) {
        setError(handleStripeError(err));
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };
}
```

### Retry Logic

```typescript
// lib/stripe/retry.ts
export async function retryStripeOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        throw lastError;
      }

      // Exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, delay * Math.pow(2, attempt - 1)),
      );
    }
  }

  throw lastError!;
}

// Usage
const result = await retryStripeOperation(async () => {
  return await stripe.paymentIntents.create({
    amount: 1000,
    currency: "usd",
  });
});
```

## Testing Stripe Integration

### Test Mode Configuration

```typescript
// lib/stripe/test-utils.ts
export const testCards = {
  success: "4242424242424242",
  decline: "4000000000000002",
  insufficientFunds: "4000000000009995",
  expired: "4000000000000069",
  incorrectCVC: "4000000000000127",
};

export function createTestToken(cardNumber: string): Promise<Stripe.Token> {
  return stripe.tokens.create({
    card: {
      number: cardNumber,
      exp_month: 12,
      exp_year: new Date().getFullYear() + 1,
      cvc: "123",
    },
  });
}
```

### Integration Tests

```typescript
// __tests__/stripe-integration.test.ts
describe("Stripe Integration", () => {
  it("should create checkout session", async () => {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: "price_test", quantity: 1 }],
      mode: "payment",
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
    });

    expect(session.id).toBeDefined();
    expect(session.url).toContain("checkout.stripe.com");
  });

  it("should handle webhook events", async () => {
    const event = {
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_123",
          metadata: { courseId: "course_123", userId: "user_123" },
          amount_total: 10000,
          currency: "usd",
        },
      },
    };

    // Mock webhook processing
    const result = await processWebhook(event);
    expect(result).toBe(true);
  });
});
```

## Security Best Practices

### PCI Compliance

- Never store card details on your servers
- Use Stripe Elements for card input
- Always validate data on the server side
- Use HTTPS for all payment-related communications

### Webhook Security

```typescript
// Secure webhook handling
export async function secureWebhookHandler(request: NextRequest) {
  // Verify signature
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  // Verify timestamp (prevent replay attacks)
  const event = stripe.webhooks.constructEvent(
    await request.text(),
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!,
  );

  // Check if event is recent (within last 5 minutes)
  const eventAge = Date.now() - event.created * 1000;
  if (eventAge > 5 * 60 * 1000) {
    return NextResponse.json({ error: "Event too old" }, { status: 400 });
  }

  // Process event
  return NextResponse.json({ received: true });
}
```

### Rate Limiting

```typescript
// Rate limiting for payment endpoints
import rateLimit from "express-rate-limit";

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: "Too many payment attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

export { paymentLimiter };
```

This comprehensive Stripe documentation covers the complete payment integration for the WeTrainEducation platform, including checkout flows, webhooks, subscriptions, and security best practices.
