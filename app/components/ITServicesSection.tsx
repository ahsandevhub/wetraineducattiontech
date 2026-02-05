// components/ITServicesSection.tsx
"use client";

import { createClient } from "@/app/utils/supabase/client";
import { motion } from "framer-motion";
import {
  Building2,
  CheckCircle2,
  Globe,
  GraduationCap,
  Laptop,
  ShoppingCart,
  Store,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface ITService {
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

const fallbackServices: ITService[] = [
  {
    id: "school-management",
    title: "School Management System",
    description:
      "Complete school administration solution with student management, attendance tracking, fee management, exam system, and parent portal.",
    icon: <GraduationCap className="h-8 w-8" />,
    features: [
      "Student & staff management",
      "Attendance & leave tracking",
      "Fee & payment management",
      "Exam & grade management",
      "Parent-teacher portal",
      "SMS & email notifications",
      "Report card generation",
      "Library management",
      "Mobile app access",
    ],
    price: "৳49,999",
    priceNote: "one-time + hosting",
    popular: true,
  },
  {
    id: "ecommerce-website",
    title: "E-Commerce Website",
    description:
      "Full-featured online store with product catalog, shopping cart, payment gateway integration, order management, and admin dashboard.",
    icon: <ShoppingCart className="h-8 w-8" />,
    features: [
      "Product catalog & categories",
      "Shopping cart & wishlist",
      "Multiple payment gateways",
      "Order tracking system",
      "Inventory management",
      "Customer accounts",
      "Coupon & discount system",
      "Sales analytics",
      "Mobile responsive design",
    ],
    price: "৳39,999",
    priceNote: "one-time + hosting",
  },
  {
    id: "supershop-pos",
    title: "Supershop POS System",
    description:
      "Advanced point-of-sale system for retail stores with inventory management, barcode scanning, billing, and sales reporting.",
    icon: <Store className="h-8 w-8" />,
    features: [
      "Barcode scanner integration",
      "Fast billing & invoicing",
      "Inventory management",
      "Multiple payment methods",
      "Daily sales reports",
      "Supplier management",
      "Stock alerts & reorder",
      "Employee management",
      "Cloud backup",
    ],
    price: "৳35,999",
    priceNote: "one-time + support",
  },
  {
    id: "corporate-website",
    title: "Corporate Website",
    description:
      "Professional business website with CMS, SEO optimization, contact forms, service showcase, and responsive design.",
    icon: <Building2 className="h-8 w-8" />,
    features: [
      "Custom responsive design",
      "Content management system",
      "SEO optimized",
      "Contact & inquiry forms",
      "Service/product showcase",
      "Blog & news section",
      "Social media integration",
      "Google Analytics",
      "Fast loading & secure",
    ],
    price: "৳24,999",
    priceNote: "one-time + hosting",
  },
  {
    id: "custom-software",
    title: "Custom Software Solution",
    description:
      "Tailored software development for your unique business needs. ERP, CRM, HRM, or any custom application.",
    icon: <Laptop className="h-8 w-8" />,
    features: [
      "Custom requirement analysis",
      "Scalable architecture",
      "User-friendly interface",
      "Database design & optimization",
      "Third-party integrations",
      "Training & documentation",
      "Ongoing support",
      "Regular updates",
      "Security & backup",
    ],
    price: "Custom Quote",
    priceNote: "based on requirements",
  },
  {
    id: "web-app-development",
    title: "Web Application Development",
    description:
      "Build powerful web applications with modern technologies. SaaS platforms, dashboards, booking systems, and more.",
    icon: <Globe className="h-8 w-8" />,
    features: [
      "Modern tech stack",
      "Real-time features",
      "API development",
      "Database integration",
      "Authentication & security",
      "Admin dashboard",
      "Payment integration",
      "Cloud deployment",
      "Performance optimized",
    ],
    price: "৳59,999",
    priceNote: "starting from",
  },
];

export default function ITServicesSection() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [services, setServices] = useState<ITService[]>(fallbackServices);

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
        .eq("category", "software")
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        const mapped: ITService[] = data.map((service) => ({
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
                {/* Icon */}
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
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
                    Key Features:
                  </p>
                  <ul className="space-y-2">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-500" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Price & CTA */}
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
                      className="block w-full rounded-lg bg-gray-400 py-3 text-center font-bold text-gray-600 cursor-not-allowed"
                      title="Admins cannot purchase"
                    >
                      Purchase Now
                    </button>
                  ) : (
                    <Link
                      href={`/checkout?service=it-service&name=${encodeURIComponent(service.title)}&price=${encodeURIComponent(service.price)}&id=${service.id}`}
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

        {/* Bottom Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16 rounded-2xl border border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 p-8 text-center"
        >
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
        </motion.div>
      </div>
    </section>
  );
}
