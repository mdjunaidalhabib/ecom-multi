"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { formatDateTime } from "../../../lib/utils.js";
import { isDueActive, wholesaleDue, wholesalePaid } from "../shared/utils";

/**
 * ✅ Wholesale অর্ডারের বাকি আদায় + পেমেন্ট হিস্টোরি।
 *
 * - বাকির বেশি নেওয়া যায় না (backend-ও একই চেক করে)
 * - ভুল এন্ট্রি মোছা হয় না — "Reverse" করা যায় (শুধু owner/admin), হিসাবের ট্রেইল থাকে
 *
 * props:
 *  order       — null হলে বন্ধ (parent লিস্ট থেকে লাইভ order পাঠায়, তাই আদায়ের পর নিজে আপডেট হয়)
 *  onClose
 *  onSubmit({ amount, method, note })  — throw করলে error দেখায়
 *  onReverse(paymentId)                — throw করলে error দেখায়
 *  canReverse  — owner/admin হলে true
 */
const METHODS = [
  { value: "cash", label: "Cash" },
  { value: "bkash", label: "bKash" },
  { value: "nagad", label: "Nagad" },
  { value: "rocket", label: "Rocket" },
  { value: "bank", label: "Bank" },
  { value: "other", label: "Other" },
];

const field =
  "w-full h-10 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30";
const label =
  "block text-xs font-bold tracking-wide mb-1.5 text-gray-500 dark:text-slate-400";

