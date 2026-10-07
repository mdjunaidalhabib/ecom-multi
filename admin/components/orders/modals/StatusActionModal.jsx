"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

/**
 * ✅ Status পরিবর্তনের আগে confirm + কারণ (+ refund) নেওয়ার মডাল।
 * Final status (Delivered/Cancelled), Undo/Reopen, Return — সবখানে একই।
 *
 * data: {
 *   title, message,
 *   tone: "danger" | "warning" | "primary",
 *   reason: { required, label, placeholder, defaultValue } | null,
 *   refund: { defaultValue, max } | null,
 *   confirmText,
 *   onConfirm: async ({ reason, refundAmount }) => void  // throw করলে error মডালেই দেখায়
 * }
 */
const TONES = {
  danger: {
    icon: "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400",
    button: "bg-red-600 hover:bg-red-700",
  },
  warning: {
    icon: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
    button: "bg-amber-600 hover:bg-amber-700",
  },
  primary: {
    icon: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
    button: "bg-blue-600 hover:bg-blue-700",
  },
};

export default function StatusActionModal({ data, onClose }) {
  const [reason, setReason] = useState("");
  const [refund, setRefund] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!data) return;
    setReason(data.reason?.defaultValue || "");
    setRefund(
      data.refund?.defaultValue !== undefined ? String(data.refund.defaultValue) : "",
    );
    setError("");
    setLoading(false);
  }, [data]);

  if (!data) return null;

  const tone = TONES[data.tone] || TONES.primary;
  const reasonMissing = data.reason?.required && !reason.trim();

  const handleConfirm = async () => {
    if (reasonMissing) {
      setError("কারণ লেখা বাধ্যতামূলক।");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await data.onConfirm?.({
        reason: reason.trim(),
        refundAmount: data.refund ? Number(refund || 0) : undefined,
      });
      onClose();
    } catch (err) {
      setError(err?.message || "কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" />
      <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-2xl border border-transparent dark:border-slate-700 p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className={`h-10 w-10 rounded-xl grid place-items-center shrink-0 ${tone.icon}`}>
              <AlertTriangle size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-gray-900 dark:text-slate-100">
                {data.title}
              </h2>
              {data.message && (
                <p className="mt-1 text-sm text-gray-600 dark:text-slate-400 whitespace-pre-line">
                  {data.message}
                </p>
              )}
            </div>
          </div>

          {data.reason && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-1.5 text-gray-500 dark:text-slate-400">
                {data.reason.label || "কারণ"}
                {data.reason.required ? " *" : " (ঐচ্ছিক)"}
              </label>
              <textarea
                rows={2}
                autoFocus
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={data.reason.placeholder || ""}
                className="w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30 resize-y"
              />
            </div>
          )}

          {data.refund && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-1.5 text-gray-500 dark:text-slate-400">
                Refund Amount (৳) — সর্বোচ্চ ৳{data.refund.max}
              </label>
              <input
                type="number"
                min={0}
                max={data.refund.max}
                value={refund}
                onWheel={(e) => e.target.blur()}
                onChange={(e) => setRefund(e.target.value)}
                className="w-full h-10 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30"
              />
              <p className="mt-1 text-[11px] text-gray-500 dark:text-slate-400">
                কাস্টমারকে কত টাকা ফেরত দিচ্ছেন — রেকর্ডের জন্য। টাকা ফেরত না দিলে 0 লিখুন।
              </p>
            </div>
          )}

          {error && (
            <div className="text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={onClose}
              disabled={loading}
              className="h-10 px-4 rounded-xl border border-gray-300 dark:border-slate-600 text-sm font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50"
            >
              বাতিল
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading || reasonMissing}
              className={`h-10 px-4 rounded-xl text-sm font-bold text-white inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${tone.button}`}
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              {data.confirmText || "Confirm"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
