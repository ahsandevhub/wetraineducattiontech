"use client";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Clock,
  Heart,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useState } from "react";
import { getDepartmentIcon, teamMembers } from "../../data/teamData";

interface ProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const resolvedParams = use(params);
  const [imageError, setImageError] = useState(false);

  const member = teamMembers.find((m) => m.id === resolvedParams.id);

  if (!member) {
    notFound();
  }

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const calculateExperience = (joiningDate: string) => {
    const joinDate = new Date(joiningDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - joinDate.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const months = Math.floor(totalDays / 30);
    const remainingDays = totalDays % 30;

    if (months === 0) {
      return `${totalDays} দিন`;
    } else {
      return remainingDays > 0
        ? `${months} মাস ${remainingDays} দিন`
        : `${months} মাস`;
    }
  };

  return (
    <>
      {/* Profile Header */}
      <section className="relative bg-gradient-to-b from-yellow-200 to-white">
        {/* Back Button */}
        <section className="max-w-6xl mx-auto px-6 py-6">
          <Link href="/our-teams">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-600 transition-all shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              টিমে ফিরে যান
            </motion.button>
          </Link>
        </section>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto px-6 text-center"
        >
          {/* Profile Image */}
          <div className="relative mb-6">
            <div className="w-48 h-48 mx-auto bg-white rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl hover:shadow-amber-500 transition-all duration-500 border-4 border-yellow-500 overflow-hidden">
              {!imageError ? (
                <Image
                  src={member.photo}
                  alt={member.name}
                  width={320}
                  height={320}
                  className="object-cover rounded-full"
                  onError={() => setImageError(true)}
                />
              ) : (
                <User className="w-48 h-48 text-gray-400" />
              )}
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-yellow-500 px-3 py-1 rounded-full text-sm font-bold text-white">
              {member.id}
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            {member.name}
          </h1>
          <div className="flex items-center justify-center gap-2 text-xl text-yellow-600 font-semibold mb-4">
            <span className="text-2xl">
              {getDepartmentIcon(member.department)}
            </span>
            {member.designation}
          </div>
          <p className="text-lg text-gray-700">
            {member.department} বিভাগের একজন দক্ষ পেশাদার
          </p>
        </motion.div>
      </section>

      {/* Profile Details */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Mail className="w-6 h-6 text-yellow-600" />
              যোগাযোগের তথ্য
            </h2>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">ইমেইল</p>
                  <p className="font-medium text-gray-900">{member.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">ফোন</p>
                  <p className="font-medium text-gray-900">{member.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">বিভাগ</p>
                  <p className="font-medium text-gray-900">
                    {member.department}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Personal Information */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <User className="w-6 h-6 text-yellow-600" />
              ব্যক্তিগত তথ্য
            </h2>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">জন্ম তারিখ</p>
                  <p className="font-medium text-gray-900">
                    {member.dob} ({calculateAge(member.dob)} বছর)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                  <span className="text-pink-600 font-bold">♂♀</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">লিঙ্গ</p>
                  <p className="font-medium text-gray-900">
                    {member.sex === "Male" ? "পুরুষ" : "নারী"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">রক্তের গ্রুপ</p>
                  <p className="font-medium text-gray-900">{member.blood}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Professional Information */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8 bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-2xl p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-yellow-600" />
            পেশাগত তথ্য
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                <Briefcase className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">পদবী</h3>
              <p className="text-gray-700">{member.designation}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">যোগদানের তারিখ</h3>
              <p className="text-gray-700">{member.joining}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">কর্মঅভিজ্ঞতা</h3>
              <p className="text-gray-700">
                {calculateExperience(member.joining)}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-8 text-center"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            {member.name} এর সাথে যোগাযোগ করুন
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`mailto:${member.email}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary-yellow)] text-gray-900 font-semibold rounded-lg hover:bg-[var(--secondary-yellow)] transition-all"
            >
              <Mail className="w-4 h-4" />
              ইমেইল পাঠান
            </a>
            <a
              href={`tel:${member.phone}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all"
            >
              <Phone className="w-4 h-4" />
              ফোন করুন
            </a>
          </div>
        </motion.div>
      </section>
    </>
  );
}
