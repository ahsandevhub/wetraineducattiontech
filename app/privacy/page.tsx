"use client";
import { motion } from "framer-motion";

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-700">
            How we collect, use, and protect your information at
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Information We Collect
          </h2>
          <ul className="list-disc list-inside text-gray-700 mb-6">
            <li>Contact details (name, email, phone) you provide via forms</li>
            <li>
              Usage data (pages visited, actions taken, device/browser info)
            </li>
            <li>Cookies and analytics for improving site experience</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How We Use Your Data
          </h2>
          <ul className="list-disc list-inside text-gray-700 mb-6">
            <li>To respond to inquiries and provide requested services</li>
            <li>To improve our website, products, and marketing</li>
            <li>To comply with legal obligations and prevent abuse</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Data Protection
          </h2>
          <ul className="list-disc list-inside text-gray-700 mb-6">
            <li>
              We use industry-standard security measures to protect your data
            </li>
            <li>Access is limited to authorized team members only</li>
            <li>
              We do not sell or share your personal information with third
              parties except as required by law
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
          <ul className="list-disc list-inside text-gray-700 mb-6">
            <li>
              You can request access, correction, or deletion of your data
            </li>
            <li>
              Contact us at{" "}
              <a
                href="mailto:support@wetraineducation.com"
                className="text-[var(--primary-yellow)] font-bold"
              >
                support@wetraineducation.com
              </a>{" "}
              for privacy requests
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">Updates</h2>
          <p className="text-gray-700">
            We may update this policy from time to time. Changes will be posted
            on this page.
          </p>
        </motion.div>
      </section>
    </>
  );
}
