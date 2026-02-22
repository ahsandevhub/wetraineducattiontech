"use client";

import { createClient } from "@/app/utils/supabase/client";
import { motion } from "framer-motion";
import { BookOpen, Megaphone, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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
  },
  software: {
    label: "IT Services",
    path: "software",
    icon: Zap,
    color: "from-purple-500 to-purple-600",
  },
  marketing: {
    label: "Marketing Services",
    path: "marketing",
    icon: Megaphone,
    color: "from-pink-500 to-pink-600",
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
              <Link href={`/${config.path}/${service.slug}`} className="block">
                <div className="h-full flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-xl hover:border-yellow-300">
                  {/* Image Container */}
                  <div className="relative h-52 bg-gradient-to-br from-yellow-100 to-orange-100 overflow-hidden">
                    {service.featured_image_url ? (
                      <Image
                        src={service.featured_image_url}
                        alt={service.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">
                        {key === "course"
                          ? "📚"
                          : key === "software"
                            ? "💻"
                            : "📈"}
                      </div>
                    )}
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col p-6">
                    <div className="mb-2">
                      <span className="text-xs font-semibold text-yellow-600 uppercase tracking-wider">
                        {config.label}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-yellow-600 transition-colors mb-3 line-clamp-2">
                      {service.title}
                    </h3>

                    {service.details && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">
                        {service.details}
                      </p>
                    )}

                    {/* Features */}
                    {service.key_features &&
                      service.key_features.length > 0 && (
                        <ul className="mb-4 space-y-2 border-t border-gray-100 pt-4">
                          {service.key_features
                            .slice(0, 3)
                            .map((feature, idx) => (
                              <li
                                key={idx}
                                className="text-sm text-gray-600 flex items-start gap-2"
                              >
                                <span className="text-yellow-600 font-bold mt-0.5 flex-shrink-0">
                                  ✓
                                </span>
                                <span className="line-clamp-1">{feature}</span>
                              </li>
                            ))}
                        </ul>
                      )}

                    {/* Pricing */}
                    {service.price !== null && (
                      <div className="mb-4 pb-4 border-b border-gray-100">
                        <div className="flex items-baseline gap-2">
                          {service.discount && service.discount > 0 ? (
                            <>
                              <span className="text-2xl font-bold text-gray-900">
                                ৳{(service.price - service.discount).toFixed(0)}
                              </span>
                              <span className="text-base text-gray-500 line-through">
                                ৳{service.price.toFixed(0)}
                              </span>
                            </>
                          ) : (
                            <span className="text-2xl font-bold text-gray-900">
                              ৳{service.price.toFixed(0)}
                            </span>
                          )}
                        </div>
                        {service.discount && service.discount > 0 && (
                          <p className="text-sm text-green-600 font-semibold mt-1">
                            Save ৳{service.discount.toFixed(0)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Link>

              {/* Separate Enroll Now Button */}
              <Link
                href={`/checkout?service=${service.id}`}
                onClick={(e) => e.stopPropagation()}
                className="mt-4 block w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-center font-bold rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg"
              >
                Enroll Now
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500" />
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
