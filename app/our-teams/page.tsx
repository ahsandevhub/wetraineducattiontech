"use client";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Mail, Phone, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  departments,
  getDepartmentIcon,
  teamMembers,
  type TeamMember,
} from "../data/teamData";

interface MemberCardProps {
  member: TeamMember;
  index: number;
  deptIndex: number;
}

function MemberCard({ member, index, deptIndex }: MemberCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: deptIndex * 0.1 + index * 0.1,
      }}
      className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all group"
    >
      {/* Profile Image */}
      <div className="relative h-80 bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center overflow-hidden">
        {!imageError ? (
          <Image
            src={member.photo}
            alt={member.name}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-md">
            <User className="w-12 h-12 text-gray-400" />
          </div>
        )}
        <div className="absolute top-4 right-4 bg-[var(--primary-yellow)] px-2 py-1 rounded-full text-xs font-semibold text-gray-600">
          {member.id}
        </div>
      </div>

      {/* Profile Info */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
        <p className="text-yellow-600 font-semibold mb-2">
          {member.designation}
        </p>

        <div className="space-y-2 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <span className="truncate">{member.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span>{member.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>যোগদান: {member.joining}</span>
          </div>
        </div>

        <Link href={`/our-teams/${member.id}`}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-[var(--primary-yellow)] text-gray-900 font-semibold rounded-lg hover:bg-[var(--secondary-yellow)] transition-all"
          >
            বিস্তারিত দেখুন <ArrowRight className="w-4 h-4" />
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}

export default function OurTeamsPage() {
  const getMembersByDepartment = (department: string) => {
    return teamMembers.filter((member) => member.department === department);
  };

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
            আমাদের টিম
          </h1>
          <p className="text-lg text-gray-700">
            WeTrainEducation এর দক্ষ ও অভিজ্ঞ টিম সদস্যদের সাথে পরিচিত হন যারা
            আপনার সফলতার জন্য নিরলসভাবে কাজ করছেন।
          </p>
        </motion.div>
      </section>

      {/* Department Stats */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {departments.map((dept, i) => (
            <motion.div
              key={dept}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-all"
            >
              <div className="text-3xl mb-2">{getDepartmentIcon(dept)}</div>
              <h3 className="font-bold text-gray-900 mb-1">{dept}</h3>
              <p className="text-sm text-gray-600">
                {getMembersByDepartment(dept).length} সদস্য
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team Members by Department */}
      {departments.map((department, deptIndex) => {
        const members = getMembersByDepartment(department);
        if (members.length === 0) return null;

        return (
          <section key={department} className="max-w-6xl mx-auto px-6 pb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: deptIndex * 0.1 }}
              className="mb-8"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <span className="text-2xl">
                  {getDepartmentIcon(department)}
                </span>
                {department}
              </h2>
              <p className="text-gray-600">{members.length} জন দক্ষ পেশাদার</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {members.map((member, memberIndex) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  index={memberIndex}
                  deptIndex={deptIndex}
                />
              ))}
            </div>
          </section>
        );
      })}

      {/* Contact CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-gradient-to-r from-yellow-100 to-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            আমাদের টিমের সাথে যোগাযোগ করুন
          </h2>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            আপনার কোনো প্রশ্ন বা সহায়তার প্রয়োজন হলে আমাদের দক্ষ টিম সদস্যরা
            সবসময় আপনার সেবায় প্রস্তুত।
          </p>
          <Link href="/about">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary-yellow)] text-gray-900 font-semibold rounded-lg hover:bg-[var(--secondary-yellow)] transition-all"
            >
              যোগাযোগ করুন <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </motion.div>
      </section>
    </>
  );
}
