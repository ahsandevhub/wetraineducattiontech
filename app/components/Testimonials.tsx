"use cl    {
      name: "Sarah Johnson",
      role: "CEO, Tech Startup",
      text: "Their marketing strategies transformed our business completely. We saw a 300% increase in leads within the first quarter of working with them.",
      avatar: "/avatars/rajesh.avif",
      profit: "300% Lead Growth",
      rating: 5,
    },import { motion } from "framer-motion";
import { Clock, Star, TrendingUp, Users } from "lucide-react";
import Image from "next/image";

export default function Testimonials() {
  const testimonials = [
    {
      name: "মো. নাহিয়ান ইসলাম",
      role: "শিক্ষার্থী, খুলনা",
      text: "WeTrain Education-এর কোর্সগুলো খুবই সহজবোধ্য এবং কার্যকর। আমি এক মাসে প্রফেশনাল ট্রেডিং সম্পর্কে স্পষ্ট ধারণা পেয়েছি।",
      avatar: "/avatars/rajesh.avif",
      profit: "ফান্ডেড প্রস্তুত",
      rating: 5,
    },
    {
      name: "জাহানারা সুলতানা",
      role: "গৃহিণী ও শিক্ষার্থী, বরিশাল",
      text: "আমি আগে ট্রেডিং নিয়ে দ্বিধায় ছিলাম, কিন্তু এখানকার সাপোর্ট টিম এবং লাইভ ক্লাস আমাকে আত্মবিশ্বাস দিয়েছে।",
      avatar: "/avatars/ayesha.jpg",
      profit: "৩টি মডিউল সম্পন্ন",
      rating: 5,
    },
    {
      name: "তানভীর হাসান",
      role: "ফ্রিল্যান্সার ও শিক্ষার্থী, রংপুর",
      text: "এই প্ল্যাটফর্মে শেখা শুরু করার পর আমি আমার প্রথম চ্যালেঞ্জ ফান্ডিংয়ের জন্য আবেদন করেছি। কোর্সগুলো খুব স্ট্রাকচার্ড।",
      avatar: "/avatars/vikram.jpg",
      profit: "প্রশংসাপত্র অর্জন",
      rating: 4,
    },
  ];

  const stats = [
    { value: "৪.৯/৫", label: "কোর্স রেটিং (Student Review)", icon: Star },
    { value: "৯৮%", label: "শিক্ষার্থীর সন্তুষ্টি", icon: TrendingUp },
    { value: "২৪-৪৮ ঘণ্টা", label: "সাপোর্ট রেসপন্স টাইম", icon: Clock },
    { value: "১০০০+", label: "অ্যাকটিভ শিক্ষার্থী", icon: Users },
  ];

  return (
    <section
      id="testimonials"
      className="relative py-24 bg-[var(--tertiary-yellow)] overflow-hidden border-y-2 border-yellow-200/50 font-[Baloo Da 2]"
    >
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/wireframe.png')] opacity-10"></div>
        <div className="absolute top-1/4 left-1/4 w-60 h-60 rounded-full bg-[var(--primary-yellow)] blur-[100px] opacity-10"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[var(--secondary-yellow)] blur-[100px] opacity-10"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-50px" }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-[var(--primary-yellow)]/10 text-[var(--primary-yellow)] px-4 py-2 rounded-full text-sm font-medium mb-4">
            শিক্ষার্থীদের অভিজ্ঞতা
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <span className="text-[var(--primary-yellow)]">১,০০০+</span>{" "}
            সন্তুষ্ট শিক্ষার্থী
          </h2>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            বাস্তব শিক্ষার্থীদের অভিজ্ঞতা যারা WeTrain Education-এর মাধ্যমে
            ট্রেডিং শিখেছেন।
          </p>
        </motion.div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              viewport={{ once: true, margin: "-50px" }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl p-8 border border-gray-100 hover:shadow-lg transition-all h-full flex flex-col"
            >
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < t.rating
                        ? "text-[var(--primary-yellow)] fill-[var(--primary-yellow)]"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <p className="text-gray-600 mb-6 flex-grow italic">
                &quot;{t.text}&quot;
              </p>
              <div className="flex items-center">
                <Image
                  src={t.avatar}
                  alt={t.name}
                  height={48}
                  width={48}
                  className="w-12 h-12 rounded-full border-2 border-[var(--primary-yellow)] object-cover mr-4"
                />
                <div>
                  <h4 className="text-gray-900 font-bold">{t.name}</h4>
                  <p className="text-gray-500 text-sm">{t.role}</p>
                </div>
              </div>
              <div className="mt-6 bg-[var(--tertiary-yellow)] rounded-lg p-3 text-center">
                <p className="text-sm text-gray-600">অর্জন</p>
                <p className="text-xl font-bold text-[var(--primary-yellow)]">
                  {t.profit}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true, margin: "-50px" }}
          className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-3">
                    <div className="w-12 h-12 rounded-full bg-[var(--primary-yellow)]/10 flex items-center justify-center text-[var(--primary-yellow)]">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
