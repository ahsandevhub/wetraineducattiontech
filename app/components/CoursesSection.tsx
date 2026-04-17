// components/CoursesSection.tsx
"use client";

import {
  formatServiceCurrency,
  getServicePricing,
} from "@/app/utils/services/pricing";
import { createClient } from "@/app/utils/supabase/client";
import ServiceCard, {
  ServiceCardSkeleton,
} from "@/components/shared/ServiceCard";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: string;
  originalPrice: string | null;
  priceNote: string;
  imageUrl?: string;
  features: string[];
}

export default function CoursesSection() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
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
        .eq("category", "course")
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        const mapped: Course[] = data.map((service) => {
          const pricing = getServicePricing(
            service.price === null ? null : Number(service.price),
            service.discount === null ? null : Number(service.discount),
          );

          return {
            id: service.id as string,
            slug: service.slug as string,
            title: service.title ?? "",
            description: service.details ?? "",
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
            features: Array.isArray(service.key_features)
              ? service.key_features
              : [],
          };
        });
        setCourses(mapped);
      }
      setLoading(false);
    };

    loadData();
  }, []);

  return (
    <section
      id="courses"
      className="relative overflow-hidden bg-gradient-to-b from-yellow-50 to-white py-24"
      aria-labelledby="courses-heading"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-yellow-300 opacity-5 blur-3xl" />
        <div className="absolute -right-40 bottom-40 h-96 w-96 rounded-full bg-yellow-400 opacity-5 blur-3xl" />
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
          <span className="mb-4 inline-block rounded-full bg-yellow-400/10 px-4 py-2 text-sm font-medium text-yellow-600">
            Our Courses
          </span>
          <h2
            id="courses-heading"
            className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl"
          >
            Professional{" "}
            <span className="text-yellow-500">Training Courses</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Expert-led courses designed to boost your skills and advance your
            career. Learn from industry professionals with hands-on projects.
          </p>
        </motion.div>

        {/* Courses Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <motion.div
                key={`course-skeleton-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <ServiceCardSkeleton />
              </motion.div>
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {courses.slice(0, 3).map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-50px" }}
                className="h-full"
              >
                <ServiceCard
                  id={course.id}
                  title={course.title}
                  description={course.description}
                  features={course.features}
                  imageUrl={course.imageUrl}
                  categoryLabel="Course"
                  categoryClassName="bg-blue-100 text-blue-800 hover:bg-blue-100"
                  detailHref={`/courses/${course.slug}`}
                  ctaHref={isAdmin ? undefined : `/courses/${course.slug}`}
                  ctaLabel="Enroll Now"
                  ctaDisabled={isAdmin}
                  ctaTitle={isAdmin ? "Admins cannot purchase" : undefined}
                  priceLabel={course.price}
                  originalPriceLabel={course.originalPrice}
                  priceNote={course.priceNote}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="min-h-96 flex flex-col items-center justify-center text-center py-20">
            <div className="text-6xl mb-6">🚀</div>
            <h3 className="text-3xl font-bold text-gray-900 mb-3">
              Coming Soon
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl">
              We&apos;re working hard to bring you amazing training courses.
              Check back soon!
            </p>
          </div>
        )}

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16 text-center space-y-6"
        >
          {courses.length > 3 && (
            <Link
              href="/courses"
              className="inline-block rounded-xl bg-yellow-500 px-8 py-3 font-bold text-white transition-all hover:bg-yellow-600 hover:shadow-lg"
            >
              View All Courses
            </Link>
          )}
          <p className="mb-4 text-lg text-gray-600">
            Can&apos;t find the right course? We offer custom training programs
            tailored to your needs.
          </p>
          <Link
            href="/#proposal"
            className="inline-block rounded-xl border border-yellow-400 bg-white px-8 py-3 font-bold text-gray-900 transition-all hover:bg-yellow-50 hover:shadow-lg"
          >
            Request Custom Training
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
