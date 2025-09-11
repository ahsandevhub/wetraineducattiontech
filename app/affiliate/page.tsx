"use client";
import { motion } from "framer-motion";

export default function AffiliatePage() {
  return (
    <>
      {/* Hero-style Header */}
      <section className="relative bg-gradient-to-b from-yellow-200 to-white sm:py-20 py-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto px-6"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            অ্যাফিলিয়েট তথ্য
          </h1>
          <p className="text-lg text-gray-700">
            WeTrain Education & Tech OPC-এর অ্যাফিলিয়েট লিংক ও মার্কেটিং
            অংশীদারিত্ব সম্পর্কিত গুরুত্বপূর্ণ তথ্য।
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
            আমাদের ওয়েবসাইট বা কনটেন্টে আপনি কিছু তৃতীয় পক্ষের লিংক (বিশেষ করে{" "}
            <strong>WeMasterTrade</strong>) দেখতে পারেন, যেগুলোর মাধ্যমে আমরা
            অ্যাফিলিয়েট কমিশন পেতে পারি। নিচে অ্যাফিলিয়েট কার্যক্রম সম্পর্কিত
            আমাদের নীতিমালা তুলে ধরা হলো:
          </p>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              ১. অ্যাফিলিয়েট লিংক কী?
            </h2>
            <p>
              অ্যাফিলিয়েট লিংক এমন একটি ট্র্যাকিং লিংক যার মাধ্যমে আপনি কোনো
              তৃতীয় পক্ষের প্ল্যাটফর্মে গেলে এবং সাইন আপ করলে আমরা একটি ক্ষুদ্র
              কমিশন পেতে পারি — আপনার খরচ না বাড়িয়ে।
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              ২. আমাদের অ্যাফিলিয়েট সম্পর্ক
            </h2>
            <p>
              WeTrain Education, WeMasterTrade-এর কোনো অফিসিয়াল শাখা নয়। আমরা
              কেবল একটি অংশীদারিত্ব ভিত্তিক অ্যাফিলিয়েট প্রোগ্রামের অংশ হিসেবে
              প্ল্যাটফর্মটি প্রচার করি। আপনি যদি আমাদের রেফারেন্সে সাইন আপ করেন,
              আমরা কমিশন পেতে পারি।
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              ৩. নিরপেক্ষতা ও স্বচ্ছতা
            </h2>
            <p>
              আমাদের রিভিউ, ব্লগ পোস্ট এবং ভিডিও কনটেন্ট অ্যাফিলিয়েট কমিশনের
              উপর ভিত্তি করে তৈরি নয়। আমরা সর্বদা নিরপেক্ষভাবে তথ্য উপস্থাপন
              করার চেষ্টা করি যাতে আপনি নিজের সিদ্ধান্ত নিজেই নিতে পারেন।
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              ৪. আপনার দায়িত্ব
            </h2>
            <p>
              আপনি কোনো অ্যাফিলিয়েট লিংক ব্যবহার করে কোনো প্ল্যাটফর্মে সাইন আপ
              করার আগে তাদের শর্তাবলী, প্রাইভেসি পলিসি এবং নিয়মাবলী পড়ে বুঝে
              নিন। WeTrain কোনো তৃতীয় পক্ষের কার্যক্রম বা সিদ্ধান্তের জন্য
              দায়ী নয়।
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              ৫. যোগাযোগ
            </h2>
            <p>
              অ্যাফিলিয়েট সম্পর্ক বা কোনো প্রশ্ন থাকলে আমাদের সাথে যোগাযোগ
              করুন:
              <br />
              📧 support@wetraineducation.com <br />
              📞 +880 1887-864760
            </p>
          </div>
        </motion.div>
      </section>
    </>
  );
}
