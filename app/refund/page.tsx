"use client";
import { motion } from "framer-motion";

export default function RefundPage() {
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
            রিফান্ড নীতি
          </h1>
          <p className="text-lg text-gray-700">
            WeTrain Education & Tech OPC-এ কোর্স ফি, পেমেন্ট ও রিফান্ড সংক্রান্ত
            নীতিমালা।
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
            আমাদের লক্ষ্য হলো শিক্ষার্থীদের সর্বোচ্চ মানসম্পন্ন প্রশিক্ষণ ও
            কনটেন্ট সরবরাহ করা। তবে পেমেন্ট এবং রিফান্ড বিষয়ক কিছু নির্দিষ্ট
            নীতিমালা অনুসরণ করা হয়, যা নিচে উল্লেখ করা হলো:
          </p>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              ১. রিফান্ড নীতির পরিধি
            </h2>
            <p>
              WeTrain Education কর্তৃক বিক্রিত সব কোর্স, ওয়ার্কশপ এবং ডিজিটাল
              প্রোডাক্ট সাধারণত রিফান্ডযোগ্য নয়। ব্যবহারকারী কোর্সে অ্যাক্সেস
              পাওয়ার পর তা বাতিল বা রিফান্ড চাওয়ার সুযোগ নেই।
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              ২. ব্যতিক্রম ও বিবেচনা
            </h2>
            <p>
              যদি কোনো পেমেন্ট প্রযুক্তিগত ত্রুটির কারণে দ্বৈতভাবে কেটে যায় বা
              আপনি ভুলভাবে ফি প্রদান করেন, তবে যথাযথ যাচাই-বাছাই শেষে রিফান্ড
              বিবেচনা করা হবে। এর জন্য অবশ্যই ৭ কার্যদিবসের মধ্যে আবেদন করতে
              হবে।
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              ৩. রিফান্ড আবেদন প্রক্রিয়া
            </h2>
            <p>
              রিফান্ডের জন্য আমাদের অফিসিয়াল ইমেইলে
              (support@wetraineducation.com) আপনার পেমেন্ট রসিদ, ইমেইল, ফোন
              নম্বর ও কারণ সহ একটি অনুরোধ পাঠাতে হবে। বিষয়টি যাচাই করে ১০
              কার্যদিবসের মধ্যে উত্তর দেয়া হবে।
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              ৪. রিফান্ড অনুমোদনের পর
            </h2>
            <p>
              যদি রিফান্ড অনুমোদিত হয়, তাহলে সেটি মূল পেমেন্ট মাধ্যমেই ফেরত
              দেয়া হবে। নগদ বা বিকাশে প্রদানকৃত ফি সেই অ্যাকাউন্টেই ফেরত যাবে।
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              ৫. যোগাযোগ ও সহায়তা
            </h2>
            <p>
              রিফান্ড নীতিমালা নিয়ে আপনার যদি কোনো প্রশ্ন থাকে, অনুগ্রহ করে
              আমাদের সাথে যোগাযোগ করুন: <br />
              📧 support@wetraineducation.com <br />
              📞 +880 1887-864760
            </p>
          </div>
        </motion.div>
      </section>
    </>
  );
}
