"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

/**
 * ✅ Responsive modal:
 *  - Mobile: নিচ থেকে উঠে আসা bottom-sheet (drag handle, sticky header + sticky footer,
 *    keyboard খুললেও বাটন দেখা যায়)
 *  - Desktop: মাঝখানে centered dialog
 *
 * Props:
 *  title, subtitle, icon  → sticky হেডার
 *  footer                 → sticky ফুটার (সাধারণত Cancel/Save বাটন)
 *  bare                   → হেডার ছাড়া (যেমন ProductForm যার নিজের হেডার আছে)
 *  maxWidth               → desktop-এ সর্বোচ্চ প্রস্থ ক্লাস
 */
export default function ModalShell({
  open = true,
  onClose,
  title,
  subtitle,
  icon,
  footer,
  bare = false,
  maxWidth = "sm:max-w-md",
  children,
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/50 dark:bg-black/70 backdrop-blur-[2px] animate-[fadeIn_.15s_ease-out]"
      />

      {/* Sheet */}
      <div
        className={`relative flex flex-col w-full ${maxWidth} max-h-[94dvh] sm:max-h-[90vh]
          bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl
          border-t sm:border border-gray-200 dark:border-slate-700
          animate-[sheetUp_.25s_cubic-bezier(.2,.8,.2,1)] sm:animate-[zoomIn_.2s_ease-out]`}
      >
        {/* drag handle (mobile only) */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1 shrink-0">
          <span className="h-1.5 w-10 rounded-full bg-gray-300 dark:bg-slate-600" />
        </div>

        {!bare && (
          <div className="flex items-center gap-3 px-5 pt-2 sm:pt-5 pb-3 border-b border-gray-100 dark:border-slate-800 shrink-0">
            {icon && (
              <span className="grid place-items-center h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                {icon}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-slate-100 truncate">{title}</h2>
              {subtitle && <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{subtitle}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="grid place-items-center h-9 w-9 rounded-full text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors shrink-0"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {bare && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 z-10 grid place-items-center h-9 w-9 rounded-full bg-gray-100/90 text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
        )}

        <div className={`flex-1 overflow-y-auto overscroll-contain ${bare ? "p-4 sm:p-6" : "px-5 py-4"}`}>{children}</div>

        {footer && (
          <div
            className="shrink-0 px-5 pt-3 border-t border-gray-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 rounded-b-2xl"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)" }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* ====== ফর্মের জন্য shared ক্লাস (mobile-এ ১৬px → iOS zoom হয় না) ====== */
export const fieldLabel = "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-gray-500 dark:text-slate-400";
export const fieldInput =
  "w-full h-11 px-3.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-base sm:text-sm text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-500/20 transition";
