"use client";
import { motion } from "framer-motion";
import { Languages } from "lucide-react";
import { useState } from "react";
import { useContactInfo } from "../../utils/contactInfo";

export default function RefundPage() {
  const { contactPhone, supportEmail } = useContactInfo();
  const [showBengali, setShowBengali] = useState(false);

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
        >
          {/* Content Card - Both Languages */}
          <div className="text-gray-700 leading-7 border border-yellow-300 rounded-lg p-6 bg-yellow-50">
            {showBengali ? (
              <>
                {/* Bengali Version */}
                <h2 className="text-2xl font-bold mb-4">রিফান্ড নীতিমালা</h2>
                <p className="mb-4">
                  আমরা উচ্চ-মানের মার্কেটিং সেবা ও কনটেন্ট প্রদানে
                  প্রতিশ্রুতিবদ্ধ। আপনি যদি সন্তুষ্ট না হন, তাহলে নিচের রিফান্ড
                  নীতিমালা দেখুন।
                </p>
                <div className="mb-3 font-bold">১. রিফান্ডের সুযোগ</div>
                <p className="mb-4">
                  পরিষেবা, ওয়ার্কশপ, রিটেইনার ও ডিজিটাল ডেলিভারেবলের ফি সাধারণত
                  ফেরতযোগ্য নয় যদি কাজ শুরু হয়ে যায় বা অ্যাক্সেস/অ্যাসেট
                  ডেলিভারি হয়ে যায়। কোনো ডেলিভারেবল ব্যবহারের মাধ্যমে আপনি
                  স্বীকার করছেন যে রিফান্ড সীমিত।
                </p>
                <div className="mb-3 font-bold">২. ব্যতিক্রম ও বিবেচনা</div>
                <p className="mb-4">
                  ডুপ্লিকেট চার্জ, পেমেন্ট ত্রুটি বা স্পষ্টতই ত্রুটিপূর্ণ
                  ডিজিটাল ফাইলের জন্য রিফান্ড বিবেচনা করা হতে পারে। অনুরোধের
                  সাথে পেমেন্টের প্রমাণ দিতে হবে এবং লেনদেনের ৭ কর্মদিবসের মধ্যে
                  জমা দিতে হবে।
                </p>
                <div className="mb-3 font-bold">
                  ৩. রিফান্ডের অনুরোধ কিভাবে করবেন
                </div>
                <p className="mb-4">
                  রসিদ, নাম, ইমেইল, ফোন নম্বর, লেনদেন আইডি ও সংক্ষিপ্ত কারণসহ{" "}
                  {supportEmail} এ ইমেইল করুন। আমরা ১০ কর্মদিবসের মধ্যে
                  পর্যালোচনা ও উত্তর দেব।
                </p>
                <div className="mb-3 font-bold">৪. অনুমোদনের পর</div>
                <p className="mb-4">
                  অনুমোদিত রিফান্ড কেবলমাত্র মূল পেমেন্ট পদ্ধতিতে প্রদান করা
                  হবে। আপনার ব্যাংক বা প্রদানকারীর উপর নির্ভর করে প্রসেসিং টাইম
                  ৫-১০ কর্মদিবস লাগতে পারে।
                </p>
                <div className="mb-3 font-bold">৫. যোগাযোগ ও সহায়তা</div>
                <p>
                  এই নীতিমালা সম্পর্কে প্রশ্ন থাকলে যোগাযোগ করুন: <br />
                  {supportEmail} <br />
                  {contactPhone}
                </p>
              </>
            ) : (
              <>
                {/* English Version */}
                <p>
                  We aim to deliver high-quality marketing services and content.
                  The following refund terms apply to payments made for our
                  services and digital products.
                </p>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    1. Scope of Refunds
                  </h2>
                  <p>
                    Fees for services, workshops, retainers, and digital
                    deliverables are generally non-refundable once work has
                    begun or access/assets have been delivered. By accessing or
                    using any deliverable, you acknowledge that refunds are
                    limited.
                  </p>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    2. Exceptions and Considerations
                  </h2>
                  <p>
                    Refunds may be considered for duplicate charges, payment
                    errors, or clearly defective digital files. Requests must
                    include proof of payment and be submitted within 7 business
                    days of the transaction.
                  </p>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    3. How to Request a Refund
                  </h2>
                  <p>
                    Email {supportEmail} with your receipt, name, email, phone
                    number, transaction ID, and a brief reason. We will review
                    and respond within 10 business days.
                  </p>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    4. After Approval
                  </h2>
                  <p>
                    Approved refunds are issued to the original payment method
                    only. Processing times depend on your bank or provider and
                    may take 5–10 business days after we initiate the refund.
                  </p>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    5. Contact and Support
                  </h2>
                  <p>
                    For questions or assistance, please contact us: <br />
                    <strong>Email:</strong> {supportEmail} <br />
                    <strong>Phone:</strong> {contactPhone}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Language Toggle Button */}
          <div className="mt-6 mx-auto max-w-max">
            <button
              onClick={() => setShowBengali(!showBengali)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 text-gray-900 font-semibold rounded-lg hover:bg-yellow-600 transition-colors"
            >
              <Languages className="h-4 w-4" />
              {showBengali ? "Show English" : "বাংলায় দেখুন"}
            </button>
          </div>
        </motion.div>
      </section>
    </>
  );
}
