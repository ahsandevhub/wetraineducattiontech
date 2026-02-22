"use client";
import { createClient } from "@/app/utils/supabase/client";
import { motion } from "framer-motion";
import { Building2, CreditCard, Smartphone } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Service {
  id: string;
  title: string;
  price: number | null;
  discount: number | null;
  category: "course" | "software" | "marketing";
  details: string | null;
}

const packages = [
  {
    name: "Starter",
    price: "৳4,999",
    priceNote: "one-time setup",
    description:
      "Perfect for new brands: positioning, essential creatives, and a launch-ready playbook.",
    features: [
      "Brand audit & positioning workshop",
      "Creative starter kit (ads + social)",
      "1 channel launch plan (e.g., Meta)",
      "Tracking & pixel setup",
      "Monthly report & roadmap",
    ],
  },
  {
    name: "Growth",
    price: "৳12,999",
    priceNote: "per month",
    description:
      "Scale with performance: full-funnel campaigns, weekly experiments, and clear KPIs.",
    features: [
      "Cross-channel strategy (Meta/Google/TikTok)",
      "Creative testing framework (UGC & statics)",
      "Landing page recommendations",
      "Weekly sprints & reporting dashboard",
      "Quarterly growth review",
    ],
  },
  {
    name: "Scale",
    price: "Custom",
    priceNote: "talk to sales",
    description:
      "For high-velocity teams: multi-market orchestration, advanced analytics, and SLAs.",
    features: [
      "Multi-market & localization playbooks",
      "Dedicated strategist + creative pod",
      "Marketing mix modeling (MMM-light)",
      "Advanced GA4/Server-side tracking",
      "Prioritized roadmap & SLAs",
    ],
  },
];

import { Suspense } from "react";

function CheckoutPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailLocked, setEmailLocked] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Bank");
  const [isAdmin, setIsAdmin] = useState(false);
  const [serviceData, setServiceData] = useState<Service | null>(null);
  const [loadingService, setLoadingService] = useState(true);

  // Get package/service info from query params
  const name = searchParams.get("name") || "";
  const price = searchParams.get("price") || "";
  const serviceParam = searchParams.get("service") || "";
  const id = searchParams.get("id") || serviceParam; // Use service param as ID if id not provided
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");
  const sessionId = searchParams.get("session_id");

  // Find package details
  const pkg = packages.find((p) => p.name === name);

  const isServicePurchase = Boolean(id);

  // Fetch service details from database if service ID is provided
  useEffect(() => {
    const fetchService = async () => {
      if (!id) {
        setLoadingService(false);
        return;
      }

      try {
        const supabase = createClient();
        const { data, error: fetchError } = await supabase
          .from("services")
          .select("*")
          .eq("id", id)
          .single();

        if (fetchError || !data) {
          console.error("Error fetching service:", fetchError);
          setServiceData(null);
        } else {
          setServiceData(data);
        }
      } catch (err) {
        console.error("Error fetching service:", err);
        setServiceData(null);
      } finally {
        setLoadingService(false);
      }
    };

    fetchService();
  }, [id]);

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email) {
        setUserEmail(user.email);
        setEmailLocked(true);

        // Check if user is admin
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile?.role === "admin") {
          setIsAdmin(true);
        }
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    const confirmPayment = async () => {
      if (!sessionId || (!success && !canceled)) return;

      await fetch("/api/checkout/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          status: success ? "success" : "canceled",
        }),
      });
    };

    confirmPayment();
  }, [sessionId, success, canceled]);

  const handleCheckout = async () => {
    setError("");
    setEmailError("");

    // Prevent admins from purchasing
    if (isAdmin) {
      setError(
        "Administrators cannot purchase services. Please switch to a customer account to continue.",
      );
      return;
    }

    if (!userEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    // Check if it's a custom quote
    if (price.toLowerCase().includes("custom")) {
      setError(
        "This service requires a custom quote. Please fill out the proposal form below.",
      );
      setTimeout(() => {
        document
          .querySelector("/#proposal")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 1000);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: serviceData?.title || name,
          price:
            serviceData && serviceData.price !== null
              ? serviceData.discount && serviceData.discount > 0
                ? serviceData.price - serviceData.discount
                : serviceData.price
              : price,
          email: userEmail,
          service: serviceData?.category || "",
          id: id || "",
          method: paymentMethod,
        }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Unable to start checkout.");
      }
    } catch {
      setError("Unable to start checkout.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <section className="relative bg-gradient-to-b from-yellow-200 to-white py-20 text-center min-h-dvh">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto px-6"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Payment Successful!
            </h2>
            <p className="text-lg text-gray-700 mb-2">
              Thank you for your purchase. We&apos;ll be in touch soon.
            </p>
          </motion.div>
        </section>
      </>
    );
  }
  if (canceled) {
    return (
      <>
        <section className="relative bg-gradient-to-b from-yellow-200 to-white py-20 text-center min-h-dvh">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto px-6"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-red-700 mb-4">
              Payment Canceled
            </h2>
            <p className="text-lg text-gray-700 mb-2">
              Your payment was not completed. You can try again below.
            </p>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 bg-gray-900 text-white rounded-lg font-bold mt-6"
            >
              Go to Home
            </button>
          </motion.div>
        </section>
      </>
    );
  }

  return (
    <>
      {/* Hero-style Header */}
      <section className="relative bg-gradient-to-b from-yellow-200 to-white py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto px-6"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Checkout
          </h1>
          <p className="text-lg text-gray-700">
            Review your selected package and proceed to secure payment.
          </p>
        </motion.div>
      </section>

      {/* Main Content Card */}
      <section className="max-w-xl mx-auto pb-20 px-6">
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-4 rounded-lg border border-red-300 bg-red-50 p-4"
          >
            <p className="text-sm font-semibold text-red-700">
              ⛔ Admin Access Restricted: Administrators cannot purchase
              services. If you need to test the purchase flow, please use a
              customer account instead.
            </p>
          </motion.div>
        )}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow-lg p-8 text-center border border-yellow-100"
        >
          {loadingService ? (
            <div className="flex items-center justify-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="rounded-full h-12 w-12 border-4 border-yellow-300 border-t-gray-900"
              />
            </div>
          ) : pkg || (name && price) || serviceData ? (
            <>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {serviceData?.title || name}
                </h3>
                {pkg && <p className="text-gray-600 mb-4">{pkg.description}</p>}
                {serviceData?.details && (
                  <p className="text-gray-600 mb-4">{serviceData.details}</p>
                )}
                {isServicePurchase && serviceData && (
                  <div className="mb-4">
                    <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                      {serviceData.category === "course" && "📚 Course"}
                      {serviceData.category === "software" && "💻 IT Service"}
                      {serviceData.category === "marketing" &&
                        "📱 Marketing Service"}
                    </span>
                  </div>
                )}
                <span className="text-3xl font-bold text-[var(--primary-yellow)]">
                  {serviceData && serviceData.price !== null
                    ? serviceData.discount && serviceData.discount > 0
                      ? `৳${(serviceData.price - serviceData.discount).toFixed(0)}`
                      : `৳${serviceData.price.toFixed(0)}`
                    : price}
                </span>
                {pkg?.priceNote && (
                  <span className="text-gray-500 ml-2">/ {pkg.priceNote}</span>
                )}
              </div>
              {pkg && (
                <div className="mb-6 text-left">
                  <h4 className="font-semibold mb-2 text-gray-900">
                    Features:
                  </h4>
                  <ul className="list-disc list-inside text-gray-700">
                    {pkg.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="mb-6 text-gray-700">
                You&apos;re about to purchase{" "}
                <span className="font-bold">{serviceData?.title || name}</span>{" "}
                for{" "}
                <span className="text-[var(--primary-yellow)] font-bold">
                  {serviceData && serviceData.price !== null
                    ? `৳${(serviceData.discount && serviceData.discount > 0 ? serviceData.price - serviceData.discount : serviceData.price).toFixed(0)}`
                    : price}
                </span>
                .
              </p>
            </>
          ) : (
            <p className="mb-6 text-red-600">Invalid service selected.</p>
          )}

          {!loadingService && (
            <>
              <div className="mb-4 text-left">
                <label
                  htmlFor="checkout-email"
                  className="block text-sm font-medium text-gray-900 mb-1"
                >
                  Email Address
                </label>
                <input
                  id="checkout-email"
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-yellow-300"
                  placeholder="Enter your email address"
                  readOnly={emailLocked}
                />
                {emailLocked && (
                  <p className="mt-1 text-xs text-gray-500">
                    Logged in email is locked for checkout.
                  </p>
                )}
                {emailError && (
                  <p className="mt-1 text-sm text-red-600">{emailError}</p>
                )}
              </div>

              {/* Instant Registration Info */}
              {!emailLocked && userEmail && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-4 rounded-lg border border-green-300 bg-green-50 p-3"
                >
                  <p className="text-sm text-green-700">
                    ✨ <strong>New here?</strong> No problem! We&apos;ll
                    instantly create your account during checkout. You&apos;ll
                    receive a magic link to confirm your email and set your
                    password.
                  </p>
                </motion.div>
              )}

              {/* Payment Method Selection */}
              <div className="mb-4 text-left">
                <h4 className="mb-2 text-sm font-semibold text-gray-900">
                  Select payment method
                </h4>
                <div className="grid gap-2 sm:grid-cols-3">
                  {["Bank", "Nagad", "bKash"].map((method) => (
                    <label
                      key={method}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                        paymentMethod === method
                          ? "border-[var(--primary-yellow)] bg-yellow-50"
                          : "border-gray-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment-method"
                        value={method}
                        checked={paymentMethod === method}
                        onChange={() => setPaymentMethod(method)}
                      />
                      {method}
                    </label>
                  ))}
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h4 className="mb-3 text-sm font-semibold text-gray-900">
                  We Accept:
                </h4>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 shadow-sm">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Bank Transfer
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-orange-300 bg-white px-4 py-2 shadow-sm">
                    <Smartphone className="h-5 w-5 text-orange-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Nagad
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-pink-300 bg-white px-4 py-2 shadow-sm">
                    <CreditCard className="h-5 w-5 text-pink-600" />
                    <span className="text-sm font-medium text-gray-700">
                      bKash
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-500 text-center">
                  Secure payment processing with multiple options
                </p>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="px-6 me-4 py-3 bg-[var(--primary-yellow)] text-white rounded-lg font-bold hover:bg-[var(--secondary-yellow)] transition-colors mb-4"
              >
                {loading ? "Redirecting..." : "Proceed to Payment"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg font-bold hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
              {error && <p className="mt-4 text-red-600">{error}</p>}
            </>
          )}
        </motion.div>
      </section>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutPageContent />
    </Suspense>
  );
}
