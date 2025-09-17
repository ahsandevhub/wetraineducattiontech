// components/HeroSection.tsx
"use client";

import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";

export default function HeroSection() {
  return (
    <section
      id="home"
      className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-gradient-to-b from-yellow-300 to-yellow-100"
      style={{
        backgroundImage:
          "url('/abstract-geometric-yellow-background-orange-abstract.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      aria-label="WeTrain Marketing — Global growth made simple"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-yellow-400 opacity-10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-yellow-400 opacity-10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-4 py-10 sm:px-6 md:py-28 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 text-center md:text-left lg:grid-cols-2">
          {/* Left: Copy */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-6 text-4xl font-bold leading-tight text-gray-900 md:text-5xl lg:text-6xl"
            >
              Global Marketing,
              <br />
              Real Business <br /> Growth
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mb-8 max-w-2xl text-lg text-gray-700 md:text-xl"
            >
              WeTrain Marketing helps brands launch, scale, and win—worldwide.
              From strategy and creative to performance campaigns and analytics,
              we deliver measurable growth without the noise.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mb-10 flex flex-wrap justify-center gap-4 md:justify-start"
            >
              <motion.a
                href="#services"
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-8 py-4 font-bold text-white shadow-lg transition-all hover:bg-gray-800 hover:shadow-xl"
                aria-label="Explore our services"
              >
                View Services <Zap className="h-5 w-5" />
              </motion.a>

              <motion.a
                href="#how-we-work"
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 rounded-xl border border-yellow-400 bg-white px-8 py-4 font-bold text-gray-800 transition-all hover:bg-gray-50 hover:shadow-lg"
                aria-label="Learn how we work"
              >
                How We Work <ArrowRight className="h-5 w-5" />
              </motion.a>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="grid max-w-md grid-cols-2 gap-4"
            >
              {[
                "Strategy-first approach",
                "Creative that converts",
                "Performance marketing",
                "Transparent reporting",
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg bg-white/80 p-3 backdrop-blur-sm"
                >
                  <div className="rounded-full bg-yellow-400 p-2">
                    <svg
                      className="h-5 w-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-800">{item}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Video / Case Study Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
              <div className="relative aspect-video">
                <iframe
                  className="h-full w-full"
                  // Replace with your brand reel or case study video
                  src="https://www.youtube.com/embed/NKRq927M3no"
                  title="WeTrain Marketing — Brand Reel"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              <div className="bg-white p-6">
                <h3 className="mb-3 text-xl font-bold text-gray-900">
                  Why WeTrain Marketing?
                </h3>
                <p className="mb-4 text-gray-600">
                  In two minutes, see how our strategy, creative, and
                  performance teams partner to drive measurable growth.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✔ Full-funnel strategy & execution</li>
                  <li>✔ Creative built for performance</li>
                  <li>✔ Clear KPIs and transparent reporting</li>
                </ul>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { value: "1,000+", label: "Clients" },
                { value: "95%", label: "Avg. CSAT" },
                { value: "24/7", label: "Support" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-gray-100 bg-white/90 p-4 backdrop-blur-sm"
                >
                  <div className="text-2xl font-bold text-yellow-500">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
