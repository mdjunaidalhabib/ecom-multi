"use client";

import { isDueActive, isWholesale, wholesaleDue, wholesalePaid } from "./utils";

/**
 * ✅ Sale channel ব্যাজ — Offline (বেগুনি) ও Wholesale (সবুজ)।
 * Online-এ কিছু দেখায় না (ডিফল্ট চ্যানেল, আগের মতোই)।
 */
export function ChannelBadge({ o, compact = false }) {
  const size = compact
    ? "text-[9px] px-1.5 py-0.5 leading-none"
    : "text-[10px] px-1.5 py-0.5";

  if (o?.saleChannel === "offline") {
    return (
      <span
        className={`${size} font-bold uppercase rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20`}
      >
        🏬 Offline
      </span>
    );
  }

  if (isWholesale(o)) {
    return (
      <span
        className={`${size} font-bold uppercase rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20`}
      >
        📦 Wholesale
      </span>
    );
  }

  return null;
}

/**
 * ✅ Wholesale অর্ডারের Paid / Due সারি + "Collect" বাটন।
 * Wholesale ছাড়া অন্য অর্ডারে কিছুই দেখায় না।
 */
export function WholesalePaymentInfo({ o, onCollect }) {
  if (!isWholesale(o)) return null;

  const paid = wholesalePaid(o);
  const due = wholesaleDue(o);
  const active = isDueActive(o);
  const hasDue = active && due > 0;

  return (
    <div className="space-y-1 text-[11px]">
      <div className="flex items-center justify-between gap-3">
        <span className="text-gray-500 dark:text-slate-400">Paid</span>
        <span className="font-bold text-green-700 dark:text-green-400">৳{paid}</span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="text-gray-500 dark:text-slate-400">Due</span>
        {!active ? (
          <span className="font-semibold text-gray-400 dark:text-slate-500">—</span>
        ) : hasDue ? (
          <span className="font-black text-red-600 dark:text-red-400">৳{due}</span>
        ) : (
          <span className="font-bold text-green-700 dark:text-green-400">Settled ✓</span>
        )}
      </div>

      {hasDue && onCollect && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onCollect(o);
          }}
          className="mt-1 w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold py-1.5 transition"
        >
          💰 Collect Payment
        </button>
      )}

      {!hasDue && active && (paid > 0 || (o.payments || []).length > 0) && onCollect && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onCollect(o);
          }}
          className="mt-1 w-full rounded-lg border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 text-[11px] font-semibold py-1 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
        >
          Payment History
        </button>
      )}
    </div>
  );
}
