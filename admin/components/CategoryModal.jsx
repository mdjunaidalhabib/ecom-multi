"use client";

import { useEffect } from "react";
import { Layers } from "lucide-react";
import ImageUploader from "./ImageUploader";
import ModalShell, { fieldLabel, fieldInput } from "./ModalShell";

/* ================== CATEGORY IMAGE RULE ================== */
const CATEGORY_IMAGE_RULE = {
  type: "image/webp",
  width: 300,
  height: 300,
  maxBytes: 100 * 1024,
  startQuality: 0.88,
  minQuality: 0.2,
  qualityStep: 0.05,
  strictLimit: true,
};

export default function CategoryModal({
  show,
  editId,
  categoriesLength = 0,

  name,
  setName,

  order,
  setOrder,

  isActive,
  setIsActive,

  file,
  setFile,

  preview,
  setPreview,

  loading,
  onClose,
  onSubmit,
  onToast,
}) {
  const maxSerial = editId ? categoriesLength : categoriesLength + 1;

  useEffect(() => {
    if (show && !editId) {
      setOrder(categoriesLength + 1);
      setIsActive(true);
    }
  }, [show, editId, categoriesLength, setOrder, setIsActive]);

  if (!show) return null;

  return (
    <ModalShell
      title={editId ? "Edit Category" : "Add Category"}
      subtitle={editId ? "Category-r tothyo update korun" : "Notun category toiri korun"}
      icon={<Layers size={20} />}
      onClose={loading ? undefined : onClose}
      footer={
        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="h-11 sm:h-10 px-5 rounded-xl border border-gray-200 dark:border-slate-700 text-sm font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="category-form"
            disabled={loading}
            className="h-11 sm:h-10 px-6 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 shadow-md shadow-indigo-600/25 active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : editId ? "Update Category" : "Save Category"}
          </button>
        </div>
      }
    >
      <form id="category-form" onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className={fieldLabel}>Category Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Men's Fashion"
            className={fieldInput}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={fieldLabel}>Serial No</label>
            <select value={order} onChange={(e) => setOrder(Number(e.target.value))} className={fieldInput}>
              {Array.from({ length: maxSerial }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={fieldLabel}>Status</label>
            <select
              value={isActive ? "active" : "hidden"}
              onChange={(e) => setIsActive(e.target.value === "active")}
              className={fieldInput}
            >
              <option value="active">Active</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>
        </div>

        <ImageUploader
          preview={preview}
          onFileReady={setFile}
          onPreviewChange={setPreview}
          onToast={onToast}
          rule={CATEGORY_IMAGE_RULE}
          shape="square"
          label="Category Image"
        />
      </form>
    </ModalShell>
  );
}
