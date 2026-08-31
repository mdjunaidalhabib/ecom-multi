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

export default function BrandingAdminPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ✅ প্রতিটা ফিল্ড ডিফল্টভাবে "ভিউ মোড"-এ থাকে (শুধু বর্তমান মান দেখায়) —
  // Edit আইকনে ক্লিক করলেই সেই একটা ফিল্ড ইনপুট মোডে চলে যায়
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState("");

  const [editingFavicon, setEditingFavicon] = useState(false);
  const [faviconFile, setFaviconFile] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/site-branding");
      const json = await res.json();
      setData(json);
      setTitleInput(json.browserTitle || "");
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
      const res = await fetch("/api/admin/site-branding", {
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
    formData.append("browserTitle", titleInput.trim());
    const ok = await submit(formData, "✅ টাইটেল আপডেট হয়েছে");
    if (ok) setEditingTitle(false);
  };

  const clearTitle = async () => {
    const formData = new FormData();
    formData.append("browserTitle", "");
    const ok = await submit(formData, "✅ ডিফল্টে ফিরে গেছে");
    if (ok) {
      setTitleInput("");
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
    const ok = await submit(formData, "✅ ডিফল্টে ফিরে গেছে");
    if (ok) {
      setFaviconFile(null);
      setFaviconPreview("");
      setEditingFavicon(false);
    }
  };

  if (loading) return <Skeleton />;
  if (!data) return null;

  const usingDefaultTitle = !data.browserTitle;
  const usingDefaultFavicon = !data.favicon;

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-5 pb-8">
      <Toaster position="top-right" />

      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-slate-100">
          🌐 ব্রাউজার ট্যাব টাইটেল ও ফেভিকন
        </h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          এখানে কিছু সেট না করলে সুপার-অ্যাডমিনের ঠিক করা ডিফল্ট টাইটেল/ফেভিকন
          আপনার শপে দেখাবে।
        </p>
      </div>

      {/* ============ Title ============ */}
      <div className="border dark:border-slate-700 rounded-xl p-4 sm:p-5 bg-white dark:bg-slate-900 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
            ব্রাউজার ট্যাব টাইটেল
          </label>
          {!editingTitle && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setTitleInput(data.browserTitle || "");
                  setEditingTitle(true);
                }}
                title="Edit"
                className="p-1.5 rounded-md text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                <Pencil size={16} />
              </button>
              <button
                type="button"
                onClick={clearTitle}
                disabled={usingDefaultTitle || saving}
                title="Delete (ডিফল্টে ফিরে যান)"
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
              placeholder={`ডিফল্ট: ${data.platformDefault?.title || "Hikmah IT"}`}
              className="w-full border dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 rounded-md p-2.5 text-sm"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={saveTitle}
                disabled={saving}
                className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
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
            {data.browserTitle || (
              <span className="text-gray-400 dark:text-slate-500">
                ⚪ (ডিফল্ট) {data.platformDefault?.title || "Hikmah IT"}
              </span>
            )}
          </p>
        )}
      </div>

      {/* ============ Favicon ============ */}
      <div className="border dark:border-slate-700 rounded-xl p-4 sm:p-5 bg-white dark:bg-slate-900 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
            ফেভিকন
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
                disabled={usingDefaultFavicon || saving}
                title="Delete (ডিফল্টে ফিরে যান)"
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
                className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
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
            {data.favicon ? (
              <img
                src={data.favicon}
                alt="favicon"
                className="w-10 h-10 rounded border dark:border-slate-700 bg-white object-contain"
              />
            ) : (
              <>
                {data.platformDefault?.favicon ? (
                  <img
                    src={data.platformDefault.favicon}
                    alt="default favicon"
                    className="w-10 h-10 rounded border dark:border-slate-700 bg-white object-contain opacity-60"
                  />
                ) : null}
                <span className="text-sm text-gray-400 dark:text-slate-500">
                  ⚪ (ডিফল্ট) ব্যবহার হচ্ছে
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
