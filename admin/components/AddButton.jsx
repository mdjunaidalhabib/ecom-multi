"use client";

import { Plus } from "lucide-react";

/**
 * ✅ Professional "Add" বাটন — সব admin পেজে একই look।
 *  - Desktop/Tablet (sm+): হেডারের পাশে গ্রেডিয়েন্ট pill বাটন (আইকন + লেবেল)
 *  - Mobile: নিচের ডান কোণে floating action button (FAB) — এক হাতে সহজে চাপা যায়,
 *    iPhone-এর safe-area মেনে চলে।
 */
export default function AddButton({ label, onClick, disabled = false }) {
  return (
    <>
      {/* Desktop / tablet */}
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="group hidden sm:inline-flex items-center gap-2 h-9 pl-2.5 pr-3.5 rounded-lg text-[13px] font-semibold text-white
          bg-gradient-to-r from-indigo-600 to-blue-600 shadow-md shadow-indigo-600/25
          hover:shadow-lg hover:shadow-indigo-600/30 hover:from-indigo-500 hover:to-blue-500
          active:scale-[0.97] transition-all disabled:opacity-60 disabled:cursor-not-allowed
          focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
      >
        <span className="grid place-items-center h-5 w-5 rounded-md bg-white/20 group-hover:bg-white/30 transition-colors">
          <Plus size={14} strokeWidth={3} />
        </span>
        {label}
      </button>

      {/* Mobile FAB */}
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className="sm:hidden fixed right-3 z-30 flex items-center gap-1.5 h-10 pl-3 pr-4 rounded-full text-xs font-semibold text-white
          bg-gradient-to-br from-indigo-600 to-blue-600 shadow-lg shadow-indigo-600/30
          active:scale-95 transition-transform disabled:opacity-60"
        style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)" }}
      >
        <Plus size={16} strokeWidth={3} />
        {label}
      </button>
    </>
  );
}
