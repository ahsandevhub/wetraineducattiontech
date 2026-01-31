// components/CoursesSection.tsx
"use client";

import { createClient } from "@/app/utils/supabase/client";
import { motion } from "framer-motion";
import { BookOpen, Clock, Star, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  students: string;
  rating: number;
  price: string;
  image: string;
  features: string[];
}

const courses: Course[] = [
  {
    id: "web-development",
    title: "Full-Stack Web Development",
    description:
      "Master modern web development with React, Next.js, Node.js, and MongoDB. Build real-world projects from scratch.",
    instructor: "Senior Developer Team",
    duration: "12 Weeks",
    students: "2,500+",
    rating: 4.9,
    price: "৳15,999",
    image: "💻",
    features: [
      "React & Next.js fundamentals",
      "Backend with Node.js & Express",
      "Database design with MongoDB",
      "Deployment & DevOps basics",
      "Real-world projects",
      "Lifetime access",
    ],
  },
  {
    id: "digital-marketing",
    title: "Digital Marketing Mastery",
    description:
      "Learn proven strategies for social media marketing, SEO, content marketing, and paid advertising to grow your business.",
    instructor: "Marketing Expert Team",
    duration: "8 Weeks",
    students: "3,200+",
    rating: 4.8,
    price: "৳12,999",
    image: "📱",
    features: [
      "Social media marketing strategies",
      "SEO & content optimization",
      "Facebook & Google Ads",
      "Email marketing campaigns",
      "Analytics & reporting",
      "Certification included",
    ],
  },
  {
    id: "graphic-design",
    title: "Professional Graphic Design",
    description:
      "Create stunning designs with Adobe Creative Suite. Master Photoshop, Illustrator, and design principles.",
    instructor: "Creative Design Team",
    duration: "10 Weeks",
    students: "1,800+",
    rating: 4.7,
    price: "৳13,999",
    image: "🎨",
    features: [
      "Adobe Photoshop mastery",
      "Illustrator for vector graphics",
      "Brand identity design",
      "UI/UX design basics",
      "Portfolio development",
      "Job placement support",
    ],
  },
  {
    id: "python-programming",
    title: "Python for Data Science",
    description:
      "Learn Python programming, data analysis with Pandas, visualization with Matplotlib, and machine learning basics.",
    instructor: "Data Science Team",
    duration: "10 Weeks",
    students: "2,100+",
    rating: 4.9,
    price: "৳14,999",
    image: "🐍",
    features: [
      "Python programming fundamentals",
      "Data analysis with Pandas",
      "Data visualization",
      "Machine learning basics",
      "Real datasets & projects",
      "Industry certification",
    ],
  },
  {
    id: "business-management",
    title: "Business Management & Strategy",
    description:
      "Essential business skills including leadership, strategic planning, operations management, and entrepreneurship.",
    instructor: "Business Consultant Team",
    duration: "6 Weeks",
    students: "1,500+",
    rating: 4.6,
    price: "৳11,999",
    image: "📊",
    features: [
      "Leadership & team management",
      "Strategic business planning",
      "Financial management basics",
      "Operations & supply chain",
      "Case study analysis",
      "Expert mentorship",
    ],
  },
  {
    id: "mobile-app-development",
    title: "Mobile App Development",
    description:
      "Build native and cross-platform mobile apps with React Native. Deploy to iOS and Android app stores.",
    instructor: "Mobile Dev Team",
    duration: "12 Weeks",
    students: "1,900+",
    rating: 4.8,
    price: "৳16,999",
    image: "📱",
    features: [
      "React Native development",
      "iOS & Android deployment",
      "App store optimization",
      "Push notifications & APIs",
      "3+ real app projects",
      "Freelancing guidance",
    ],
  },
];

export default function CoursesSection() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkUserRole = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile?.role === "admin") {
          setIsAdmin(true);
        }
      }
    };

    checkUserRole();
  }, []);

  return (
    <section
      id="courses"
      className="relative overflow-hidden bg-gradient-to-b from-white to-yellow-50 py-24"
      aria-labelledby="courses-heading"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-yellow-300 opacity-5 blur-3xl" />
        <div className="absolute -right-40 bottom-40 h-96 w-96 rounded-full bg-yellow-400 opacity-5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <span className="mb-4 inline-block rounded-full bg-yellow-400/10 px-4 py-2 text-sm font-medium text-yellow-600">
            Our Courses
          </span>
          <h2
            id="courses-heading"
            className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl"
          >
            Professional{" "}
            <span className="text-yellow-500">Training Courses</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Expert-led courses designed to boost your skills and advance your
            career. Learn from industry professionals with hands-on projects.
          </p>
        </motion.div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-50px" }}
              className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:border-yellow-300 hover:shadow-xl"
            >
              {/* Course Image/Icon */}
              <div className="flex h-48 items-center justify-center bg-gradient-to-br from-yellow-100 to-yellow-50 text-6xl">
                {course.image}
              </div>

              <div className="flex flex-1 flex-col p-6">
                {/* Rating & Stats */}
                <div className="mb-4 flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{course.rating}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{course.students}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration}</span>
                    </div>
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="mb-2 text-xl font-bold text-gray-900">
                  {course.title}
                </h3>
                <p className="mb-4 text-gray-600">{course.description}</p>

                {/* Features */}
                <ul className="mb-6 space-y-2 text-sm">
                  {course.features.slice(0, 3).map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <BookOpen className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-500" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Instructor */}
                <p className="mb-4 text-sm text-gray-500">
                  By {course.instructor}
                </p>

                {/* Price & CTA */}
                <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
                  <div>
                    <span className="text-2xl font-bold text-yellow-500">
                      {course.price}
                    </span>
                  </div>
                  {isAdmin ? (
                    <button
                      disabled
                      className="rounded-lg bg-gray-300 px-6 py-2.5 font-bold text-gray-600 cursor-not-allowed"
                      title="Admins cannot purchase"
                    >
                      Enroll Now
                    </button>
                  ) : (
                    <Link
                      href={`/checkout?service=course&name=${encodeURIComponent(course.title)}&price=${encodeURIComponent(course.price)}&id=${course.id}`}
                      className="rounded-lg bg-yellow-500 px-6 py-2.5 font-bold text-white transition-all hover:bg-yellow-600 hover:shadow-lg"
                    >
                      Enroll Now
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="mb-4 text-lg text-gray-600">
            Can&apos;t find the right course? We offer custom training programs
            tailored to your needs.
          </p>
          <a
            href="#proposal"
            className="inline-block rounded-xl border border-yellow-400 bg-white px-8 py-3 font-bold text-gray-900 transition-all hover:bg-yellow-50 hover:shadow-lg"
          >
            Request Custom Training
          </a>
        </motion.div>
      </div>
    </section>
  );
}
