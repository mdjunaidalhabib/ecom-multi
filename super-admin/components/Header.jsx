"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, User, LogOut, ShieldCheck } from "lucide-react";
import MenuBar from "./MenuBar";
import LiveDateTime from "./LiveDateTime";
import ThemeToggle from "./ThemeToggle";
import useAdminMe from "../hooks/useAdminMe";
import { superAdminNavItems } from "./menuConfig";
import { motion, AnimatePresence } from "framer-motion";

// ✅ বর্তমান pathname থেকে টপবারে দেখানোর জন্য পেজের নাম বের করে —
// nav আইটেমগুলোর সাথে মিলে গেলে সেই label, নাহলে URL segment থেকে fallback
function getPageMeta(pathname) {
  const match = superAdminNavItems.find((item) => item.href === pathname);
  if (match) return { title: match.label, icon: match.icon };
  if (pathname?.startsWith("/profile")) return { title: "Profile", icon: null };

  const segment = pathname?.split("/").filter(Boolean).pop() || "dashboard";
  return { title: segment.charAt(0).toUpperCase() + segment.slice(1), icon: null };
}

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { admin } = useAdminMe();
  const profileRef = useRef(null);

  // Close the profile dropdown when clicking outside of it
  useEffect(() => {
    const onClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const displayName = admin?.name || "Super Admin";
  const { title: pageTitle, icon: pageIcon } = getPageMeta(pathname);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      document.cookie =
        "admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      localStorage.clear();
      sessionStorage.clear();
      window.location.replace("/login");
    }
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm px-3 md:px-6 py-2.5 flex items-center justify-between gap-3 relative transition-colors">
      {/* বাম দিকে: বর্তমান পেজের নাম */}
      <div className="min-w-0 flex-1 flex items-center gap-2.5">
        {pageIcon && (
          <span className="hidden sm:flex items-center justify-center h-9 w-9 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0">
            {pageIcon}
          </span>
        )}
        <div className="min-w-0">
          <h1 className="text-base md:text-lg font-bold text-gray-900 dark:text-slate-100 truncate">
            {pageTitle}
          </h1>
          <p className="hidden sm:block text-xs text-gray-500 dark:text-slate-400 truncate">
            স্বাগতম, {displayName} — পুরো প্ল্যাটফর্ম পরিচালনা করতে প্রস্তুত
          </p>
        </div>
      </div>

      {/* ডান দিকে: থিম টগল, তারিখ-সময়, প্রোফাইল ড্রপডাউন, মোবাইল মেনু */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        <ThemeToggle className="hidden sm:flex" />
        <LiveDateTime />

        {/* ✅ Profile dropdown (ডেস্কটপ) */}
        <div className="relative hidden sm:block" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((o) => !o)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="relative shrink-0">
              <img
                src={admin?.avatar || "/default-avatar.svg"}
                alt="avatar"
                className="w-7 h-7 rounded-full object-cover"
              />
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
            </span>
            <span className="text-sm font-medium text-gray-700 dark:text-slate-300 max-w-[110px] truncate">
              {displayName}
            </span>
            <ChevronDown
              size={14}
              className={`text-gray-400 dark:text-slate-500 transition-transform ${profileOpen ? "rotate-180" : ""}`}
            />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 py-2 z-50"
              >
                <div className="px-3 py-2 border-b border-gray-100 dark:border-slate-700">
                  <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                    {admin?.email}
                  </p>
                  <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded text-[10px] font-medium bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20">
                    <ShieldCheck size={11} /> Super Admin
                  </span>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                >
                  <User size={15} /> Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  <LogOut size={15} /> Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ✅ মোবাইলে avatar → সরাসরি Profile */}
        <Link href="/profile" className="relative sm:hidden shrink-0">
          <img
            src={admin?.avatar || "/default-avatar.svg"}
            alt="avatar"
            className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-slate-700"
          />
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
        </Link>

        <ThemeToggle className="sm:hidden" />

        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center justify-center rounded-full h-9 w-9 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
          >
            {menuOpen ? (
              <X className="text-rose-600 dark:text-rose-400" size={20} />
            ) : (
              <Menu className="text-gray-600 dark:text-slate-300" size={20} />
            )}
          </button>
        </div>
      </div>

      {/* মোবাইল মেনু — Sidebar-এর সাথে consistent ডার্ক থিম */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setMenuOpen(false)}
            />

            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 left-0 h-[100dvh] w-72 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 shadow-lg z-50 p-4 pb-[env(safe-area-inset-bottom,0px)] overflow-y-auto flex flex-col"
            >
              <div className="flex items-center justify-between shrink-0 pb-4">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shrink-0 shadow-lg shadow-rose-950/50">
                    <ShieldCheck size={18} className="text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white leading-tight truncate">
                      Super Admin Console
                    </p>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Platform Control
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="h-8 w-8 flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="mx-1 mb-2 border-b border-white/10" />

              <div className="flex-1 min-h-0">
                <MenuBar
                  items={superAdminNavItems}
                  onItemClick={() => setMenuOpen(false)}
                  vertical={true}
                />
              </div>
              <button
                onClick={handleLogout}
                className="shrink-0 mt-2 w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-colors"
              >
                <LogOut size={16} /> Logout
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
