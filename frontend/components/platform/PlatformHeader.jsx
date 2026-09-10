"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronRight,
  HelpCircle,
  LayoutDashboard,
  MessageCircle,
  Menu,
  Route,
  ShoppingCart,
  Sparkles,
  Wallet,
  X,
} from "lucide-react";
import AdminCTA from "./AdminCTA";

const NAV_LINKS = [
  { id: "features", href: "/#features", label: "সার্ভিস", desc: "সব সার্ভিস এক নজরে", icon: Sparkles },
  { id: "plans", href: "/#plans", label: "প্ল্যান", desc: "মূল্য ও প্যাকেজ", icon: Wallet },
  { id: "how-it-works", href: "/#how-it-works", label: "প্রক্রিয়া", desc: "কিভাবে কাজ করে", icon: Route },
  { id: "faq", href: "/#faq", label: "FAQ", desc: "সাধারণ জিজ্ঞাসা", icon: HelpCircle },
  { id: "contact", href: "/#contact", label: "যোগাযোগ", desc: "সরাসরি যোগাযোগ করুন", icon: MessageCircle },
];

const drawerListVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.12 } },
};

const drawerItemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.25, ease: "easeOut" } },
};

// Shared across PlatformLanding and PlatformLegalPage so the platform's
// marketing pages (landing, privacy policy, terms of service) all render the
// exact same header instead of each page rolling its own stripped-down copy.
export default function PlatformHeader({ adminUrl }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Scroll-spy: only the landing page ("/") renders sections with these ids,
  // so on other pages (privacy-policy, terms-of-service) this simply finds
  // nothing and no link is ever highlighted.
  useEffect(() => {
    const elements = NAV_LINKS.map((l) => document.getElementById(l.id)).filter(Boolean);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-orange-100/70 bg-gradient-to-r from-teal-50/90 via-white/90 to-orange-50/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 shadow-md shadow-orange-200">
            <ShoppingCart size={16} className="text-white" />
          </div>
          <div className="leading-tight">
            <p className="bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-base font-extrabold tracking-tight text-transparent">
              ECMS
            </p>
            <p className="hidden bg-gradient-to-r from-teal-600 to-orange-500 bg-clip-text text-[11px] font-medium text-transparent lg:block">
              E-Commerce Management System
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-4 text-sm font-semibold text-gray-500 md:flex lg:gap-7">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className={`relative transition-colors hover:text-gray-900 ${
                activeId === link.id ? "text-gray-900" : ""
              }`}
            >
              {link.label}
              {activeId === link.id && (
                <motion.span
                  layoutId="platform-nav-active"
                  className="absolute -bottom-1.5 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-orange-500 to-rose-500"
                />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <AdminCTA
            adminUrl={adminUrl}
            className="hidden items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-orange-200 transition-transform hover:scale-105 sm:inline-flex sm:text-sm"
          >
            <LayoutDashboard size={14} />
            অ্যাডমিন প্যানেলে যান
          </AdminCTA>

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="মেনু খুলুন"
            aria-expanded={mobileOpen}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition-colors hover:bg-gray-50 md:hidden"
          >
            <Menu size={18} />
          </button>
        </div>
      </div>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {mobileOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  onClick={() => setMobileOpen(false)}
                  className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] md:hidden"
                />
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", stiffness: 320, damping: 34 }}
                  className="fixed inset-y-0 left-0 z-50 flex w-[78%] max-w-xs flex-col overflow-hidden border-r border-orange-100 bg-white shadow-2xl md:hidden"
                >
                  <div className="border-b border-orange-100/70 bg-gradient-to-r from-teal-50/90 via-white/90 to-orange-50/90 px-5 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 shadow-md shadow-orange-200">
                          <ShoppingCart size={16} className="text-white" />
                        </div>
                        <div className="leading-tight">
                          <p className="bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-sm font-extrabold tracking-tight text-transparent">
                            ECMS
                          </p>
                          <p className="bg-gradient-to-r from-teal-600 to-orange-500 bg-clip-text text-[10px] font-medium text-transparent">
                            E-Commerce Platform
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMobileOpen(false)}
                        aria-label="মেনু বন্ধ করুন"
                        className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>

                  <motion.nav
                    initial="hidden"
                    animate="visible"
                    variants={drawerListVariants}
                    className="flex flex-col gap-2 px-3 py-4"
                  >
                    {NAV_LINKS.map((link) => {
                      const Icon = link.icon;
                      const isActive = activeId === link.id;
                      return (
                        <motion.div key={link.id} variants={drawerItemVariants}>
                          <Link
                            href={link.href}
                            onClick={() => setMobileOpen(false)}
                            className={`group flex items-center gap-3 rounded-2xl border px-3.5 py-3 transition-all ${
                              isActive
                                ? "border-orange-200 bg-orange-50"
                                : "border-transparent hover:border-gray-100 hover:bg-gray-50"
                            }`}
                          >
                            <span
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                                isActive
                                  ? "bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow-md shadow-orange-200"
                                  : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                              }`}
                            >
                              <Icon size={18} />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span
                                className={`block text-sm font-bold ${
                                  isActive ? "text-gray-900" : "text-gray-700"
                                }`}
                              >
                                {link.label}
                              </span>
                              <span className="block truncate text-xs text-gray-400">{link.desc}</span>
                            </span>
                            <ChevronRight
                              size={16}
                              className={isActive ? "text-orange-500" : "text-gray-300"}
                            />
                          </Link>
                        </motion.div>
                      );
                    })}
                  </motion.nav>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.25 }}
                    className="mt-auto border-t border-orange-100 bg-gradient-to-b from-white to-orange-50/50 p-4"
                  >
                    <AdminCTA
                      adminUrl={adminUrl}
                      className="flex w-full items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-4 py-3 text-sm font-bold text-white shadow-md shadow-orange-200 transition-transform active:scale-95"
                    >
                      <LayoutDashboard size={14} />
                      অ্যাডমিন প্যানেলে যান
                    </AdminCTA>
                  </motion.div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </header>
  );
}
