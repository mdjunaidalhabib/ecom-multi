"use client";

import { useRef, useState, useEffect } from "react";
import { Images, UploadCloud } from "lucide-react";
import ModalShell, { fieldLabel, fieldInput } from "./ModalShell";

/* ================== ✅ SLIDER IMAGE RULE ================== */
const SLIDER_IMAGE_RULE = {
  type: "image/webp",
  width: 1500,
  height: 500,
  maxBytes: 100 * 1024, // ✅ 100KB 
};

export default function AddSlideModal({
  showModal,
  closeModal,
  onSubmit,
  loading,
  editId = null,
  initialData = null,
  slidesLength = 0,

  // ✅ image processor from parent
  processSliderImage,
}) {
  const dropRef = useRef(null);

  const [title, setTitle] = useState("");
  const [href, setHref] = useState("");
  const [order, setOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  // ✅ states
  const [imageError, setImageError] = useState("");
  const [filesReady, setFilesReady] = useState(true);

  // ✅ dropdown limit
  const maxSerial = editId ? slidesLength : slidesLength + 1;

  const maxKB = Math.floor(SLIDER_IMAGE_RULE.maxBytes / 1024);

  // ✅ Edit mode / initialData load
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setHref(initialData.href || "");
      setOrder(
        initialData.order && initialData.order <= slidesLength
          ? initialData.order
          : 1
      );
      setIsActive(initialData.isActive ?? true);
      setPreview(initialData.src || "");
      setFile(null);

      setImageError("");
      setFilesReady(true);
    }
  }, [initialData, slidesLength]);

  // ✅ New slide open হলে ফর্ম ক্লিয়ার হবে
  useEffect(() => {
    if (showModal && !initialData && !editId) {
      setTitle("");
      setHref("");
      setOrder(slidesLength + 1);
      setIsActive(true);
      setFile(null);
      setPreview("");

      setImageError("");
      setFilesReady(true);
    }
  }, [showModal, initialData, editId, slidesLength]);

  // ✅ preview object URL cleanup (memory leak fix)
  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // ✅ Reset image states on close
  useEffect(() => {
    if (!showModal) {
      setImageError("");
      setFilesReady(true);
    }
  }, [showModal]);

  if (!showModal) return null;

  const handleClose = () => {
    setTitle("");
    setHref("");
    setOrder(1);
    setIsActive(true);

    setFile(null);
    setPreview("");

    setImageError("");
    setFilesReady(true);

    closeModal?.();
  };

  /* ================== ✅ MAIN FILE PROCESSOR ================== */
  const processFile = async (incomingFile) => {
    if (!incomingFile) return;

    setFilesReady(false);
    setImageError("");

    try {
      if (!processSliderImage) {
        setImageError("Image processor missing!");
        setFilesReady(true);
        return;
      }

      // ✅ Convert to WEBP (Rule applied from parent processor)
      const resized = await processSliderImage(incomingFile);

      // ✅ format must be webp
      if (resized.type !== SLIDER_IMAGE_RULE.type) {
        setImageError(
          `Only WEBP allowed (${SLIDER_IMAGE_RULE.width}×${SLIDER_IMAGE_RULE.height}, max ${maxKB}KB)`
        );
        setFile(null);
        setPreview("");
        setFilesReady(true);
        return;
      }

      // ✅ size validate
      if (resized.size > SLIDER_IMAGE_RULE.maxBytes) {
        setImageError(
          `Max ${maxKB}KB allowed (Your file: ${Math.ceil(
            resized.size / 1024
          )}KB)`
        );
        setFile(null);
        setPreview("");
        setFilesReady(true);
        return;
      }

      setFile(resized);
      setPreview(URL.createObjectURL(resized));
      setFilesReady(true);
    } catch (err) {
      console.error(err);
      setImageError("Invalid image file");
      setFile(null);
      setPreview("");
      setFilesReady(true);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (!dropped) return;
    processFile(dropped);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ block submit when processing / error
    if (!filesReady || imageError) return;

    const slideObj = {
      ...(initialData || {}),
      _id: editId || undefined,
      title,
      href,
      order,
      isActive,
      imageFile: file, // ✅ processed file
    };

    await onSubmit?.(slideObj);
  };

  const submitDisabled = loading || !filesReady || !!imageError;

  return (
    <ModalShell
      title={editId ? "Edit Slide" : "Add New Slide"}
      subtitle="Homepage slider-er jonno banner"
      icon={<Images size={20} />}
      onClose={loading ? undefined : handleClose}
      footer={
        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="h-11 sm:h-10 px-5 rounded-xl border border-gray-200 dark:border-slate-700 text-sm font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="slide-form"
            disabled={submitDisabled}
            className="h-11 sm:h-10 px-6 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 shadow-md shadow-indigo-600/25 active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : editId ? "Update Slide" : "Save Slide"}
          </button>
        </div>
      }
    >
      <form id="slide-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={fieldLabel}>Slide Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Slide title" className={fieldInput} required />
        </div>

        <div>
          <label className={fieldLabel}>Slide Link (Href)</label>
          <input value={href} onChange={(e) => setHref(e.target.value)} placeholder="Optional — e.g. /category/shoes" className={fieldInput} />
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
            <select value={isActive ? "active" : "hidden"} onChange={(e) => setIsActive(e.target.value === "active")} className={fieldInput}>
              <option value="active">Active</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>
        </div>

        {/* ✅ Image uploader */}
        <div>
          <label className={fieldLabel}>
            Slide Image <span className="normal-case font-medium text-gray-400">(Auto {SLIDER_IMAGE_RULE.width}×{SLIDER_IMAGE_RULE.height}, max {maxKB}KB)</span>
          </label>

          <div
            ref={dropRef}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => dropRef.current?.querySelector("input[type=file]")?.click()}
            className={`border-2 border-dashed rounded-2xl overflow-hidden cursor-pointer aspect-[3/1] min-h-[96px] flex items-center justify-center transition-colors ${
              imageError
                ? "border-red-400 bg-red-50 dark:bg-red-500/10"
                : "border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 hover:border-indigo-400"
            }`}
          >
            {preview ? (
              <img src={preview} alt="preview" className="w-full h-full object-cover" />
            ) : (
              <span className="flex flex-col items-center gap-1 text-gray-500 dark:text-slate-400 text-sm">
                <UploadCloud size={22} />
                Tap to upload
              </span>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = ""; // ✅ same file reselect
                if (!f) return;
                processFile(f);
              }}
            />
          </div>

          {imageError && <p className="text-[11px] text-red-600 dark:text-red-400 mt-1 font-semibold">{imageError}</p>}
          {!filesReady && <p className="text-[11px] text-orange-600 dark:text-orange-400 mt-1 font-semibold">Processing image...</p>}
        </div>
      </form>
    </ModalShell>
  );
}
