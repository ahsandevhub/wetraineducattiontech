// components/CertificatesSection.tsx
"use client";

import { motion } from "framer-motion";
import { Award, CheckCircle2, ExternalLink, Shield } from "lucide-react";

interface Certificate {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description: string;
  credentialId?: string;
  verifyUrl?: string;
  icon?: React.ReactNode;
}

const certificates: Certificate[] = [
  {
    id: "iso-9001",
    title: "ISO 9001:2015 Certification",
    issuer: "International Organization for Standardization",
    date: "2024",
    description:
      "Quality Management System certification demonstrating our commitment to delivering consistent, high-quality products and services.",
    credentialId: "ISO-9001-2024-BD-12345",
    verifyUrl: "#",
    icon: <Shield className="h-8 w-8" />,
  },
  {
    id: "aws-certified",
    title: "AWS Certified Solutions Architect",
    issuer: "Amazon Web Services",
    date: "2023",
    description:
      "Professional-level certification validating expertise in designing distributed systems on AWS infrastructure.",
    credentialId: "AWS-SAA-C03-2023-456789",
    verifyUrl: "#",
    icon: <Award className="h-8 w-8" />,
  },
  {
    id: "google-partner",
    title: "Google Cloud Partner",
    issuer: "Google Cloud",
    date: "2023",
    description:
      "Official Google Cloud Partner status, demonstrating proficiency in Google Cloud Platform services and solutions.",
    credentialId: "GCP-PARTNER-2023-78901",
    verifyUrl: "#",
    icon: <Award className="h-8 w-8" />,
  },
  {
    id: "microsoft-certified",
    title: "Microsoft Certified: Azure Developer Associate",
    issuer: "Microsoft",
    date: "2023",
    description:
      "Certification validating skills in designing, building, testing, and maintaining cloud applications on Azure.",
    credentialId: "MS-AZ-204-2023-23456",
    verifyUrl: "#",
    icon: <Award className="h-8 w-8" />,
  },
  {
    id: "pmp-certified",
    title: "PMP® Certification",
    issuer: "Project Management Institute",
    date: "2022",
    description:
      "Project Management Professional certification demonstrating expertise in leading and directing projects.",
    credentialId: "PMP-2022-34567",
    verifyUrl: "#",
    icon: <CheckCircle2 className="h-8 w-8" />,
  },
  {
    id: "security-plus",
    title: "CompTIA Security+",
    issuer: "CompTIA",
    date: "2022",
    description:
      "Vendor-neutral certification validating baseline cybersecurity skills and best practices.",
    credentialId: "SEC-PLUS-2022-45678",
    verifyUrl: "#",
    icon: <Shield className="h-8 w-8" />,
  },
];

const achievements = [
  {
    number: "50+",
    label: "Professional Certifications",
    description: "Across multiple technology platforms",
  },
  {
    number: "100%",
    label: "Client Satisfaction",
    description: "In quality and delivery standards",
  },
  {
    number: "10+",
    label: "Years Experience",
    description: "In software development industry",
  },
  {
    number: "200+",
    label: "Projects Delivered",
    description: "Successfully completed worldwide",
  },
];

export default function CertificatesSection() {
  return (
    <section
      id="certificates"
      className="relative overflow-hidden bg-gradient-to-b from-yellow-50 to-yellow-100 py-24"
      aria-labelledby="certificates-heading"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-yellow-400 opacity-5 blur-3xl" />
        <div className="absolute -left-40 bottom-40 h-96 w-96 rounded-full bg-orange-400 opacity-5 blur-3xl" />
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
          <span className="mb-4 inline-block rounded-full bg-yellow-500/10 px-4 py-2 text-sm font-medium text-yellow-600">
            Trust & Credentials
          </span>
          <h2
            id="certificates-heading"
            className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl"
          >
            Our <span className="text-yellow-600">Certifications</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Industry-recognized certifications and credentials that validate our
            expertise and commitment to excellence in technology and service
            delivery.
          </p>
        </motion.div>

        {/* Achievements Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-16 grid grid-cols-2 gap-6 md:grid-cols-4"
        >
          {achievements.map((achievement, index) => (
            <div
              key={index}
              className="rounded-2xl border border-yellow-200 bg-white p-6 text-center shadow-sm transition-all hover:shadow-lg"
            >
              <div className="mb-2 text-4xl font-bold text-yellow-600">
                {achievement.number}
              </div>
              <div className="mb-1 font-semibold text-gray-900">
                {achievement.label}
              </div>
              <div className="text-sm text-gray-600">
                {achievement.description}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Certificates Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {certificates.map((certificate, index) => (
            <motion.div
              key={certificate.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-50px" }}
              className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-xl hover:border-yellow-300"
            >
              <div className="flex flex-1 flex-col p-6">
                {/* Icon */}
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
                  {certificate.icon}
                </div>

                {/* Title & Issuer */}
                <h3 className="mb-2 text-xl font-bold text-gray-900">
                  {certificate.title}
                </h3>
                <p className="mb-1 text-sm font-medium text-yellow-600">
                  {certificate.issuer}
                </p>
                <p className="mb-4 text-sm text-gray-500">{certificate.date}</p>

                {/* Description */}
                <p className="mb-6 flex-1 text-gray-600">
                  {certificate.description}
                </p>

                {/* Credential Info */}
                <div className="border-t border-gray-100 pt-4">
                  {certificate.credentialId && (
                    <div className="mb-3">
                      <p className="mb-1 text-xs font-semibold text-gray-500">
                        CREDENTIAL ID
                      </p>
                      <p className="font-mono text-sm text-gray-700">
                        {certificate.credentialId}
                      </p>
                    </div>
                  )}
                  {certificate.verifyUrl && (
                    <a
                      href={certificate.verifyUrl}
                      className="flex items-center justify-center gap-2 rounded-lg border border-yellow-300 bg-yellow-50 py-2 text-sm font-medium text-yellow-700 transition-all hover:bg-yellow-100"
                    >
                      Verify Credential
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16 rounded-2xl border border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 p-8"
        >
          <div className="text-center">
            <div className="mb-4 flex items-center justify-center gap-2">
              <Shield className="h-8 w-8 text-yellow-600" />
              <h3 className="text-2xl font-bold text-gray-900">
                Trusted by Industry Leaders
              </h3>
            </div>
            <p className="mx-auto mb-6 max-w-2xl text-lg text-gray-600">
              Our certifications and partnerships with leading technology
              providers ensure that we deliver solutions using industry best
              practices and cutting-edge technologies.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <span className="rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm">
                🏆 ISO Certified
              </span>
              <span className="rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm">
                ☁️ Cloud Partners
              </span>
              <span className="rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm">
                🔒 Security Compliant
              </span>
              <span className="rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm">
                ✅ Quality Assured
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
