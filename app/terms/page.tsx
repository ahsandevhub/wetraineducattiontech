"use client";

import { motion } from "framer-motion";


import ShowBengaliButton from "../components/ShowBengaliButton";
import { useContactInfo } from "../utils/contactInfo";

export default function TermsPage() {
  const { contactPhone, supportEmail } = useContactInfo();
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
            Terms of Use
          </h1>
          <ShowBengaliButton />
          <p className="text-lg text-gray-700">
            Terms and conditions for using our website, content, and services.
          </p>
        </motion.div>
      </section>

      {/* Main Content */}
      <section className="max-w-4xl mx-auto pb-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-gray-700 leading-7 mb-6">
            By accessing or using our website, materials, or services, you agree
            to the terms below. If you do not agree, please do not use our
            website or any services.
          </p>

          <div className="text-gray-700 leading-7 mb-6">
            <p className="mb-3 font-bold">1. Nature of Services</p>
            <p>
              We provide marketing and communications services such as strategy,
              digital advertising, content creation, branding, social media
              management, SEO/SEM, analytics, and related training. We do not
              provide legal, tax, or financial advice and do not guarantee
              specific outcomes or revenue.
            </p>
          </div>

          <div className="text-gray-700 leading-7 mb-6">
            <p className="mb-3 font-bold">2. Permitted Use</p>
            <p>
              All content and deliverables are provided for legitimate business
              and educational purposes. You may not copy, resell, sublicense, or
              redistribute our materials without prior written permission. You
              are responsible for your account access and complying with
              applicable laws.
            </p>
          </div>

          <div className="text-gray-700 leading-7 mb-6">
            <p className="mb-3 font-bold">3. Intellectual Property</p>
            <p>
              All materials, including copy, graphics, video, code, campaign
              assets, and documentation, are owned by us or our licensors.
              Unauthorized use, reproduction, or creation of derivative works is
              prohibited.
            </p>
          </div>

          <div className="text-gray-700 leading-7 mb-6">
            <p className="mb-3 font-bold">4. Third-Party Links and Tools</p>
            <p>
              Our site may reference or link to third-party platforms and
              services. We do not control and are not responsible for their
              content, policies, or availability. Use of third-party tools is at
              your own risk and subject to those providers’ terms.
            </p>
          </div>

          <div className="text-gray-700 leading-7 mb-6">
            <p className="mb-3 font-bold">5. Fees and Refunds</p>
            <p>
              Fees, invoices, and payment schedules are defined in the
              applicable order form or proposal. Unless stated otherwise, fees
              are non-refundable once services have commenced or assets have
              been delivered. Taxes and processing fees may apply. Any
              discretionary refunds follow our published refund policy.
            </p>
          </div>

          <div className="text-gray-700 leading-7 mb-6">
            <p className="mb-3 font-bold">6. Legal and Dispute Resolution</p>
            <p>
              These terms are governed by the laws of your jurisdiction, without
              regard to conflict-of-law principles. Disputes will be resolved
              exclusively in the courts located in your city/state. Services are
              provided “as is” and “as available” without warranties; our
              liability is limited to the maximum extent permitted by law. We
              may update these terms at any time by posting a revised version.
              <br />
              Contact: {supportEmail} <br />
              {contactPhone}
            </p>
          </div>
        </motion.div>
      </section>
    </>
  );
}
