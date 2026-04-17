"use client";

import { createClient } from "@/app/utils/supabase/client";
import { getServicePricing } from "@/app/utils/services/pricing";
import ServiceCard, { ServiceCardSkeleton } from "@/components/shared/ServiceCard";
import { motion } from "framer-motion";
import { BookOpen, Megaphone, Zap } from "lucide-react";
import { useEffect, useState } from "react";

interface Service {
  id: string;
  title: string;
  slug: string;
  category: "course" | "software" | "marketing";
  price: number | null;
  discount: number | null;
  currency: string;
  details: string | null;
  key_features: string[];
  featured_image_url: string;
}

const categoryConfig = {
  course: {
    label: "Courses",
    path: "courses",
    icon: BookOpen,
    color: "from-blue-500 to-blue-600",
    badgeClassName: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    ctaLabel: "Enroll Now",
  },
  software: {
    label: "IT Services",
    path: "software",
    icon: Zap,
    color: "from-purple-500 to-purple-600",
    badgeClassName: "bg-purple-100 text-purple-800 hover:bg-purple-100",
    ctaLabel: "Purchase Now",
  },
  marketing: {
    label: "Marketing Services",
    path: "marketing",
    icon: Megaphone,
    color: "from-pink-500 to-pink-600",
    badgeClassName: "bg-green-100 text-green-800 hover:bg-green-100",
    ctaLabel: "Get Started",
  },
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const loadServices = async () => {
      try {
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setServices(data || []);
      } catch (error) {
        console.error("Error loading services:", error);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, [supabase]);

  const groupedServices = {
    course: services.filter((s) => s.category === "course"),
    software: services.filter((s) => s.category === "software"),
    marketing: services.filter((s) => s.category === "marketing"),
  };

  const renderCategory = (
    key: keyof typeof groupedServices,
    services: Service[],
  ) => {
    const config = categoryConfig[key];
    const Icon = config.icon;

    if (services.length === 0) return null;

    return (
      <motion.section
        key={key}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, margin: "-50px" }}
        className="py-16 border-b border-gray-100 last:border-0"
      >
        <div className="flex items-center gap-4 mb-12">
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            viewport={{ once: true }}
            className={`p-4 bg-gradient-to-br ${config.color} rounded-xl shadow-lg`}
          >
            <Icon className="h-8 w-8 text-white" />
          </motion.div>
          <div>
            <h2 className="text-4xl font-bold text-gray-900">{config.label}</h2>
            <p className="text-gray-600 mt-1 text-lg">
              {services.length}{" "}
              {services.length === 1 ? "offering" : "offerings"} available
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-50px" }}
              className="group"
            >
              {(() => {
                const pricing = getServicePricing(service.price, service.discount);

                return (
                  <ServiceCard
                    key={service.id}
                    id={service.id}
                    title={service.title}
                    description={service.details}
                    features={service.key_features}
                    imageUrl={service.featured_image_url}
                    categoryLabel={
                      key === "course"
                        ? "Course"
                        : key === "software"
                          ? "Software"
                          : "Marketing"
                    }
                    categoryClassName={config.badgeClassName}
                    detailHref={`/${config.path}/${service.slug}`}
                    ctaHref={`/checkout?service=${service.id}`}
                    ctaLabel={config.ctaLabel}
                    priceLabel={
                      pricing.discountedPrice !== null
                        ? `৳${pricing.discountedPrice.toFixed(0)}`
                        : null
                    }
                    originalPriceLabel={
                      pricing.hasDiscount
                        ? `৳${pricing.originalPrice!.toFixed(0)}`
                        : null
                    }
                    priceNote={
                      pricing.hasDiscount
                        ? `Save ৳${pricing.savingsAmount!.toFixed(0)} • ${pricing.savingsPercent}% off`
                        : null
                    }
                  />
                );
              })()}
            </motion.div>
          ))}
        </div>
      </motion.section>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <section className="relative overflow-hidden bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-100 py-24">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-yellow-400 opacity-20 blur-3xl" />
            <div className="absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-orange-400 opacity-20 blur-3xl" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <div className="mx-auto mb-6 h-10 w-52 rounded-full bg-white/70" />
              <div className="mx-auto mb-6 h-16 w-full max-w-xl rounded bg-white/70" />
              <div className="mx-auto h-6 w-full max-w-3xl rounded bg-white/60" />
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <motion.div
                key={`services-page-skeleton-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <ServiceCardSkeleton />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const hasServices = Object.values(groupedServices).some(
    (cat) => cat.length > 0,
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-100 py-24">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-yellow-400 opacity-20 blur-3xl" />
          <div className="absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-orange-400 opacity-20 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-block mb-6 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-lg"
            >
              Comprehensive Solutions
            </motion.span>

            <h1 className="mb-6 text-5xl font-bold text-gray-900 md:text-6xl lg:text-7xl">
              Our{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600">
                Services
              </span>
            </h1>

            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Explore our comprehensive range of training courses, software
              solutions, and marketing services designed to accelerate your
              success.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        {/* Categories */}
        {hasServices ? (
          <>
            {renderCategory("course", groupedServices.course)}
            {renderCategory("software", groupedServices.software)}
            {renderCategory("marketing", groupedServices.marketing)}
          </>
        ) : (
          <div className="min-h-96 flex flex-col items-center justify-center text-center py-20">
            <div className="text-6xl mb-6">🚀</div>
            <h3 className="text-3xl font-bold text-gray-900 mb-3">
              Coming Soon
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl">
              We&apos;re preparing exciting services for you. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
