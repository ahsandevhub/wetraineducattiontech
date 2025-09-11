// components/WhyChooseUs.tsx
"use client";
import { motion } from "framer-motion";

export default function WhyChooseUs() {
  const features = [
    {
      title: "Data-Driven Strategies",
      description:
        "We use advanced analytics and market insights to create campaigns that deliver measurable results and maximize your marketing investment.",
      icon: "📊",
    },
    {
      title: "Expert Creative Team",
      description:
        "Our talented designers and copywriters craft compelling content that resonates with your audience and drives engagement across all channels.",
      icon: "🎨",
    },
    {
      title: "Multi-Channel Approach",
      description:
        "From social media to search engines, we leverage every platform to ensure your brand reaches the right audience at the right time.",
      icon: "📱",
    },
    {
      title: "Proven Track Record",
      description:
        "With successful campaigns for businesses across industries, we have the experience to scale your marketing efforts effectively.",
      icon: "🚀",
    },
    {
      title: "Transparent Reporting",
      description:
        "Get detailed insights into campaign performance with our comprehensive analytics and regular progress reports.",
      icon: "📈",
    },
    {
      title: "Dedicated Support",
      description:
        "Your success is our priority. Our team provides ongoing support and optimization to ensure continuous growth.",
      icon: "🤝",
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Choose Our Marketing Agency
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We combine creativity with data-driven insights to deliver marketing
            solutions that drive real business growth
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
