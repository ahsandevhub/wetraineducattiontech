"use client";

import { createClient } from "@/app/utils/supabase/client";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import Image from "next/image";
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
  priceNote: string;
  popular?: boolean;
}

export default function ITServicesPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [services, setServices] = useState<ITService[]>([]);

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
          "id, slug, title, details, key_features, featured_image_url, price, discount, currency",
        )
        .eq("category", "software")
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        const mapped: ITService[] = data.map((service) => ({
          id: service.id as string,
          slug: service.slug as string,
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
    <div className="min-h-screen bg-white">
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
            <h1
              id="it-services-heading"
              className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl"
            >
              Enterprise{" "}
              <span className="text-yellow-600">Software Solutions</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Custom software development tailored to your business needs. From
              school management to e-commerce, we build solutions that scale.
            </p>
          </motion.div>

          {/* Services Grid */}
          {services.length > 0 ? (
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
                      ? "border-yellow-400 ring-2 ring-yellow-400/20"
                      : "border-gray-200 hover:border-yellow-300"
                  }`}
                >
                  {/* Popular Badge */}
                  {service.popular && (
                    <div className="absolute right-4 top-4 z-10 rounded-full bg-yellow-500 px-3 py-1 text-xs font-bold text-white">
                      POPULAR
                    </div>
                  )}

                  <div className="flex flex-1 flex-col p-6">
                    {/* Icon / Image (Video aspect) */}
                    <div className="mb-4">
                      {service.imageUrl ? (
                        <div className="relative w-full overflow-hidden rounded-xl bg-gray-100">
                          <div className="relative aspect-video w-full">
                            <Image
                              src={service.imageUrl}
                              alt=""
                              fill
                              sizes="(max-width: 768px) 100vw, 33vw"
                              className="scale-110 object-cover blur-2xl"
                              priority={false}
                            />
                            <div className="absolute inset-0 bg-black/10" />

                            <Image
                              src={service.imageUrl}
                              alt={service.title}
                              fill
                              sizes="(max-width: 768px) 100vw, 33vw"
                              className="object-contain"
                              priority={false}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
                          {service.icon}
                        </div>
                      )}
                    </div>

                    <h3 className="mb-3 text-xl font-bold text-gray-900">
                      {service.title}
                    </h3>
                    <p className="mb-6 text-gray-600">{service.description}</p>

                    <div className="mb-6 flex-1">
                      <p className="mb-3 text-sm font-semibold text-gray-700">
                        Key Features:
                      </p>
                      <ul className="space-y-2">
                        {service.features.map((feature, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm"
                          >
                            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-500" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                      <div className="mb-4">
                        <span className="text-3xl font-bold text-yellow-600">
                          {service.price}
                        </span>
                        {service.priceNote ? (
                          <span className="ml-2 text-sm text-gray-500">
                            {service.priceNote}
                          </span>
                        ) : null}
                      </div>

                      {service.id === "custom-software" ? (
                        <a
                          href="#proposal"
                          className="block w-full rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 py-3 text-center font-bold text-white transition-all hover:from-yellow-600 hover:to-orange-600 hover:shadow-lg"
                        >
                          Request Quote
                        </a>
                      ) : isAdmin ? (
                        <button
                          disabled
                          className="block w-full cursor-not-allowed rounded-lg bg-gray-400 py-3 text-center font-bold text-gray-600"
                          title="Admins cannot purchase"
                        >
                          Purchase Now
                        </button>
                      ) : (
                        <Link
                          href={`/software/${service.slug}`}
                          className="block w-full rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 py-3 text-center font-bold text-white transition-all hover:from-yellow-600 hover:to-orange-600 hover:shadow-lg"
                        >
                          Purchase Now
                        </Link>
                      )}
                    </div>
                  </div>
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
            <div>
              <h3 className="mb-3 text-2xl font-bold text-gray-900">
                Need a Custom Solution?
              </h3>
              <p className="mb-6 text-lg text-gray-600">
                Every business is unique. Let&apos;s discuss your specific
                requirements and build the perfect solution.
              </p>
              <a
                href="#proposal"
                className="inline-block rounded-xl border border-yellow-400 bg-white px-8 py-3 font-bold text-yellow-600 transition-all hover:bg-yellow-50 hover:shadow-lg"
              >
                Schedule Consultation
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
