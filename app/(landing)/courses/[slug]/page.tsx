"use client";

import { createClient } from "@/app/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, Clock, Users, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useEffect, useState } from "react";

interface Service {
  id: string;
  title: string;
  slug: string;
  category: "course" | "software" | "marketing";
  price: number | null;
  discount: number | null;
  currency: string;
  details: string | null;
  key_features: string[];
  featured_image_url: string;
}

export default function CourseDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ slug: string }>;
}) {
  const params = use(paramsPromise);
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundFlag, setNotFoundFlag] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const loadService = async () => {
      try {
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .eq("slug", params.slug)
          .eq("category", "course")
          .single();

        if (error || !data) {
          setNotFoundFlag(true);
          return;
        }

        setService(data);
      } catch (error) {
        console.error("Error loading service:", error);
        setNotFoundFlag(true);
      } finally {
        setLoading(false);
      }
    };

    loadService();
  }, [params.slug, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-100 to-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-12 w-12 border-4 border-yellow-300 border-t-gray-900"
        />
      </div>
    );
  }

  if (notFoundFlag || !service) {
    notFound();
  }

  const finalPrice =
    service.discount && service.discount > 0
      ? service.price! - service.discount
      : service.price;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold transition-colors mb-8"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Courses
          </Link>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          {/* Hero Section */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Hero Image */}
              <motion.div
                variants={itemVariants}
                className="relative h-96 bg-gradient-to-br from-yellow-200 to-yellow-100 rounded-2xl overflow-hidden shadow-lg mb-8"
              >
                {service.featured_image_url ? (
                  <Image
                    src={service.featured_image_url}
                    alt={service.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-9xl">
                    📚
                  </div>
                )}
              </motion.div>

              {/* Title & Badge */}
              <motion.div variants={itemVariants} className="mb-8">
                <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
                  {service.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4">
                  <span className="inline-block px-4 py-2 bg-yellow-100 text-gray-900 font-semibold rounded-xl border border-yellow-300">
                    Training Course
                  </span>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="h-5 w-5" />
                    <span>Flexible Schedule</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="h-5 w-5" />
                    <span>Live Sessions</span>
                  </div>
                </div>
              </motion.div>

              {/* Description */}
              {service.details && (
                <motion.div
                  variants={itemVariants}
                  className="bg-white rounded-2xl shadow-md p-8 mb-8 border border-yellow-100"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    About This Course
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">
                    {service.details}
                  </p>
                </motion.div>
              )}

              {/* Key Features */}
              {service.key_features && service.key_features.length > 0 && (
                <motion.div
                  variants={itemVariants}
                  className="bg-white rounded-2xl shadow-md p-8 border border-yellow-100"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    What You&apos;ll Learn
                  </h2>
                  <ul className="space-y-4">
                    {service.key_features.map((feature, idx) => (
                      <motion.li
                        key={idx}
                        variants={itemVariants}
                        className="flex items-start gap-4"
                      >
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 360 }}
                          transition={{ duration: 0.6 }}
                        >
                          <CheckCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
                        </motion.div>
                        <span className="text-gray-700 text-lg leading-relaxed">
                          {feature}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </div>

            {/* Sidebar - Pricing & CTA */}
            <motion.div variants={itemVariants} className="lg:col-span-1">
              <motion.div className="bg-white rounded-2xl shadow-lg border border-yellow-100 p-8">
                {/* Pricing */}
                {service.price !== null && (
                  <div className="pb-6 border-yellow-100">
                    <p className="text-sm text-gray-600 font-semibold mb-3 uppercase">
                      Investment
                    </p>
                    <div className="flex items-baseline gap-3">
                      {service.discount && service.discount > 0 && (
                        <span className="text-4xl font-bold text-gray-900">
                          ৳{finalPrice!.toFixed(0)}
                        </span>
                      )}
                      <span
                        className={
                          service.discount && service.discount > 0
                            ? "text-xl text-gray-500 line-through"
                            : "text-4xl font-bold text-gray-900"
                        }
                      >
                        ৳{service.price.toFixed(0)}
                      </span>
                    </div>
                    {service.discount && service.discount > 0 && (
                      <p className="text-sm text-green-600 font-bold mt-3">
                        Save ৳{service.discount.toFixed(0)} • Limited Time
                      </p>
                    )}
                  </div>
                )}

                {/* CTA Buttons */}
                <div className="space-y-3 mb-8">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href={`/checkout?service=${service.id}`}
                      className="block"
                    >
                      <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white text-lg py-6 rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2">
                        <Zap className="h-5 w-5" />
                        Enroll Now
                      </Button>
                    </Link>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link href="/#proposal" className="block">
                      <Button
                        variant="outline"
                        className="w-full border-2 border-yellow-300 text-gray-900 hover:bg-yellow-50 text-lg py-6 rounded-xl font-bold"
                      >
                        Custom Training
                      </Button>
                    </Link>
                  </motion.div>
                </div>

                {/* Info Cards */}
                <div className="space-y-3 text-sm">
                  <div className="bg-yellow-50 rounded-xl p-4">
                    <p className="text-gray-600 font-semibold mb-1">Duration</p>
                    <p className="text-gray-900 font-bold">
                      Flexible • Self-Paced
                    </p>
                  </div>
                  <div className="bg-yellow-50 rounded-xl p-4">
                    <p className="text-gray-600 font-semibold mb-1">Support</p>
                    <p className="text-gray-900 font-bold">
                      24/7 Access • Materials
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
