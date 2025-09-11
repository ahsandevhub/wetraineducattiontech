"use client";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function CheckoutPage() {
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
            কোর্স ভর্তি
          </h1>
          <p className="text-lg text-gray-700">
            আপনার আগ্রহের জন্য ধন্যবাদ! আমাদের কোর্সগুলো খুব শীঘ্রই শুরু হচ্ছে।
          </p>
        </motion.div>
      </section>

      {/* Coming Soon Message */}
      <section className="max-w-xl mx-auto px-6 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 shadow-sm"
        >
          <Loader2 className="w-10 h-10 text-yellow-500 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-yellow-800 mb-2">
            কোর্স প্রকাশের প্রস্তুতি চলছে...
          </h2>
          <p className="text-gray-700 leading-7">
            আমাদের টিম বর্তমানে কোর্স লঞ্চের শেষ প্রস্তুতিতে ব্যস্ত। <br />
            নতুন ব্যাচের ঘোষণা খুব শীঘ্রই দেওয়া হবে।
          </p>
          <p className="text-sm text-gray-500 mt-6">
            অনুগ্রহ করে নিয়মিত আমাদের ওয়েবসাইট ভিজিট করুন অথবা <br />
            <span className="underline">support@wetraineducation.com</span> এ
            যোগাযোগ করুন।
          </p>
        </motion.div>
      </section>
    </>
  );
}
