"use client";

import { Eye, EyeOff } from "lucide-react";
import AddButton from "./AddButton";

/**
 * ✅ Categories ও Sliders পেজের shared হেডার (slim)।
 * Mobile-এ: ১ম সারিতে টাইটেল, ২য় সারিতে ফুল-উইডথ segmented filter,
 * ৩য় সারিতে Hide All / Delete All পাশাপাশি সমান প্রস্থে — তাই কোনো বাটন
 * আরেকটার উপর উঠে যায় না। Desktop-এ সব এক সারিতে।
 */
export default function ListToolbar({
  title,
  subtitle,
  addLabel,
  onAdd,
  filter,
  onFilterChange,
  counts = {},
  showBulk = false,
  hasAnyActive = true,
  onToggleAll,
  extra,
}) {
  const hasActions = showBulk || !!extra;

  return (
    <div className="mb-3 space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100 truncate">{title}</h1>
          {subtitle && <p className="text-xs text-gray-500 dark:text-slate-400">{subtitle}</p>}
        </div>
        <AddButton label={addLabel} onClick={onAdd} />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        {/* segmented filter */}
        <div className="grid grid-cols-3 sm:inline-flex p-0.5 rounded-lg bg-gray-100 dark:bg-slate-800 border border-gray-200/70 dark:border-slate-700">
          {["all", "active", "hidden"].map((f) => {
            const active = filter === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => onFilterChange(f)}
                className={`min-w-0 inline-flex items-center justify-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-md text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                  active
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200"
                }`}
              >
                {f}
                <span className={`px-1.5 rounded-full text-[10px] leading-4 ${active ? "bg-indigo-50 dark:bg-indigo-500/15" : "bg-gray-200/70 dark:bg-slate-700"}`}>
                  {counts[f] ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* bulk actions */}
        {hasActions && (
          <div className={`grid gap-2 sm:flex sm:items-center ${showBulk && extra ? "grid-cols-2" : "grid-cols-1"}`}>
            {showBulk && (
              <button
                type="button"
                onClick={onToggleAll}
                className={`inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold border whitespace-nowrap transition-all active:scale-[0.97] ${
                  hasAnyActive
                    ? "bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 border-gray-200 dark:border-slate-700 hover:border-gray-400"
                    : "bg-green-600 text-white border-green-600 hover:bg-green-700"
                }`}
              >
                {hasAnyActive ? <EyeOff size={14} /> : <Eye size={14} />}
                {hasAnyActive ? "Hide All" : "Show All"}
              </button>
            )}
            {extra}
          </div>
        )}
      </div>
    </div>
  );
}
