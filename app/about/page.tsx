"use client";
import { motion } from "framer-motion";

export default function AboutPage() {
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
            আমাদের সম্পর্কে
          </h1>
          <p className="text-lg text-gray-700">
            WeTrain Education & Tech OPC — আইনসম্মতভাবে নিবন্ধিত একটি ট্রেনিং ও
            টেকনোলজি কোম্পানি, যা ভবিষ্যৎ ট্রেডারদের দক্ষ করে তুলতে
            প্রতিশ্রুতিবদ্ধ।
          </p>
        </motion.div>
      </section>

      {/* Main Content Section */}
      <section className="max-w-4xl mx-auto pb-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-gray-700 leading-7 mb-6">
            <strong>WeTrain Education & Tech OPC</strong> একটি One Person
            Company (OPC) যা{" "}
            <strong>Companies Act, 1994 (Second Amendment 2020)</strong> এর
            অধীনে ২০২৫ সালের মে মাসে বাংলাদেশে নিবন্ধিত হয়েছে। প্রতিষ্ঠানটি
            একজন পরিচালক ও একমাত্র শেয়ারহোল্ডার দ্বারা পরিচালিত, এবং RJSC-এর
            নিবন্ধন নম্বর 510710 দ্বারা বৈধতা প্রাপ্ত।
          </p>

          <p className="text-gray-700 leading-7 mb-6">
            আমাদের লক্ষ্য হল আন্তর্জাতিক মানসম্পন্ন ট্রেডিং শিক্ষা, সফটওয়্যার
            সলিউশন, এবং আইটি সার্ভিসের মাধ্যমে তরুণদের দক্ষতা বৃদ্ধি ও
            ক্যারিয়ার প্রস্তুতি। প্রতিষ্ঠানটি আধুনিক প্রযুক্তি ব্যবহারের
            মাধ্যমে বাস্তবমুখী শিক্ষা এবং প্রশিক্ষণ সরবরাহে প্রতিশ্রুতিবদ্ধ।
          </p>

          <div className="text-gray-700 leading-7 mb-6">
            <p className="mb-3 font-medium">প্রধান কার্যক্রমসমূহ:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>ট্রেনিং সেন্টার ও অফিস স্থাপন ও পরিচালনা</li>
              <li>প্রিন্ট ও ডিজিটাল ফরম্যাটে শিক্ষামূলক কনটেন্ট তৈরি</li>
              <li>ই-লার্নিং প্ল্যাটফর্ম, অনলাইন কোর্স ও সার্টিফিকেশন</li>
              <li>ওয়ার্কশপ, সেমিনার এবং দক্ষতা উন্নয়নমূলক প্রোগ্রাম</li>
              <li>এডুকেশন সফটওয়্যার, LMS ও আইটি সলিউশন ডেভেলপমেন্ট</li>
              <li>
                দেশি ও আন্তর্জাতিক ক্লায়েন্টদের জন্য আইটি এবং কনসালটেন্সি সেবা
              </li>
              <li>
                জয়েন্ট ভেঞ্চার, পার্টনারশিপ ও অন্যান্য কোম্পানির সঙ্গে সহযোগিতা
              </li>
            </ul>
          </div>

          <p className="text-gray-700 leading-7 mb-6">
            আমরা <strong>WeMasterTrade</strong>-এর জন্য বাংলাদেশে মার্কেটিং,
            গ্রাহক সাপোর্ট এবং সেলস সেবা দিয়ে থাকি। তবে WeTrain Education নিজে
            কোনো প্রপ ফার্ম বা লাইসেন্সপ্রাপ্ত আর্থিক প্রতিষ্ঠান নয় এবং আমরা
            ট্রেডিং একাউন্ট পরিচালনা বা অর্থ সংগ্রহ করি না।
          </p>

          {/* Disclaimer Section */}
          <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-6 mt-12">
            <h2 className="text-2xl font-semibold text-yellow-800 mb-4">
              ডিসক্লেইমার
            </h2>
            <p className="text-gray-700 leading-7">
              WeTrain Education & Tech OPC একটি নিবন্ধিত শিক্ষা ও
              প্রযুক্তিভিত্তিক প্রতিষ্ঠান। আমরা কোনো ফরেক্স, সিএফডি বা
              বিনিয়োগমূলক ট্রেডিং সার্ভিস সরবরাহ করি না। আমাদের সকল কোর্স,
              কনটেন্ট ও প্ল্যাটফর্ম শুধুমাত্র শিক্ষামূলক উদ্দেশ্যে প্রযোজ্য।{" "}
              <br />
              <br />
              WeMasterTrade একটি আন্তর্জাতিক প্রপ ফার্ম, যা বাংলাদেশের কোনো
              ফিনান্সিয়াল অথরিটির অধীনে লাইসেন্সপ্রাপ্ত নয়। ব্যবহারকারীদের
              অনুরোধ করা হচ্ছে যেকোনো সিদ্ধান্ত নেয়ার আগে নিজ দায়িত্বে যথাযথ
              যাচাই করে নিতে।
            </p>
          </div>
        </motion.div>
      </section>
    </>
  );
}
