"use client";

import { useEffect, useState } from "react";
import {
  Palette,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Store,
  Layers,
} from "lucide-react";
import Toast from "./Toast";

const BASE_LAYOUT_OPTIONS = [
  { value: "classic", label: "Classic" },
  { value: "aurora", label: "Aurora" },
  { value: "terra", label: "Terra" },
];

const FONT_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "serif", label: "Serif" },
  { value: "rounded", label: "Rounded" },
  { value: "mono", label: "Mono" },
];

const COLOR_FIELDS = [
  { key: "primary", label: "Primary" },
  { key: "primaryDark", label: "Primary (dark)" },
  { key: "secondary", label: "Secondary" },
  { key: "background", label: "Background" },
  { key: "surface", label: "Surface" },
  { key: "text", label: "Text" },
  { key: "accent", label: "Accent" },
];

const emptyForm = () => ({
  name: "",
  baseLayout: "classic",
  colors: {
    primary: "#db2777",
    primaryDark: "#be185d",
    secondary: "#111827",
    background: "#fdf2f8",
    surface: "#ffffff",
    text: "#1f2937",
    accent: "#ec4899",
  },
  fonts: { heading: "default", body: "default" },
});

const formFromTheme = (theme) => ({
  name: theme.name || "",
  baseLayout: theme.baseLayout || "classic",
  colors: { ...emptyForm().colors, ...(theme.colors || {}) },
  fonts: { ...emptyForm().fonts, ...(theme.fonts || {}) },
});

