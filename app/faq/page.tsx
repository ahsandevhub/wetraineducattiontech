"use client";
import { motion } from "framer-motion";

export default function FAQPage() {
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
            প্রশ্নোত্তর
          </h1>
          <p className="text-lg text-gray-700">
            WeTrain Education & Tech OPC সম্পর্কে শিক্ষার্থীদের করা সাধারণ কিছু
            প্রশ্ন এবং তার উত্তর।
          </p>
        </motion.div>
      </section>

      {/* FAQ Content */}
      <section className="max-w-4xl mx-auto pb-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-gray-700 leading-7 space-y-10"
        >
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              ১. WeTrain কি কোনো লাইভ ট্রেডিং অ্যাকাউন্ট সরবরাহ করে?
            </h2>
            <p>
              না। WeTrain শুধুমাত্র ট্রেডিং প্রশিক্ষণ, কোর্স এবং মেন্টরশিপ
              প্রদান করে। আমরা লাইভ ট্রেডিং, ব্রোকারেজ বা ফান্ডেড অ্যাকাউন্ট
              সরবরাহ করি না।
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              ২. আমি কীভাবে কোর্সে ভর্তি হতে পারি?
            </h2>
            <p>
              আমাদের ওয়েবসাইটের &quot;পেমেন্ট করুন&quot; বা &quot;কোর্স ব্রাউজ
              করুন&quot; বাটনে ক্লিক করে আপনি সহজেই অনলাইন পেমেন্টের মাধ্যমে
              ভর্তি হতে পারেন।
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              ৩. পেমেন্ট করার পর কোর্স কিভাবে অ্যাক্সেস করবো?
            </h2>
            <p>
              পেমেন্ট সফল হলে আপনাকে একটি কনফার্মেশন মেইল/মেসেজ এবং লগইন লিঙ্ক
              প্রদান করা হবে। সেখান থেকেই আপনি কোর্স অ্যাক্সেস করতে পারবেন।
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              ৪. রিফান্ড কীভাবে পাওয়া যাবে?
            </h2>
            <p>
              আমাদের রিফান্ড নীতি অনুযায়ী নির্দিষ্ট কিছু শর্তে (যেমন:
              প্রযুক্তিগত ত্রুটি) রিফান্ড বিবেচনা করা যেতে পারে। বিস্তারিত জানতে{" "}
              <a href="/refund" className="text-yellow-600 underline">
                রিফান্ড নীতি
              </a>{" "}
              পেজটি দেখুন।
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              ৫. WeTrain-এর সাথে WeMasterTrade-এর সম্পর্ক কী?
            </h2>
            <p>
              WeTrain Education একটি স্বাধীন শিক্ষা প্রতিষ্ঠান যা
              WeMasterTrade-এর মার্কেটিং ও সাপোর্ট পার্টনার। আমরা তাদের পক্ষ
              থেকে কোনও অর্থ গ্রহণ বা ট্রেডিং পরিচালনা করি না।
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              ৬. আমি কিভাবে সহায়তা পাব?
            </h2>
            <p>
              আপনি আমাদের অফিসিয়াল ইমেইলে support@wetraineducation.com লিখে
              অথবা 📞 +880 1887-864760 নম্বরে কল করে সহায়তা নিতে পারেন।
            </p>
          </div>
        </motion.div>
      </section>
    </>
  );
}
