"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { settingsChildren } from "./menuConfig";
import {
  useShopFeatures,
  filterByFeature,
  filterByPermission,
} from "../hooks/useShopFeatures";
import { useCurrentAdmin } from "../hooks/useCurrentAdmin";

export default function SettingsSideMenu() {
  const pathname = usePathname();
  const features = useShopFeatures();
  const admin = useCurrentAdmin();
  const items = filterByPermission(filterByFeature(settingsChildren, features), admin);

  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const activeItem = items.find((item) => item.href === pathname);

  // ✅ পেজ বদলালে dropdown নিজে থেকে বন্ধ হয়ে যাবে
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // ✅ বাইরে ক্লিক করলে dropdown বন্ধ
  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const renderLink = ({ icon, label, href }, { onClick } = {}) => {
    const isActive = pathname === href;
    return (
      <Link
        key={href}
        href={href}
        onClick={onClick}
        className={`flex items-center gap-2 px-3 py-2.5 md:py-2 rounded-lg text-sm transition ${
          isActive
            ? "bg-rose-50 dark:bg-rose-500/10 font-semibold text-rose-600 dark:text-rose-400"
            : "text-gray-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-500/10"
        }`}
      >
        {icon}
        <span className="truncate">{label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* ✅ মোবাইল: সব আইটেম পাশাপাশি scroll করার বদলে একটা compact dropdown */}
      <div ref={wrapRef} className="relative shrink-0 md:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-semibold text-gray-800 dark:text-slate-200 transition-colors"
        >
          <span className="flex items-center gap-2 min-w-0 text-rose-600 dark:text-rose-400">
            {activeItem?.icon}
            <span className="truncate">
              {activeItem?.label || "একটি সেটিংস নির্বাচন করুন"}
            </span>
          </span>
          <ChevronDown
            size={16}
            className={`shrink-0 text-gray-400 dark:text-slate-500 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {open && (
          <div className="absolute z-30 left-0 right-0 mt-1.5 max-h-80 overflow-y-auto rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg p-1.5 space-y-0.5">
            {items.map((item) => renderLink(item, { onClick: () => setOpen(false) }))}
          </div>
        )}
      </div>

      {/* ✅ ডেস্কটপ/ট্যাবলেট: চিরাচরিত sticky sidebar */}
      <nav className="hidden md:block shrink-0 md:w-56 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-2 md:sticky md:top-4 md:self-start transition-colors">
        <div className="flex flex-col gap-1">{items.map((item) => renderLink(item))}</div>
      </nav>
    </>
  );
}
