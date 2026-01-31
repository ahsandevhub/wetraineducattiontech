// components/Packages.tsx
"use client";

import { motion } from "framer-motion";
import { CheckCircle, Star } from "lucide-react";
import Link from "next/link";

interface Package {
  name: string;
  price: string;
  priceNote?: string;
  description: string;
  features: string[];
  popular: boolean;
  ctaHref: string;
  ctaLabel: string;
}

const packages: Package[] = [
  {
    name: "Starter",
    price: "৳3,999",
    priceNote: "per month",
    description:
      "Perfect for growing businesses: Course Add + WhatsApp messaging + basic email support.",
    features: [
      "Course Add platform access",
      "WhatsApp Service integration",
      "Basic IT support",
      "Monthly analytics report",
      "Payment integration (Bank, Nagad, bKash)",
    ],
    popular: false,
    ctaHref: "#contact",
    ctaLabel: "Choose Starter",
  },
  {
    name: "Professional",
    price: "৳9,999",
    priceNote: "per month",
    description:
      "Scale faster: Full marketing suite + Bulk SMS + WeSend + advanced integrations.",
    features: [
      "All Starter features included",
      "Marketing Service (campaigns & strategy)",
      "Bulk SMS Service for campaigns",
      "WeSend delivery platform",
      "Advanced IT support (24/7)",
      "Priority analytics & reporting",
    ],
    popular: true,
    ctaHref: "#contact",
    ctaLabel: "Start Professional",
  },
  {
    name: "Enterprise",
    price: "Custom",
    priceNote: "talk to sales",
    description:
      "Complete platform access: All services including Leadpilot + dedicated support team.",
    features: [
      "All Professional features included",
      "Leadpilot lead management system",
      "Dedicated account manager",
      "Custom integrations & API access",
      "Enterprise-level IT infrastructure",
      "Multi-channel campaign orchestration",
    ],
    popular: false,
    ctaHref: "#proposal",
    ctaLabel: "Get Enterprise Quote",
  },
];

export default function Packages() {
  return (
    <section
      id="pricing"
      className="relative overflow-hidden border-b-2 border-yellow-200/50 bg-[var(--tertiary-yellow)] py-24"
      aria-labelledby="pricing-heading"
    >
      {/* Background accents */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-0 top-0 h-full w-full bg-[url('/wireframe.png')] opacity-10" />
        <div className="absolute -left-20 top-1/4 h-80 w-80 rounded-full bg-[var(--primary-yellow)] opacity-10 blur-[100px]" />
        <div className="absolute -right-20 bottom-1/3 h-80 w-80 rounded-full bg-[var(--secondary-yellow)] opacity-10 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <span className="mb-4 inline-block rounded-full bg-[var(--primary-yellow)]/10 px-4 py-2 text-sm font-medium text-[var(--primary-yellow)]">
            Simple Pricing
          </span>
          <h2
            id="pricing-heading"
            className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl"
          >
            Choose your{" "}
            <span className="text-[var(--primary-yellow)]">plan</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Transparent pricing for all our integrated services. Start small,
            scale up anytime—no long-term contracts.
          </p>
        </motion.div>

        {/* Package Cards */}
        <div className="mb-20 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-50px" }}
              whileHover={{ y: -10 }}
              className={`relative rounded-xl border bg-white transition-all ${
                pkg.popular
                  ? "border-[var(--primary-yellow)] shadow-lg"
                  : "border-gray-200 shadow-md"
              }`}
            >
              {pkg.popular && (
                <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-3 transform rounded-full bg-[var(--primary-yellow)] px-4 py-1 text-sm font-bold text-white">
                  <span className="inline-flex items-center">
                    <Star className="mr-1 h-4 w-4 fill-white" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="flex h-full flex-col p-8">
                <div className="mb-6">
                  <h3 className="mb-2 text-2xl font-bold text-gray-900">
                    {pkg.name}
                  </h3>
                  <p className="text-gray-600">{pkg.description}</p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-[var(--primary-yellow)]">
                    {pkg.price}
                  </span>{" "}
                  {pkg.priceNote && (
                    <span className="text-gray-500">/ {pkg.priceNote}</span>
                  )}
                </div>

                <ul className="mb-8 flex-grow space-y-3">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <CheckCircle className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--primary-yellow)]" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {pkg.name === "Scale" ? (
                  <a href="#proposal">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full cursor-pointer rounded-lg py-3 font-bold transition-colors ${
                        pkg.popular
                          ? "bg-[var(--primary-yellow)] text-white hover:bg-[var(--secondary-yellow)]"
                          : "bg-gray-900 text-white hover:bg-gray-800"
                      }`}
                      aria-label={pkg.ctaLabel}
                    >
                      {pkg.ctaLabel}
                    </motion.button>
                  </a>
                ) : (
                  <Link
                    href={`/checkout?name=${encodeURIComponent(
                      pkg.name,
                    )}&price=${encodeURIComponent(pkg.price)}`}
                    passHref
                  >
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full cursor-pointer rounded-lg py-3 font-bold transition-colors ${
                        pkg.popular
                          ? "bg-[var(--primary-yellow)] text-white hover:bg-[var(--secondary-yellow)]"
                          : "bg-gray-900 text-white hover:bg-gray-800"
                      }`}
                      aria-label={pkg.ctaLabel}
                    >
                      {pkg.ctaLabel}
                    </motion.button>
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
