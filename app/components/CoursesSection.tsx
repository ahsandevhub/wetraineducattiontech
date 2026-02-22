// components/CoursesSection.tsx
"use client";

import { createClient } from "@/app/utils/supabase/client";
import { motion } from "framer-motion";
import { BookOpen, Clock, Star, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  students: string;
  rating: number;
  price: string;
  imageUrl?: string;
  emoji?: string;
  features: string[];
}

export default function CoursesSection() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);

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
        .eq("category", "course")
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        const mapped: Course[] = data.map((service) => ({
          id: service.id as string,
          slug: service.slug as string,
          title: service.title ?? "",
          description: service.details ?? "",
          instructor: "WeTrain Team",
          duration: "Flexible",
          students: "—",
          rating: 4.8,
          price: formatPrice(
            service.price === null ? null : Number(service.price),
            service.currency ?? "BDT",
          ),
          imageUrl: service.featured_image_url ?? undefined,
          features: Array.isArray(service.key_features)
            ? service.key_features
            : [],
        }));
        setCourses(mapped);
      }
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
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {courses.slice(0, 3).map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-50px" }}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:border-yellow-300 hover:shadow-xl"
              >
                {/* Course Image/Icon */}
                <div className="flex h-48 items-center justify-center bg-gradient-to-br from-yellow-100 to-yellow-50 text-6xl">
                  {course.imageUrl ? (
                    <div className="relative h-full w-full">
                      <Image
                        src={course.imageUrl}
                        alt={course.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <span>{course.emoji ?? "🎓"}</span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-6">
                  {/* Rating & Stats */}
                  <div className="mb-4 flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{course.rating}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{course.students}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration}</span>
                      </div>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="mb-2 text-xl font-bold text-gray-900">
                    {course.title}
                  </h3>
                  <p className="mb-4 text-gray-600">{course.description}</p>

                  {/* Features */}
                  <ul className="mb-6 space-y-2 text-sm">
                    {course.features.slice(0, 3).map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <BookOpen className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-500" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Instructor */}
                  <p className="mb-4 text-sm text-gray-500">
                    By {course.instructor}
                  </p>

                  {/* Price & CTA */}
                  <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
                    <div>
                      <span className="text-2xl font-bold text-yellow-500">
                        {course.price}
                      </span>
                    </div>
                    {isAdmin ? (
                      <button
                        disabled
                        className="rounded-lg bg-gray-300 px-6 py-2.5 font-bold text-gray-600 cursor-not-allowed"
                        title="Admins cannot purchase"
                      >
                        Enroll Now
                      </button>
                    ) : (
                      <Link
                        href={`/courses/${course.slug}`}
                        className="rounded-lg bg-yellow-500 px-6 py-2.5 font-bold text-white transition-all hover:bg-yellow-600 hover:shadow-lg"
                      >
                        Enroll Now
                      </Link>
                    )}
                  </div>
                </div>
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
