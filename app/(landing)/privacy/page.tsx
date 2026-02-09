"use client";
import { motion } from "framer-motion";
import { Languages } from "lucide-react";
import { useState } from "react";
import { useContactInfo } from "../../utils/contactInfo";

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-700">
            Your privacy is important to us. Learn how WeTrainEducation & Tech
            collects, uses, and protects your personal information.
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
                <h2 className="text-2xl font-bold mb-4">গোপনীয়তা নীতিমালা</h2>
                <p className="mb-4">
                  WeTrainEducation & Tech আপনার ব্যক্তিগত তথ্য রক্ষা করতে এবং
                  স্বচ্ছতার সাথে পরিচালনা করতে প্রতিশ্রুতিবদ্ধ। এই গোপনীয়তা
                  নীতিমালা ব্যাখ্যা করে যে আমরা কী ধরনের তথ্য সংগ্রহ করি, কীভাবে
                  ব্যবহার করি এবং কীভাবে রক্ষা করি।
                </p>

                <div className="mb-3 font-bold">১. আমরা কী তথ্য সংগ্রহ করি</div>
                <p className="mb-4">
                  আমরা নিম্নলিখিত ধরনের তথ্য সংগ্রহ করতে পারি:
                </p>
                <ul className="list-disc list-inside mb-4 space-y-2">
                  <li>
                    নাম, ইমেইল, ফোন নম্বর এবং অন্যান্য যোগাযোগ তথ্য যা আপনি
                    ফর্মে প্রদান করেন
                  </li>
                  <li>কোর্স রেজিস্ট্রেশন এবং পেমেন্ট তথ্য</li>
                  <li>ব্রাউজিং ডেটা, আইপি ঠিকানা, কুকিজ এবং ডিভাইস তথ্য</li>
                  <li>আপনি যখন আমাদের সাইট ব্যবহার করেন তখনকার কার্যকলাপ লগ</li>
                </ul>

                <div className="mb-3 font-bold">
                  ২. আমরা আপনার তথ্য কীভাবে ব্যবহার করি
                </div>
                <p className="mb-4">
                  আমরা আপনার তথ্য ব্যবহার করি আপনার অনুরোধ অনুযায়ী পরিষেবা
                  প্রদান, আপনার সাথে যোগাযোগ, সাপোর্ট প্রদান, সেবা উন্নত করা এবং
                  আইনি বাধ্যবাধকতা মেনে চলতে।
                </p>

                <div className="mb-3 font-bold">৩. তথ্য নিরাপত্তা</div>
                <p className="mb-4">
                  আমরা শিল্প-মান নিরাপত্তা ব্যবস্থা ব্যবহার করি আপনার তথ্য রক্ষা
                  করতে যেমন এনক্রিপশন, সীমিত অ্যাক্সেস এবং নিয়মিত নিরাপত্তা
                  অডিট।
                </p>

                <div className="mb-3 font-bold">৪. আপনার অধিকার</div>
                <p>
                  আপনি আপনার তথ্য অ্যাক্সেস, সংশোধন বা মুছে ফেলার অধিকার রাখেন।
                  যোগাযোগ করুন: <br />
                  <strong>ইমেইল:</strong> {supportEmail} <br />
                  <strong>ফোন:</strong> {contactPhone}
                </p>
              </>
            ) : (
              <>
                {/* English Version */}
                <h2 className="text-2xl font-bold mb-4">Privacy Policy</h2>
                <p>
                  This Privacy Policy explains how WeTrainEducation & Tech
                  collects, uses, discloses, and safeguards your information
                  when you visit our website or use our services.
                </p>

                <h3 className="text-xl font-bold">1. Information We Collect</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    <strong>Personal Information:</strong> Name, email, phone,
                    and payment details you provide
                  </li>
                  <li>
                    <strong>Course & Service Data:</strong> Enrollment status,
                    completion records, and feedback
                  </li>
                  <li>
                    <strong>Usage Data:</strong> Pages visited, time spent,
                    clicks, and device information
                  </li>
                  <li>
                    <strong>Cookies & Tracking:</strong> We use cookies and
                    similar technologies to enhance experience
                  </li>
                </ul>

                <h3 className="text-xl font-bold">
                  2. How We Use Your Information
                </h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    Provide courses, software, and marketing services you
                    request
                  </li>
                  <li>Respond to inquiries and deliver customer support</li>
                  <li>Personalize your experience</li>
                  <li>Improve our services and analyze usage</li>
                  <li>Comply with legal obligations</li>
                  <li>Detect and prevent fraud</li>
                </ul>

                <h3 className="text-xl font-bold">3. Data Security</h3>
                <p>
                  We use SSL encryption, secure payment processing, regular
                  security audits, and limited access to protect your
                  information. However, no online system is completely secure.
                </p>

                <h3 className="text-xl font-bold">
                  4. Sharing Your Information
                </h3>
                <p>
                  We do not sell or trade your personal information. We may
                  share it with service providers under confidentiality
                  agreements or when required by law.
                </p>

                <h3 className="text-xl font-bold">5. Your Rights</h3>
                <p>
                  You can request access, correction, deletion, or opt-out of
                  communications. You can also control cookies through your
                  browser settings.
                </p>

                <h3 className="text-xl font-bold">
                  6. Children&apos;s Privacy
                </h3>
                <p>
                  Our services are not intended for children under 13. We do not
                  knowingly collect information from children under this age.
                </p>

                <h3 className="text-xl font-bold">7. Policy Updates</h3>
                <p>
                  We may update this policy to reflect changes in our practices
                  or laws. We will notify you of significant changes.
                </p>

                <h3 className="text-xl font-bold">8. Contact Us</h3>
                <p>
                  For questions or assistance, please contact us: <br />
                  <strong>Email:</strong> {supportEmail} <br />
                  <strong>Phone:</strong> {contactPhone}
                </p>

                <p className="mt-6 text-sm text-gray-600">
                  <strong>Last Updated:</strong> February 2026
                </p>
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
