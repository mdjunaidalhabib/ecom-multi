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
  Megaphone,
} from "lucide-react";
import { apiFetch } from "../lib/api";
import { formatDateTime } from "../lib/utils";

// ✅ প্ল্যান এখন super-admin থেকে dynamically যোগ/এডিট/ডিলিট করা যায়, তাই
// এখানে fixed free/starter/pro constants নেই — badge রঙ প্ল্যান লিস্টে
// তার position অনুযায়ী একটা ছোট rotating palette থেকে বসে
const PLAN_BADGE_PALETTE = [
  "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 border-gray-300 dark:border-slate-600",
  "bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-500/20",
  "bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-500/20",
  "bg-teal-100 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-300 dark:border-teal-500/20",
];

const TOGGLE_FEATURES = [
  { key: "customDomain", label: "কাস্টম ডোমেইন" },
  { key: "analytics", label: "Visitor Analytics" },
  { key: "promo", label: "Promo/Coupon" },
  { key: "payment", label: "Payment (bKash/Nagad/Rocket)" },
  { key: "landingPages", label: "Landing Pages" },
  { key: "fullStorefront", label: "Full Storefront (মাল্টি-প্রোডাক্ট)" },
  { key: "invoiceCustomization", label: "Invoice Design" },
];
const LIMIT_FEATURES = [
  { key: "maxProducts", label: "সর্বোচ্চ Products" },
  { key: "maxAdmins", label: "সর্বোচ্চ Admin/Staff" },
];

const STATUS_META = {
  pending: ["পর্যালোচনাধীন", "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20", Clock],
  approved: ["অনুমোদিত", "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20", CheckCircle2],
  rejected: ["বাতিল", "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20", XCircle],
};

