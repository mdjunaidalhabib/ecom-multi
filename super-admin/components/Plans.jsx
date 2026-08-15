"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Layers,
  Check,
  X,
  Store,
  Palette,
  Loader2,
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Megaphone,
} from "lucide-react";
import Toast from "./Toast";

const PLAN_ACCENTS_BY_ORDER = [
  {
    ring: "ring-gray-200 dark:ring-slate-700",
    badge: "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 border-gray-300 dark:border-slate-600",
    icon: "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300",
  },
  {
    ring: "ring-blue-200 dark:ring-blue-500/30",
    badge: "bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-500/30",
    icon: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    ring: "ring-rose-300 dark:ring-rose-500/40",
    badge: "bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-500/30",
    icon: "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400",
  },
];

const TOGGLE_FEATURES = [
  { key: "customDomain", label: "Custom Domain" },
  { key: "analytics", label: "Analytics" },
  { key: "promo", label: "Promo/Coupon" },
  { key: "payment", label: "Payment (bKash/Nagad/Rocket)" },
  { key: "landingPages", label: "Landing Pages (single-product ad পেজ)" },
  { key: "fullStorefront", label: "Full Storefront (মাল্টি-প্রোডাক্ট ক্যাটালগ)" },
];
const LIMIT_FEATURES = [
  { key: "maxProducts", label: "সর্বোচ্চ Products" },
  { key: "maxAdmins", label: "সর্বোচ্চ Admin/Staff" },
];
const THEME_OPTIONS = [
  { value: "classic", label: "Classic" },
  { value: "aurora", label: "Aurora" },
  { value: "terra", label: "Terra" },
];

const emptyForm = () => ({
  name: "",
  tagline: "",
  theme: "classic",
  isVisible: true,
  customDomain: false,
  analytics: false,
  promo: false,
  payment: false,
  landingPages: false,
  fullStorefront: true,
  maxProducts: 50,
  maxAdmins: 1,
});

