// components/Header.tsx
"use client";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function Header() {
  const [isHovered, setIsHovered] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 1, name: "Home", href: "#hero" },
    { id: 2, name: "About", href: "#about" },
    { id: 3, name: "Services", href: "#services" },
    { id: 4, name: "Process", href: "#process" },
    { id: 5, name: "Testimonials", href: "#testimonials" },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="bg-[var(--tertiary-yellow)] border-b border-[var(--secondary-yellow)] sticky top-0 z-50 backdrop-blur-sm bg-opacity-80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => handleNavClick("#hero")}
        >
          <Image
            src="/WeTrainEducation Logo.png"
            alt="Elite Marketing Logo"
            className="h-10 w-auto"
            height={150}
            width={150}
          />
        </motion.div>

        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.href)}
              className="relative px-3 py-2 text-gray-800 font-medium transition-colors hover:text-[var(--primary-yellow)]"
              onMouseEnter={() => setIsHovered(item.id)}
              onMouseLeave={() => setIsHovered(null)}
            >
              {item.name}
              {isHovered === item.id && (
                <motion.span
                  layoutId="navUnderline"
                  className="absolute left-3 top-full block h-[2px] bg-[var(--primary-yellow)]"
                  initial={{ width: 0 }}
                  animate={{ width: "calc(100% - 1.5rem)" }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="ml-4"
          >
            <button
              onClick={() => handleNavClick("#contact")}
              className="bg-[var(--primary-yellow)] text-gray-900 px-5 py-2 rounded-lg font-semibold shadow-sm hover:shadow-md transition-all hover:bg-[var(--secondary-yellow)] flex items-center gap-2"
            >
              Get Started
            </button>
          </motion.div>
        </nav>

        <button
          className="md:hidden text-gray-800 p-2 rounded-lg hover:bg-[var(--primary-yellow)] hover:bg-opacity-20 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden bg-white border-t border-[var(--secondary-yellow)]"
        >
          <div className="px-4 py-3 space-y-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.href)}
                className="block w-full text-left px-3 py-2 text-gray-800 font-medium rounded-lg hover:bg-[var(--primary-yellow)] hover:bg-opacity-20 transition-colors"
              >
                {item.name}
              </button>
            ))}
            <button
              onClick={() => handleNavClick("#contact")}
              className="block w-full bg-[var(--primary-yellow)] text-gray-900 px-5 py-2.5 rounded-lg font-semibold text-center mt-2"
            >
              Get Started
            </button>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
