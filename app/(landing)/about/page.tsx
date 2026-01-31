"use client";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <>
      {/* Hero-style Header */}
      <section className="relative bg-gradient-to-b from-yellow-200 to-white py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto px-6"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            About Us
          </h1>
          <p className="text-lg text-gray-700">
            Learn more about our mission, values, and the team behind
            WeTrainEducation.
          </p>
        </motion.div>
      </section>

      {/* Main Content */}
      <section className="max-w-4xl mx-auto pb-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow-lg p-8 border border-yellow-100"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-700 mb-6">
            We empower brands and businesses to grow through innovative
            marketing, creative strategy, and data-driven solutions. Our goal is
            to make world-class marketing accessible to everyone, regardless of
            size or budget.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Values</h2>
          <ul className="list-disc list-inside text-gray-700 mb-6">
            <li>Integrity & transparency in every project</li>
            <li>Creativity that drives real results</li>
            <li>Collaboration with clients as true partners</li>
            <li>Continuous learning and improvement</li>
            <li>Respect for diversity and inclusion</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Meet the Team
          </h2>
          <p className="text-gray-700 mb-6">
            Our team is a blend of strategists, creatives, analysts, and
            technologists passionate about helping you succeed. We bring global
            experience and local insight to every challenge.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-gray-700">
            Have questions or want to work with us? Email{" "}
            <a
              href="mailto:support@wetraineducation.com"
              className="text-[var(--primary-yellow)] font-bold"
            >
              support@wetraineducation.com
            </a>{" "}
            or visit our contact page.
          </p>
        </motion.div>
      </section>
    </>
  );
}
