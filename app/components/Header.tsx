// components/Header.tsx
"use client";

import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [hovered, setHovered] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // SPA-friendly section anchors
  const navItems = [
    { id: 1, name: "Home", href: "/" },
    { id: 2, name: "About", href: "/about" },
    { id: 3, name: "Services", href: "#services" },
    { id: 4, name: "Pricing", href: "#pricing" },
    { id: 5, name: "Terms and Conditions", href: "/terms" },
    { id: 6, name: "Refund Policy", href: "/refund" },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="#home"
          aria-label="WeTrain Marketing — Home"
          className="font-bold text-2xl text-gray-900"
        >
          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-2"
          >
            <Image
              src="/favicon.png" // update to your actual logo path
              alt="WeTrain Marketing"
              height={40}
              width={140}
              className="h-10 w-auto"
              priority
            />
            WeTrainEducation & Tech
          </motion.div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="relative px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-900 rounded-md"
              onMouseEnter={() => setHovered(item.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {item.name}
              {hovered === item.id && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute left-3 top-full block h-[2px] bg-gray-900"
                  initial={{ width: 0 }}
                  animate={{ width: "calc(100% - 1.5rem)" }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
            </Link>
          ))}

          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="ml-2"
          >
            <Link
              href="#proposal"
              className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-900"
              aria-label="Get a proposal"
            >
              Get a Proposal
            </Link>
          </motion.div>
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden rounded-lg p-2 text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-900"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle mobile menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25 }}
          className="md:hidden border-t border-gray-200 bg-white"
        >
          <div className="space-y-1 px-4 py-3">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                onClick={() => setMobileOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="#proposal"
              className="mt-2 block rounded-lg bg-gray-900 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-gray-800"
              onClick={() => setMobileOpen(false)}
            >
              Get a Proposal
            </Link>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
