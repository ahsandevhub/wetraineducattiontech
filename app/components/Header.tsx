// components/Header.tsx
"use client";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-[var(--primary-yellow)]">
                MarketPro Agency
              </h1>
            </div>
          </div>

          <div className="hidden md:block">
            <button className="bg-[var(--primary-yellow)] hover:bg-[var(--secondary-yellow)] text-gray-900 font-bold py-2 px-6 rounded-full transition-all duration-300 transform hover:scale-105">
              Get Started
            </button>
          </div>

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
      </nav>
    </header>
  );
}
