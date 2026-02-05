// components/MarketingServicesSection.tsx
"use client";

import { createClient } from "@/app/utils/supabase/client";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Mail,
  MessageCircle,
  Send,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface MarketingService {
  id: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  imageUrl?: string;
  features: string[];
  price: string;
  priceNote: string;
  popular?: boolean;
}

const fallbackServices: MarketingService[] = [
  {
    id: "whatsapp-service",
    title: "WhatsApp Business Service",
    description:
      "Reach customers directly with WhatsApp Business API integration. Automated messages, customer support, and marketing campaigns.",
    icon: <MessageCircle className="h-8 w-8" />,
    features: [
      "WhatsApp Business API setup",
      "Automated message templates",
      "Customer chat management",
      "Broadcast campaigns",
      "Chatbot integration",
      "Analytics & reporting",
      "Multi-agent support",
      "24/7 availability",
    ],
    price: "৳9,999",
    priceNote: "per month",
    popular: true,
  },
  {
    id: "bulk-sms-service",
    title: "Bulk SMS Service",
    description:
      "Send promotional & transactional SMS to thousands of customers instantly. Perfect for marketing campaigns and notifications.",
    icon: <Mail className="h-8 w-8" />,
    features: [
      "Bulk SMS sending",
      "Masking & non-masking SMS",
      "API integration",
      "Contact list management",
      "Delivery reports",
      "Schedule campaigns",
      "Two-way SMS",
      "Competitive pricing",
    ],
    price: "৳0.25",
    priceNote: "per SMS (bulk rates)",
    popular: false,
  },
  {
    id: "marketing-service",
    title: "Digital Marketing Service",
    description:
      "Complete digital marketing solutions including social media marketing, SEO, content creation, and paid advertising campaigns.",
    icon: <TrendingUp className="h-8 w-8" />,
    features: [
      "Social media management",
      "Facebook & Instagram ads",
      "Google Ads campaigns",
      "SEO optimization",
      "Content creation",
      "Email marketing",
      "Analytics & reports",
      "Monthly strategy calls",
    ],
    price: "৳19,999",
    priceNote: "per month",
    popular: false,
  },
  {
    id: "wesend-service",
    title: "WeSend - Delivery Management",
    description:
      "Complete delivery & logistics management platform. Track orders, manage riders, real-time GPS tracking, and customer notifications.",
    icon: <Send className="h-8 w-8" />,
    features: [
      "Order management dashboard",
      "Real-time GPS tracking",
      "Rider management",
      "Auto order assignment",
      "Customer notifications",
      "Proof of delivery",
      "Route optimization",
      "Performance analytics",
    ],
    price: "৳14,999",
    priceNote: "per month",
    popular: false,
  },
  {
    id: "leadpilot-service",
    title: "Leadpilot - Lead Management",
    description:
      "Advanced CRM & lead management system. Capture, track, nurture leads from multiple channels and convert them to customers.",
    icon: <Target className="h-8 w-8" />,
    features: [
      "Lead capture forms",
      "Multi-channel integration",
      "Lead scoring & segmentation",
      "Automated follow-ups",
      "Sales pipeline management",
      "Email & SMS campaigns",
      "Team collaboration",
      "Conversion analytics",
    ],
    price: "৳12,999",
    priceNote: "per month",
    popular: false,
  },
  {
    id: "influencer-marketing",
    title: "Influencer Marketing",
    description:
      "Connect with the right influencers for your brand. Campaign management, content creation, and performance tracking.",
    icon: <Users className="h-8 w-8" />,
    features: [
      "Influencer discovery",
      "Campaign strategy",
      "Content collaboration",
      "Contract management",
      "Performance tracking",
      "ROI measurement",
      "Multi-platform campaigns",
      "Reporting & insights",
    ],
    price: "Custom Quote",
    priceNote: "based on campaign",
    popular: false,
  },
];

