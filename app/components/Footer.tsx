// components/Footer.tsx
"use client";

import { motion } from "framer-motion";
import { Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useContactInfo } from "../utils/contactInfo";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { contactPhone, supportEmail } = useContactInfo();

  const quickLinks = [
    { name: "About", href: "/about" },
    { name: "Services", href: "#services" },
    { name: "Pricing", href: "#pricing" },
    { name: "Terms of Use", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Refund Policy", href: "/refund" },
  ];

  const contactInfo = [
    { icon: Mail, text: supportEmail },
    { icon: Phone, text: contactPhone },
    { icon: MapPin, text: "30 N GOULD ST STE 43673 SHERIDAN, WY, 82801, USA" },
  ];

  // const socialLinks = [
  //   { icon: Facebook, href: "#" },
  //   { icon: Instagram, href: "#" },
  // ];

  const [newsletterStatus, setNewsletterStatus] = useState<string>("");
  const [newsletterLoading, setNewsletterLoading] = useState<boolean>(false);

  const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setNewsletterStatus("");
    setNewsletterLoading(true);
    const form = e.currentTarget;
    const email = (
      form.elements.namedItem("newsletterEmail") as HTMLInputElement
    )?.value;
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewsletterStatus(
          "Thank you for subscribing! Please check your email for confirmation."
        );
        form.reset();
      } else {
        setNewsletterStatus(
          data.error || "Subscription failed. Please try again."
        );
      }
    } catch {
      setNewsletterStatus("Subscription failed. Please try again.");
    } finally {
      setNewsletterLoading(false);
    }
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
          {/* <div className="flex gap-4">
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
          </div> */}
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

          {/* Payment Partners */}
          <div className="mt-8">
            <h3 className="mb-4 text-lg font-bold text-white">
              Payment Partners
            </h3>
            <div className="flex gap-4 items-center">
              <Image
                src="/stripe.png"
                alt="Stripe"
                width={80}
                height={32}
                className="h-8 w-auto"
              />
              {/* Add more payment logos as needed */}
              {/* <Image src="/paypal.svg" alt="PayPal" width={80} height={32} className="h-8 w-auto" /> */}
              {/* <Image src="/visa.svg" alt="Visa" width={60} height={32} className="h-8 w-auto" /> */}
            </div>
          </div>
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
              name="newsletterEmail"
              required
              placeholder="Your email"
              className="w-full rounded-l-lg bg-slate-50 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-700"
              aria-label="Email address"
            />
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={newsletterLoading}
              className="rounded-r-lg bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100"
              aria-label="Subscribe to newsletter"
            >
              {newsletterLoading ? "Subscribing..." : "Subscribe"}
            </motion.button>
          </form>
          {newsletterStatus && (
            <p
              className={`mt-2 text-sm ${
                newsletterStatus.startsWith("Thank")
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {newsletterStatus}
            </p>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800 py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 sm:px-6 md:flex-row lg:px-8">
          <p className="text-sm">
            &copy; {currentYear} WeTrain Marketing. All rights reserved.
          </p>
          {/* <p className="mt-2 text-sm md:mt-0">
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
          </p> */}
        </div>
      </div>
    </footer>
  );
}
