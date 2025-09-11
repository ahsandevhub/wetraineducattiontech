"use client";
import { motion } from "framer-motion";
import { CheckCircle, Star } from "lucide-react";

interface Package {
  name: string;
  price: string;
  description: string;
  features: string[];
  popular: boolean;
  duration: string;
  support: string;
}

const packages: Package[] = [
  {
    name: "Starter Package",
    price: "$999",
    description:
      "Perfect for small businesses looking to establish their digital presence",
    features: [
      "Social Media Management",
      "Basic SEO Setup",
      "Content Creation (10 posts/month)",
      "Monthly Analytics Report",
      "Email Support",
    ],
    popular: false,
    duration: "3 Months",
    support: "Email",
  },
  {
    name: "Professional Package",
    price: "$2,499",
    description:
      "Comprehensive marketing solution for growing businesses ready to scale",
    features: [
      "Multi-Channel Campaigns",
      "Advanced SEO & SEM",
      "Content Marketing Strategy",
      "Social Media Advertising",
      "Weekly Strategy Calls",
      "Conversion Optimization",
    ],
    popular: true,
    duration: "6 Months",
    support: "Priority",
  },
  {
    name: "Enterprise Package",
    price: "$4,999",
    description:
      "Full-service marketing solution for established businesses seeking market dominance",
    features: [
      "Custom Marketing Strategy",
      "Dedicated Account Manager",
      "Advanced Analytics Dashboard",
      "Brand Development",
      "24/7 Support",
      "Performance Guarantee",
    ],
    popular: false,
    duration: "12 Months",
    support: "24/7",
  },
];

export default function ChallengePackages() {
  return (
    <section
      id="services"
      className="relative py-24 bg-[var(--tertiary-yellow)] overflow-hidden border-b-2 border-yellow-200/50 font-[Baloo Da 2]"
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
                    {pkg.name}
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
