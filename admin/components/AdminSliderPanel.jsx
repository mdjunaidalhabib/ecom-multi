"use client";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import AddSlideModal from "./AddSlideModal";
import ListToolbar from "./ListToolbar";
import ModalShell from "./ModalShell";
import { Trash2 } from "lucide-react";
import SliderPanelSkeleton from "./Skeleton/SliderSkeleton";

/* ================== ✅ SLIDER IMAGE RULE ================== */
const SLIDER_IMAGE_RULE = {
  type: "image/webp",
  width: 1500,
  height: 500,
  maxBytes: 100 * 1024, // ✅ 100KB
  startQuality: 0.85,
  minQuality: 0.25,
  qualityStep: 0.07,
};

/* ================== ✅ RESIZE HELPER (Dynamic 1500×500 WEBP <= maxBytes) ================== */
async function resizeToWebP_1500x500(
  file,
  width = SLIDER_IMAGE_RULE.width,
  height = SLIDER_IMAGE_RULE.height,
  maxBytes = SLIDER_IMAGE_RULE.maxBytes
) {
  const readAsDataURL = (f) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });

  const loadImage = (src) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  const toWebP = (canvas, quality) =>
    new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Blob creation failed"));
          resolve(blob);
        },
        SLIDER_IMAGE_RULE.type,
        quality
      );
    });

  const dataURL = await readAsDataURL(file);
  const img = await loadImage(dataURL);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  // ✅ Cover crop for width × height
  const scale = Math.max(width / img.width, height / img.height);
  const x = (width - img.width * scale) / 2;
  const y = (height - img.height * scale) / 2;
  ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

  // ✅ Auto reduce quality until <= maxBytes
  let quality = SLIDER_IMAGE_RULE.startQuality;
  let blob = await toWebP(canvas, quality);

  while (blob.size > maxBytes && quality > SLIDER_IMAGE_RULE.minQuality) {
    quality -= SLIDER_IMAGE_RULE.qualityStep;
    blob = await toWebP(canvas, quality);
  }

  return new File([blob], file.name.replace(/\.\w+$/, ".webp"), {
    type: SLIDER_IMAGE_RULE.type,
  });
}