export default function MarketingServicesSection() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [services, setServices] =
    useState<MarketingService[]>(fallbackServices);

  const formatPrice = (price: number | null, currency: string) => {
    if (price === null) return "Custom Quote";
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(price);
  };

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile?.role === "admin") {
          setIsAdmin(true);
        }
      }

      const { data } = await supabase
        .from("services")
        .select(
          "id, title, details, key_features, featured_image_url, price, discount, currency",
        )
        .eq("category", "marketing")
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        const mapped: MarketingService[] = data.map((service) => ({
          id: service.id as string,
          title: service.title ?? "",
          description: service.details ?? "",
          features: Array.isArray(service.key_features)
            ? service.key_features
            : [],
          price: formatPrice(
            service.price === null ? null : Number(service.price),
            service.currency ?? "BDT",
          ),
          priceNote:
            service.discount !== null && service.discount !== undefined
              ? `Save ${service.discount}%`
              : "",
          imageUrl: service.featured_image_url ?? undefined,
          popular: false,
        }));
        setServices(mapped);
      }
    };

    loadData();
  }, []);

  return (
    <section
      id="marketing-services"
      className="relative overflow-hidden bg-gradient-to-b from-yellow-50 to-orange-50 py-24"
      aria-labelledby="marketing-services-heading"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-0 top-0 h-full w-full opacity-5" />
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-orange-400 opacity-10 blur-3xl" />
        <div className="absolute -right-40 bottom-40 h-96 w-96 rounded-full bg-yellow-400 opacity-10 blur-3xl" />
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
          <span className="mb-4 inline-block rounded-full bg-orange-500/10 px-4 py-2 text-sm font-medium text-orange-600">
            Marketing & Communication
          </span>
          <h2
            id="marketing-services-heading"
            className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl"
          >
            Marketing &{" "}
            <span className="text-orange-600">Communication Services</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Powerful marketing tools to reach your customers. From WhatsApp to
            bulk SMS, lead management to delivery tracking—everything you need
            to grow.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-50px" }}
              className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-xl ${
                service.popular
                  ? "border-orange-400 ring-2 ring-orange-400/20"
                  : "border-gray-200 hover:border-orange-300"
              }`}
            >
              {/* Popular Badge */}
              {service.popular && (
                <div className="absolute right-4 top-4 z-10 flex items-center gap-1 rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white">
                  <Sparkles className="h-3 w-3" />
                  POPULAR
                </div>
              )}

              <div className="flex flex-1 flex-col p-6">
                {/* Icon */}
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 text-white">
                  {service.imageUrl ? (
                    <Image
                      src={service.imageUrl}
                      alt={service.title}
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  ) : (
                    service.icon
                  )}
                </div>

                {/* Title & Description */}
                <h3 className="mb-3 text-xl font-bold text-gray-900">
                  {service.title}
                </h3>
                <p className="mb-6 text-gray-600">{service.description}</p>

                {/* Features */}
                <div className="mb-6 flex-1">
                  <p className="mb-3 text-sm font-semibold text-gray-700">
                    What&apos;s Included:
                  </p>
                  <ul className="space-y-2">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-500" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Price & CTA */}
                <div className="border-t border-gray-100 pt-4">
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-orange-600">
                      {service.price}
                    </span>
                    {service.priceNote ? (
                      <span className="ml-2 text-sm text-gray-500">
                        {service.priceNote}
                      </span>
                    ) : null}
                  </div>
                  {service.id === "influencer-marketing" ? (
                    <a
                      href="#proposal"
                      className="block w-full rounded-lg bg-gradient-to-r from-orange-500 to-yellow-500 py-3 text-center font-bold text-white transition-all hover:from-orange-600 hover:to-yellow-600 hover:shadow-lg"
                    >
                      Get Quote
                    </a>
                  ) : isAdmin ? (
                    <button
                      disabled
                      className="block w-full rounded-lg bg-gray-400 py-3 text-center font-bold text-gray-600 cursor-not-allowed"
                      title="Admins cannot purchase"
                    >
                      Get Started
                    </button>
                  ) : (
                    <Link
                      href={`/checkout?service=marketing&name=${encodeURIComponent(service.title)}&price=${encodeURIComponent(service.price)}&id=${service.id}`}
                      className="block w-full rounded-lg bg-gradient-to-r from-orange-500 to-yellow-500 py-3 text-center font-bold text-white transition-all hover:from-orange-600 hover:to-yellow-600 hover:shadow-lg"
                    >
                      Get Started
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16 rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 p-8"
        >
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="mb-3 text-2xl font-bold text-gray-900">
                Need Multiple Services?
              </h3>
              <p className="text-gray-600">
                Save up to 30% when you bundle multiple marketing services.
                Contact us for a custom package tailored to your business.
              </p>
            </div>
            <div className="flex items-center justify-center md:justify-end">
              <a
                href="#proposal"
                className="inline-block rounded-xl border border-orange-400 bg-white px-8 py-3 font-bold text-orange-600 transition-all hover:bg-orange-50 hover:shadow-lg"
              >
                Request Custom Package
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
