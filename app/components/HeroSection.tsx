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
      aria-label="WeTrainEducation & Tech — Global growth made simple"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-yellow-400 opacity-10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-yellow-400 opacity-10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl text-center">
          {/* Content */}
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
              Complete Digital Solutions for Your Business Success
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-gray-700 md:text-xl"
            >
              From professional courses to enterprise software, marketing
              automation to messaging services—WeTrainEducation & Tech delivers
              integrated solutions that drive real growth. One platform, endless
              possibilities.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-wrap justify-center gap-4"
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
              className="mx-auto mt-12 max-w-4xl"
            >
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:gap-6">
                {[
                  "Professional Courses",
                  "Enterprise Software",
                  "Marketing Automation",
                  "24/7 Support",
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-2 rounded-lg bg-white/80 p-4 backdrop-blur-sm"
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
                    <span className="font-medium text-gray-800 text-sm text-center">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
