// components/CTASection.tsx
"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check, Clock, Rocket, Zap } from "lucide-react";

export default function CTASection() {
  return (
    <section
      id="cta"
      className="relative overflow-hidden bg-gradient-to-br from-[var(--primary-yellow)] to-[var(--secondary-yellow)]"
      aria-label="Call to action — Grow with WeTrain Marketing"
    >
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.png')] bg-cover opacity-10" />
        <div
          className="absolute left-1/4 top-1/3 h-80 w-80 rounded-full bg-white/20 blur-[80px]"
          style={{ transform: "translate(-50%, -50%)" }}
        />
        <div
          className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-[var(--tertiary-yellow)]/20 blur-[80px]"
          style={{ transform: "translate(50%, 50%)" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, margin: "-50px" }}
        className="relative z-10 mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8"
      >
        {/* Animated Icon */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="mb-8 inline-flex items-center justify-center rounded-full bg-white/20 p-5 shadow-lg backdrop-blur-sm"
        >
          <Rocket className="h-10 w-10 fill-white text-white" />
        </motion.div>

        {/* Heading */}
        <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
          Ready to <span className="text-gray-900">accelerate growth</span>?
        </h2>

        {/* Subheading */}
        <p className="mx-auto mb-10 max-w-3xl text-xl text-white/90">
          Partner with WeTrain Marketing to launch smarter campaigns, scale into
          new markets, and turn brand momentum into measurable results.
        </p>

        {/* CTA Buttons */}
        <div className="mb-16 flex flex-col justify-center gap-4 sm:flex-row">
          <motion.a
            href="#pricing"
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-8 py-4 font-bold text-white shadow-lg transition-all hover:bg-gray-800 hover:shadow-xl"
            aria-label="View pricing"
          >
            Get Started <Zap className="h-5 w-5" />
          </motion.a>

          <motion.a
            href="#why"
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-8 py-4 font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:shadow-lg"
            aria-label="Learn why companies choose us"
          >
            Why Choose Us <ArrowRight className="h-5 w-5" />
          </motion.a>
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true, margin: "-50px" }}
          className="mx-auto grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4"
        >
          {[
            { icon: Check, text: "1,000+ projects delivered" },
            { icon: Clock, text: "On-time, sprint-based delivery" },
            { icon: Zap, text: "Performance-first creative" },
            { icon: Rocket, text: "Global, scalable campaigns" },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -3 }}
              className="flex items-center justify-center gap-3 rounded-xl border border-white/20 bg-white/10 px-5 py-3 transition-colors hover:border-white/40 backdrop-blur-sm"
            >
              <item.icon className="h-5 w-5 text-white" />
              <span className="text-sm font-medium text-white">
                {item.text}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
