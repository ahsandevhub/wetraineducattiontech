// components/Header.tsx
"use client";

import { createClient } from "@/app/utils/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription?.unsubscribe();
  }, [supabase]);

  const navItems = [
    { id: "home", name: "Home", href: "/", type: "link" },
    { id: "about", name: "About", href: "/about", type: "link" },
    { id: "services", name: "Services", href: "/services", type: "dropdown" },
    { id: "projects", name: "Projects", href: "/#projects", type: "link" },
    {
      id: "certificates",
      name: "Certificates",
      href: "/#certificates",
      type: "link",
    },
    { id: "contact", name: "Contact", href: "#proposal", type: "link" },
  ];

  const servicesSubmenu = [
    { name: "Courses", href: "/courses" },
    { name: "IT Services", href: "/software" },
    { name: "Marketing Services", href: "/marketing" },
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
          href="/"
          aria-label="WeTrainEducation & Tech — Home"
          className="font-bold text-2xl text-gray-900"
        >
          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-2"
          >
            <Image
              src="/favicon.png"
              alt="WeTrainEducation & Tech"
              height={40}
              width={140}
              className="h-10 w-auto"
              priority
            />
            <span className="hidden sm:inline">WeTrainEducation & Tech</span>
          </motion.div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <div
              key={item.id}
              onMouseEnter={() =>
                item.type === "dropdown" && setHovered(item.id)
              }
              onMouseLeave={() => setHovered(null)}
              className="relative"
            >
              {item.type === "dropdown" ? (
                <button className="relative flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none rounded-md transition-colors">
                  {item.name}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${hovered === item.id ? "rotate-180" : ""}`}
                  />
                  {hovered === item.id && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute left-3 top-full block h-[2px] bg-gray-900"
                      initial={{ width: 0 }}
                      animate={{ width: "calc(100% - 1.5rem)" }}
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.5,
                      }}
                    />
                  )}
                </button>
              ) : (
                <Link
                  href={item.href}
                  className="relative px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none rounded-md transition-colors"
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
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.5,
                      }}
                    />
                  )}
                </Link>
              )}

              {/* Dropdown menu */}
              {item.type === "dropdown" && hovered === item.id && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-0 top-full mt-1 w-48 rounded-lg bg-white shadow-lg border border-gray-200 py-2 z-50"
                >
                  {servicesSubmenu.map((submenu) => (
                    <Link
                      key={submenu.name}
                      href={submenu.href}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 hover:text-gray-900 transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      {submenu.name}
                    </Link>
                  ))}
                </motion.div>
              )}
            </div>
          ))}

          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="ml-4"
          >
            {!loading && (
              <>
                {user ? (
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition-all hover:bg-yellow-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-yellow-500"
                    aria-label="My account"
                  >
                    My Account
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-900"
                    aria-label="Login to your account"
                  >
                    Login
                  </Link>
                )}
              </>
            )}
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
              <div key={item.id}>
                {item.type === "dropdown" ? (
                  <>
                    <button
                      onClick={() => setServicesOpen(!servicesOpen)}
                      className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                      {item.name}
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${servicesOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {servicesOpen && (
                      <div className="ml-4 space-y-1">
                        {servicesSubmenu.map((submenu) => (
                          <Link
                            key={submenu.name}
                            href={submenu.href}
                            className="block rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-yellow-50 hover:text-gray-900"
                            onClick={() => setMobileOpen(false)}
                          >
                            {submenu.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
            {!loading && (
              <>
                {user ? (
                  <Link
                    href="/dashboard"
                    className="mt-2 block rounded-lg bg-yellow-500 px-4 py-2.5 text-center text-sm font-semibold text-gray-900 hover:bg-yellow-600"
                    onClick={() => setMobileOpen(false)}
                  >
                    My Account
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="mt-2 block rounded-lg bg-gray-900 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-gray-800"
                    onClick={() => setMobileOpen(false)}
                  >
                    Login
                  </Link>
                )}
              </>
            )}
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