export default function CollectPaymentModal({
  order,
  onClose,
  onSubmit,
  onReverse,
  canReverse = false,
}) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmId, setConfirmId] = useState(null);
  const [reversingId, setReversingId] = useState(null);

  const due = order ? wholesaleDue(order) : 0;

  // ✅ অর্ডার খুললে / বাকি বদলালে amount বাকির সমান বসে (সবচেয়ে সাধারণ কেস: পুরোটা নেওয়া)
  useEffect(() => {
    if (!order) return;
    setAmount(due > 0 ? String(due) : "");
    setError("");
    setConfirmId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?._id, due]);

  useEffect(() => {
    if (!order) return;
    setMethod("cash");
    setNote("");
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?._id]);

  if (!order) return null;

  const paid = wholesalePaid(order);
  const active = isDueActive(order);
  const canCollect = active && due > 0;
  const payments = Array.isArray(order.payments) ? order.payments : [];
  const amountNum = Number(amount);
  const amountInvalid =
    !Number.isFinite(amountNum) || amountNum <= 0 || amountNum > due;

  const handleCollect = async () => {
    if (amountInvalid) {
      return setError(
        due > 0 ? `০ থেকে বড় এবং সর্বোচ্চ ৳${due} দিন।` : "কোনো বাকি নেই।",
      );
    }
    setLoading(true);
    setError("");
    try {
      await onSubmit({ amount: amountNum, method, note: note.trim() });
      onClose(); // সফল হলে টোস্ট দেখায় (hook থেকে), মডাল বন্ধ
    } catch (e) {
      setError(e?.message || "পেমেন্ট সেভ করা যায়নি");
    } finally {
      setLoading(false);
    }
  };

  const handleReverse = async (paymentId) => {
    if (confirmId !== paymentId) {
      setConfirmId(paymentId);
      return;
    }
    setReversingId(paymentId);
    setError("");
    try {
      await onReverse(paymentId);
      setConfirmId(null);
    } catch (e) {
      setError(e?.message || "Reverse করা যায়নি");
    } finally {
      setReversingId(null);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={loading ? undefined : onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-transparent dark:border-slate-700 shadow-xl">
          {/* HEADER */}
          <div className="flex items-start justify-between gap-3 p-5 pb-3">
            <div className="min-w-0">
              <div className="text-base font-bold text-gray-900 dark:text-slate-100">
                বাকি আদায় — #{order.orderNumber ?? order._id}
              </div>
              <div className="text-xs text-gray-500 dark:text-slate-400 truncate">
                {order.billing?.name || "—"}
                {order.billing?.phone ? ` • ${order.billing.phone}` : ""}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-8 w-8 shrink-0 rounded-lg grid place-items-center text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-50"
            >
              <X size={16} />
            </button>
          </div>

          <div className="px-5 pb-5 space-y-4">
            {/* SUMMARY */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-gray-50 dark:bg-slate-800 p-2.5">
                <div className="text-[10px] font-bold uppercase text-gray-400 dark:text-slate-500">Total</div>
                <div className="text-sm font-black text-gray-900 dark:text-slate-100">৳{order.total}</div>
              </div>
              <div className="rounded-xl bg-green-50 dark:bg-green-500/10 p-2.5">
                <div className="text-[10px] font-bold uppercase text-green-600 dark:text-green-400">Paid</div>
                <div className="text-sm font-black text-green-700 dark:text-green-400">৳{paid}</div>
              </div>
              <div
                className={`rounded-xl p-2.5 ${
                  due > 0 && active
                    ? "bg-red-50 dark:bg-red-500/10"
                    : "bg-gray-50 dark:bg-slate-800"
                }`}
              >
                <div
                  className={`text-[10px] font-bold uppercase ${
                    due > 0 && active ? "text-red-600 dark:text-red-400" : "text-gray-400 dark:text-slate-500"
                  }`}
                >
                  Due
                </div>
                <div
                  className={`text-sm font-black ${
                    due > 0 && active ? "text-red-700 dark:text-red-400" : "text-gray-500 dark:text-slate-400"
                  }`}
                >
                  {active ? `৳${due}` : "—"}
                </div>
              </div>
            </div>

            {!active && (
              <div className="rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-800 dark:text-amber-300">
                এই অর্ডার Cancelled/Returned — নতুন পেমেন্ট নেওয়া যাবে না।
              </div>
            )}

            {/* COLLECT FORM */}
            {canCollect && (
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <label className={label}>কত টাকা পেলেন (৳)</label>
                    <button
                      type="button"
                      onClick={() => setAmount(String(due))}
                      className="mb-1.5 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      পুরো বাকি (৳{due})
                    </button>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={due}
                    className={`${field} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                    value={amount}
                    onWheel={(e) => e.target.blur()}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={label}>মাধ্যম</label>
                    <select
                      className={field}
                      value={method}
                      onChange={(e) => setMethod(e.target.value)}
                    >
                      {METHODS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={label}>নোট (ঐচ্ছিক)</label>
                    <input
                      className={field}
                      value={note}
                      maxLength={200}
                      placeholder="যেমন: TrxID / চেক নং"
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-xs font-semibold text-red-600 dark:text-red-400">{error}</div>
                )}

                <button
                  type="button"
                  onClick={handleCollect}
                  disabled={loading || amountInvalid}
                  className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold flex items-center justify-center gap-2 transition"
                >
                  {loading && <Loader2 size={15} className="animate-spin" />}
                  {loading
                    ? "সেভ হচ্ছে..."
                    : `৳${Number.isFinite(amountNum) && amountNum > 0 ? amountNum : 0} আদায় করুন`}
                </button>
              </div>
            )}

            {!canCollect && error && (
              <div className="text-xs font-semibold text-red-600 dark:text-red-400">{error}</div>
            )}

            {/* HISTORY */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-slate-400 mb-2">
                পেমেন্ট হিস্টোরি
              </div>

              {payments.length === 0 ? (
                <div className="text-xs text-gray-400 dark:text-slate-500">এখনো কোনো পেমেন্ট নেই।</div>
              ) : (
                <div className="space-y-1.5">
                  {[...payments].reverse().map((p) => (
                    <div
                      key={p._id}
                      className={`rounded-xl border px-3 py-2 text-xs flex items-start justify-between gap-2 ${
                        p.reversed
                          ? "border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 opacity-70"
                          : "border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800"
                      }`}
                    >
                      <div className="min-w-0">
                        <div
                          className={`font-bold ${
                            p.reversed
                              ? "line-through text-gray-500 dark:text-slate-500"
                              : "text-gray-900 dark:text-slate-100"
                          }`}
                        >
                          ৳{p.amount}{" "}
                          <span className="font-semibold uppercase text-gray-500 dark:text-slate-400">
                            • {p.method}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-slate-400">
                          {formatDateTime(p.at, { year: undefined })}
                          {p.byName ? ` • ${p.byName}` : ""}
                        </div>
                        {p.note && (
                          <div className="text-[11px] text-gray-600 dark:text-slate-300 break-words">
                            {p.note}
                          </div>
                        )}
                        {p.reversed && (
                          <div className="text-[11px] font-semibold text-red-500 dark:text-red-400">
                            Reversed{p.reversedByName ? ` — ${p.reversedByName}` : ""}
                          </div>
                        )}
                      </div>

                      {canReverse && !p.reversed && active && (
                        <button
                          type="button"
                          disabled={reversingId === p._id}
                          onClick={() => handleReverse(p._id)}
                          className={`shrink-0 rounded-lg px-2 py-1 text-[11px] font-bold transition disabled:opacity-50 ${
                            confirmId === p._id
                              ? "bg-red-600 text-white"
                              : "border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                          }`}
                        >
                          {reversingId === p._id
                            ? "..."
                            : confirmId === p._id
                              ? "নিশ্চিত?"
                              : "Reverse"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
