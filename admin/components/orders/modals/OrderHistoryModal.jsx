"use client";

import { useEffect, useState } from "react";
import {
  X,
  History,
  RotateCcw,
  PackageX,
  Loader2,
  ArrowRight,
  Boxes,
} from "lucide-react";
import { STATUS_LABEL, STATUS_BADGE_COLOR } from "../shared/constants";
import { formatDateTime } from "../../../lib/utils.js";

const ACTION_LABEL = {
  create: "অর্ডার তৈরি",
  status_change: "Status পরিবর্তন",
  revert: "Undo / Reopen",
  return: "Return",
};

const ACTOR_LABEL = {
  admin: "Admin",
  superadmin: "Super Admin",
  staff: "Staff",
  customer: "Customer",
  courier: "Courier",
  system: "System",
};

const LEDGER_REASON_LABEL = {
  order: "অর্ডার",
  cancel: "Cancel",
  return: "Return",
  reopen: "Reopen",
  qty_edit: "Qty এডিট",
};

// ✅ Undo/Reopen বাটনের লেখা — বর্তমান status অনুযায়ী
export function revertLabel(status, target) {
  if (status === "cancelled") return "Reopen (আবার চালু)";
  if (status === "returned") return "Return বাতিল";
  if (status === "delivered") return "Delivery ফেরত নিন";
  return `Undo → ${STATUS_LABEL[target] || target}`;
}

