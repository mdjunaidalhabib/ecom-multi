"use client";

import { useEffect, useMemo, useState } from "react";
import {
  GraduationCap,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Play,
  Eye,
  EyeOff,
  ExternalLink,
} from "lucide-react";
import Toast from "./Toast";
import {
  TUTORIAL_SECTIONS,
  sectionLabel,
  youtubeThumb,
  extractYouTubeId,
} from "../lib/tutorialSections";

const emptyForm = () => ({
  title: "",
  description: "",
  section: "getting-started",
  youtubeUrl: "",
  sortOrder: 1,
  isPublished: true,
});

// sortOrder এখানে "পজিশন" — backend ১, ২, ৩… ক্রমে সাজায়; নম্বর ধরে না রেখে
// লিস্টের সিরিয়ালই পজিশন হিসেবে ব্যবহার হয় (লিস্ট সবসময় সাজানো অবস্থায় আসে)।
const formFromTutorial = (t, position) => ({
  title: t.title || "",
  description: t.description || "",
  section: t.section || "other",
  youtubeUrl: t.youtubeUrl || "",
  sortOrder: position,
  isPublished: t.isPublished !== false,
});

const inputClass =
  "mt-1 w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 px-3 py-2 outline-none focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-500/20";

export default function Tutorials() {
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState("all");

  const [modal, setModal] = useState(null); // { mode: "create" | "edit", tutorial? }
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const notify = (message, type = "success") => setToast({ message, type });

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/tutorials");
      const data = await res.json();
      setTutorials(Array.isArray(data) ? data : []);
    } catch {
      notify("টিউটোরিয়াল লোড করা যায়নি", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(
    () => (filter === "all" ? tutorials : tutorials.filter((t) => t.section === filter)),
    [tutorials, filter],
  );

  const previewId = extractYouTubeId(form.youtubeUrl);

  // সব টিউটোরিয়ালের গ্লোবাল পজিশন (filter-এ আটকে থাকা লিস্ট নয়) — কার্ডের ব্যাজ ও
  // এডিট ফর্মের ডিফল্ট এখান থেকে আসে
  const positionOf = useMemo(
    () => new Map(tutorials.map((t, i) => [t._id, i + 1])),
    [tutorials],
  );

  const openCreate = () => {
    // নতুন ভিডিও ডিফল্টে সবার শেষে যোগ হয়
    setForm({ ...emptyForm(), sortOrder: tutorials.length + 1 });
    setFormError("");
    setModal({ mode: "create" });
  };

  const openEdit = (tutorial) => {
    setForm(formFromTutorial(tutorial, positionOf.get(tutorial._id) || 1));
    setFormError("");
    setModal({ mode: "edit", tutorial });
  };

  const closeModal = () => {
    setModal(null);
    setSaving(false);
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setFormError("শিরোনাম দিন");
    if (!previewId) return setFormError("সঠিক YouTube লিংক দিন");

    setSaving(true);
    setFormError("");
    try {
      const isEdit = modal.mode === "edit";
      const res = await fetch(
        isEdit ? `/api/admin/tutorials/${modal.tutorial._id}` : "/api/admin/tutorials",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, sortOrder: Number(form.sortOrder) || 0 }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(data?.message || "সেভ করা যায়নি");
        return;
      }
      notify(isEdit ? "✅ টিউটোরিয়াল আপডেট হয়েছে" : "✅ নতুন টিউটোরিয়াল যোগ হয়েছে");
      closeModal();
      load();
    } catch {
      setFormError("Server error");
    } finally {
      setSaving(false);
    }
  };

  const togglePublished = async (tutorial) => {
    setTogglingId(tutorial._id);
    try {
      const res = await fetch(`/api/admin/tutorials/${tutorial._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !tutorial.isPublished }),
      });
      if (!res.ok) throw new Error();
      setTutorials((list) =>
        list.map((t) =>
          t._id === tutorial._id ? { ...t, isPublished: !t.isPublished } : t,
        ),
      );
    } catch {
      notify("আপডেট করা যায়নি", "error");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/tutorials/${deleteModal._id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        notify(data?.message || "ডিলিট করা যায়নি", "error");
      } else {
        notify("🗑️ টিউটোরিয়াল ডিলিট হয়েছে");
        setDeleteModal(null);
        load();
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
            <GraduationCap size={20} />
            <span className="text-sm font-semibold uppercase tracking-wider">Tutorials</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 sm:text-3xl">
            ভিডিও টিউটোরিয়াল
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            YouTube-এ ভিডিও আপলোড করে লিংক এখানে যোগ করুন — সব শপের admin ও staff তাদের
            Tutorials মেনুতে এগুলো দেখতে পাবে।
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-rose-700 active:scale-[0.98]"
        >
          <Plus size={16} /> নতুন টিউটোরিয়াল
        </button>
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap">
        {[{ key: "all", label: "সব" }, ...TUTORIAL_SECTIONS].map((s) => {
          const count =
            s.key === "all"
              ? tutorials.length
              : tutorials.filter((t) => t.section === s.key).length;
          const active = filter === s.key;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => setFilter(s.key)}
              className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                active
                  ? "bg-rose-600 text-white shadow"
                  : "bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 ring-1 ring-gray-200 dark:ring-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800"
              }`}
            >
              {s.label}
              <span className={`ml-1.5 text-xs ${active ? "text-rose-100" : "text-gray-400"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-14 text-center text-gray-500 dark:text-slate-400">
          {tutorials.length === 0
            ? "এখনো কোনো টিউটোরিয়াল নেই — “নতুন টিউটোরিয়াল” এ ক্লিক করে যোগ করুন।"
            : "এই সেকশনে কোনো টিউটোরিয়াল নেই।"}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((t) => (
            <div
              key={t._id}
              className="flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-sm ring-1 ring-gray-200 dark:ring-slate-700"
            >
              <a
                href={t.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block aspect-video bg-slate-200 dark:bg-slate-800"
                title="YouTube-এ খুলুন"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={youtubeThumb(t.videoId)}
                  alt=""
                  loading="lazy"
                  className={`h-full w-full object-cover ${t.isPublished ? "" : "opacity-50 grayscale"}`}
                />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-rose-600 shadow-lg transition group-hover:scale-110">
                    <Play size={18} className="ml-0.5" fill="currentColor" />
                  </span>
                </span>
                {!t.isPublished && (
                  <span className="absolute left-2 top-2 rounded-full bg-slate-800/90 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                    Draft
                  </span>
                )}
              </a>

              <div className="flex flex-1 flex-col gap-1.5 p-4">
                <span className="w-fit rounded-full bg-rose-50 dark:bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700 dark:text-rose-300">
                  {sectionLabel(t.section)}
                </span>
                <h2 className="text-sm font-bold leading-snug text-gray-900 dark:text-slate-100 line-clamp-2">
                  {t.title}
                </h2>
                {t.description && (
                  <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2">
                    {t.description}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 dark:border-slate-800 px-3 py-2">
                <span className="text-xs font-semibold text-gray-400 dark:text-slate-500">
                  ক্রম #{positionOf.get(t._id)}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => togglePublished(t)}
                    disabled={togglingId === t._id}
                    title={t.isPublished ? "Draft করুন (লুকান)" : "Publish করুন"}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-700 dark:hover:text-slate-300 disabled:opacity-50"
                  >
                    {t.isPublished ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>
                  <button
                    onClick={() => openEdit(t)}
                    title="এডিট করুন"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-700 dark:hover:text-slate-300"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => setDeleteModal(t)}
                    title="ডিলিট করুন"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {modal && (
        <>
          <div
            className="fixed inset-0 bg-white/50 dark:bg-black/60 backdrop-blur-sm z-40"
            onClick={closeModal}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <form
              onSubmit={handleSubmit}
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-xl dark:shadow-black/40 space-y-4"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                {modal.mode === "edit" ? "টিউটোরিয়াল এডিট করুন" : "নতুন টিউটোরিয়াল"}
              </h2>

              {formError && (
                <div className="rounded-lg border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">
                  {formError}
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  শিরোনাম <span className="text-red-600">*</span>
                </label>
                <input
                  required
                  maxLength={120}
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className={inputClass}
                  placeholder="যেমন: কীভাবে নতুন প্রোডাক্ট যোগ করবেন"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  YouTube লিংক <span className="text-red-600">*</span>
                </label>
                <input
                  required
                  value={form.youtubeUrl}
                  onChange={(e) => setForm((f) => ({ ...f, youtubeUrl: e.target.value }))}
                  className={inputClass}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                {form.youtubeUrl.trim() &&
                  (previewId ? (
                    <div className="mt-2 flex items-center gap-3 rounded-lg bg-gray-50 dark:bg-slate-800 p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={youtubeThumb(previewId)}
                        alt=""
                        className="h-14 w-24 rounded object-cover"
                      />
                      <span className="flex items-center gap-1 text-xs text-green-700 dark:text-green-400">
                        <ExternalLink size={12} /> ভিডিও পাওয়া গেছে
                      </span>
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      এটা সঠিক YouTube লিংক মনে হচ্ছে না।
                    </p>
                  ))}
                <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">
                  Unlisted ভিডিও দিলেও চলবে — শুধু লিংক যাদের কাছে আছে তারাই দেখতে পারবে।
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  কোন সেকশনের ভিডিও
                </label>
                <select
                  value={form.section}
                  onChange={(e) => setForm((f) => ({ ...f, section: e.target.value }))}
                  className={inputClass}
                >
                  {TUTORIAL_SECTIONS.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label} — {s.hint}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  সংক্ষিপ্ত বিবরণ
                </label>
                <textarea
                  rows={3}
                  maxLength={600}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className={inputClass}
                  placeholder="এই ভিডিওতে কী শেখানো হয়েছে..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                    ক্রম
                  </label>
                  <select
                    value={form.sortOrder}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))
                    }
                    className={inputClass}
                  >
                    {Array.from(
                      { length: tutorials.length + (modal.mode === "create" ? 1 : 0) },
                      (_, i) => {
                        const at = tutorials[i];
                        const isSelf = at && modal.tutorial && at._id === modal.tutorial._id;
                        return (
                          <option key={i} value={i + 1}>
                            {i + 1}
                            {isSelf ? " — বর্তমান" : at ? ` — ${at.title.slice(0, 28)}` : " — শেষে"}
                          </option>
                        );
                      },
                    )}
                  </select>
                  <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">
                    বাকিগুলো নিজে থেকে সরে যাবে
                  </p>
                </div>
                <label className="flex cursor-pointer items-center gap-2 self-center text-sm font-medium text-gray-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
                    className="h-4 w-4 rounded accent-rose-600"
                  />
                  Publish করা থাকবে
                </label>
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
                  {saving ? "সেভ হচ্ছে..." : modal.mode === "edit" ? "আপডেট করুন" : "যোগ করুন"}
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
                ⚠ টিউটোরিয়াল ডিলিট করবেন?
              </h2>
              <p className="mb-6 text-gray-700 dark:text-slate-300">
                <b>{deleteModal.title}</b> সব শপের Tutorials থেকে মুছে যাবে এবং ফিরিয়ে আনা যাবে না।
                সাময়িক লুকাতে চাইলে বরং Draft করুন।
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