export default function Themes() {
  const [themes, setThemes] = useState([]);
  const [plans, setPlans] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [modal, setModal] = useState(null); // { mode: "create" | "edit", theme? }
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const notify = (message, type = "success") => setToast({ message, type });

  const loadAll = async () => {
    try {
      setLoading(true);
      const [themesRes, plansRes, shopsRes] = await Promise.all([
        fetch("/api/admin/themes"),
        fetch("/api/admin/plans"),
        fetch("/api/admin/shops"),
      ]);
      const [themesData, plansData, shopsData] = await Promise.all([
        themesRes.json(),
        plansRes.json(),
        shopsRes.json(),
      ]);
      setThemes(Array.isArray(themesData) ? themesData : []);
      setPlans(Array.isArray(plansData) ? plansData : []);
      setShops(Array.isArray(shopsData) ? shopsData : []);
    } catch {
      notify("থিম লোড করা যায়নি", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const usageCount = (themeKey) => {
    const planCount = plans.filter((p) => p.theme === themeKey).length;
    const shopCount = shops.filter((s) => s.branding?.theme === themeKey).length;
    return { planCount, shopCount };
  };

  const openCreateModal = () => {
    setForm(emptyForm());
    setFormError("");
    setModal({ mode: "create" });
  };

  const openEditModal = (theme) => {
    setForm(formFromTheme(theme));
    setFormError("");
    setModal({ mode: "edit", theme });
  };

  const closeModal = () => {
    setModal(null);
    setSaving(false);
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError("থিমের নাম দিন");
      return;
    }

    setSaving(true);
    setFormError("");

    const payload = {
      name: form.name.trim(),
      baseLayout: form.baseLayout,
      colors: form.colors,
      fonts: form.fonts,
    };

    try {
      const url =
        modal.mode === "edit" ? `/api/admin/themes/${modal.theme._id}` : "/api/admin/themes";
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

      notify(modal.mode === "edit" ? "✅ থিম আপডেট হয়েছে" : "✅ নতুন থিম তৈরি হয়েছে");
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
      const res = await fetch(`/api/admin/themes/${deleteModal._id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        notify(data?.message || "ডিলিট করা যায়নি", "error");
      } else {
        notify("🗑️ থিম ডিলিট হয়েছে");
        setDeleteModal(null);
        loadAll();
      }
    } catch {
      notify("Server error", "error");
    } finally {
      setDeleting(false);
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
            <Palette size={20} />
            <span className="text-sm font-semibold uppercase tracking-wider">
              Themes
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 sm:text-3xl">
            থিম প্রিসেট
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            নিজের রং/ফন্ট দিয়ে নতুন থিম তৈরি করুন — এগুলো Plans ও Shops পেজে বেছে নেওয়া যাবে।
            প্রতিটা থিম আগে থেকে বানানো ৩টা লেআউট টেমপ্লেটের (Classic/Aurora/Terra) একটার উপর বসে।
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-rose-700 active:scale-[0.98]"
        >
          <Plus size={16} /> নতুন থিম
        </button>
      </div>

      {themes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-14 text-center text-gray-500 dark:text-slate-400">
          এখনো কোনো থিম নেই।
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-3">
          {themes.map((theme) => {
            const { planCount, shopCount } = usageCount(theme.key);
            return (
              <div
                key={theme._id}
                className="relative flex flex-col rounded-2xl bg-white dark:bg-slate-900 shadow-sm dark:shadow-black/30 ring-1 ring-gray-200 dark:ring-slate-700"
              >
                {/* Color strip preview */}
                <div className="flex h-3 overflow-hidden rounded-t-2xl">
                  {COLOR_FIELDS.map((f) => (
                    <span
                      key={f.key}
                      className="flex-1"
                      style={{ backgroundColor: theme.colors?.[f.key] }}
                      title={`${f.label}: ${theme.colors?.[f.key]}`}
                    />
                  ))}
                </div>

                <div className="flex items-start gap-3 p-5 pb-4">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: theme.colors?.background }}
                  >
                    <Palette size={20} style={{ color: theme.colors?.primary }} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-black text-gray-900 dark:text-slate-100 truncate">
                      {theme.name}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-slate-400 truncate capitalize">
                      {theme.baseLayout} layout
                      {theme.isSystem ? " · বেস থিম" : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => openEditModal(theme)}
                      title="এডিট করুন"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-700 dark:hover:text-slate-300"
                    >
                      <Pencil size={15} />
                    </button>
                    {!theme.isSystem && (
                      <button
                        onClick={() => setDeleteModal(theme)}
                        title="ডিলিট করুন"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="px-5 pb-5 flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-700 px-2.5 py-1 text-xs font-bold text-gray-700 dark:text-slate-300">
                    <Layers size={12} /> {planCount}টি প্ল্যানে
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-700 px-2.5 py-1 text-xs font-bold text-gray-700 dark:text-slate-300">
                    <Store size={12} /> {shopCount}টি শপে
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
                {modal.mode === "edit" ? "থিম এডিট করুন" : "নতুন থিম তৈরি করুন"}
              </h2>

              {formError && (
                <div className="rounded-lg border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">
                  {formError}
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  থিমের নাম <span className="text-red-600">*</span>
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 px-3 py-2 outline-none focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-500/20"
                  placeholder="যেমন: Rose Gold"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  লেআউট টেমপ্লেট
                </label>
                <select
                  value={form.baseLayout}
                  onChange={(e) => setForm((f) => ({ ...f, baseLayout: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 px-3 py-2 outline-none focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-500/20"
                >
                  {BASE_LAYOUT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">
                  পেজ গঠন/স্ট্রাকচার এখান থেকে ঠিক হয় — রং-ফন্ট নিচে আলাদাভাবে কাস্টমাইজ করুন।
                </p>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-gray-700 dark:text-slate-300">রং</p>
                <div className="grid grid-cols-2 gap-3">
                  {COLOR_FIELDS.map((f) => (
                    <div key={f.key} className="flex items-center gap-2">
                      <input
                        type="color"
                        value={form.colors[f.key]}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            colors: { ...prev.colors, [f.key]: e.target.value },
                          }))
                        }
                        className="h-8 w-10 shrink-0 cursor-pointer rounded border border-gray-300 dark:border-slate-600"
                      />
                      <span className="text-xs text-gray-600 dark:text-slate-400">{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                    Heading ফন্ট
                  </label>
                  <select
                    value={form.fonts.heading}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, fonts: { ...f.fonts, heading: e.target.value } }))
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 px-3 py-2 outline-none focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-500/20"
                  >
                    {FONT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                    Body ফন্ট
                  </label>
                  <select
                    value={form.fonts.body}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, fonts: { ...f.fonts, body: e.target.value } }))
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 px-3 py-2 outline-none focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-500/20"
                  >
                    {FONT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
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
                ⚠ থিম ডিলিট করবেন?
              </h2>
              <p className="mb-6 text-gray-700 dark:text-slate-300">
                <b>{deleteModal.name}</b> থিম ডিলিট করলে এটি আর ফিরিয়ে আনা যাবে না। কোনো প্ল্যান/শপ এই থিমে থাকলে ডিলিট হবে না।
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
