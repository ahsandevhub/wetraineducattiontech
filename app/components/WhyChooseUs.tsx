// components/WhyChooseUs.tsx
"use client";
import { motion } from "framer-motion";
import {
  Award,
  BarChart2,
  Clock,
  Globe,
  Lightbulb,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";

export default function WhyChooseUs() {
  const features = [
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "Trusted Expertise",
      desc: "Years of proven experience in digital marketing with a track record of successful campaigns across industries.",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Results-Driven",
      desc: "We focus on measurable outcomes that directly impact your bottom line and business growth.",
    },
    {
      icon: <BarChart2 className="w-6 h-6" />,
      title: "Data Analytics",
      desc: "Advanced analytics and reporting to track performance and optimize your marketing strategies.",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Dedicated Team",
      desc: "A passionate team of marketing professionals committed to your brand's success.",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Fast Implementation",
      desc: "Quick turnaround times and agile methodologies to get your campaigns up and running.",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Reach",
      desc: "Comprehensive marketing solutions that work across different markets and platforms.",
    },
    {
      icon: <Lightbulb className="w-6 h-6" />,
      title: "Creative Innovation",
      desc: "Fresh, creative approaches that set your brand apart from the competition.",
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Award-Winning",
      desc: "Recognized excellence in digital marketing with industry awards and client testimonials.",
    },
  ];

  const stats = [
    { value: "500+", label: "Happy Clients" },
    { value: "98%", label: "Success Rate" },
    { value: "24/7", label: "Support" },
    { value: "10+", label: "Years Experience" },
  ];

  return (
    <section
      id="about"
      className="relative py-24 overflow-hidden bg-[var(--tertiary-yellow)] font-[Baloo Da 2] border-y-2 border-yellow-200/50"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/wireframe.png')] opacity-10"></div>
        <div className="absolute top-20 left-1/4 w-60 h-60 rounded-full bg-[var(--primary-yellow)] blur-[100px] opacity-10"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-[var(--secondary-yellow)] blur-[100px] opacity-10"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-[var(--primary-yellow)]/10 text-[var(--primary-yellow)] px-4 py-2 rounded-full text-sm font-medium mb-4">
            Why Choose Us?
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <span className="text-[var(--primary-yellow)]">
              Elite Marketing
            </span>{" "}
            Advantages
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We don&apos;t just run campaigns—we build comprehensive marketing
            strategies that transform your brand presence and drive sustainable
            growth.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {features.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-50px" }}
              className="bg-white rounded-xl p-6 border border-gray-100 hover:border-[var(--primary-yellow)]/30 hover:shadow-lg transition-all h-full"
            >
              <div className="w-12 h-12 rounded-lg bg-[var(--primary-yellow)]/10 flex items-center justify-center mb-4 text-[var(--primary-yellow)]">
                {item.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {item.title}
              </h3>
              <p className="text-gray-600">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-[var(--primary-yellow)]/5 to-[var(--secondary-yellow)]/5 border border-[var(--primary-yellow)]/20 rounded-2xl p-8 backdrop-blur-sm"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-[var(--primary-yellow)] mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <motion.a
            href="#services"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[var(--primary-yellow)] text-gray-900 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:bg-[var(--secondary-yellow)]"
          >
            View Our Services
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
