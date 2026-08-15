"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, User, LogOut, Store, Check } from "lucide-react";
import MenuBar from "./MenuBar";
import LiveDateTime from "./LiveDateTime";
import ThemeToggle from "./ThemeToggle";
import { navItems, settingsChildren } from "./menuConfig";
import {
  useShopFeatures,
  filterByFeature,
  filterByRole,
  filterByPermission,
} from "../hooks/useShopFeatures";
import { getRoleLabel } from "../lib/roleLabel";
import { motion, AnimatePresence } from "framer-motion";

// ✅ বর্তমান pathname থেকে টপবারে দেখানোর জন্য পেজের নাম বের করে —
// navItems/settingsChildren এ মিলে গেলে সেই label, নাহলে URL segment থেকে
// fallback তৈরি করে (যেমন প্রোডাক্ট এডিট পেজের মতো ডাইনামিক রুটের জন্য)।
function getPageMeta(pathname) {
  const match = [...navItems, ...settingsChildren].find(
    (item) => item.href === pathname,
  );
  if (match) return { title: match.label, icon: match.icon };
  if (pathname?.startsWith("/admin/profile")) return { title: "Profile", icon: null };

  const segment = pathname?.split("/").filter(Boolean).pop() || "dashboard";
  return { title: segment.charAt(0).toUpperCase() + segment.slice(1), icon: null };
}

// ✅ ব্রাউজার কুকি পড়া/লেখার ছোট হেল্পার — শপ-সুইচার এখানে বেছে নেওয়া শপ
// `active_shop_id` কুকিতে রাখে, যেটা admin API প্রক্সি (route.js) পড়ে
// `x-active-shop-id` হেডার হিসেবে backend-এ পাঠায় (দেখুন requireShopContext)।
function getCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setActiveShopCookie(shopId) {
  document.cookie = `active_shop_id=${encodeURIComponent(shopId)}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [shopMenuOpen, setShopMenuOpen] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [shops, setShops] = useState([]);
  const [activeShopId, setActiveShopId] = useState(null);
  const features = useShopFeatures();
  const profileRef = useRef(null);
  const shopMenuRef = useRef(null);

  useEffect(() => {
    const loadAdmin = async () => {
      try {
        const res = await axios.get("/api/admin/verify", {
          withCredentials: true,
        });
        setAdmin(res.data?.admin || null);

        const shopList = res.data?.shops || [];
        setShops(shopList);

        if (shopList.length > 0) {
          const cookieShopId = getCookie("active_shop_id");
          const validCookieShop = shopList.find((s) => s.id === cookieShopId);

          if (validCookieShop) {
            setActiveShopId(validCookieShop.id);
          } else {
            // কুকি নেই বা এই admin-এর অ্যাক্সেসে নেই এমন শপে সেট করা — প্রথম
            // assigned শপে ফলব্যাক (backend-এর ডিফল্ট আচরণের সাথে সামঞ্জস্যপূর্ণ)
            setActiveShopId(shopList[0].id);
            setActiveShopCookie(shopList[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load admin info:", err);
      }
    };

    loadAdmin();
  }, []);

  // Close the shop switcher dropdown when clicking outside of it
  useEffect(() => {
    const onClickOutside = (e) => {
      if (shopMenuRef.current && !shopMenuRef.current.contains(e.target)) {
        setShopMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleShopSwitch = (shopId) => {
    if (shopId === activeShopId) {
      setShopMenuOpen(false);
      return;
    }
    setActiveShopCookie(shopId);
    // ✅ পুরো অ্যাপের সব state/cache নতুন active শপের ডেটা দিয়ে রিফ্রেশ
    // করার সবচেয়ে সহজ ও নিরাপদ উপায় — hard reload
    window.location.reload();
  };

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

  const displayName = admin?.name || "Admin";
  const roleLabel = admin ? getRoleLabel(admin.role) : "";
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
      document.cookie =
        "active_shop_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      localStorage.clear();
      sessionStorage.clear();
      window.location.replace("/login");
    }
  };

  const filteredNavItems = filterByPermission(
    filterByRole(filterByFeature(navItems, features), admin?.role),
    admin,
  );
  const filteredSettingsChildren = filterByPermission(
    filterByRole(filterByFeature(settingsChildren, features), admin?.role),
    admin,
  );

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm px-3 md:px-6 py-2.5 flex items-center justify-between gap-3 relative transition-colors">
      {/* বাম দিকে: বর্তমান পেজের নাম */}
      <div className="min-w-0 flex-1 flex items-center gap-2.5">
        {pageIcon && (
          <span className="hidden sm:flex items-center justify-center h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
            {pageIcon}
          </span>
        )}
        <div className="min-w-0">
          <h1 className="text-base md:text-lg font-bold text-gray-900 dark:text-slate-100 truncate">
            {pageTitle}
          </h1>
          <p className="hidden sm:block text-xs text-gray-500 dark:text-slate-400 truncate">
            স্বাগতম, {displayName} — আজকের কার্যক্রম পরিচালনা করতে প্রস্তুত
          </p>
        </div>
      </div>

      {/* ডান দিকে: থিম টগল, তারিখ-সময়, প্রোফাইল ড্রপডাউন, মোবাইল মেনু */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        <ThemeToggle className="hidden sm:flex" />
        <LiveDateTime />

        {/* ✅ Shop switcher — একাধিক শপে assigned admin/staff এর জন্যই দেখা যায় */}
        {shops.length > 1 && (
          <div className="relative hidden md:block" ref={shopMenuRef}>
            <button
              onClick={() => setShopMenuOpen((o) => !o)}
              className="flex items-center gap-1.5 pl-2.5 pr-2 py-1.5 rounded-full border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors max-w-[160px]"
            >
              <Store size={14} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="text-sm font-medium text-gray-700 dark:text-slate-300 truncate">
                {shops.find((s) => s.id === activeShopId)?.name || "শপ নির্বাচন"}
              </span>
              <ChevronDown
                size={14}
                className={`text-gray-400 dark:text-slate-500 shrink-0 transition-transform ${shopMenuOpen ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {shopMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 py-2 z-50 max-h-72 overflow-y-auto"
                >
                  <p className="px-3 pb-1.5 text-[11px] font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wide">
                    আপনার শপসমূহ
                  </p>
                  {shops.map((shop) => (
                    <button
                      key={shop.id}
                      onClick={() => handleShopSwitch(shop.id)}
                      className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                    >
                      <span className="truncate">{shop.name}</span>
                      {shop.id === activeShopId && (
                        <Check size={14} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

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
                  {roleLabel && (
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
                      {roleLabel}
                    </span>
                  )}
                </div>
                <Link
                  href="/admin/profile"
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
        <Link href="/admin/profile" className="relative sm:hidden shrink-0">
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
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-950/50">
                    <Store size={18} className="text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white leading-tight truncate">
                      Shop Console
                    </p>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Admin Panel
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
                  items={filteredNavItems}
                  settingsChildren={filteredSettingsChildren}
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
