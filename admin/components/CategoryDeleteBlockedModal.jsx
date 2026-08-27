"use client";

import Link from "next/link";
import { AlertTriangle, ExternalLink } from "lucide-react";

export default function CategoryDeleteBlockedModal({ open, count, products = [], onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[85vh] flex flex-col">
        {/* HEADER */}
        <div className="flex items-start gap-3 shrink-0">
          <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400">
            <AlertTriangle size={20} />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-gray-900 dark:text-slate-100">
              এই ক্যাটেগরি ডিলিট করা যাবে না
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
              এই ক্যাটেগরিতে এখনো <b>{count}</b> টি প্রোডাক্ট আছে। আগে সেগুলো ডিলিট করুন
              অথবা অন্য ক্যাটেগরিতে সরিয়ে নিন।
            </p>
          </div>
        </div>

        {/* PRODUCT LIST */}
        <div className="mt-4 overflow-y-auto space-y-2 pr-1">
          {products.map((p) => (
            <div
              key={p._id}
              className="flex items-center gap-3 border border-gray-200 dark:border-slate-700 rounded-lg p-2"
            >
              {p.image ? (
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-10 h-10 rounded-md object-cover shrink-0 bg-gray-100 dark:bg-slate-800"
                />
              ) : (
                <div className="w-10 h-10 rounded-md shrink-0 bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-[9px] text-gray-400 dark:text-slate-500">
                  No Image
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p
                  className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate"
                  title={p.name}
                >
                  {p.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  {p.price !== undefined && <>৳{p.price}</>}
                  {p.stock !== undefined && <> · স্টক: {p.stock}</>}
                </p>
              </div>

              <Link
                href={`/admin/products?edit=${p._id}`}
                onClick={onClose}
                className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition"
              >
                Edit
                <ExternalLink size={12} />
              </Link>
            </div>
          ))}

          {count > products.length && (
            <p className="text-xs text-gray-500 dark:text-slate-400 text-center pt-1">
              + আরও {count - products.length} টি প্রোডাক্ট আছে
            </p>
          )}
        </div>

        {/* FOOTER */}
        <div className="mt-6 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
