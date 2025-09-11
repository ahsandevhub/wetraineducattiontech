"use client";
import { motion } from "framer-motion";

export default function TermsPage() {
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
            ব্যবহারের শর্তাবলী
          </h1>
          <p className="text-lg text-gray-700">
            WeTrain Education & Tech OPC এর ওয়েবসাইট, কোর্স ও পরিষেবা ব্যবহারের
            নিয়মাবলী।
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
            এই ওয়েবসাইটে প্রবেশ করে বা আমাদের কোর্স, কনটেন্ট বা সার্ভিস ব্যবহার
            করে, আপনি নিচের শর্তাবলীতে সম্মত হচ্ছেন। যদি আপনি এই শর্তাবলীতে
            সম্মত না হন, তাহলে অনুগ্রহ করে আমাদের ওয়েবসাইট বা কোনো কোর্স
            ব্যবহার করবেন না।
          </p>

          <div className="text-gray-700 leading-7 mb-6">
            <p className="mb-3 font-bold">১. পরিষেবার প্রকৃতি</p>
            <p>
              WeTrain Education & Tech OPC শুধুমাত্র ট্রেডিং ও আইটি-ভিত্তিক
              শিক্ষামূলক কনটেন্ট, মেন্টরশিপ, এবং কোর্স প্রদান করে। আমরা কোনো
              প্রকার ট্রেডিং, বিনিয়োগ, ব্রোকারেজ বা লাইভ ট্রেডিং অ্যাকাউন্ট
              পরিচালনা করি না।
            </p>
          </div>

          <div className="text-gray-700 leading-7 mb-6">
            <p className="mb-3 font-bold">২. ব্যক্তিগত ব্যবহার</p>
            <p>
              আমাদের সকল কনটেন্ট শুধুমাত্র ব্যক্তিগত ও শিক্ষার উদ্দেশ্যে
              ব্যবহারের জন্য প্রদান করা হয়। কোনো কনটেন্ট পুনঃপ্রকাশ, বিক্রয় বা
              বাণিজ্যিকভাবে ব্যবহার করা যাবে না।
            </p>
          </div>

          <div className="text-gray-700 leading-7 mb-6">
            <p className="mb-3 font-bold">৩. কপিরাইট ও মালিকানা</p>
            <p>
              সকল কোর্স, ভিডিও, আর্টওয়ার্ক, কোড, ও অন্যান্য কনটেন্ট WeTrain
              Education-এর স্বত্বাধিকারভুক্ত। অনুমতি ব্যতীত এগুলো ব্যবহার আইনত
              দণ্ডনীয়।
            </p>
          </div>

          <div className="text-gray-700 leading-7 mb-6">
            <p className="mb-3 font-bold">৪. বহিঃলিংক এবং দায়ভার</p>
            <p>
              ওয়েবসাইটে তৃতীয় পক্ষের (যেমন: WeMasterTrade) লিংক থাকতে পারে,
              যেগুলোর জন্য WeTrain কোনোভাবে দায়ী নয়। এসব লিংক ব্যবহার সম্পূর্ণ
              আপনার নিজ দায়িত্বে।
            </p>
          </div>

          <div className="text-gray-700 leading-7 mb-6">
            <p className="mb-3 font-bold">৫. পেমেন্ট ও রিফান্ড</p>
            <p>
              কোর্স ফি একবার প্রদান করার পর তা সাধারণত ফেরতযোগ্য নয়। শুধুমাত্র
              পূর্বনির্ধারিত শর্ত সাপেক্ষে রিফান্ড দেয়া হতে পারে। সকল পেমেন্ট
              শুধুমাত্র প্রশিক্ষণ ও লার্নিং কনটেন্টের জন্য গ্রহন করা হয়।
            </p>
          </div>

          <div className="text-gray-700 leading-7 mb-6">
            <p className="mb-3 font-bold">৬. আইনি বাধ্যবাধকতা</p>
            <p>
              এই শর্তাবলী বাংলাদেশের প্রচলিত আইন অনুসারে প্রযোজ্য হবে এবং সকল
              আইনি বিরোধ নিষ্পত্তি হবে ঢাকা জেলাধীন আদালতের মাধ্যমে।
            </p>
          </div>
        </motion.div>
      </section>
    </>
  );
}
