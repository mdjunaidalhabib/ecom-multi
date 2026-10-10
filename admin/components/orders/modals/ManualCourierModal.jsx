"use client";

import { useEffect, useState } from "react";
import { Loader2, PackageCheck } from "lucide-react";

/**
 * ✅ ম্যানুয়ালি কুরিয়ারে পাঠানো অর্ডারের এন্ট্রি।
 * কুরিয়ারের নাম + Tracking/Consignment ID রেকর্ড হয়, অর্ডার Shipped হয়।
 * কুরিয়ারের API কল হয় না — তাই দ্বিতীয়বার পাঠানোর ঝুঁকি নেই।
 *
 * Tracking ID ঐচ্ছিক — না দিলে "ID নেই" দেখায়; পরে একই বাটন/Edit থেকে আসল ID বসানো যায়।
 * order.courier.manual থাকলে এটা এডিট মোড।
 *
 * props: order (null হলে বন্ধ), onClose, onSubmit({ provider, trackingId, codAmount, note })
 */
const COURIERS = [
  "Steadfast",
  "Pathao",
  "RedX",
  "Paperfly",
  "eCourier",
  "Sundarban",
  "SA Paribahan",
  "Other",
];

// অ্যাপ নিজেও যেভাবে COD হিসাব করে — advance paid হলে delivery charge বাদ
const defaultCod = (o) => {
  const total = Number(o?.total || 0);
  const advancePaid =
    (o?.paymentMethod || "cod") !== "cod" && o?.paymentStatus === "paid";
  return advancePaid ? Math.max(0, total - Number(o?.deliveryCharge || 0)) : total;
};

const field =
  "w-full h-10 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30";
const label =
  "block text-xs font-bold tracking-wide mb-1.5 text-gray-500 dark:text-slate-400";

export default function ManualCourierModal({ order, onClose, onSubmit }) {
  const [courier, setCourier] = useState("Steadfast");
  const [otherName, setOtherName] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [cod, setCod] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!order) return;
    const c = order.courier;
    const known = c?.manual
      ? COURIERS.find(
          (x) => x !== "Other" && x.toLowerCase() === String(c.provider || "").toLowerCase(),
        )
      : "Steadfast";
    setCourier(known || "Other");
    setOtherName(known ? "" : c?.provider || "");
    setTrackingId(c?.manual && !c.idPending ? c.trackingId || "" : "");
    setCod(String(c?.manual && c.codAmountSent != null ? c.codAmountSent : defaultCod(order)));
    setNote(c?.note || "");
    setError("");
    setLoading(false);
  }, [order]);

  if (!order) return null;

  const isEdit = Boolean(order.courier?.manual);

  const provider = courier === "Other" ? otherName.trim() : courier;

  const handleSave = async () => {
    if (!provider) return setError("কুরিয়ারের নাম লিখুন।");
    // এডিট মোডে ID বসানোই উদ্দেশ্য, তাই তখন লাগবে; প্রথমবার ঐচ্ছিক
    if (isEdit && !trackingId.trim())
      return setError("Tracking / Consignment ID দিন।");
    setLoading(true);
    setError("");
    try {
      await onSubmit({
        provider,
        trackingId: trackingId.trim(),
        codAmount: Number(cod || 0),
        note: note.trim(),
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
        <div className="w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-2xl border border-transparent dark:border-slate-700 p-5 space-y-4 max-h-[92vh] overflow-y-auto">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl grid place-items-center shrink-0 bg-teal-100 text-teal-600 dark:bg-teal-500/15 dark:text-teal-400">
              <PackageCheck size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-gray-900 dark:text-slate-100">
                {isEdit ? "কুরিয়ারের তথ্য এডিট" : "ম্যানুয়ালি কুরিয়ারে পাঠানো হয়েছে"}
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                {order.billing?.name} · {order.billing?.phone}
                <br />
                {isEdit
                  ? "আসল Tracking ID বা কুরিয়ার বদলাতে পারবেন। অর্ডারের status বদলাবে না।"
                  : "সেভ করলে অর্ডার Shipped হবে। কুরিয়ারে নতুন করে কিছু যাবে না।"}
              </p>
            </div>
          </div>

          <div>
            <label className={label}>কুরিয়ার</label>
            <select
              className={field}
              value={courier}
              onChange={(e) => setCourier(e.target.value)}
            >
              {COURIERS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {courier === "Other" && (
            <div>
              <label className={label}>কুরিয়ারের নাম</label>
              <input
                className={field}
                value={otherName}
                onChange={(e) => setOtherName(e.target.value)}
                placeholder="যেমন: Janani Express"
              />
            </div>
          )}

          <div>
            <label className={label}>
              Tracking / Consignment ID{isEdit ? "" : " (ঐচ্ছিক — পরে বসানো যাবে)"}
            </label>
            <input
              className={field}
              autoFocus
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder={isEdit ? "কুরিয়ারের দেওয়া ID" : "ID জানা না থাকলে ফাঁকা রাখুন"}
            />
          </div>

          <div>
            <label className={label}>COD amount (৳)</label>
            <input
              type="number"
              min={0}
              className={field}
              value={cod}
              onWheel={(e) => e.target.blur()}
              onChange={(e) => setCod(e.target.value)}
            />
          </div>

          <div>
            <label className={label}>নোট (ঐচ্ছিক)</label>
            <textarea
              rows={2}
              className="w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30 resize-y"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="যেমন: অফিস থেকে হাতে দিয়ে পাঠানো"
            />
          </div>

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
              onClick={handleSave}
              disabled={loading}
              className="h-10 px-4 rounded-xl text-sm font-bold text-white inline-flex items-center gap-2 disabled:opacity-50 bg-teal-600 hover:bg-teal-700"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              সেভ করুন
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
