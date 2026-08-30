"use client";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Pencil, Trash2 } from "lucide-react";
import ImageUploader from "../../../../components/ImageUploader";

const POPUP_IMAGE_RULE = {
  type: "image/webp",
  width: 800,
  height: 800,
  maxBytes: 200 * 1024,
  startQuality: 0.88,
  minQuality: 0.2,
  qualityStep: 0.05,
  strictLimit: true,
};

export default function HomepagePopupAdmin() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [preview, setPreview] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [linkInput, setLinkInput] = useState("");
  const [editingLink, setEditingLink] = useState(false);
  const [openInNewTab, setOpenInNewTab] = useState(true);

  useEffect(() => {
    fetch("/api/admin/homepage-popup")
      .then((res) => res.json())
      .then((data) => {
        const cfg = data.data || data;
        setConfig(cfg);
        setPreview(cfg.image || "");
        setLinkInput(cfg.link || "");
        setOpenInNewTab(cfg.openInNewTab ?? true);
        setEditingLink(!cfg.link); // link না থাকলে সরাসরি add mode-এ শুরু হবে
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load");
        setLoading(false);
      });
  }, []);

  const handleSave = async ({
    file,
    removeImage,
    enabled,
    link,
    openInNewTab: newTabOption,
    successMessage,
  } = {}) => {
    setSaving(true);
    try {
      const formData = new FormData();
      if (file) formData.append("image", file);
      if (removeImage) formData.append("removeImage", "true");
      if (enabled !== undefined) formData.append("enabled", String(enabled));
      if (link !== undefined) formData.append("link", link);
      if (newTabOption !== undefined)
        formData.append("openInNewTab", String(newTabOption));

      const res = await fetch("/api/admin/homepage-popup", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error();

      const json = await res.json();
      const updated = json.data || json;
      setConfig(updated);
      setPreview(updated.image || "");
      setLinkInput(updated.link || "");
      setOpenInNewTab(updated.openInNewTab ?? true);
      setImageFile(null);
      toast.success(successMessage || "Saved!");
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const toggleEnabled = () => {
    const nextEnabled = !config.enabled;
    setConfig({ ...config, enabled: nextEnabled });
    handleSave({ enabled: nextEnabled });
  };

  // ✅ image file ready হলে auto save
  const handleImageFileReady = (file) => {
    setImageFile(file);
    if (!file) return;
    handleSave({ file });
  };

  // ✅ image remove
  const handleImageRemove = () => {
    setPreview("");
    setImageFile(null);
    handleSave({ removeImage: true });
  };

  // ✅ popup link save
  const handleSaveLink = async () => {
    const trimmed = linkInput.trim();
    await handleSave({
      link: trimmed,
      openInNewTab,
      successMessage: trimmed ? "Link saved!" : "Link removed!",
    });
    setEditingLink(!trimmed); // link দেওয়া হলে read mode-এ চলে যাবে, খালি হলে add mode-এই থাকবে
  };

  // ✅ popup link remove
  const handleRemoveLink = async () => {
    setLinkInput("");
    await handleSave({ link: "", successMessage: "Link removed!" });
    setEditingLink(true);
  };

  // ✅ edit icon ক্লিকে read mode থেকে edit mode-এ যাওয়া
  const handleEditLink = () => {
    setLinkInput(config.link || "");
    setOpenInNewTab(config.openInNewTab ?? true);
    setEditingLink(true);
  };

  // ✅ edit mode থেকে cancel করে আগের read mode-এ ফিরে যাওয়া
  const handleCancelLinkEdit = () => {
    setLinkInput(config.link || "");
    setOpenInNewTab(config.openInNewTab ?? true);
    setEditingLink(false);
  };

  if (loading) return <p className="text-center py-10 text-gray-600 dark:text-slate-400">Loading...</p>;
  if (!config) return null;

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 shadow p-4 md:p-6 rounded-lg space-y-6">
      <Toaster position="top-right" />

      <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-slate-100">🖼️ Homepage Popup</h2>

      {/* TOGGLE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border dark:border-slate-700 p-4 rounded-lg">
        <div>
          <p className="font-semibold text-gray-900 dark:text-slate-100">Popup Status</p>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            {config.enabled ? "Visible ✅" : "Hidden 🚫"}
          </p>
        </div>

        <button
          onClick={toggleEnabled}
          disabled={saving}
          className={`relative inline-flex h-7 w-14 items-center rounded-full transition ${
            config.enabled ? "bg-green-500" : "bg-gray-300 dark:bg-slate-700"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
              config.enabled ? "translate-x-8" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* IMAGE */}
      <div className="border dark:border-slate-700 p-4 rounded-lg space-y-3">
        <h3 className="font-semibold text-gray-900 dark:text-slate-100">Popup Image (1:1)</h3>

        {config.image && !imageFile ? (
          <div className="flex items-center gap-3">
            <img
              src={config.image}
              alt="Homepage Popup"
              className="h-24 w-24 rounded border dark:border-slate-700 object-cover"
            />
            <button
              disabled={saving}
              onClick={handleImageRemove}
              className="bg-red-600 text-white px-3 py-1 rounded disabled:opacity-60"
            >
              Remove
            </button>
          </div>
        ) : (
          <ImageUploader
            preview={preview}
            onFileReady={handleImageFileReady}
            onPreviewChange={setPreview}
            onToast={({ message, type }) =>
              type === "error" ? toast.error(message) : toast(message)
            }
            rule={POPUP_IMAGE_RULE}
            shape="square"
            label="Popup Image"
            hint="সাইট হোমপেজে প্রবেশ করার কিছুক্ষণ পর এই ছবিটি popup আকারে দেখাবে। (upload করলেই auto save হয়ে যাবে)"
          />
        )}
      </div>

      {/* LINK */}
      <div className="border dark:border-slate-700 p-4 rounded-lg space-y-3">
        <h3 className="font-semibold text-gray-900 dark:text-slate-100">Popup Link (Optional)</h3>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Popup-এ ক্লিক করলে কাস্টমারকে এই লিংকে নিয়ে যাবে (product page বা যেকোনো URL)। ফাঁকা রাখলে popup শুধু বন্ধ হবে।
        </p>
        {!editingLink && config.link ? (
          // ✅ READ MODE — link যোগ থাকলে শুধু দেখাবে + edit/remove আইকন
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <a
                href={config.link}
                target={config.openInNewTab === false ? "_self" : "_blank"}
                rel="noopener noreferrer"
                className="flex-1 min-w-0 truncate text-sm text-indigo-600 dark:text-indigo-400 underline underline-offset-2"
                title={config.link}
              >
                {config.link}
              </a>
              <button
                onClick={handleEditLink}
                disabled={saving}
                aria-label="Edit link"
                title="Edit"
                className="p-2 rounded border dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={handleRemoveLink}
                disabled={saving}
                aria-label="Remove link"
                title="Remove"
                className="p-2 rounded border border-red-200 dark:border-red-900 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors disabled:opacity-50"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              {config.openInNewTab === false
                ? "Opens in: same tab"
                : "Opens in: new tab"}
            </p>
          </div>
        ) : (
          // ✅ EDIT MODE — নতুন link দেওয়া বা existing link বদলানো
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                placeholder="https://yourshop.com/product/product-slug"
                className="flex-1 border dark:border-slate-700 rounded px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveLink}
                  disabled={
                    saving ||
                    (linkInput.trim() === (config.link || "") &&
                      openInNewTab === (config.openInNewTab ?? true))
                  }
                  className="flex-1 sm:flex-none bg-indigo-600 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
                >
                  Save Link
                </button>
                {config.link && (
                  <button
                    onClick={handleCancelLinkEdit}
                    disabled={saving}
                    className="px-4 py-2 rounded text-sm font-medium border dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300 cursor-pointer w-fit">
              <input
                type="checkbox"
                checked={openInNewTab}
                onChange={(e) => setOpenInNewTab(e.target.checked)}
                className="rounded border-gray-300 dark:border-slate-600"
              />
              Open in new tab
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
