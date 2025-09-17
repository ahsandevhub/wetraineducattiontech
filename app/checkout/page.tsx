"use client";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

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

  // Get package info from query params
  const name = searchParams.get("name") || "";
  const price = searchParams.get("price") || "";
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  // Find package details
  const pkg = packages.find((p) => p.name === name);

  const handleCheckout = async () => {
    setError("");
    setEmailError("");
    if (!userEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price, email: userEmail }),
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
        <section className="relative bg-gradient-to-b from-yellow-200 to-white py-20 text-center">
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
        <section className="relative bg-gradient-to-b from-yellow-200 to-white py-20 text-center">
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow-lg p-8 text-center border border-yellow-100"
        >
          {pkg ? (
            <>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {pkg.name} Package
                </h3>
                <p className="text-gray-600 mb-4">{pkg.description}</p>
                <span className="text-3xl font-bold text-[var(--primary-yellow)]">
                  {pkg.price}
                </span>
                {pkg.priceNote && (
                  <span className="text-gray-500 ml-2">/ {pkg.priceNote}</span>
                )}
              </div>
              <div className="mb-6 text-left">
                <h4 className="font-semibold mb-2 text-gray-900">Features:</h4>
                <ul className="list-disc list-inside text-gray-700">
                  {pkg.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </div>
              <p className="mb-6 text-gray-700">
                You&apos;re about to purchase{" "}
                <span className="font-bold">{pkg.name}</span> for{" "}
                <span className="text-[var(--primary-yellow)] font-bold">
                  {pkg.price}
                </span>
                .
              </p>
            </>
          ) : (
            <p className="mb-6 text-red-600">Invalid package selected.</p>
          )}
          {/* Email input */}
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
            />
            {emailError && (
              <p className="mt-1 text-sm text-red-600">{emailError}</p>
            )}
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