const formFromPlan = (plan) => ({
  name: plan.name || "",
  tagline: plan.tagline || "",
  theme: plan.theme || "classic",
  isVisible: plan.isVisible !== false,
  customDomain: !!plan.features?.customDomain,
  analytics: !!plan.features?.analytics,
  promo: !!plan.features?.promo,
  payment: !!plan.features?.payment,
  landingPages: !!plan.features?.landingPages,
  fullStorefront: plan.features?.fullStorefront !== false,
  maxProducts: plan.limits?.maxProducts ?? 0,
  maxAdmins: plan.limits?.maxAdmins ?? 0,
});

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [modal, setModal] = useState(null); // { mode: "create" | "edit", plan? }
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleteModal, setDeleteModal] = useState(null); // plan being deleted
  const [deleting, setDeleting] = useState(false);

  const [announcement, setAnnouncement] = useState("");
  const [announcementInput, setAnnouncementInput] = useState("");
  const [editingAnnouncement, setEditingAnnouncement] = useState(false);
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);

  const notify = (message, type = "success") => setToast({ message, type });

  const loadAll = async () => {
    try {
      setLoading(true);
      const [plansRes, shopsRes, announcementRes] = await Promise.all([
        fetch("/api/admin/plans"),
        fetch("/api/admin/shops"),
        fetch("/api/admin/announcement"),
      ]);
      const [plansData, shopsData, announcementData] = await Promise.all([
        plansRes.json(),
        shopsRes.json(),
        announcementRes.json(),
      ]);
      setPlans(Array.isArray(plansData) ? plansData : []);
      setShops(Array.isArray(shopsData) ? shopsData : []);
      setAnnouncement(announcementData?.text || "");
      setAnnouncementInput(announcementData?.text || "");
    } catch {
      notify("Plans লোড করা যায়নি", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const shopCountByPlanKey = useMemo(() => {
    const counts = {};
    for (const shop of shops) {
      counts[shop.plan] = (counts[shop.plan] || 0) + 1;
    }
    return counts;
  }, [shops]);

  const openCreateModal = () => {
    setForm(emptyForm());
    setFormError("");
    setModal({ mode: "create" });
  };

  const openEditModal = (plan) => {
    setForm(formFromPlan(plan));
    setFormError("");
    setModal({ mode: "edit", plan });
  };

  const closeModal = () => {
    setModal(null);
    setSaving(false);
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError("প্ল্যানের নাম দিন");
      return;
    }

    setSaving(true);
    setFormError("");

    const payload = {
      name: form.name.trim(),
      tagline: form.tagline.trim(),
      theme: form.theme,
      isVisible: form.isVisible,
      features: {
        customDomain: form.customDomain,
        analytics: form.analytics,
        promo: form.promo,
        payment: form.payment,
        landingPages: form.landingPages,
        fullStorefront: form.fullStorefront,
      },
      limits: {
        maxProducts: form.maxProducts,
        maxAdmins: form.maxAdmins,
      },
    };

    try {
      const url =
        modal.mode === "edit" ? `/api/admin/plans/${modal.plan._id}` : "/api/admin/plans";
      const method = modal.mode === "edit" ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setFormError(data?.message || "সেভ করা যায়নি");
        return;
      }

      notify(modal.mode === "edit" ? "✅ প্ল্যান আপডেট হয়েছে" : "✅ নতুন প্ল্যান তৈরি হয়েছে");
      closeModal();
      loadAll();
    } catch {
      setFormError("Server error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/plans/${deleteModal._id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        notify(data?.message || "ডিলিট করা যায়নি", "error");
      } else {
        notify("🗑️ প্ল্যান ডিলিট হয়েছে");
        setDeleteModal(null);
        loadAll();
      }
    } catch {
      notify("Server error", "error");
    } finally {
      setDeleting(false);
    }
  };

  const saveAnnouncement = async () => {
    setSavingAnnouncement(true);
    try {
      const res = await fetch("/api/admin/announcement", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: announcementInput.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        notify(data?.message || "সেভ করা যায়নি", "error");
        return;
      }
      setAnnouncement(data.text || "");
      setAnnouncementInput(data.text || "");
      setEditingAnnouncement(false);
      notify(data.text ? "✅ ঘোষণা সেভ হয়েছে" : "🗑️ ঘোষণা মুছে ফেলা হয়েছে");
    } catch {
      notify("Server error", "error");
    } finally {
      setSavingAnnouncement(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Loader2 className="animate-spin text-rose-600 dark:text-rose-400" size={28} />
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <Layers size={20} />
            <span className="text-sm font-semibold uppercase tracking-wider">
              Plans Overview
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 sm:text-3xl">
            প্ল্যান ও ফিচার
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            প্ল্যান যোগ, এডিট বা ডিলিট করুন — ফিচার, লিমিট আর ডিফল্ট থিম সব একসাথে এখান থেকেই নিয়ন্ত্রণ করা যাবে।
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-rose-700 active:scale-[0.98]"
        >
          <Plus size={16} /> নতুন প্ল্যান
        </button>
      </div>

      {/* ✅ "শীঘ্রই আসছে" ব্যানার — শপ-admin দের "My Plan" পেজে এই টেক্সট
          দেখা যাবে (কোন নতুন প্ল্যান/ফিচার/আপডেট আসছে জানাতে) */}
      <div className="mb-6 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
        <div className="mb-2 flex items-center gap-2 text-gray-700 dark:text-slate-300">
          <Megaphone size={16} className="text-rose-500" />
          <span className="text-sm font-semibold">"শীঘ্রই আসছে" ঘোষণা</span>
        </div>
        <p className="mb-2 text-xs text-gray-400 dark:text-slate-500">
          শপ-admin দের "My Plan" পেজে ব্যানার হিসেবে দেখাবে — যেমন কোন নতুন প্ল্যান বা ফিচার আসছে। খালি রেখে Update করলে ব্যানার লুকিয়ে যাবে।
        </p>

        {!editingAnnouncement ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-gray-700 dark:text-slate-300">
              {announcement || (
                <span className="text-gray-400 dark:text-slate-500">কোনো ঘোষণা সেট করা নেই।</span>
              )}
            </p>
            <button
              onClick={() => {
                setAnnouncementInput(announcement);
                setEditingAnnouncement(true);
              }}
              className="shrink-0 flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
            >
              <Pencil size={13} /> Edit
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              autoFocus
              value={announcementInput}
              onChange={(e) => setAnnouncementInput(e.target.value)}
              maxLength={300}
              placeholder="যেমন: শীঘ্রই আসছে নতুন Enterprise প্ল্যান — Unlimited Products!"
              className="flex-1 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-500/20"
            />
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => {
                  setAnnouncementInput(announcement);
                  setEditingAnnouncement(false);
                }}
                className="rounded-lg border border-gray-300 dark:border-slate-600 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
              >
                বাতিল
              </button>
              {announcementInput !== announcement && (
                <button
                  onClick={saveAnnouncement}
                  disabled={savingAnnouncement}
                  className="rounded-lg bg-gray-900 dark:bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 dark:hover:bg-slate-600 disabled:opacity-50"
                >
                  {savingAnnouncement ? "সেভ হচ্ছে..." : "Update"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {plans.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-14 text-center text-gray-500 dark:text-slate-400">
          এখনো কোনো প্ল্যান নেই।
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-3">
          {plans.map((plan, index) => {
            const accent = PLAN_ACCENTS_BY_ORDER[index % PLAN_ACCENTS_BY_ORDER.length];
            const isHighlighted = index === plans.length - 1 && plans.length > 1;
            const shopCount = shopCountByPlanKey[plan.key] || 0;

            return (
              <div
                key={plan._id}
                className={`relative flex flex-col rounded-2xl bg-white dark:bg-slate-900 shadow-sm dark:shadow-black/30 ring-1 ${accent.ring} ${
                  isHighlighted ? "ring-2" : ""
                }`}
              >
                {isHighlighted && (
                  <span className="absolute -top-3 right-5 inline-flex items-center gap-1 rounded-full bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white shadow">
                    <Sparkles size={12} /> সর্বোচ্চ ফিচার
                  </span>
                )}

                <div className="flex items-start gap-3 p-5 pb-4">
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${accent.icon}`}>
                    <Layers size={20} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-black text-gray-900 dark:text-slate-100 truncate">
                      {plan.name}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                      {plan.tagline || "—"}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => openEditModal(plan)}
                      title="এডিট করুন"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-700 dark:hover:text-slate-300"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => setDeleteModal(plan)}
                      title="ডিলিট করুন"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="px-5 flex flex-wrap items-center gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${accent.badge}`}
                  >
                    <Store size={12} /> {shopCount}টি শপ এই প্ল্যানে
                  </span>
                  {plan.isVisible === false ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-400">
                      <EyeOff size={12} /> Admin panel-এ লুকানো
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      <Eye size={12} /> Admin panel-এ দেখা যাচ্ছে
                    </span>
                  )}
                </div>

                <div className="mx-5 my-4 border-t border-gray-100 dark:border-slate-800" />

                <div className="flex-1 space-y-2 px-5">
                  {TOGGLE_FEATURES.map((feature) => {
                    const enabled = !!plan.features?.[feature.key];
                    return (
                      <div key={feature.key} className="flex items-center justify-between gap-2 text-sm">
                        <span className="text-gray-700 dark:text-slate-300">{feature.label}</span>
                        {enabled ? (
                          <Check size={16} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <X size={16} className="shrink-0 text-gray-300 dark:text-slate-600" />
                        )}
                      </div>
                    );
                  })}

                  {LIMIT_FEATURES.map((feature) => (
                    <div key={feature.key} className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-gray-700 dark:text-slate-300">{feature.label}</span>
                      <span className="font-bold text-gray-900 dark:text-slate-100">
                        {plan.limits?.[feature.key] ?? "—"}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mx-5 my-4 border-t border-gray-100 dark:border-slate-800" />

                <div className="flex items-center justify-between gap-2 px-5 pb-5 text-sm">
                  <span className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400">
                    <Palette size={14} /> ডিফল্ট থিম
                  </span>
                  <span className="font-bold text-gray-900 dark:text-slate-100 capitalize">
                    {plan.theme}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {modal && (
        <>
          <div className="fixed inset-0 bg-white/50 dark:bg-black/60 backdrop-blur-sm z-40" onClick={closeModal} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <form
              onSubmit={handleSubmit}
              className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-xl dark:shadow-black/40 space-y-4"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                {modal.mode === "edit" ? "প্ল্যান এডিট করুন" : "নতুন প্ল্যান তৈরি করুন"}
              </h2>

              {formError && (
                <div className="rounded-lg border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">
                  {formError}
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  প্ল্যানের নাম <span className="text-red-600">*</span>
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 px-3 py-2 outline-none focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-500/20"
                  placeholder="যেমন: Business"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">ট্যাগলাইন</label>
                <input
                  value={form.tagline}
                  onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 px-3 py-2 outline-none focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-500/20"
                  placeholder="সংক্ষিপ্ত বর্ণনা (ঐচ্ছিক)"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">ডিফল্ট থিম</label>
                <select
                  value={form.theme}
                  onChange={(e) => setForm((f) => ({ ...f, theme: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 px-3 py-2 outline-none focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-500/20"
                >
                  {THEME_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 px-3 py-2.5 text-sm text-gray-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-rose-600"
                  checked={form.isVisible}
                  onChange={(e) => setForm((f) => ({ ...f, isVisible: e.target.checked }))}
                />
                <span>
                  শপ-admin দের কাছে দৃশ্যমান
                  <span className="block text-xs text-gray-400 dark:text-slate-500">
                    বন্ধ রাখলে এই প্ল্যান "সব প্ল্যান তুলনা করুন" লিস্টে দেখা যাবে না — যেসব শপ ইতিমধ্যে এই প্ল্যানে আছে তারা ঠিকই দেখবে।
                  </span>
                </span>
              </label>

              <div>
                <p className="mb-2 text-sm font-medium text-gray-700 dark:text-slate-300">Features</p>
                <div className="grid grid-cols-2 gap-2">
                  {TOGGLE_FEATURES.map((feature) => (
                    <label
                      key={feature.key}
                      className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 px-3 py-2 text-sm text-gray-700 dark:text-slate-300"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-rose-600"
                        checked={form[feature.key]}
                        onChange={(e) => setForm((f) => ({ ...f, [feature.key]: e.target.checked }))}
                      />
                      {feature.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {LIMIT_FEATURES.map((feature) => (
                  <div key={feature.key}>
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      {feature.label}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form[feature.key]}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, [feature.key]: e.target.value }))
                      }
                      className="mt-1 w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 px-3 py-2 outline-none focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-500/20"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-60"
                >
                  {saving ? "সেভ হচ্ছে..." : modal.mode === "edit" ? "আপডেট করুন" : "তৈরি করুন"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteModal && (
        <>
          <div className="fixed inset-0 bg-white/50 dark:bg-black/60 backdrop-blur-sm z-40" />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-xl dark:shadow-black/40">
              <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-3">
                ⚠ প্ল্যান ডিলিট করবেন?
              </h2>
              <p className="mb-6 text-gray-700 dark:text-slate-300">
                <b>{deleteModal.name}</b> প্ল্যান ডিলিট করলে এটি আর ফিরিয়ে আনা যাবে না। কোনো শপ এই প্ল্যানে থাকলে ডিলিট হবে না।
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setDeleteModal(null)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-60"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                >
                  {deleting ? "ডিলিট হচ্ছে..." : "ডিলিট করুন"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
