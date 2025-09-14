// components/WhyChooseUs.tsx
"use client";

import { motion } from "framer-motion";
import {
  Award,
  BarChart2,
  Clock,
  DollarSign,
  Repeat,
  ShieldCheck,
  TrendingUp,
  UserPlus,
} from "lucide-react";

export default function WhyChooseUs() {
  const features = [
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "Trust & Brand Safety",
      desc: "We prioritize compliance, brand safety, and privacy across every campaign and channel.",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Growth at Scale",
      desc: "From launch to hyper-growth—our systems scale with your pipeline, markets, and budgets.",
    },
    {
      icon: <BarChart2 className="w-6 h-6" />,
      title: "Data-Driven Strategy",
      desc: "Clear hypotheses, testing plans, and dashboards that tie spend to measurable outcomes.",
    },
    {
      icon: <UserPlus className="w-6 h-6" />,
      title: "Frictionless Onboarding",
      desc: "Kick off fast with a streamlined intake, immediate wins, and a 30-day roadmap.",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "On-Time Delivery",
      desc: "Reliable sprint cycles with SLAs—no surprises, just predictable velocity.",
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "ROI-Focused",
      desc: "Performance creative and media plans designed to maximize CAC/LTV efficiency.",
    },
    {
      icon: <Repeat className="w-6 h-6" />,
      title: "Always-On Optimization",
      desc: "Iterate, test, and improve continuously—creative, audiences, bids, and funnels.",
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Senior Talent",
      desc: "Cross-functional team of strategists, creatives, and analysts on every account.",
    },
  ];

  const stats = [
    { value: "1,000+", label: "Projects Delivered" },
    { value: "95%", label: "Client CSAT" },
    { value: "24/7", label: "Global Support" },
    { value: "5+", label: "Service Lines" },
  ];

  return (
    <section
      id="services"
      className="relative overflow-hidden border-y-2 border-yellow-200/50 bg-[var(--tertiary-yellow)] py-24"
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
            WeTrain{" "}
            <span className="text-[var(--primary-yellow)]">Marketing</span>{" "}
            Advantage
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-gray-600">
            Outcomes over outputs. We combine strategy, creative, and
            performance marketing to drive measurable business growth—globally.
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
          <a
            href="#contact"
            className="rounded-xl bg-[var(--primary-yellow)] px-8 py-4 text-lg font-bold text-gray-900 shadow-lg transition-all hover:bg-[var(--secondary-yellow)] hover:shadow-xl"
            aria-label="Get a proposal"
          >
            Get a Proposal
          </a>
        </motion.div>
      </div>
    </section>
  );
}
