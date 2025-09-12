// components/Footer.tsx
"use client";

import { motion } from "framer-motion";
import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "About", href: "#about" },
    { name: "Services", href: "#services" },
    { name: "Work", href: "#work" },
    { name: "Pricing", href: "#pricing" },
    { name: "FAQ", href: "#faq" },
    { name: "Terms of Use", href: "/terms" },
    { name: "Affiliate", href: "/affiliate" },
  ];

  const contactInfo = [
    { icon: Mail, text: "support@wetraineducation.com" }, // update if you have a marketing domain
    { icon: Phone, text: "+880 1887-864760" }, // optional: replace with global number
    { icon: MapPin, text: "Global presence — serving clients worldwide" },
  ];

  const socialLinks = [
    { icon: Twitter, href: "#" },
    { icon: Facebook, href: "#" },
    { icon: Instagram, href: "#" },
    { icon: Linkedin, href: "#" },
  ];

  const handleSubscribe = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Hook up to your newsletter provider (e.g., ConvertKit, Mailchimp, Brevo)
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        {/* Brand */}
        <div className="space-y-4">
          <div className="flex items-center gap-1">
            <Image
              src="/favicon.png" // update to your actual logo path
              alt="WeTrain Marketing"
              height={30}
              width={140}
              className="h-12 w-auto"
              priority
            />
            <span className="font-bold text-2xl leading-none text-white">
              WeTrainEducation <br /> & Tech
            </span>
          </div>
          <p className="text-sm leading-6">
            WeTrain Marketing is a global marketing company delivering brand
            strategy, creative campaigns, and growth solutions for businesses
            worldwide.
          </p>
          <div className="flex gap-4">
            {socialLinks.map((s, i) => (
              <motion.a
                key={i}
                href={s.href}
                whileHover={{ y: -3 }}
                className="text-gray-400 transition-colors hover:text-white"
                aria-label={`Visit our ${s.icon.name} page`}
              >
                <s.icon className="h-5 w-5" />
              </motion.a>
            ))}
          </div>
        </div>

        {/* Links */}
        <div>
          <h3 className="mb-4 text-lg font-bold text-white">Quick Links</h3>
          <ul className="space-y-3">
            {quickLinks.map((l, i) => (
              <motion.li key={i} whileHover={{ x: 5 }}>
                {l.href.startsWith("#") ? (
                  <a
                    href={l.href}
                    className="text-sm transition-colors hover:text-white"
                  >
                    {l.name}
                  </a>
                ) : (
                  <Link
                    href={l.href}
                    className="text-sm transition-colors hover:text-white"
                  >
                    {l.name}
                  </Link>
                )}
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="mb-4 text-lg font-bold text-white">Contact</h3>
          <ul className="space-y-3">
            {contactInfo.map((info, i) => (
              <li key={i} className="flex items-start gap-3">
                <info.icon className="h-5 w-5 flex-shrink-0 text-white" />
                <span className="text-sm">{info.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="mb-4 text-lg font-bold text-white">Newsletter</h3>
          <p className="mb-4 text-sm">
            Get fresh marketing insights, case studies, and exclusive
            resources—straight to your inbox.
          </p>
          <form onSubmit={handleSubscribe} className="flex">
            <input
              type="email"
              required
              placeholder="Your email"
              className="w-full rounded-l-lg bg-slate-50 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-700"
              aria-label="Email address"
            />
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="rounded-r-lg bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100"
              aria-label="Subscribe to newsletter"
            >
              Subscribe
            </motion.button>
          </form>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800 py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between px-4 sm:px-6 md:flex-row lg:px-8">
          <p className="text-sm">
            &copy; {currentYear} WeTrain Marketing. All rights reserved.
          </p>
          <p className="mt-2 text-sm md:mt-0">
            Built by{" "}
            <motion.a
              href="https://ahsandevhub.com"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ color: "#ffffff" }}
              className="underline decoration-gray-600 underline-offset-4 hover:decoration-white"
            >
              Ahsan DevHub
            </motion.a>
          </p>
        </div>
      </div>
    </footer>
  );
}
