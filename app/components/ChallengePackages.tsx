"use client";
import { motion } from "framer-motion";
import { CheckCircle, Star } from "lucide-react";

export default function ChallengePackages() {
  const packages = [
    {
      title: "Digital Starter",
      price: "Starting at $2,999/month",
      duration: "3-month minimum",
      description:
        "Perfect for small businesses looking to establish their digital presence and grow their online audience.",
      features: [
        "Social Media Management",
        "Content Creation & Strategy",
        "Basic SEO Optimization",
        "Monthly Performance Reports",
        "Email Marketing Setup",
        "Google Ads Management (up to $5k spend)",
      ],
      popular: false,
      gradient: "from-blue-500 to-cyan-600",
      support: "Business Hours",
    },
    {
      title: "Growth Accelerator",
      price: "Starting at $5,999/month",
      duration: "6-month minimum",
      description:
        "Comprehensive marketing solution for businesses ready to scale and dominate their market.",
      features: [
        "Everything in Digital Starter",
        "Advanced SEO & Content Marketing",
        "Conversion Rate Optimization",
        "Marketing Automation",
        "Influencer Partnership Management",
        "Video Content Production",
        "Advanced Analytics & Insights",
      ],
      popular: true,
      gradient: "from-purple-500 to-pink-600",
      support: "Priority Support",
    },
    {
      title: "Enterprise Elite",
      price: "Custom Pricing",
      duration: "12-month partnership",
      description:
        "Full-service marketing partnership for established companies seeking market leadership.",
      features: [
        "Everything in Growth Accelerator",
        "Dedicated Account Team",
        "Custom Marketing Technology Stack",
        "Brand Strategy & Positioning",
        "Public Relations & Media Outreach",
        "Trade Show & Event Marketing",
        "Executive Thought Leadership",
        "24/7 Priority Support",
      ],
      popular: false,
      gradient: "from-indigo-500 to-purple-600",
      support: "24/7 Dedicated Support",
    },
  ];

  return (
    <section
      id="packages"
      className="relative py-20 bg-white overflow-hidden border-b-2 border-yellow-200/50 font-[Baloo Da 2]"
    >
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/wireframe.png')] opacity-10"></div>
        <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-[var(--primary-yellow)] blur-[100px] opacity-10"></div>
        <div className="absolute bottom-1/3 -right-20 w-80 h-80 rounded-full bg-[var(--secondary-yellow)] blur-[100px] opacity-10"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-[var(--primary-yellow)]/10 text-[var(--primary-yellow)] px-4 py-2 rounded-full text-sm font-medium mb-4">
            Service Packages
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your{" "}
            <span className="text-[var(--primary-yellow)]">
              Marketing Journey
            </span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Transparent pricing and comprehensive solutions tailored to your
            business needs
          </p>
        </motion.div>

        {/* Package Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {packages.map((pkg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-50px" }}
              whileHover={{ y: -10 }}
              className={`relative rounded-xl border ${
                pkg.popular
                  ? "border-[var(--primary-yellow)] shadow-lg"
                  : "border-gray-200 shadow-md"
              } bg-white transition-all`}
            >
              {pkg.popular && (
                <div className="absolute top-0 left-1/2 bg-[var(--primary-yellow)] text-white px-4 py-1 font-bold text-sm transform -translate-x-1/2 -translate-y-3 rounded-full flex items-center">
                  <Star className="w-4 h-4 mr-1 fill-white" />
                  Most Popular
                </div>
              )}

              <div className="p-8 h-full flex flex-col">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {pkg.title}
                  </h3>
                  <p className="text-gray-600">{pkg.description}</p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-[var(--primary-yellow)]">
                    {pkg.price}
                  </span>
                  <span className="text-gray-500">/{pkg.duration}</span>
                </div>

                <ul className="space-y-3 mb-8 flex-grow">
                  {pkg.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-[var(--primary-yellow)] mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Support Level:</span>
                    <span className="font-semibold">{pkg.support}</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full cursor-pointer py-3 rounded-lg font-bold mt-auto ${
                    pkg.popular
                      ? "bg-[var(--primary-yellow)] hover:bg-[var(--secondary-yellow)] text-white"
                      : "bg-gray-900 hover:bg-gray-800 text-white"
                  } transition-colors`}
                  onClick={() => (window.location.href = "#contact")}
                >
                  Get Started
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
