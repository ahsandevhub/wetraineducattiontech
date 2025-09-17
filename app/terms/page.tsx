"use client";

import { motion } from "framer-motion";

// Removed ShowBengaliButton import
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
          <div className="text-gray-700 leading-7 mb-10 border border-yellow-300 rounded-lg p-6 bg-yellow-50">
            <h2 className="text-2xl font-bold mb-4">ব্যবহারের শর্তাবলী</h2>
            <p className="mb-4">
              আমাদের ওয়েবসাইট, উপকরণ বা পরিষেবা ব্যবহার করে আপনি নিচের
              শর্তাবলীতে সম্মত হচ্ছেন। আপনি যদি সম্মত না হন, অনুগ্রহ করে আমাদের
              ওয়েবসাইট বা পরিষেবা ব্যবহার করবেন না।
            </p>
            <div className="mb-3 font-bold">১. পরিষেবার প্রকৃতি</div>
            <p className="mb-4">
              আমরা মার্কেটিং ও যোগাযোগ পরিষেবা যেমন কৌশল, ডিজিটাল বিজ্ঞাপন,
              কনটেন্ট তৈরি, ব্র্যান্ডিং, সোশ্যাল মিডিয়া ম্যানেজমেন্ট,
              এসইও/এসইএম, অ্যানালিটিক্স এবং সংশ্লিষ্ট প্রশিক্ষণ প্রদান করি। আমরা
              কোনো আইনি, ট্যাক্স বা আর্থিক পরামর্শ দিই না এবং নির্দিষ্ট ফলাফল বা
              আয়ের নিশ্চয়তা দিই না।
            </p>
            <div className="mb-3 font-bold">২. অনুমোদিত ব্যবহার</div>
            <p className="mb-4">
              সমস্ত কনটেন্ট ও ডেলিভারেবল শুধুমাত্র বৈধ ব্যবসায়িক ও শিক্ষামূলক
              উদ্দেশ্যে প্রদান করা হয়। আমাদের লিখিত অনুমতি ছাড়া আপনি আমাদের
              উপকরণ কপি, পুনরায় বিক্রি, সাবলাইসেন্স বা পুনরায় বিতরণ করতে
              পারবেন না। আপনার অ্যাকাউন্ট ব্যবহারের জন্য এবং প্রযোজ্য আইন মেনে
              চলার দায়িত্ব আপনার।
            </p>
            <div className="mb-3 font-bold">৩. মেধাস্বত্ব</div>
            <p className="mb-4">
              সমস্ত উপকরণ, যেমন কপি, গ্রাফিক্স, ভিডিও, কোড, ক্যাম্পেইন অ্যাসেট ও
              ডকুমেন্টেশন আমাদের বা আমাদের লাইসেন্সদাতার মালিকানাধীন। অনুমতি
              ছাড়া ব্যবহার, পুনরুৎপাদন বা ডেরিভেটিভ কাজ তৈরি নিষিদ্ধ।
            </p>
            <div className="mb-3 font-bold">৪. তৃতীয় পক্ষের লিঙ্ক ও টুল</div>
            <p className="mb-4">
              আমাদের সাইটে তৃতীয় পক্ষের প্ল্যাটফর্ম ও পরিষেবার রেফারেন্স বা
              লিঙ্ক থাকতে পারে। আমরা তাদের কনটেন্ট, নীতি বা প্রাপ্যতার জন্য
              দায়ী নই। তৃতীয় পক্ষের টুল ব্যবহারের ঝুঁকি আপনার এবং তাদের
              শর্তাবলীর অধীন।
            </p>
            <div className="mb-3 font-bold">৫. ফি ও রিফান্ড</div>
            <p className="mb-4">
              ফি, ইনভয়েস ও পেমেন্ট শিডিউল প্রযোজ্য অর্ডার ফর্ম বা প্রস্তাবে
              নির্ধারিত। অন্যথায় উল্লেখ না থাকলে, পরিষেবা শুরু বা অ্যাসেট
              ডেলিভারির পর ফি ফেরতযোগ্য নয়। ট্যাক্স ও প্রসেসিং ফি প্রযোজ্য হতে
              পারে। যেকোনো বিবেচনাধীন রিফান্ড আমাদের প্রকাশিত রিফান্ড নীতিমালা
              অনুযায়ী।
            </p>
            <div className="mb-3 font-bold">৬. আইন ও বিরোধ নিষ্পত্তি</div>
            <p>
              এই শর্তাবলী আপনার এখতিয়ারের আইনের অধীন। বিরোধ কেবলমাত্র আপনার
              শহর/রাজ্যের আদালতে নিষ্পত্তি হবে। পরিষেবা &quot;যেমন আছে&quot;
              ভিত্তিতে প্রদান করা হয়; আমাদের দায়বদ্ধতা আইনের সর্বোচ্চ সীমা
              পর্যন্ত সীমিত। আমরা যেকোনো সময় এই শর্তাবলী আপডেট করতে পারি।{" "}
              <br />
              যোগাযোগ: {supportEmail} <br />
              {contactPhone}
            </p>
          </div>
          {/* English version always shown */}
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
