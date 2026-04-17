// components/ITServicesSection.tsx
"use client";

import { createClient } from "@/app/utils/supabase/client";
import { formatServiceCurrency, getServicePricing } from "@/app/utils/services/pricing";
import ServiceCard, { ServiceCardSkeleton } from "@/components/shared/ServiceCard";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

interface ITService {
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

export default function ITServicesSection() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [services, setServices] = useState<ITService[]>([]);
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
        .eq("category", "software")
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        const mapped: ITService[] = data.map((service) => {
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
    <section
      id="it-services"
      className="relative overflow-hidden bg-white py-24"
      aria-labelledby="it-services-heading"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-0 top-0 h-full w-full bg-[url('/wireframe.png')] opacity-5" />
        <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-yellow-400 opacity-5 blur-3xl" />
        <div className="absolute -left-40 bottom-40 h-96 w-96 rounded-full bg-orange-400 opacity-5 blur-3xl" />
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
          <span className="mb-4 inline-block rounded-full bg-yellow-500/10 px-4 py-2 text-sm font-medium text-yellow-600">
            IT Services & Software
          </span>
          <h2
            id="it-services-heading"
            className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl"
          >
            Enterprise{" "}
            <span className="text-yellow-600">Software Solutions</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Custom software development tailored to your business needs. From
            school management to e-commerce, we build solutions that scale.
          </p>
        </motion.div>

        {/* Services Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <motion.div
                key={`software-skeleton-${index}`}
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
            {services.slice(0, 3).map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-50px" }}
                className="h-full"
              >
                <ServiceCard
                  id={service.id}
                  title={service.title}
                  description={service.description}
                  features={service.features}
                  imageUrl={service.imageUrl}
                  categoryLabel="Software"
                  categoryClassName="bg-purple-100 text-purple-800 hover:bg-purple-100"
                  detailHref={`/software/${service.slug}`}
                  ctaHref={
                    isAdmin
                      ? undefined
                      : service.id === "custom-software"
                        ? "/#proposal"
                        : `/software/${service.slug}`
                  }
                  ctaLabel={
                    service.id === "custom-software"
                      ? "Request Quote"
                      : "Purchase Now"
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
            <div className="text-6xl mb-6">💻</div>
            <h3 className="text-3xl font-bold text-gray-900 mb-3">
              Coming Soon
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl">
              We&apos;re building amazing software solutions for you. Stay
              tuned!
            </p>
          </div>
        )}

        {/* Bottom Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16 rounded-2xl border border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 p-8 text-center space-y-6"
        >
          {services.length > 3 && (
            <Link
              href="/software"
              className="inline-block rounded-xl bg-yellow-600 px-8 py-3 font-bold text-white transition-all hover:bg-yellow-700 hover:shadow-lg"
            >
              View All IT Services
            </Link>
          )}
          <div>
            <h3 className="mb-3 text-2xl font-bold text-gray-900">
              Need a Custom Solution?
            </h3>
            <p className="mb-6 text-lg text-gray-600">
              Every business is unique. Let&apos;s discuss your specific
              requirements and build the perfect solution.
            </p>
            <Link
              href="/#proposal"
              className="inline-block rounded-xl border border-yellow-400 bg-white px-8 py-3 font-bold text-yellow-600 transition-all hover:bg-yellow-50 hover:shadow-lg"
            >
              Schedule Consultation
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
