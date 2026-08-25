"use client";

import { AlertTriangle, X } from "lucide-react";

export default function AlertModal({ data, onClose }) {
  if (!data) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70]" />

      <div className="fixed inset-0 flex justify-center items-center z-[71] p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm shadow-2xl border border-transparent dark:border-slate-700 overflow-hidden">
          <div className="flex items-start gap-3 px-6 pt-6">
            <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div className="flex-1 pt-1.5">
              <h2 className="text-base font-bold text-gray-900 dark:text-slate-100">
                {data.title || "সমস্যা হয়েছে"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="h-7 w-7 rounded-lg grid place-items-center text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
            >
              <X size={16} />
            </button>
          </div>

          <p className="px-6 pt-3 pb-6 text-sm text-gray-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {data.message}
          </p>

          <div className="flex justify-end px-6 pb-6">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition"
            >
              {data.confirmText || "বুঝেছি"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
