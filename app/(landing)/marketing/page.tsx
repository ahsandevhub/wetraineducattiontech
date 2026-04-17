"use client";

import { createClient } from "@/app/utils/supabase/client";
import { formatServiceCurrency, getServicePricing } from "@/app/utils/services/pricing";
import ServiceCard, { ServiceCardSkeleton } from "@/components/shared/ServiceCard";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

interface MarketingService {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  imageUrl?: string;
  features: string[];
  price: string;
  originalPrice: string | null;
  priceNote: string;
  popular?: boolean;
}

export default function MarketingServicesPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [services, setServices] = useState<MarketingService[]>([]);
  const [loading, setLoading] = useState(true);

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
          "id, slug, title, details, key_features, featured_image_url, price, discount, currency",
        )
        .eq("category", "marketing")
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        const mapped: MarketingService[] = data.map((service) => {
          const pricing = getServicePricing(
            service.price === null ? null : Number(service.price),
            service.discount === null ? null : Number(service.discount),
          );

          return {
            id: service.id as string,
            slug: service.slug as string,
            title: service.title ?? "",
            description: service.details ?? "",
            features: Array.isArray(service.key_features)
              ? service.key_features
              : [],
            price: formatServiceCurrency(
              pricing.discountedPrice,
              service.currency ?? "BDT",
            ),
            originalPrice: pricing.hasDiscount
              ? formatServiceCurrency(
                  pricing.originalPrice,
                  service.currency ?? "BDT",
                )
              : null,
            priceNote: pricing.hasDiscount
              ? `Save ৳${pricing.savingsAmount} • ${pricing.savingsPercent}% off`
              : "",
            imageUrl: service.featured_image_url ?? undefined,
            popular: false,
          };
        });
        setServices(mapped);
      }
      setLoading(false);
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-white">
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
            <h1
              id="marketing-services-heading"
              className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl"
            >
              Marketing &{" "}
              <span className="text-orange-600">Communication Services</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Powerful marketing tools to reach your customers. From WhatsApp to
              bulk SMS, lead management to delivery tracking—everything you need
              to grow.
            </p>
          </motion.div>

          {/* Services Grid */}
          {loading ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <motion.div
                  key={`marketing-page-skeleton-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <ServiceCardSkeleton />
                </motion.div>
              ))}
            </div>
          ) : services.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true, margin: "-50px" }}
                className="h-full"
              >
                <ServiceCard
                  key={service.id}
                  id={service.id}
                  title={service.title}
                  description={service.description}
                  features={service.features}
                  imageUrl={service.imageUrl}
                  categoryLabel="Marketing"
                  categoryClassName="bg-green-100 text-green-800 hover:bg-green-100"
                  detailHref={`/marketing/${service.slug}`}
                  ctaHref={
                    isAdmin
                      ? undefined
                      : service.id === "influencer-marketing"
                        ? "/#proposal"
                        : `/marketing/${service.slug}`
                  }
                  ctaLabel={
                    service.id === "influencer-marketing"
                      ? "Get Quote"
                      : "Get Started"
                  }
                  ctaDisabled={isAdmin}
                  ctaTitle={isAdmin ? "Admins cannot purchase" : undefined}
                  priceLabel={service.price}
                  originalPriceLabel={service.originalPrice}
                  priceNote={service.priceNote}
                />
              </motion.div>
            ))}
          </div>
          ) : (
            <div className="min-h-96 flex flex-col items-center justify-center text-center py-20">
              <div className="text-6xl mb-6">📣</div>
              <h3 className="text-3xl font-bold text-gray-900 mb-3">
                Coming Soon
              </h3>
              <p className="text-xl text-gray-600 max-w-2xl">
                We&apos;re crafting powerful marketing services to boost your
                business. Coming soon!
              </p>
            </div>
          )}

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
                <Link
                  href="/#proposal"
                  className="inline-block rounded-xl border border-orange-400 bg-white px-8 py-3 font-bold text-orange-600 transition-all hover:bg-orange-50 hover:shadow-lg"
                >
                  Request Custom Package
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
