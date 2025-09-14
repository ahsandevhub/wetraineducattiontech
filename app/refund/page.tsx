"use client";
import { motion } from "framer-motion";



import ShowBengaliButton from "../components/ShowBengaliButton";
import { useContactInfo } from "../utils/contactInfo";

export default function RefundPage() {
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
            Refund Policy
          </h1>
          <ShowBengaliButton />
          <p className="text-lg text-gray-700">
            Generic refund policy for our marketing services and digital
            deliverables.
          </p>
        </motion.div>
      </section>

      {/* Main Content */}
      <section className="max-w-4xl mx-auto pb-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-gray-700 leading-7 space-y-6"
        >
          <p>
            We aim to deliver high-quality marketing services and content. The
            following refund terms apply to payments made for our services and
            digital products.
          </p>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              1. Scope of Refunds
            </h2>
            <p>
              Fees for services, workshops, retainers, and digital deliverables
              are generally non-refundable once work has begun or access/assets
              have been delivered. By accessing or using any deliverable, you
              acknowledge that refunds are limited.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              2. Exceptions and Considerations
            </h2>
            <p>
              Refunds may be considered for duplicate charges, payment errors,
              or clearly defective digital files. Requests must include proof of
              payment and be submitted within 7 business days of the
              transaction.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              3. How to Request a Refund
            </h2>
            <p>
              Email support@example.com with your receipt, name, email, phone
              number, transaction ID, and a brief reason. We will review and
              respond within 10 business days.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              4. After Approval
            </h2>
            <p>
              Approved refunds are issued to the original payment method only.
              Processing times depend on your bank or provider and may take 5–10
              business days after we initiate the refund.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              5. Contact and Support
            </h2>
            <p>
              Questions about this policy? Contact us: <br />
              {supportEmail} <br />
              {contactPhone}
            </p>
          </div>
        </motion.div>
      </section>
    </>
  );
}
