"use client";
import { motion } from "framer-motion";
import { ChevronsRight } from "lucide-react";

export default function ChallengeFlow() {
  const steps = [
    {
      step: "01",
      title: "Choose Your Service",
      description:
        "Browse our comprehensive range of courses, software solutions, and marketing services. Select what fits your business needs.",
      icon: "🎯",
      duration: "Instant",
    },
    {
      step: "02",
      title: "One-Click Purchase",
      description:
        "Simple checkout with multiple payment options. Secure transactions via Bank, Nagad, or bKash—whatever works best for you.",
      icon: "🛒",
      duration: "2 minutes",
    },
    {
      step: "03",
      title: "Onboarding & Setup",
      description:
        "Our team reaches out immediately to understand your requirements and begin implementation or training setup.",
      icon: "🚀",
      duration: "24-48 hours",
    },
    {
      step: "04",
      title: "Implementation",
      description:
        "For software: Custom development and deployment. For courses: Immediate access to learning materials and live sessions.",
      icon: "⚙️",
      duration: "1-4 weeks",
    },
    {
      step: "05",
      title: "Support & Growth",
      description:
        "Ongoing support, updates, and training. We're with you every step as your business grows and evolves.",
      icon: "📈",
      duration: "Ongoing",
    },
  ];

  return (
    <section id="how-we-work" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From selection to implementation, we&apos;ve streamlined the entire
            process to get you up and running quickly
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
