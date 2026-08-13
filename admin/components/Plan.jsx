"use client";

import { useEffect, useState } from "react";
import {
  CreditCard,
  Check,
  X,
  Loader2,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { apiFetch } from "../lib/api";
import { formatDateTime } from "../lib/utils";

const PLAN_LABELS = { free: "Free", starter: "Starter", pro: "Pro" };
const PLAN_STYLES = {
  free: "bg-gray-100 text-gray-700 border-gray-300",
  starter: "bg-blue-100 text-blue-700 border-blue-300",
  pro: "bg-purple-100 text-purple-700 border-purple-300",
};
const PLAN_ORDER = ["free", "starter", "pro"];

const TOGGLE_FEATURES = [
  { key: "customDomain", label: "কাস্টম ডোমেইন" },
  { key: "analytics", label: "Visitor Analytics" },
  { key: "promo", label: "Promo/Coupon" },
];
const LIMIT_FEATURES = [
  { key: "maxProducts", label: "সর্বোচ্চ Products" },
  { key: "maxAdmins", label: "সর্বোচ্চ Admin/Staff" },
];

const STATUS_META = {
  pending: ["পর্যালোচনাধীন", "bg-amber-50 text-amber-700 border-amber-200", Clock],
  approved: ["অনুমোদিত", "bg-emerald-50 text-emerald-700 border-emerald-200", CheckCircle2],
  rejected: ["বাতিল", "bg-red-50 text-red-700 border-red-200", XCircle],
};

export default function Plan() {
  const [planInfo, setPlanInfo] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestedPlan, setRequestedPlan] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const notify = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [features, myRequests] = await Promise.all([
        apiFetch("/admin/my-features"),
        apiFetch("/admin/plan-requests"),
      ]);
      setPlanInfo(features);
      setRequests(Array.isArray(myRequests) ? myRequests : []);
    } catch (error) {
      notify(error.message || "প্ল্যান তথ্য লোড করা যায়নি", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const pendingRequest = requests.find((r) => r.status === "pending");
  const otherPlans = PLAN_ORDER.filter((p) => p !== planInfo?.plan);

  const submitRequest = async (event) => {
    event.preventDefault();
    if (!requestedPlan) {
      notify("একটি প্ল্যান বাছাই করুন", "error");
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch("/admin/plan-requests", {
        method: "POST",
        body: JSON.stringify({ requestedPlan, note }),
      });
      notify("প্ল্যান পরিবর্তনের অনুরোধ পাঠানো হয়েছে");
      setRequestedPlan("");
      setNote("");
      loadAll();
    } catch (error) {
      notify(error.message || "অনুরোধ পাঠানো যায়নি", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Loader2 className="animate-spin text-pink-600" size={28} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-4 sm:p-4 md:p-6">
      {toast && (
        <div
          className={`fixed left-3 right-3 top-3 z-[200] rounded-xl px-4 py-3 text-center text-sm font-bold text-white shadow-xl sm:left-auto sm:right-4 sm:top-4 sm:max-w-sm ${
            toast.type === "error" ? "bg-red-600" : "bg-emerald-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-pink-500">
            Billing
          </p>
          <h1 className="mt-1 text-2xl font-black text-gray-900">
            আমার প্ল্যান
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            বর্তমান প্ল্যান, ফিচার লিমিট দেখুন এবং প্রয়োজনে আপগ্রেড/ডাউনগ্রেড অনুরোধ পাঠান।
          </p>
        </div>

        {/* Current plan card */}
        <section className="mb-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-gray-100 p-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-pink-50 text-pink-600">
              <CreditCard size={20} />
            </span>
            <div>
              <h2 className="font-black text-gray-900">বর্তমান প্ল্যান</h2>
              <span
                className={`mt-1 inline-block rounded-full border px-2.5 py-1 text-xs font-bold ${
                  PLAN_STYLES[planInfo?.plan] || PLAN_STYLES.free
                }`}
              >
                {PLAN_LABELS[planInfo?.plan] || planInfo?.plan}
              </span>
            </div>
          </div>

          <div className="grid gap-3 p-4 sm:grid-cols-2">
            {TOGGLE_FEATURES.map((feature) => {
              const enabled = !!planInfo?.features?.[feature.key];
              return (
                <div
                  key={feature.key}
                  className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5"
                >
                  <span className="text-sm font-bold text-gray-700">
                    {feature.label}
                  </span>
                  {enabled ? (
                    <Check className="text-emerald-600" size={18} />
                  ) : (
                    <X className="text-gray-400" size={18} />
                  )}
                </div>
              );
            })}
            {LIMIT_FEATURES.map((feature) => (
              <div
                key={feature.key}
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5"
              >
                <span className="text-sm font-bold text-gray-700">
                  {feature.label}
                </span>
                <span className="text-sm font-black text-gray-900">
                  {planInfo?.features?.[feature.key] ?? "—"}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Request form / pending notice */}
        <section className="mb-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-4">
            <h2 className="font-black text-gray-900">প্ল্যান পরিবর্তনের অনুরোধ</h2>
            <p className="mt-0.5 text-xs text-gray-400">
              সুপার-অ্যাডমিন অনুমোদন করলে নতুন প্ল্যান কার্যকর হবে।
            </p>
          </div>

          {pendingRequest ? (
            <div className="m-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              আপনার{" "}
              <b>{PLAN_LABELS[pendingRequest.requestedPlan]}</b> প্ল্যানে
              পরিবর্তনের একটি অনুরোধ পর্যালোচনাধীন আছে। এটি অনুমোদিত বা বাতিল
              না হওয়া পর্যন্ত নতুন অনুরোধ পাঠানো যাবে না।
            </div>
          ) : (
            <form onSubmit={submitRequest} className="space-y-3 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs font-bold text-gray-600">
                  নতুন প্ল্যান *
                  <select
                    required
                    value={requestedPlan}
                    onChange={(e) => setRequestedPlan(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm outline-none focus:border-pink-300"
                  >
                    <option value="">বাছাই করুন</option>
                    {otherPlans.map((plan) => (
                      <option key={plan} value={plan}>
                        {PLAN_LABELS[plan]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="block text-xs font-bold text-gray-600">
                নোট (ঐচ্ছিক)
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={500}
                  className="mt-1 min-h-20 w-full resize-y rounded-xl border border-gray-200 p-2.5 text-sm outline-none focus:border-pink-300"
                  placeholder="কেন প্ল্যান পরিবর্তন করতে চান তা লিখুন..."
                />
              </label>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-pink-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-pink-200 transition hover:bg-pink-700 disabled:bg-pink-300"
              >
                {submitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                অনুরোধ পাঠান
              </button>
            </form>
          )}
        </section>

        {/* Request history */}
        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-4">
            <h2 className="font-black text-gray-900">অনুরোধের ইতিহাস</h2>
          </div>
          {requests.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-400">
              এখনো কোনো অনুরোধ পাঠানো হয়নি।
            </p>
          ) : (
            <div className="divide-y divide-gray-100">
              {requests.map((r) => {
                const meta = STATUS_META[r.status] || STATUS_META.pending;
                const StatusIcon = meta[2];
                return (
                  <div key={r._id} className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                        {PLAN_LABELS[r.currentPlan]} → {PLAN_LABELS[r.requestedPlan]}
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${meta[1]}`}
                      >
                        <StatusIcon size={13} />
                        {meta[0]}
                      </span>
                    </div>
                    {r.note && (
                      <p className="mt-1.5 text-xs text-gray-500">
                        নোট: {r.note}
                      </p>
                    )}
                    {r.reviewNote && (
                      <p className="mt-1 text-xs text-gray-500">
                        সুপার-অ্যাডমিনের মন্তব্য: {r.reviewNote}
                      </p>
                    )}
                    <p className="mt-1.5 text-[11px] text-gray-400">
                      পাঠানো হয়েছে: {formatDateTime(r.createdAt)}
                      {r.reviewedAt
                        ? ` · পর্যালোচিত: ${formatDateTime(r.reviewedAt)}`
                        : ""}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
