// components/WhyChooseUs.tsx
"use client";

import { motion } from "framer-motion";
import {
  Award,
  BarChart2,
  Clock,
  CreditCard,
  MessageSquare,
  Repeat,
  ShieldCheck,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function WhyChooseUs() {
  const features = [
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "Professional Courses",
      desc: "Industry-leading training programs in web development, marketing, design, and business management.",
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "WhatsApp Business",
      desc: "Direct customer engagement with WhatsApp API integration for messaging and support automation.",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Enterprise Software",
      desc: "Custom software solutions including school management, e-commerce, POS systems, and more.",
    },
    {
      icon: <BarChart2 className="w-6 h-6" />,
      title: "Digital Marketing",
      desc: "Comprehensive marketing campaigns including social media, SEO, paid ads, and content creation.",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Bulk SMS Campaigns",
      desc: "High-volume SMS sending for marketing, notifications, and customer communication needs.",
    },
    {
      icon: <Repeat className="w-6 h-6" />,
      title: "WeSend Delivery",
      desc: "Complete delivery management platform with GPS tracking, rider management, and notifications.",
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Leadpilot CRM",
      desc: "Advanced lead management and CRM system to capture, nurture, and convert prospects effectively.",
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: "Flexible Payments",
      desc: "Multiple payment options including Bank Transfer, Nagad, and bKash for your convenience.",
    },
  ];

  const stats = [
    { value: "2,000+", label: "Active Students" },
    { value: "500+", label: "Projects Delivered" },
    { value: "50+", label: "Enterprise Clients" },
    { value: "24/7", label: "Support Available" },
  ];

  return (
    <section
      id="services"
      className="relative overflow-hidden bg-white py-24"
      aria-labelledby="why-heading"
    >
      {/* Background accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 h-full w-full bg-[url('/wireframe.png')] opacity-10" />
        <div className="absolute left-1/4 top-20 h-60 w-60 rounded-full bg-[var(--primary-yellow)] opacity-10 blur-[100px]" />
        <div className="absolute right-1/4 bottom-0 h-80 w-80 rounded-full bg-[var(--secondary-yellow)] opacity-10 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <span className="mb-4 inline-block rounded-full bg-[var(--primary-yellow)]/10 px-4 py-2 text-sm font-medium text-[var(--primary-yellow)]">
            Why choose us?
          </span>
          <h2
            id="why-heading"
            className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl"
          >
            Complete Digital{" "}
            <span className="text-[var(--primary-yellow)]">Ecosystem</span>
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-gray-600">
            Everything you need to succeed online—from learning new skills to
            building software, managing customers, and growing your business.
            One platform, endless possibilities.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="mb-20 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.06 }}
              viewport={{ once: true, margin: "-50px" }}
              className="h-full rounded-xl border border-gray-100 bg-white p-6 transition-all hover:border-[var(--primary-yellow)]/30 hover:shadow-lg"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--primary-yellow)]/10 text-[var(--primary-yellow)]">
                {item.icon}
              </div>
              <h3 className="mb-2 text-lg font-bold text-gray-900">
                {item.title}
              </h3>
              <p className="text-gray-600">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-[var(--primary-yellow)]/20 bg-gradient-to-r from-[var(--primary-yellow)]/5 to-[var(--secondary-yellow)]/5 p-8 backdrop-blur-sm"
        >
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="mb-2 text-4xl font-bold text-[var(--primary-yellow)]">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <Link
            href="/#proposal"
            className="rounded-xl bg-[var(--primary-yellow)] px-8 py-4 text-lg font-bold text-gray-900 shadow-lg transition-all hover:bg-[var(--secondary-yellow)] hover:shadow-xl"
            aria-label="Get a proposal"
          >
            Get a Proposal
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
