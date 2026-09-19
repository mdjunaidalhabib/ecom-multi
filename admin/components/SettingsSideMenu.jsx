"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Search, Settings, X } from "lucide-react";
import useSettingsGroups from "../hooks/useSettingsGroups";
import { settingsTones } from "./settingsTheme";

function SearchBox({ value, onChange, autoFocus = false }) {
  return (
    <div className="relative">
      <Search
        size={14}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus={autoFocus}
        placeholder="সেটিংস খুঁজুন..."
        className="w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/60 pl-8 pr-8 py-2 text-sm text-gray-800 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-500 transition"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="মুছুন"
          className="absolute right-2 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-200/70 dark:hover:bg-slate-700 transition"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}

function GroupLabel({ group }) {
  const tone = settingsTones[group.tone];
  return (
    <p className="flex items-center gap-2 px-2 pb-1.5 pt-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
      {group.label}
    </p>
  );
}

function SettingsLink({ item, tone, active, onClick }) {
  const { Icon, label, href } = item;
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`group relative flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors ${
        active
          ? `${tone.rowActive} font-semibold text-gray-900 dark:text-white`
          : "text-gray-600 dark:text-slate-400 hover:bg-gray-100/80 dark:hover:bg-slate-800/70 hover:text-gray-900 dark:hover:text-slate-200"
      }`}
    >
      {active && (
        <span
          className={`absolute -left-2 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full ${tone.bar}`}
        />
      )}
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
          active ? tone.tileActive : `${tone.tile} group-hover:scale-105`
        }`}
      >
        <Icon size={14} />
      </span>
      <span className="truncate">{label}</span>
    </Link>
  );
}

function GroupedLinks({ groups, pathname, onNavigate }) {
  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.key}>
          <GroupLabel group={group} />
          <div className="space-y-0.5 pl-2">
            {group.items.map((item) => (
              <SettingsLink
                key={item.href}
                item={item}
                tone={settingsTones[group.tone]}
                active={pathname === item.href}
                onClick={onNavigate}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyResult() {
  return (
    <p className="px-2 py-6 text-center text-xs text-gray-400 dark:text-slate-500">
      কোনো সেটিংস পাওয়া যায়নি
    </p>
  );
}

export default function SettingsSideMenu() {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const { groups, total, allGroups, allTotal } = useSettingsGroups(query);

  const activeGroup = allGroups.find((g) => g.items.some((i) => i.href === pathname));
  const activeItem = activeGroup?.items.find((i) => i.href === pathname);
  const activeTone = settingsTones[activeGroup?.tone || "indigo"];

  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  // ✅ পেজ বদলালে dropdown নিজে থেকে বন্ধ হয়ে যাবে
  useEffect(() => {
    setOpen(false);
    setQuery("");
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

  return (
    <>
      {/* ✅ মোবাইল: compact dropdown (গ্রুপ সহ) */}
      <div ref={wrapRef} className="relative shrink-0 md:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="w-full flex items-center justify-between gap-2 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-semibold text-gray-800 dark:text-slate-200 shadow-sm transition-colors"
        >
          <span className="flex min-w-0 items-center gap-2.5">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                activeItem ? activeTone.tileActive : "bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400"
              }`}
            >
              {activeItem ? <activeItem.Icon size={14} /> : <Settings size={14} />}
            </span>
            <span className="min-w-0 text-left">
              <span className="block truncate">
                {activeItem?.label || "একটি সেটিংস নির্বাচন করুন"}
              </span>
              {activeGroup && (
                <span className="block truncate text-[10px] font-medium uppercase tracking-wide text-gray-400 dark:text-slate-500">
                  {activeGroup.label}
                </span>
              )}
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
          <div className="absolute z-30 left-0 right-0 mt-1.5 overflow-hidden rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
            <div className="border-b border-gray-100 dark:border-slate-800 p-2">
              <SearchBox value={query} onChange={setQuery} />
            </div>
            <div className="max-h-80 overflow-y-auto p-3 sidebar-scroll">
              {total === 0 ? (
                <EmptyResult />
              ) : (
                <GroupedLinks
                  groups={groups}
                  pathname={pathname}
                  onNavigate={() => setOpen(false)}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* ✅ ডেস্কটপ/ট্যাবলেট: sticky sidebar — গ্রুপ, সার্চ ও রঙিন আইকন সহ */}
      <nav
        aria-label="Settings"
        className="hidden md:flex md:flex-col shrink-0 md:w-64 overflow-hidden rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm md:sticky md:top-4 md:self-start md:max-h-[calc(100vh-7.5rem)] transition-colors"
      >
        <Link
          href="/admin/settings"
          className="group flex shrink-0 items-center gap-3 border-b border-gray-100 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-900 px-4 py-3.5"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 dark:from-indigo-500 dark:to-violet-600 text-white shadow-md">
            <Settings
              size={17}
              className="transition-transform duration-500 group-hover:rotate-90"
            />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold leading-tight text-gray-900 dark:text-white">
              Settings
            </span>
            <span className="block text-[11px] leading-tight text-gray-400 dark:text-slate-500">
              {allTotal}টি অপশন
            </span>
          </span>
        </Link>

        <div className="shrink-0 px-3 pt-3">
          <SearchBox value={query} onChange={setQuery} />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 sidebar-scroll">
          {total === 0 ? (
            <EmptyResult />
          ) : (
            <GroupedLinks groups={groups} pathname={pathname} />
          )}
        </div>
      </nav>
    </>
  );
}
