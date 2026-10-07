"use client";

import { useEffect, useState } from "react";
import { X, Boxes, Loader2 } from "lucide-react";
import { formatDateTime } from "../lib/utils.js";

const REASON_LABEL = {
  order: "অর্ডার",
  cancel: "Cancel",
  return: "Return",
  reopen: "Reopen",
  qty_edit: "অর্ডার Qty এডিট",
  initial: "Opening stock",
  manual_adjust: "হাতে এডিট",
};

// ✅ একটা product-এর stock ledger — কোন অর্ডার/এডিটের কারণে stock কত বেড়েছে/কমেছে
export default function ProductStockHistoryModal({ product, onClose }) {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!product?._id) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    fetch(`/api/admin/products/${product._id}/stock-movements`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Stock history লোড করা যায়নি");
        if (!cancelled) setMovements(data.movements || []);
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [product?._id]);

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60">
      <div className="w-full sm:max-w-2xl sm:rounded-3xl bg-gray-50 dark:bg-slate-900 h-[80vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="shrink-0 px-4 sm:px-6 py-4 flex items-center justify-between bg-gradient-to-r from-slate-800 to-slate-700">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-2xl bg-white/15 grid place-items-center shrink-0">
              <Boxes className="text-white" size={18} />
            </div>
            <div className="min-w-0">
              <div className="text-lg font-semibold text-white truncate">
                {product.name}
              </div>
              <div className="text-xs text-white/70">
                Stock History • বর্তমান stock: {product.stock ?? 0}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-10 w-10 rounded-2xl grid place-items-center bg-white/15 hover:bg-white/25 text-white"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500 dark:text-slate-400">
              <Loader2 size={16} className="animate-spin" /> লোড হচ্ছে...
            </div>
          ) : error ? (
            <div className="text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </div>
          ) : movements.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-10">
              এখনো কোনো stock এন্ট্রি নেই (Ledger চালুর আগের পরিবর্তন এখানে দেখা যায় না)।
            </p>
          ) : (
            <div className="rounded-2xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-50 dark:bg-slate-900/50 text-left text-gray-500 dark:text-slate-400">
                  <tr>
                    <th className="px-3 py-2">সময়</th>
                    <th className="px-3 py-2">Qty</th>
                    <th className="px-3 py-2">কারণ</th>
                    <th className="px-3 py-2">অর্ডার</th>
                    <th className="px-3 py-2">কে</th>
                  </tr>
                </thead>
                <tbody className="text-gray-800 dark:text-slate-200">
                  {movements.map((m) => (
                    <tr key={m._id} className="border-t border-gray-100 dark:border-slate-700">
                      <td className="px-3 py-2 whitespace-nowrap text-gray-500 dark:text-slate-400">
                        {formatDateTime(m.createdAt)}
                      </td>
                      <td
                        className={`px-3 py-2 font-bold whitespace-nowrap ${
                          m.qty < 0
                            ? "text-red-600 dark:text-red-400"
                            : "text-green-600 dark:text-green-400"
                        }`}
                      >
                        {m.qty > 0 ? `+${m.qty}` : m.qty}
                        {m.color ? (
                          <span className="ml-1 font-normal text-purple-600 dark:text-purple-400">
                            ({m.color})
                          </span>
                        ) : null}
                      </td>
                      <td className="px-3 py-2">{REASON_LABEL[m.reason] || m.reason}</td>
                      <td className="px-3 py-2 font-mono">
                        {m.orderNumber ? `#${m.orderNumber}` : "—"}
                      </td>
                      <td className="px-3 py-2">{m.byName || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
