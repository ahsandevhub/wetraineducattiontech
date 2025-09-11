"use client";
import { motion } from "framer-motion";
import { ArrowLeft, SearchX } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center bg-white px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-xl"
      >
        <SearchX className="w-20 h-20 text-yellow-400 mx-auto mb-6" />
        <h1 className="text-5xl font-bold text-gray-900 mb-4">৪০৪</h1>
        <p className="text-xl text-gray-700 font-semibold mb-2">
          উফ! পেজটি খুঁজে পাওয়া যায়নি।
        </p>
        <p className="text-gray-600 mb-6">
          আপনি যে পেজটি খুঁজছেন সেটি মুছে ফেলা হয়েছে, স্থানান্তর করা হয়েছে,
          অথবা কখনও ছিল না।
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium bg-[var(--primary-yellow)] text-gray-900 rounded-lg shadow hover:bg-[var(--secondary-yellow)] transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          হোম পেজে ফিরে যান
        </Link>
      </motion.div>
    </section>
  );
}