function StatusChip({ status }) {
  if (!status) {
    return (
      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full border border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-400">
        NEW
      </span>
    );
  }
  return (
    <span
      className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full border ${
        STATUS_BADGE_COLOR[status] || "border-gray-200 text-gray-600"
      }`}
    >
      {STATUS_LABEL[status] || status}
    </span>
  );
}

export default function OrderHistoryModal({ order, onClose, fetchHistory, onAction }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!order?._id) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    setData(null);
    fetchHistory(order._id)
      .then((d) => !cancelled && setData(d))
      .catch((err) => !cancelled && setError(err?.message || "History লোড করা যায়নি"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [order?._id, order?.status, fetchHistory]);

  if (!order) return null;

  const history = [...(data?.statusHistory || [])].reverse();
  const movements = data?.stockMovements || [];
  const revert = data?.revert;
  const status = data?.status || order.status;
  const canReturn = status === "delivered";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60">
      <div className="w-full sm:max-w-2xl sm:rounded-3xl bg-gray-50 dark:bg-slate-900 h-[88vh] overflow-hidden shadow-2xl flex flex-col">
        {/* HEADER */}
        <div className="shrink-0 px-4 sm:px-6 py-4 flex items-center justify-between bg-gradient-to-r from-slate-800 to-slate-700">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-2xl bg-white/15 grid place-items-center shrink-0">
              <History className="text-white" size={18} />
            </div>
            <div className="min-w-0">
              <div className="text-lg font-semibold text-white truncate">
                Order #{order.orderNumber ?? order._id.slice(-6)} — History
              </div>
              <div className="mt-0.5">
                <StatusChip status={status} />
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

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500 dark:text-slate-400">
              <Loader2 size={16} className="animate-spin" /> লোড হচ্ছে...
            </div>
          )}

          {error && (
            <div className="text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {data && (
            <>
              {status === "returned" && data.returnInfo?.returnedAt && (
                <div className="rounded-2xl border border-orange-200 dark:border-orange-500/20 bg-orange-50 dark:bg-orange-500/10 p-3 text-sm text-orange-800 dark:text-orange-300 space-y-0.5">
                  <div className="font-bold">
                    Returned — Refund ৳{data.returnInfo.refundAmount ?? 0}
                  </div>
                  <div>কারণ: {data.returnInfo.reason}</div>
                  <div className="text-xs opacity-80">
                    {data.returnInfo.returnedByName} •{" "}
                    {formatDateTime(data.returnInfo.returnedAt)}
                  </div>
                </div>
              )}

              {/* TIMELINE */}
              <div className="rounded-3xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
                <div className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-3">
                  Status Timeline
                </div>

                {history.length === 0 ? (
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    এই অর্ডারের কোনো history নেই (History ফিচার চালুর আগের অর্ডার)।
                  </p>
                ) : (
                  <ol className="relative border-l border-gray-200 dark:border-slate-700 ml-2 space-y-4">
                    {history.map((h, i) => (
                      <li key={i} className="ml-4">
                        <span
                          className={`absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full ${
                            h.action === "revert"
                              ? "bg-amber-500"
                              : h.action === "return"
                                ? "bg-orange-500"
                                : "bg-blue-500"
                          }`}
                        />
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <StatusChip status={h.from} />
                          <ArrowRight size={12} className="text-gray-400" />
                          <StatusChip status={h.to} />
                          <span className="text-[11px] font-semibold text-gray-600 dark:text-slate-300">
                            {ACTION_LABEL[h.action] || h.action}
                          </span>
                        </div>
                        <div className="mt-1 text-[11px] text-gray-500 dark:text-slate-400">
                          {h.byName || "—"} ({ACTOR_LABEL[h.byType] || h.byType}) •{" "}
                          {formatDateTime(h.at)}
                        </div>
                        {h.reason && (
                          <div className="mt-1 text-xs text-gray-700 dark:text-slate-300 bg-gray-50 dark:bg-slate-900/50 rounded-lg px-2 py-1">
                            {h.reason}
                          </div>
                        )}
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              {/* STOCK LEDGER */}
              <div className="rounded-3xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-slate-100 mb-3">
                  <Boxes size={15} /> Stock Ledger
                </div>

                {movements.length === 0 ? (
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    এই অর্ডারের কোনো stock এন্ট্রি নেই (Ledger চালুর আগের অর্ডার)।
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs">
                      <thead>
                        <tr className="text-left text-gray-500 dark:text-slate-400">
                          <th className="py-1 pr-3">Product</th>
                          <th className="py-1 pr-3">Qty</th>
                          <th className="py-1 pr-3">কারণ</th>
                          <th className="py-1">সময়</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-800 dark:text-slate-200">
                        {movements.map((m) => (
                          <tr key={m._id} className="border-t border-gray-100 dark:border-slate-700">
                            <td className="py-1.5 pr-3">
                              {m.productName || m.productId}
                              {m.color ? ` (${m.color})` : ""}
                            </td>
                            <td
                              className={`py-1.5 pr-3 font-bold ${
                                m.qty < 0
                                  ? "text-red-600 dark:text-red-400"
                                  : "text-green-600 dark:text-green-400"
                              }`}
                            >
                              {m.qty > 0 ? `+${m.qty}` : m.qty}
                            </td>
                            <td className="py-1.5 pr-3">
                              {LEDGER_REASON_LABEL[m.reason] || m.reason}
                            </td>
                            <td className="py-1.5 whitespace-nowrap text-gray-500 dark:text-slate-400">
                              {formatDateTime(m.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {revert && !revert.allowed && revert.target && (
                <p className="text-[11px] text-gray-500 dark:text-slate-400">
                  ℹ️ Staff নিজের করা পরিবর্তন {revert.undoWindowMinutes} মিনিটের মধ্যে Undo করতে
                  পারেন। এর পরে শপ Admin (owner) Reopen করতে পারবেন।
                </p>
              )}
            </>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        {data && (revert?.allowed || canReturn) && (
          <div className="shrink-0 px-4 sm:px-6 py-3 border-t border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-wrap justify-end gap-2">
            {canReturn && (
              <button
                onClick={() => onAction("return", order, data)}
                className="h-10 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold inline-flex items-center gap-2"
              >
                <PackageX size={15} /> Return (পণ্য ফেরত)
              </button>
            )}
            {revert?.allowed && (
              <button
                onClick={() => onAction("revert", order, data)}
                className="h-10 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold inline-flex items-center gap-2"
              >
                <RotateCcw size={15} /> {revertLabel(status, revert.target)}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
