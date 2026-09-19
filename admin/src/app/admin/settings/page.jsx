"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search, SearchX, Settings, X } from "lucide-react";
import useSettingsGroups from "../../../../hooks/useSettingsGroups";
import { settingsTones } from "../../../../components/settingsTheme";

function SettingCard({ item, tone }) {
  const { Icon, label, desc, href } = item;
  return (
    <Link
      href={href}
      className={`group relative flex items-start gap-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${tone.cardHover}`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-200 ${tone.tile} ${tone.cardTileHover}`}
      >
        <Icon size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-gray-900 dark:text-slate-100">
          {label}
        </span>
        <span className="mt-0.5 block text-xs leading-snug text-gray-500 dark:text-slate-400 line-clamp-2">
          {desc}
        </span>
      </span>
      <ArrowUpRight
        size={15}
        className="shrink-0 text-gray-300 dark:text-slate-600 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-gray-500 dark:group-hover:text-slate-300"
      />
    </Link>
  );
}

export default function SettingsPage() {
  const [query, setQuery] = useState("");
  const { groups, total, allTotal, loading } = useSettingsGroups(query);

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-slate-800 bg-gradient-to-br from-white via-indigo-50/60 to-violet-50/70 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/60 p-5 sm:p-6 shadow-sm">
        <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-indigo-400/15 dark:bg-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 right-24 h-36 w-36 rounded-full bg-violet-400/15 dark:bg-violet-500/20 blur-3xl" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
              <Settings size={20} />
            </span>
            <div>
              <h1 className="text-lg font-bold leading-tight text-gray-900 dark:text-white">
                Settings
              </h1>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
                আপনার স্টোরের সব কনফিগারেশন এক জায়গায়
                {!loading && ` · ${allTotal}টি অপশন`}
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="সেটিংস খুঁজুন..."
              className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/10 py-2.5 pl-9 pr-9 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-400 shadow-sm focus:border-indigo-400 dark:focus:border-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 transition"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="মুছুন"
                className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white transition"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Groups */}
      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[72px] animate-pulse rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900"
            />
          ))}
        </div>
      ) : total === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-14 text-center">
          <SearchX size={28} className="mb-3 text-gray-300 dark:text-slate-600" />
          <p className="font-medium text-gray-700 dark:text-slate-300">
            কোনো সেটিংস পাওয়া যায়নি
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            অন্য কীওয়ার্ড দিয়ে আবার চেষ্টা করুন।
          </p>
        </div>
      ) : (
        groups.map((group) => {
          const tone = settingsTones[group.tone];
          return (
            <section key={group.key}>
              <div className="mb-2.5 flex items-center gap-2.5 px-1">
                <span className={`h-2 w-2 rounded-full ${tone.dot}`} />
                <h2 className="text-sm font-bold text-gray-800 dark:text-slate-200">
                  {group.label}
                </h2>
                <span className="hidden text-xs text-gray-400 dark:text-slate-500 sm:inline">
                  {group.hint}
                </span>
                <span className="h-px flex-1 bg-gray-200 dark:bg-slate-800" />
                <span className="text-[11px] font-medium text-gray-400 dark:text-slate-500">
                  {group.items.length}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {group.items.map((item) => (
                  <SettingCard key={item.href} item={item} tone={tone} />
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
