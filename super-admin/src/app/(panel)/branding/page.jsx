"use client";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Pencil, Trash2, X, Check } from "lucide-react";
import ImageUploader from "../../../../components/ImageUploader";

const FAVICON_RULE = {
  type: "image/webp",
  width: 64,
  height: 64,
  maxBytes: 50 * 1024,
  minQuality: 0.5,
  qualityStep: 0.05,
  strictLimit: true,
};

function Skeleton() {
  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-3">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="h-24 bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse"
        />
      ))}
    </div>
  );
}

export default function PlatformBrandingPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ✅ প্রতিটা ফিল্ড ডিফল্টভাবে "ভিউ মোড"-এ থাকে — Edit আইকনে ক্লিক করলেই
  // সেই একটা ফিল্ড ইনপুট মোডে চলে যায়
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState("");

  const [editingFavicon, setEditingFavicon] = useState(false);
  const [faviconFile, setFaviconFile] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/platform-branding");
      const json = await res.json();
      setData(json);
      setTitleInput(json.title || "");
    } catch {
      toast.error("লোড করতে ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (formData, successMsg) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/platform-branding", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "সংরক্ষণ ব্যর্থ হয়েছে");
      setData(json);
      toast.success(successMsg);
      return true;
    } catch (err) {
      toast.error(`❌ ${err.message}`);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const saveTitle = async () => {
    const formData = new FormData();
    formData.append("title", titleInput.trim());
    const ok = await submit(formData, "✅ টাইটেল আপডেট হয়েছে");
    if (ok) setEditingTitle(false);
  };

  const resetTitle = async () => {
    const formData = new FormData();
    formData.append("title", "");
    const ok = await submit(formData, "✅ Hikmah IT তে রিসেট হয়েছে");
    if (ok) {
      setTitleInput("Hikmah IT");
      setEditingTitle(false);
    }
  };

  const saveFavicon = async () => {
    if (!faviconFile) {
      toast.error("আগে একটা ছবি আপলোড করুন");
      return;
    }
    const formData = new FormData();
    formData.append("favicon", faviconFile);
    const ok = await submit(formData, "✅ ফেভিকন আপডেট হয়েছে");
    if (ok) {
      setFaviconFile(null);
      setFaviconPreview("");
      setEditingFavicon(false);
    }
  };

  const clearFavicon = async () => {
    const formData = new FormData();
    formData.append("removeFavicon", "true");
    const ok = await submit(formData, "✅ ফেভিকন মুছে ফেলা হয়েছে");
    if (ok) {
      setFaviconFile(null);
      setFaviconPreview("");
      setEditingFavicon(false);
    }
  };

  if (loading) return <Skeleton />;
  if (!data) return null;

  const hasFavicon = !!data.favicon;

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-5 pb-8">
      <Toaster position="top-right" />

      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-slate-100">
          🌐 প্ল্যাটফর্ম ডিফল্ট ব্রাউজার টাইটেল ও ফেভিকন
        </h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          যেসব শপ তাদের নিজস্ব admin panel থেকে আলাদা টাইটেল/ফেভিকন সেট করেনি,
          তাদের storefront-এ এখানের টাইটেল/ফেভিকনই দেখাবে।
        </p>
      </div>

      {/* ============ Title ============ */}
      <div className="border dark:border-slate-700 rounded-xl p-4 sm:p-5 bg-white dark:bg-slate-900 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
            ডিফল্ট ব্রাউজার ট্যাব টাইটেল
          </label>
          {!editingTitle && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setTitleInput(data.title || "");
                  setEditingTitle(true);
                }}
                title="Edit"
                className="p-1.5 rounded-md text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                <Pencil size={16} />
              </button>
              <button
                type="button"
                onClick={resetTitle}
                disabled={saving || data.title === "Hikmah IT"}
                title="Reset (Hikmah IT)"
                className="p-1.5 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>

        {editingTitle ? (
          <div className="space-y-2">
            <input
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              maxLength={60}
              autoFocus
              placeholder="Hikmah IT"
              className="w-full border dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 rounded-md p-2.5 text-sm"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={saveTitle}
                disabled={saving}
                className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-md text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50"
              >
                <Check size={14} /> Update
              </button>
              <button
                onClick={() => setEditingTitle(false)}
                disabled={saving}
                className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-md border dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
              >
                <X size={14} /> বাতিল
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-800 dark:text-slate-200">
            {data.title || "Hikmah IT"}
          </p>
        )}
      </div>

      {/* ============ Favicon ============ */}
      <div className="border dark:border-slate-700 rounded-xl p-4 sm:p-5 bg-white dark:bg-slate-900 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
            ডিফল্ট ফেভিকন
          </label>
          {!editingFavicon && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setEditingFavicon(true)}
                title="Edit"
                className="p-1.5 rounded-md text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                <Pencil size={16} />
              </button>
              <button
                type="button"
                onClick={clearFavicon}
                disabled={!hasFavicon || saving}
                title="Delete"
                className="p-1.5 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>

        {editingFavicon ? (
          <div className="space-y-2">
            <ImageUploader
              preview={faviconPreview}
              onFileReady={(file) => setFaviconFile(file)}
              onPreviewChange={(url) => setFaviconPreview(url)}
              onToast={({ message, type }) =>
                toast[type === "error" ? "error" : "success"](message)
              }
              rule={FAVICON_RULE}
              shape="square"
              label="নতুন ফেভিকন আপলোড করুন"
              hint="বর্গাকার লোগো/আইকন সবচেয়ে ভালো দেখাবে"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={saveFavicon}
                disabled={saving || !faviconFile}
                className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-md text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50"
              >
                <Check size={14} /> Update
              </button>
              <button
                onClick={() => {
                  setFaviconFile(null);
                  setFaviconPreview("");
                  setEditingFavicon(false);
                }}
                disabled={saving}
                className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-md border dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
              >
                <X size={14} /> বাতিল
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {hasFavicon ? (
              <img
                src={data.favicon}
                alt="favicon"
                className="w-10 h-10 rounded border dark:border-slate-700 bg-white object-contain"
              />
            ) : (
              <span className="text-sm text-gray-400 dark:text-slate-500">
                কোনো ডিফল্ট ফেভিকন সেট করা নেই — স্ট্যাটিক /favicon.ico ব্যবহার
                হবে
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
