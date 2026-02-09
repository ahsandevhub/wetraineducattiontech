// components/Testimonials.tsx
"use client";

import { createClient } from "@/app/utils/supabase/client";
import { motion } from "framer-motion";
import { Clock, Star, TrendingUp, Users } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<
    {
      name: string;
      role: string;
      text: string;
      avatar: string;
      achievement: string;
      rating: number;
    }[]
  >([]);

  useEffect(() => {
    const loadStories = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("client_stories")
        .select("id, name, role, quote, achievement, rating, image_url")
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        const mapped = data.map((story) => ({
          name: story.name ?? "",
          role: story.role ?? "",
          text: story.quote ?? "",
          avatar: story.image_url ?? "",
          achievement: story.achievement ?? "",
          rating: Number(story.rating ?? 5),
        }));
        setTestimonials(mapped);
      }
    };

    loadStories();
  }, []);

  const stats = [
    { value: "4.9/5", label: "Client Rating", icon: Star },
    { value: "98%", label: "Retention Rate", icon: TrendingUp },
    { value: "24–48 hrs", label: "Avg. Response Time", icon: Clock },
    { value: "1,000+", label: "Projects Delivered", icon: Users },
  ];

  return (
    <section
      id="testimonials"
      className="relative overflow-hidden bg-gradient-to-b from-yellow-50 to-yellow-100 py-24"
      aria-labelledby="testimonials-heading"
    >
      {/* Background accents */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-0 top-0 h-full w-full bg-[url('/wireframe.png')] opacity-10" />
        <div className="absolute left-1/4 top-1/4 h-60 w-60 rounded-full bg-[var(--primary-yellow)] opacity-10 blur-[100px]" />
        <div className="absolute right-1/4 bottom-1/4 h-80 w-80 rounded-full bg-[var(--secondary-yellow)] opacity-10 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-50px" }}
          className="mb-16 text-center"
        >
          <span className="mb-4 inline-block rounded-full bg-[var(--primary-yellow)]/10 px-4 py-2 text-sm font-medium text-[var(--primary-yellow)]">
            Client Stories
          </span>
          <h2
            id="testimonials-heading"
            className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl"
          >
            Trusted by{" "}
            <span className="text-[var(--primary-yellow)]">global brands</span>
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-gray-600">
            Real outcomes from real partnerships—strategy, creative, and
            performance working together to drive growth.
          </p>
        </motion.div>

        {/* Testimonials */}
        {testimonials.length > 0 ? (
          <div className="mb-20 grid grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((t, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true, margin: "-50px" }}
                whileHover={{ y: -5 }}
                className="flex h-full flex-col rounded-xl border border-gray-100 bg-white p-8 transition-all hover:shadow-lg"
              >
                <div className="mb-4 flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < t.rating
                          ? "text-[var(--primary-yellow)] fill-[var(--primary-yellow)]"
                          : "text-gray-300"
                      }`}
                      aria-hidden="true"
                    />
                  ))}
                </div>

                <p className="mb-6 flex-grow italic text-gray-600">
                  &quot;{t.text}&quot;
                </p>

                <div className="flex items-center">
                  {t.avatar ? (
                    <Image
                      src={t.avatar}
                      alt={`${t.name} — ${t.role}`}
                      height={48}
                      width={48}
                      className="mr-4 h-12 w-12 rounded-full border-2 border-[var(--primary-yellow)] object-cover"
                    />
                  ) : (
                    <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[var(--primary-yellow)] bg-[var(--tertiary-yellow)] text-sm font-semibold text-[var(--primary-yellow)]">
                      {t.name
                        .split(" ")
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-gray-900">{t.name}</h4>
                    <p className="text-sm text-gray-500">{t.role}</p>
                  </div>
                </div>

                <div className="mt-6 rounded-lg bg-[var(--tertiary-yellow)] p-3 text-center">
                  <p className="text-sm text-gray-600">Result</p>
                  <p className="text-xl font-bold text-[var(--primary-yellow)]">
                    {t.achievement}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="mb-20 min-h-96 flex flex-col items-center justify-center text-center py-20">
            <div className="text-6xl mb-6">💬</div>
            <h3 className="text-3xl font-bold text-gray-900 mb-3">
              Coming Soon
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl">
              We&apos;re collecting client testimonials and success stories.
              Check back soon to hear from our happy clients!
            </p>
          </div>
        )}

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true, margin: "-50px" }}
          className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm"
        >
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="mb-3 flex justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary-yellow)]/10 text-[var(--primary-yellow)]">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                  </div>
                  <div className="mb-1 text-3xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
