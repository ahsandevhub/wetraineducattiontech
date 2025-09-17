"use client";
import { motion } from "framer-motion";
import { ChevronsRight } from "lucide-react";

export default function ChallengeFlow() {
  const steps = [
    {
      step: "01",
      title: "Discovery & Analysis",
      description:
        "We analyze your business, competitors, and target audience to identify growth opportunities and create a custom strategy.",
      icon: "🔍",
      duration: "1-2 weeks",
    },
    {
      step: "02",
      title: "Strategy Development",
      description:
        "Our team crafts a comprehensive marketing plan tailored to your goals, budget, and timeline for maximum impact.",
      icon: "📋",
      duration: "1-2 weeks",
    },
    {
      step: "03",
      title: "Creative Execution",
      description:
        "We bring your strategy to life with compelling content, engaging campaigns, and optimized marketing assets.",
      icon: "🎨",
      duration: "2-3 weeks",
    },
    {
      step: "04",
      title: "Launch & Optimize",
      description:
        "We deploy campaigns across channels, monitor performance, and continuously optimize for better results.",
      icon: "🚀",
      duration: "1 week",
    },
    {
      step: "05",
      title: "Scale & Grow",
      description:
        "Based on data insights, we scale successful campaigns and explore new opportunities to accelerate your growth.",
      icon: "📈",
      duration: "Ongoing",
    },
  ];

  return (
    <section
      id="how-we-work"
      className="py-20 bg-gradient-to-br from-gray-50 to-yellow-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Our Proven Marketing Process
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From strategy to execution, we follow a systematic approach to
            ensure your marketing success
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-50px" }}
                className="relative"
              >
                {/* Step number */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full bg-[var(--primary-yellow)] flex items-center justify-center text-white font-bold border-4 border-white shadow-md">
                  {step.step}
                </div>

                <div className="bg-white rounded-xl p-8 border border-gray-100 hover:border-[var(--primary-yellow)]/30 hover:shadow-lg transition-all h-full">
                  <div className="flex flex-col items-center text-center h-full">
                    <div className="w-14 h-14 rounded-lg bg-[var(--primary-yellow)]/10 flex items-center justify-center mb-6 text-[var(--primary-yellow)]">
                      {step.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 mb-4 flex-grow">
                      {step.description}
                    </p>
                    <div className="text-sm text-[var(--primary-yellow)] font-medium">
                      Timeline: {step.duration}
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-8 transform -translate-y-1/2 z-10">
                    <ChevronsRight className="w-8 h-8 text-[var(--primary-yellow)]" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
