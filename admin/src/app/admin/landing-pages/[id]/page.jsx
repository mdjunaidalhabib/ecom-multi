"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  GripVertical,
  ImageOff,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import Toast from "../../../../../components/Toast";
import ConfirmModal from "../../../../../components/ConfirmModal";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const inputBase =
  "w-full mt-1 border rounded-md p-2.5 sm:p-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500";
const textareaBase = `${inputBase} min-h-[90px]`;

const SECTION_TYPE_LABELS = {
  feature: "✨ ফিচার/বেনিফিট",
  testimonial: "💬 টেস্টিমোনিয়াল",
  faq: "❓ প্রশ্ন-উত্তর",
  richtext: "📄 ফ্রি-টেক্সট",
};

const MAX_HERO_IMAGES = 5;

function Skeleton() {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-24 bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse" />
      ))}
    </div>
  );
}

function Section({ title, hint, children }) {
  return (
    <div className="border dark:border-slate-700 rounded-xl p-4 sm:p-5 bg-white dark:bg-slate-900 space-y-4">
      <div>
        <h3 className="font-bold text-gray-800 dark:text-slate-200">{title}</h3>
        {hint && <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-600 dark:text-slate-400">{label}</label>
      {children}
    </div>
  );
}

function SortableItem({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-1 top-2 p-1.5 rounded touch-none z-10 text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-grab active:cursor-grabbing"
        title="ড্র্যাগ করে ক্রম বদলান"
      >
        <GripVertical size={16} />
      </div>
      <div className="pl-6">{children}</div>
    </div>
  );
}

const withKeys = (page) => ({
  ...page,
  sections: (page.sections || []).map((s) => ({
    ...s,
    _key: s._id || crypto.randomUUID(),
  })),
});

const stripKeys = (page) => ({
  ...page,
  sections: (page.sections || []).map(({ _key, ...rest }) => rest),
});

export default function LandingPageEditor() {
  const { id } = useParams();
  const router = useRouter();

  const [page, setPage] = useState(null);
  const [originalPage, setOriginalPage] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [toast, setToast] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const showToast = (message, type = "info") => setToast({ message, type });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/landing-pages/${id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "লোড করা যায়নি");
      setProduct(typeof json.productId === "object" ? json.productId : null);
      const keyed = withKeys(json);
      setPage(keyed);
      setOriginalPage(structuredClone(keyed));
    } catch (err) {
      showToast(`❌ ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const update = (path, value) => {
    setPage((prev) => {
      const next = structuredClone(prev);
      const keys = path.split(".");
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const updateSection = (index, field, value) => {
    setPage((prev) => {
      const next = structuredClone(prev);
      next.sections[index][field] = value;
      return next;
    });
  };

  const addSection = () => {
    setPage((prev) => {
      const next = structuredClone(prev);
      next.sections = [
        ...(next.sections || []),
        {
          type: "feature",
          heading: "",
          content: "",
          authorName: "",
          rating: 5,
          _key: crypto.randomUUID(),
        },
      ];
      return next;
    });
  };

  const removeSection = (index) => {
    setPage((prev) => {
      const next = structuredClone(prev);
      next.sections = next.sections.filter((_, i) => i !== index);
      return next;
    });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!active || !over || active.id === over.id) return;
    setPage((prev) => {
      const next = structuredClone(prev);
      const oldIndex = next.sections.findIndex((s) => s._key === active.id);
      const newIndex = next.sections.findIndex((s) => s._key === over.id);
      if (oldIndex < 0 || newIndex < 0) return prev;
      next.sections = arrayMove(next.sections, oldIndex, newIndex);
      return next;
    });
  };

  const removeHeroImage = (url) => {
    setPage((prev) => ({
      ...prev,
      heroImages: (prev.heroImages || []).filter((u) => u !== url),
    }));
  };

  const handleHeroUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;

    const room = MAX_HERO_IMAGES - (page.heroImages?.length || 0);
    if (room <= 0) {
      showToast(`⚠ সর্বোচ্চ ${MAX_HERO_IMAGES}টি hero image রাখা যাবে`, "error");
      return;
    }

    setUploadingHero(true);
    try {
      const formData = new FormData();
      files.slice(0, room).forEach((f) => formData.append("images", f));
      const res = await fetch(`/api/admin/landing-pages/${id}/hero-images`, {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "আপলোড ব্যর্থ");
      const keyed = withKeys(json.page);
      setPage(keyed);
      setOriginalPage((prev) => ({ ...structuredClone(prev), heroImages: keyed.heroImages }));
      showToast("✅ Hero image আপলোড হয়েছে", "success");
    } catch (err) {
      showToast(`❌ ${err.message}`, "error");
    } finally {
      setUploadingHero(false);
    }
  };

  const hasChanges =
    !!page && !!originalPage && JSON.stringify(page) !== JSON.stringify(originalPage);

  const handleSave = async () => {
    if (!page.headline?.trim()) {
      showToast("❌ Headline আবশ্যক", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/landing-pages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stripKeys(page)),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "সংরক্ষণ ব্যর্থ");
      const keyed = withKeys(json.page);
      setPage(keyed);
      setOriginalPage(structuredClone(keyed));
      showToast("✅ ল্যান্ডিং পেজ সংরক্ষণ হয়েছে", "success");
    } catch (err) {
      showToast(`❌ ${err.message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setPage(structuredClone(originalPage));
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/landing-pages/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      router.push("/admin/landing-pages");
    } catch {
      showToast("❌ ডিলিট করা যায়নি", "error");
      setDeleting(false);
    }
  };

  if (loading) return <Skeleton />;
  if (!page) return null;

  const sections = page.sections || [];
  const heroImages = page.heroImages || [];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-5 pb-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between flex-wrap gap-2">
        <button
          onClick={() => router.push("/admin/landing-pages")}
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200"
        >
          <ArrowLeft size={16} /> সব ল্যান্ডিং পেজ
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCancel}
            disabled={!hasChanges}
            className="text-xs font-semibold px-3 py-2 rounded-md border dark:border-slate-600 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ✖️ বাতিল
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="text-xs font-semibold px-3 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "সংরক্ষণ হচ্ছে..." : "💾 Save"}
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="text-xs font-semibold px-3 py-2 rounded-md border dark:border-slate-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
          >
            <Trash2 size={14} className="inline -mt-0.5 mr-1" /> Delete
          </button>
        </div>
      </div>

      {product && (
        <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl p-3">
          <span className="relative h-12 w-12 rounded-lg overflow-hidden border dark:border-slate-600 bg-white dark:bg-slate-700 shrink-0">
            {product.image ? (
              <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-gray-300 dark:text-slate-500">
                <ImageOff size={16} />
              </span>
            )}
          </span>
          <div className="min-w-0">
            <p className="text-xs text-gray-400 dark:text-slate-500">প্রোডাক্ট</p>
            <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 truncate">
              {product.name} — ৳{product.price}
            </p>
          </div>
        </div>
      )}

      {/* Status toggles */}
      <Section title="🚦 স্ট্যাটাস">
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={!!page.isPublished}
              onChange={(e) => update("isPublished", e.target.checked)}
              className="w-4 h-4 accent-green-600"
            />
            Published (কাস্টমাররা দেখতে পাবে)
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={!!page.isPrimary}
              onChange={(e) => update("isPrimary", e.target.checked)}
              className="w-4 h-4 accent-indigo-600"
            />
            Primary — landing-only প্ল্যানে root ডোমেইনে এটাই দেখাবে
          </label>
        </div>
        <Field label="Slug (URL)">
          <input
            value={page.slug}
            onChange={(e) => update("slug", e.target.value.toLowerCase())}
            className={inputBase}
            placeholder="my-product-offer"
          />
        </Field>
      </Section>

      {/* Hero */}
      <Section title="🖼️ Hero" hint="২-৩টা বড় ছবি — প্রোডাক্টের মূল বিজ্ঞাপন ছবি">
        <Field label="Headline">
          <input
            value={page.headline}
            onChange={(e) => update("headline", e.target.value)}
            className={inputBase}
          />
        </Field>
        <Field label="Subheadline">
          <input
            value={page.subheadline || ""}
            onChange={(e) => update("subheadline", e.target.value)}
            className={inputBase}
          />
        </Field>

        <div>
          <label className="text-xs font-medium text-gray-600 dark:text-slate-400">
            Hero Images ({heroImages.length}/{MAX_HERO_IMAGES})
          </label>
          <div className="mt-2 grid grid-cols-3 sm:grid-cols-5 gap-2">
            {heroImages.map((url) => (
              <div key={url} className="relative aspect-square rounded-lg overflow-hidden border dark:border-slate-600 group">
                <img src={url} alt="hero" className="w-full h-full object-cover" />
                <button
                  onClick={() => removeHeroImage(url)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="মুছুন"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {heroImages.length < MAX_HERO_IMAGES && (
              <label className="aspect-square rounded-lg border-2 border-dashed dark:border-slate-600 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 text-gray-400 dark:text-slate-500 text-[11px] gap-1">
                {uploadingHero ? (
                  "⏳..."
                ) : (
                  <>
                    <Upload size={16} />
                    Add
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={uploadingHero}
                  className="hidden"
                  onChange={handleHeroUpload}
                />
              </label>
            )}
          </div>
          <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-1">
            মুছে ফেলা ছবি Save করার পরই স্থায়ীভাবে বাদ যাবে — নতুন ছবি সাথে সাথেই আপলোড হয়ে যায়।
          </p>
        </div>
      </Section>

      {/* Sections */}
      <Section title="📑 কন্টেন্ট সেকশন" hint="↕️ বাম পাশের হ্যান্ডেল ধরে ড্র্যাগ করে ক্রম বদলানো যাবে">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sections.map((s) => s._key)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {sections.map((item, i) => (
                <SortableItem key={item._key} id={item._key}>
                  <div className="border dark:border-slate-700 rounded-lg p-3 space-y-2 bg-white dark:bg-slate-800">
                    <div className="flex items-center gap-2">
                      <select
                        value={item.type}
                        onChange={(e) => updateSection(i, "type", e.target.value)}
                        className={`${inputBase} !mt-0 w-auto`}
                      >
                        {Object.entries(SECTION_TYPE_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => removeSection(i)}
                        className="ml-auto text-xs font-semibold px-2.5 py-1.5 rounded-md border dark:border-slate-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                      >
                        🗑️ মুছুন
                      </button>
                    </div>

                    <Field label={item.type === "faq" ? "প্রশ্ন" : "শিরোনাম"}>
                      <input
                        value={item.heading}
                        onChange={(e) => updateSection(i, "heading", e.target.value)}
                        className={inputBase}
                      />
                    </Field>
                    <Field label={item.type === "faq" ? "উত্তর" : "বিবরণ"}>
                      <textarea
                        value={item.content}
                        onChange={(e) => updateSection(i, "content", e.target.value)}
                        className={textareaBase}
                      />
                    </Field>

                    {item.type === "testimonial" && (
                      <div className="grid sm:grid-cols-2 gap-2">
                        <Field label="কাস্টমারের নাম">
                          <input
                            value={item.authorName || ""}
                            onChange={(e) => updateSection(i, "authorName", e.target.value)}
                            className={inputBase}
                          />
                        </Field>
                        <Field label="রেটিং">
                          <div className="flex items-center gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <button
                                key={n}
                                type="button"
                                onClick={() => updateSection(i, "rating", n)}
                                className="text-amber-400"
                              >
                                <Star size={18} fill={n <= (item.rating || 5) ? "currentColor" : "none"} />
                              </button>
                            ))}
                          </div>
                        </Field>
                      </div>
                    )}
                  </div>
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <button
          onClick={addSection}
          className="text-xs font-semibold px-3 py-2 rounded-md border dark:border-slate-600 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
        >
          ➕ নতুন সেকশন যুক্ত করুন
        </button>
      </Section>

      {/* Order form config */}
      <Section title="🛒 অর্ডার ফর্ম">
        <Field label="Order বাটনের টেক্সট">
          <input
            value={page.orderForm?.ctaText || ""}
            onChange={(e) => update("orderForm.ctaText", e.target.value)}
            className={inputBase}
          />
        </Field>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={page.orderForm?.showQuantitySelector !== false}
              onChange={(e) => update("orderForm.showQuantitySelector", e.target.checked)}
              className="w-4 h-4 accent-indigo-600"
            />
            পরিমাণ (Quantity) সিলেক্টর দেখাও
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={!!page.orderForm?.showNote}
              onChange={(e) => update("orderForm.showNote", e.target.checked)}
              className="w-4 h-4 accent-indigo-600"
            />
            নোট (Note) ফিল্ড দেখাও
          </label>
        </div>
      </Section>

      {/* SEO */}
      <Section title="🔍 SEO" hint="ঐচ্ছিক — খালি রাখলে Headline/Subheadline ব্যবহার হবে">
        <Field label="Meta Title">
          <input
            value={page.seo?.metaTitle || ""}
            onChange={(e) => update("seo.metaTitle", e.target.value)}
            className={inputBase}
          />
        </Field>
        <Field label="Meta Description">
          <textarea
            value={page.seo?.metaDescription || ""}
            onChange={(e) => update("seo.metaDescription", e.target.value)}
            className={textareaBase}
          />
        </Field>
      </Section>

      <ConfirmModal
        open={confirmDelete}
        title="ল্যান্ডিং পেজ ডিলিট করবেন?"
        message="এই ল্যান্ডিং পেজ ও এর hero image স্থায়ীভাবে মুছে যাবে। এই কাজটি undo করা যাবে না।"
        confirmText={deleting ? "ডিলিট হচ্ছে..." : "হ্যাঁ, ডিলিট করুন"}
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
