"use client";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Clock, GraduationCap } from "lucide-react";

export default function CoursesPage() {
  const courses = [
    {
      title: "বেসিক ফরেক্স ট্রেডিং",
      description:
        "ফরেক্স মার্কেটের ভিত্তি, মুদ্রা জোড়া, টাইমফ্রেম, এবং ট্রেডিং টার্মস সম্পর্কে বিস্তারিত শেখা।",
      duration: "৪ সপ্তাহ",
      level: "শুরুর জন্য উপযোগী",
      details: [
        "ফরেক্স মার্কেট কী ও কীভাবে কাজ করে",
        "বিড/আস্ক, পিপ, লিভারেজ ও লট সাইজ ব্যাখ্যা",
        "মার্কেট টাইপ ও ট্রেডিং সেশনের পরিচিতি",
        "ডেমো অ্যাকাউন্ট সেটআপ ও অর্ডার টুল ব্যবহার",
        "প্রাথমিক টেকনিক্যাল অ্যানালাইসিস (সাপোর্ট/রেজিস্টেন্স)",
      ],
    },
    {
      title: "প্রফেশনাল ট্রেডিং স্ট্র্যাটেজি",
      description:
        "টেকনিক্যাল অ্যানালাইসিস, রিস্ক ম্যানেজমেন্ট এবং লাইভ মার্কেট প্ল্যান নিয়ে একটি বাস্তবমুখী কোর্স।",
      duration: "৬ সপ্তাহ",
      level: "মধ্যম থেকে উন্নত",
      details: [
        "ইন্ডিকেটর ও প্রাইস অ্যাকশন স্ট্র্যাটেজি",
        "এন্ট্রি/এক্সিট স্ট্র্যাটেজি ও সিগন্যাল ফিল্টারিং",
        "মাল্টি-টাইমফ্রেম অ্যানালাইসিস",
        "রিস্ক-রিওয়ার্ড ক্যালকুলেশন ও ট্রেডিং জার্নাল",
        "লাইভ মার্কেট রিভিউ ও রেকর্ডেড রিভিউ ক্লাস",
      ],
    },
    {
      title: "ফান্ডেড চ্যালেঞ্জ প্রস্তুতি",
      description:
        "প্রপ ফার্ম চ্যালেঞ্জ পাস করতে কীভাবে প্রস্তুতি নিতে হয় তার জন্য নির্ধারিত একটি গাইডেড কোর্স।",
      duration: "৩ সপ্তাহ",
      level: "ফান্ডেড প্রস্তুতির জন্য",
      details: [
        "চ্যালেঞ্জের নিয়ম, রিস্ক প্যারামিটার ও লিমিট",
        "ট্রেডিং প্ল্যান তৈরি ও অনুশীলন",
        "ড্রডাউন কন্ট্রোল ও সাইকোলজি মডিউল",
        "নিয়মিত মক চ্যালেঞ্জ সিমুলেশন",
        "ট্র্যাকিং টুলস ও মেন্টর ফিডব্যাক সেশন",
      ],
    },
  ];

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
            আমাদের কোর্সসমূহ
          </h1>
          <p className="text-lg text-gray-700">
            ট্রেডিং শেখা শুরু করুন ভিত্তি থেকে প্রফেশনাল লেভেল পর্যন্ত — আপনার
            দক্ষতা অনুযায়ী কোর্স বেছে নিন।
          </p>
        </motion.div>
      </section>

      {/* Course Cards */}
      <section className="max-w-6xl mx-auto px-6 pb-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-3 mb-4 text-yellow-600">
              <GraduationCap className="w-6 h-6" />
              <h2 className="text-xl font-bold text-gray-900">
                {course.title}
              </h2>
            </div>
            <p className="text-gray-600 mb-4">{course.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <Clock className="w-4 h-4" />
              <span>{course.duration}</span>
              <BookOpen className="w-4 h-4" />
              <span>{course.level}</span>
            </div>
            <a
              href="/checkout"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary-yellow)] text-gray-900 font-semibold rounded-lg hover:bg-[var(--secondary-yellow)] transition-all"
            >
              ভর্তি হন <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        ))}
      </section>

      {/* Course Details */}
      <section className="max-w-6xl mx-auto px-6 pb-24 space-y-10">
        {courses.map((course, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
            className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all"
          >
            <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 border-b border-yellow-200 px-6 py-5 rounded-t-2xl">
              <h2 className="text-2xl md:text-3xl font-bold text-yellow-800">
                {course.title}
              </h2>
              <p className="text-sm text-yellow-700 mt-1">
                বিস্তারিত মডিউল এবং শেখার বিষয়বস্তু
              </p>
            </div>

            <div className="px-6 py-6">
              <ul className="list-disc pl-6 text-gray-700 leading-8 space-y-2">
                {course.details.map((item, idx) => (
                  <li key={idx} className="relative">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </section>
    </>
  );
}