export default function Plan() {
  const [planInfo, setPlanInfo] = useState(null);
  const [requests, setRequests] = useState([]);
  const [plans, setPlans] = useState([]);
  const [announcement, setAnnouncement] = useState("");
  const [loading, setLoading] = useState(true);
  const [requestedPlan, setRequestedPlan] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const notify = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const planLabel = (key) => plans.find((p) => p.key === key)?.name || key;
  const planBadgeStyle = (key) => {
    const index = plans.findIndex((p) => p.key === key);
    return PLAN_BADGE_PALETTE[index >= 0 ? index % PLAN_BADGE_PALETTE.length : 0];
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [features, myRequests, allPlans, announcementData] = await Promise.all([
        apiFetch("/admin/my-features"),
        apiFetch("/admin/plan-requests"),
        apiFetch("/admin/plans"),
        apiFetch("/admin/announcement").catch(() => null),
      ]);
      setPlanInfo(features);
      setRequests(Array.isArray(myRequests) ? myRequests : []);
      setPlans(Array.isArray(allPlans) ? allPlans : []);
      setAnnouncement(announcementData?.text || "");
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
  const otherPlans = plans.filter((p) => p.key !== planInfo?.plan);

  // ✅ বর্তমান প্ল্যান কার্ডে আগে যেসব ফিচার চালু (✓) আছে সেগুলো দেখাবে,
  // তারপর বন্ধ (✗) থাকা ফিচারগুলো — যাতে শপ owner প্রথমেই দেখতে পায় তার
  // প্ল্যানে আসলে কী কী আছে
  const sortedToggleFeatures = [...TOGGLE_FEATURES].sort((a, b) => {
    const aEnabled = !!planInfo?.features?.[a.key];
    const bEnabled = !!planInfo?.features?.[b.key];
    return aEnabled === bEnabled ? 0 : aEnabled ? -1 : 1;
  });

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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 px-3 py-4 sm:p-4 md:p-6">
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
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-pink-500 dark:text-pink-400">
            Billing
          </p>
          <h1 className="mt-1 text-2xl font-black text-gray-900 dark:text-slate-100">
            আমার প্ল্যান
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            বর্তমান প্ল্যান, ফিচার লিমিট দেখুন এবং প্রয়োজনে আপগ্রেড/ডাউনগ্রেড অনুরোধ পাঠান।
          </p>
        </div>

        {announcement && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-pink-200 dark:border-pink-500/30 bg-pink-50 dark:bg-pink-500/10 p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pink-100 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400">
              <Megaphone size={16} />
            </span>
            <p className="text-sm font-bold text-pink-800 dark:text-pink-300">{announcement}</p>
          </div>
        )}

        {/* Current plan card */}
        <section className="mb-6 overflow-hidden rounded-2xl border border-gray-100 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center gap-3 border-b border-gray-100 dark:border-slate-700/60 p-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400">
              <CreditCard size={20} />
            </span>
            <div>
              <h2 className="font-black text-gray-900 dark:text-slate-100">বর্তমান প্ল্যান</h2>
              <span
                className={`mt-1 inline-block rounded-full border px-2.5 py-1 text-xs font-bold ${planBadgeStyle(planInfo?.plan)}`}
              >
                {planLabel(planInfo?.plan)}
              </span>
            </div>
          </div>

          <div className="grid gap-3 p-4 sm:grid-cols-2">
            {sortedToggleFeatures.map((feature) => {
              const enabled = !!planInfo?.features?.[feature.key];
              return (
                <div
                  key={feature.key}
                  className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-slate-700/60 bg-gray-50 dark:bg-slate-800 px-3 py-2.5"
                >
                  <span className="text-sm font-bold text-gray-700 dark:text-slate-300">
                    {feature.label}
                  </span>
                  {enabled ? (
                    <Check className="text-emerald-600 dark:text-emerald-400" size={18} />
                  ) : (
                    <X className="text-gray-400 dark:text-slate-500" size={18} />
                  )}
                </div>
              );
            })}
            {LIMIT_FEATURES.map((feature) => (
              <div
                key={feature.key}
                className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-slate-700/60 bg-gray-50 dark:bg-slate-800 px-3 py-2.5"
              >
                <span className="text-sm font-bold text-gray-700 dark:text-slate-300">
                  {feature.label}
                </span>
                <span className="text-sm font-black text-gray-900 dark:text-slate-100">
                  {planInfo?.features?.[feature.key] ?? "—"}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* All plans comparison — শপ owner এখান থেকেই দেখতে পারবে কোন প্ল্যানে
            কী কী ফিচার আছে, upgrade/downgrade অনুরোধ পাঠানোর আগে তুলনা করার জন্য */}
        <section className="mb-6 overflow-hidden rounded-2xl border border-gray-100 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-sm">
          <div className="border-b border-gray-100 dark:border-slate-700/60 p-4">
            <h2 className="font-black text-gray-900 dark:text-slate-100">সব প্ল্যান তুলনা করুন</h2>
            <p className="mt-0.5 text-xs text-gray-400 dark:text-slate-500">
              কোন প্ল্যানে কী কী ফিচার আছে দেখে নিন — আপনার বর্তমান প্ল্যান হাইলাইট করা আছে।
            </p>
          </div>

          <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => {
              const isCurrent = plan.key === planInfo?.plan;
              return (
                <div
                  key={plan._id || plan.key}
                  className={`rounded-2xl border p-4 ${
                    isCurrent
                      ? "border-pink-400 dark:border-pink-500/60 ring-2 ring-pink-100 dark:ring-pink-500/20"
                      : "border-gray-100 dark:border-slate-700/60"
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div>
                      <h3 className="font-black text-gray-900 dark:text-slate-100">{plan.name}</h3>
                      {plan.tagline && (
                        <p className="text-xs text-gray-400 dark:text-slate-500">{plan.tagline}</p>
                      )}
                    </div>
                    {isCurrent && (
                      <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${planBadgeStyle(plan.key)}`}>
                        আপনার প্ল্যান
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    {TOGGLE_FEATURES.map((feature) => {
                      const enabled = !!plan.features?.[feature.key];
                      return (
                        <div key={feature.key} className="flex items-center justify-between gap-2 text-xs">
                          <span className="text-gray-600 dark:text-slate-400">{feature.label}</span>
                          {enabled ? (
                            <Check size={14} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <X size={14} className="shrink-0 text-gray-300 dark:text-slate-600" />
                          )}
                        </div>
                      );
                    })}
                    {LIMIT_FEATURES.map((feature) => (
                      <div key={feature.key} className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-gray-600 dark:text-slate-400">{feature.label}</span>
                        <span className="font-bold text-gray-900 dark:text-slate-100">
                          {plan.limits?.[feature.key] ?? "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Request form / pending notice */}
        <section className="mb-6 overflow-hidden rounded-2xl border border-gray-100 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-sm">
          <div className="border-b border-gray-100 dark:border-slate-700/60 p-4">
            <h2 className="font-black text-gray-900 dark:text-slate-100">প্ল্যান পরিবর্তনের অনুরোধ</h2>
            <p className="mt-0.5 text-xs text-gray-400 dark:text-slate-500">
              সুপার-অ্যাডমিন অনুমোদন করলে নতুন প্ল্যান কার্যকর হবে।
            </p>
          </div>

          {pendingRequest ? (
            <div className="m-4 rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-400">
              আপনার{" "}
              <b>{planLabel(pendingRequest.requestedPlan)}</b> প্ল্যানে
              পরিবর্তনের একটি অনুরোধ পর্যালোচনাধীন আছে। এটি অনুমোদিত বা বাতিল
              না হওয়া পর্যন্ত নতুন অনুরোধ পাঠানো যাবে না।
            </div>
          ) : (
            <form onSubmit={submitRequest} className="space-y-3 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs font-bold text-gray-600 dark:text-slate-400">
                  নতুন প্ল্যান *
                  <select
                    required
                    value={requestedPlan}
                    onChange={(e) => setRequestedPlan(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 p-2.5 text-sm outline-none focus:border-pink-300"
                  >
                    <option value="">বাছাই করুন</option>
                    {otherPlans.map((plan) => (
                      <option key={plan.key} value={plan.key}>
                        {plan.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="block text-xs font-bold text-gray-600 dark:text-slate-400">
                নোট (ঐচ্ছিক)
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={500}
                  className="mt-1 min-h-20 w-full resize-y rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 p-2.5 text-sm outline-none focus:border-pink-300"
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
        <section className="overflow-hidden rounded-2xl border border-gray-100 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-sm">
          <div className="border-b border-gray-100 dark:border-slate-700/60 p-4">
            <h2 className="font-black text-gray-900 dark:text-slate-100">অনুরোধের ইতিহাস</h2>
          </div>
          {requests.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-400 dark:text-slate-500">
              এখনো কোনো অনুরোধ পাঠানো হয়নি।
            </p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-slate-700/60">
              {requests.map((r) => {
                const meta = STATUS_META[r.status] || STATUS_META.pending;
                const StatusIcon = meta[2];
                return (
                  <div key={r._id} className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-slate-200">
                        {planLabel(r.currentPlan)} → {planLabel(r.requestedPlan)}
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${meta[1]}`}
                      >
                        <StatusIcon size={13} />
                        {meta[0]}
                      </span>
                    </div>
                    {r.note && (
                      <p className="mt-1.5 text-xs text-gray-500 dark:text-slate-400">
                        নোট: {r.note}
                      </p>
                    )}
                    {r.reviewNote && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                        সুপার-অ্যাডমিনের মন্তব্য: {r.reviewNote}
                      </p>
                    )}
                    <p className="mt-1.5 text-[11px] text-gray-400 dark:text-slate-500">
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
