"use client";
import { motion } from "framer-motion";
import { Clock, Star, TrendingUp, Users } from "lucide-react";
import Image from "next/image";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CEO, TechStart Solutions",
      text: "Their strategic approach to digital marketing transformed our business. We saw a 300% increase in qualified leads within the first quarter of working together.",
      avatar: "/api/placeholder/80/80",
      profit: "300% Lead Growth",
      rating: 5,
      company: "TechStart Solutions",
    },
    {
      name: "Michael Chen",
      role: "Marketing Director, GrowthCorp",
      text: "The creative campaigns they developed for us were game-changing. Our brand engagement increased by 250% and conversion rates doubled across all channels.",
      avatar: "/api/placeholder/80/80",
      profit: "250% Engagement Boost",
      rating: 5,
      company: "GrowthCorp",
    },
    {
      name: "Emily Rodriguez",
      role: "Founder, EcoLiving Brands",
      text: "Working with this agency was the best investment we made. Their data-driven approach helped us scale from startup to market leader in just 18 months.",
      avatar: "/api/placeholder/80/80",
      profit: "Market Leader in 18 Months",
      rating: 5,
      company: "EcoLiving Brands",
    },
    {
      name: "David Thompson",
      role: "VP of Sales, InnovateTech",
      text: "The ROI on our marketing spend improved by 400% after partnering with them. Their team truly understands how to drive business growth through strategic marketing.",
      avatar: "/api/placeholder/80/80",
      profit: "400% ROI Improvement",
      rating: 5,
      company: "InnovateTech",
    },
  ];

  const stats = [
    { value: "৪.৯/৫", label: "কোর্স রেটিং (Student Review)", icon: Star },
    { value: "৯৮%", label: "শিক্ষার্থীর সন্তুষ্টি", icon: TrendingUp },
    { value: "২৪-৪৮ ঘণ্টা", label: "সাপোর্ট রেসপন্স টাইম", icon: Clock },
    { value: "১০০০+", label: "অ্যাকটিভ শিক্ষার্থী", icon: Users },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-yellow-50 to-orange-50">
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/wireframe.png')] opacity-10"></div>
        <div className="absolute top-1/4 left-1/4 w-60 h-60 rounded-full bg-[var(--primary-yellow)] blur-[100px] opacity-10"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[var(--secondary-yellow)] blur-[100px] opacity-10"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-50px" }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-[var(--primary-yellow)]/10 text-[var(--primary-yellow)] px-4 py-2 rounded-full text-sm font-medium mb-4">
            ক্লায়েন্টের সাফল্যের গল্প
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <span className="text-[var(--primary-yellow)]">১,০০০+</span>{" "}
            সন্তুষ্ট ক্লায়েন্ট
          </h2>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            কিভাবে আমরা ব্যবসাগুলোকে কৌশলগত মার্কেটিংয়ের মাধ্যমে অসাধারণ
            বৃদ্ধিতে সহায়তা করেছি তা দেখুন
          </p>
        </motion.div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              viewport={{ once: true, margin: "-50px" }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl p-8 border border-gray-100 hover:shadow-lg transition-all h-full flex flex-col"
            >
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < t.rating
                        ? "text-[var(--primary-yellow)] fill-[var(--primary-yellow)]"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <p className="text-gray-600 mb-6 flex-grow italic">
                &quot;{t.text}&quot;
              </p>
              <div className="flex items-center">
                <Image
                  src={t.avatar}
                  alt={t.name}
                  height={48}
                  width={48}
                  className="w-12 h-12 rounded-full border-2 border-[var(--primary-yellow)] object-cover mr-4"
                />
                <div>
                  <h4 className="text-gray-900 font-bold">{t.name}</h4>
                  <p className="text-gray-500 text-sm">{t.role}</p>
                </div>
              </div>
              <div className="mt-6 bg-[var(--tertiary-yellow)] rounded-lg p-3 text-center">
                <p className="text-sm text-gray-600">অর্জন</p>
                <p className="text-xl font-bold text-[var(--primary-yellow)]">
                  {t.profit}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true, margin: "-50px" }}
          className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-3">
                    <div className="w-12 h-12 rounded-full bg-[var(--primary-yellow)]/10 flex items-center justify-center text-[var(--primary-yellow)]">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
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