export default function AdminSliderPanel() {
  const API_URL = "/api";

  const [slides, setSlides] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  // ✅ FILTER STATE
  const [filter, setFilter] = useState("all");

  // add/edit modal state
  const [showModal, setShowModal] = useState(false);
  const [editSlide, setEditSlide] = useState(null);

  // single delete modal state
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ✅ delete-all modal state
  const [deleteAllModal, setDeleteAllModal] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  // fetch slides
  const fetchSlides = async () => {
    try {
      setPageLoading(true);
      const res = await fetch(`${API_URL}/admin/sliders`, {
        credentials: "include",
      });
      const data = await res.json();
      setSlides(data.slides || []);
    } catch {
      toast.error("❌ Failed to fetch slides");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, [API_URL]);

  // save slide
  const handleSave = async (slideObj) => {
    setSavingId(slideObj._id || "new");

    try {
      const payload = structuredClone(slideObj);
      const formData = new FormData();

      // ✅ imageFile already processed (webp 1500x500 <= maxBytes)
      if (payload.imageFile) {
        formData.append("image", payload.imageFile);
        delete payload.imageFile;
      }

      if (payload.removeImage) {
        formData.append("removeImage", "true");
        delete payload.removeImage;
      }

      formData.append("slide", JSON.stringify(payload));

      const res = await fetch(`${API_URL}/admin/sliders`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) throw new Error("Save failed");

      const data = await res.json();
      setSlides(data.slides || []);
      toast.success("✅ Slide saved");

      setShowModal(false);
      setEditSlide(null);
    } catch (e) {
      console.error(e);
      toast.error("❌ Slide save failed");
    } finally {
      setSavingId(null);
    }
  };

  // open single delete modal
  const confirmDelete = (slide) => setDeleteModal(slide);

  // delete single slide (modal confirm)
  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);

    try {
      const res = await fetch(`${API_URL}/admin/sliders/${deleteModal._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Delete failed");

      toast.success("✅ Slide deleted");
      setDeleteModal(null);
      fetchSlides();
    } catch {
      toast.error("❌ Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  // ✅ delete all slides handler
  const handleDeleteAll = async () => {
    setDeletingAll(true);
    try {
      const res = await fetch(`${API_URL}/admin/sliders/delete-all`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Delete all failed");

      toast.success("🗑 All slides deleted!");
      setDeleteAllModal(false);
      fetchSlides();
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to delete all slides");
    } finally {
      setDeletingAll(false);
    }
  };

  // toggle active (single)
  const handleToggle = async (id) => {
    try {
      await fetch(`${API_URL}/admin/sliders/${id}/toggle`, {
        method: "PATCH",
        credentials: "include",
      });
      fetchSlides();
    } catch {
      toast.error("❌ Toggle failed");
    }
  };

  // ✅ any active?
  const hasAnyActive = slides.some((s) => s.isActive);

  const counts = {
    all: slides.length,
    active: slides.filter((s) => s.isActive).length,
    hidden: slides.filter((s) => !s.isActive).length,
  };

  // ✅ bulk toggle all slides
  const toggleAllSlides = async () => {
    try {
      const shouldHideAll = hasAnyActive;

      const targets = slides.filter((s) =>
        shouldHideAll ? s.isActive : !s.isActive
      );

      await Promise.all(
        targets.map((s) =>
          fetch(`${API_URL}/admin/sliders/${s._id}/toggle`, {
            method: "PATCH",
            credentials: "include",
          })
        )
      );

      toast.success(
        shouldHideAll ? "✅ All slides hidden" : "✅ All slides active"
      );
      fetchSlides();
    } catch (e) {
      console.error(e);
      toast.error("❌ Bulk toggle failed");
    }
  };

  // ✅ FILTERED SLIDES
  const filteredSlides =
    filter === "all"
      ? slides
      : slides.filter((s) => (filter === "active" ? s.isActive : !s.isActive));

  // ✅ Skeleton UI
  if (pageLoading) {
    return (
      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="h-7 w-32 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-9 w-56 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
        <SliderPanelSkeleton count={8} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Toaster position="top-right" />

      {/* ===================== HEADER ===================== */}
      <ListToolbar
        title="Sliders"
        subtitle={`${counts.all ?? 0} total · ${counts.active ?? 0} active`}
        addLabel="Add Slide"
        onAdd={() => {
          setEditSlide(null);
          setShowModal(true);
        }}
        filter={filter}
        onFilterChange={setFilter}
        counts={counts}
        showBulk={slides.length > 0}
        hasAnyActive={hasAnyActive}
        onToggleAll={toggleAllSlides}
        extra={
          slides.length > 0 && (
            <button
              type="button"
              onClick={() => setDeleteAllModal(true)}
              className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold whitespace-nowrap border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 active:scale-[0.97] transition-all"
            >
              <Trash2 size={14} />
              Delete All
            </button>
          )
        }
      />

      {/* ===================== SLIDES GRID ===================== */}
      {filteredSlides.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-slate-400 py-10">No slides found.</div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-stretch">
          {filteredSlides.map((s) => (
            <div
              key={s._id}
              className={`border border-gray-200 dark:border-slate-700 rounded-xl p-3 shadow-sm flex flex-col h-full transition ${
                s.isActive ? "bg-white dark:bg-slate-900" : "bg-gray-50 dark:bg-slate-800 opacity-70 grayscale"
              }`}
            >
              <div className="aspect-[3/1] bg-gray-100 dark:bg-slate-700 rounded-lg overflow-hidden relative">
                {s.src ? (
                  <img
                    src={s.src}
                    alt={s.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="h-full grid place-items-center text-gray-400 dark:text-slate-500 text-sm">
                    No Image
                  </div>
                )}

                {!s.isActive && (
                  <span className="absolute top-2 left-2 text-[11px] bg-gray-800/70 text-white px-2 py-0.5 rounded">
                    Hidden
                  </span>
                )}
              </div>

              <div className="flex flex-col flex-1 mt-2">
                <h2
                  className={`font-semibold truncate min-h-[24px] ${
                    s.isActive ? "text-gray-900 dark:text-slate-100" : "text-gray-500 dark:text-slate-400"
                  }`}
                >
                  {s.title || "No Title"}
                </h2>

                <p
                  className={`text-xs truncate min-h-[18px] ${
                    s.isActive ? "text-gray-500 dark:text-slate-400" : "text-gray-400 dark:text-slate-500"
                  }`}
                >
                  {s.href || "No link"}
                </p>

                <div className="flex justify-between items-center mt-2 min-h-[28px]">
                  <span className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 px-2 py-0.5 rounded">
                    Serial No: {s.order ?? 1}
                  </span>

                  <button
                    onClick={() => handleToggle(s._id)}
                    className={`text-xs px-2 py-0.5 rounded ${
                      s.isActive
                        ? "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400"
                        : "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300"
                    }`}
                  >
                    {s.isActive ? "Active" : "Hidden"}
                  </button>
                </div>

                <div className="mt-auto pt-3 flex gap-2">
                  <button
                    onClick={() => {
                      setEditSlide(s);
                      setShowModal(true);
                    }}
                    className="flex-1 bg-yellow-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => confirmDelete(s)}
                    className="flex-1 bg-red-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ✅ Add/Edit Modal */}
      <AddSlideModal
        showModal={showModal}
        closeModal={() => {
          setShowModal(false);
          setEditSlide(null);
        }}
        onSubmit={handleSave}
        loading={savingId === (editSlide?._id || "new")}
        editId={editSlide?._id || null}
        initialData={editSlide}
        slidesLength={slides.length}
        processSliderImage={(file) =>
          resizeToWebP_1500x500(
            file,
            SLIDER_IMAGE_RULE.width,
            SLIDER_IMAGE_RULE.height,
            SLIDER_IMAGE_RULE.maxBytes
          )
        }
      />

      {/* ✅ Single DELETE POPUP */}
      {deleteModal && (
        <ModalShell
          title="Delete Slide"
          subtitle="Ei kaj ti ar undo kora jabe na"
          icon={<Trash2 size={20} className="text-red-600" />}
          maxWidth="sm:max-w-sm"
          onClose={() => !deleting && setDeleteModal(null)}
          footer={
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
              <button onClick={() => setDeleteModal(null)} disabled={deleting} className="h-11 sm:h-10 px-5 rounded-xl border border-gray-200 dark:border-slate-700 text-sm font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="h-11 sm:h-10 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-sm active:scale-[0.98] transition disabled:opacity-60">{deleting ? "Deleting..." : "Delete"}</button>
            </div>
          }
        >
          <p className="text-sm text-gray-700 dark:text-slate-300">
            আপনি কি নিশ্চিত <span className="font-semibold">{deleteModal.title || "this slide"}</span> ডিলিট করতে চান?
          </p>
        </ModalShell>
      )}

      {/* ✅ DELETE ALL POPUP */}
      {deleteAllModal && (
        <ModalShell
          title="Delete ALL Slides"
          subtitle="Shob slide muche jabe"
          icon={<Trash2 size={20} className="text-red-600" />}
          maxWidth="sm:max-w-sm"
          onClose={() => !deletingAll && setDeleteAllModal(false)}
          footer={
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
              <button onClick={() => setDeleteAllModal(false)} disabled={deletingAll} className="h-11 sm:h-10 px-5 rounded-xl border border-gray-200 dark:border-slate-700 text-sm font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition">Cancel</button>
              <button onClick={handleDeleteAll} disabled={deletingAll} className="h-11 sm:h-10 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-sm active:scale-[0.98] transition disabled:opacity-60">{deletingAll ? "Deleting..." : "Delete All"}</button>
            </div>
          }
        >
          <p className="text-sm text-gray-700 dark:text-slate-300">
            আপনি কি নিশ্চিত সবগুলো স্লাইড ডিলিট করতে চান?
            <br />
            <span className="font-semibold text-red-600 dark:text-red-400">(এই কাজটি করলে কোন স্লাইড থাকবে না)</span>
          </p>
        </ModalShell>
      )}
    </div>
  );
}
