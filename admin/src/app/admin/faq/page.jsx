"use client";
import { useEffect, useState } from "react";
import { GripVertical } from "lucide-react";
import Toast from "../../../../components/Toast";
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

function Skeleton() {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
      ))}
    </div>
  );
}

function Section({ title, hint, children }) {
  return (
    <div className="border rounded-xl p-4 sm:p-5 bg-white space-y-4">
      <div>
        <h3 className="font-bold text-gray-800">{title}</h3>
        {hint && <p className="text-[11px] text-gray-400 mt-0.5">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-600">{label}</label>
      {children}
    </div>
  );
}

const inputBase = "w-full mt-1 border rounded-md p-2.5 sm:p-2 text-sm";
const textareaBase = `${inputBase} min-h-[90px]`;
const disabledCls = "bg-gray-100 text-gray-400 cursor-not-allowed";

// ✅ মাউস দিয়ে ড্র্যাগ করে সাজানোর জন্য generic wrapper — শুধু বাম পাশের
// grip handle drag করা যাবে, ভিতরের input/textarea ক্লিক করলে drag শুরু হবে না
function SortableItem({ id, disabled, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled });

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
        className={`absolute -left-1 top-2 p-1.5 rounded touch-none z-10 ${
          disabled
            ? "text-gray-300 cursor-not-allowed"
            : "text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-grab active:cursor-grabbing"
        }`}
        title="ড্র্যাগ করে ক্রম বদলান"
      >
        <GripVertical size={16} />
      </div>
      <div className="pl-6">{children}</div>
    </div>
  );
}

export default function FaqAdminPage() {
  const [data, setData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [toast, setToast] = useState(null);

  const [isEditMode, setIsEditMode] = useState(false);
  const [activeField, setActiveField] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const showToast = (message, type = "info") => setToast({ message, type });

  // ✅ dnd-kit ও React key এর জন্য প্রতিটা সেকশনে একটা স্থিতিশীল key দরকার
  const withKeys = (obj) => ({
    ...obj,
    sections: (obj.sections || []).map((s) => ({
      ...s,
      _key: s._id || crypto.randomUUID(),
    })),
  });

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/faq`);
      const json = await res.json();
      const keyed = withKeys(json);
      setData(keyed);
      setOriginalData(structuredClone(keyed));
    } catch {
      showToast("❌ Failed to load FAQ data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const update = (path, value) => {
    setData((prev) => {
      const next = structuredClone(prev);
      const keys = path.split(".");
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const updateArrayItem = (arrayKey, index, field, value) => {
    setData((prev) => {
      const next = structuredClone(prev);
      next[arrayKey][index][field] = value;
      return next;
    });
  };

  const addArrayItem = (arrayKey, emptyItem) => {
    setData((prev) => {
      const next = structuredClone(prev);
      next[arrayKey] = [...(next[arrayKey] || []), { ...emptyItem, _key: crypto.randomUUID() }];
      return next;
    });
  };

  const removeArrayItem = (arrayKey, index) => {
    setData((prev) => {
      const next = structuredClone(prev);
      next[arrayKey] = next[arrayKey].filter((_, i) => i !== index);
      return next;
    });
  };

  const handleDragEnd = (arrayKey) => (event) => {
    const { active, over } = event;
    if (!active || !over || active.id === over.id) return;
    setData((prev) => {
      const next = structuredClone(prev);
      const list = next[arrayKey];
      const oldIndex = list.findIndex((it) => it._key === active.id);
      const newIndex = list.findIndex((it) => it._key === over.id);
      if (oldIndex < 0 || newIndex < 0) return prev;
      next[arrayKey] = arrayMove(list, oldIndex, newIndex);
      return next;
    });
  };

  const hasChanges =
    !!data &&
    !!originalData &&
    JSON.stringify(data) !== JSON.stringify(originalData);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/faq`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed");
      const keyed = withKeys(json.faq);
      setData(keyed);
      setOriginalData(structuredClone(keyed));
      setActiveField(null);
      setIsEditMode(false);
      showToast("✅ FAQ পেজ আপডেট হয়েছে", "success");
    } catch (err) {
      showToast(`❌ ${err.message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      const res = await fetch(`/api/admin/faq`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed");
      const keyed = withKeys(json.faq);
      setData(keyed);
      setOriginalData(structuredClone(keyed));
      setActiveField(null);
      showToast("🔄 FAQ পেজ রিসেট হয়েছে", "success");
    } catch (err) {
      showToast(`❌ ${err.message}`, "error");
    } finally {
      setResetting(false);
      setConfirmReset(false);
    }
  };

  const handleEnterEditMode = () => setIsEditMode(true);

  const handleCancelEdit = () => {
    setData(structuredClone(originalData));
    setActiveField(null);
    setIsEditMode(false);
  };

  if (loading) return <Skeleton />;
  if (!data) return null;

  const { pageTitle = "", intro = "", sections = [] } = data;

  const dragDisabled = !isEditMode || activeField !== null;
  const isFieldLocked = (path) =>
    isEditMode && activeField !== null && activeField !== path;
  const fieldDisabled = (path) => !isEditMode || isFieldLocked(path);

  const fieldProps = (path) => ({
    disabled: fieldDisabled(path),
    onFocus: () => setActiveField(path),
    onBlur: () => setActiveField((cur) => (cur === path ? null : cur)),
    className: `${inputBase} ${fieldDisabled(path) ? disabledCls : ""}`,
  });

  const textareaProps = (path) => ({
    ...fieldProps(path),
    className: `${textareaBase} ${fieldDisabled(path) ? disabledCls : ""}`,
  });

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-5 pb-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl md:text-2xl font-bold">❓ FAQ Page</h2>
        <div className="flex items-center gap-2">
          {!isEditMode ? (
            <button
              onClick={handleEnterEditMode}
              className="text-xs font-semibold px-3 py-2 rounded-md border text-indigo-600 hover:bg-indigo-50"
              title="Edit"
            >
              ✏️ Edit
            </button>
          ) : (
            <>
              <button
                onClick={handleCancelEdit}
                className="text-xs font-semibold px-3 py-2 rounded-md border text-gray-600 hover:bg-gray-100"
              >
                ✖️ বাতিল
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !hasChanges}
                className="text-xs font-semibold px-3 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "সংরক্ষণ হচ্ছে..." : "💾 Update"}
              </button>
            </>
          )}
          <button
            onClick={() => setConfirmReset(true)}
            disabled={!isEditMode}
            className="text-xs font-semibold px-3 py-2 rounded-md border text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            🔄 Reset to Default
          </button>
        </div>
      </div>

      {!isEditMode && (
        <div className="text-xs text-gray-500 bg-gray-50 border rounded-md px-3 py-2">
          👁️ Read-only mode — এডিট করতে উপরের ✏️ Edit বাটনে ক্লিক করুন।
        </div>
      )}

      {/* Header */}
      <Section title="🏷️ পেজ শিরোনাম">
        <Field label="পেজ টাইটেল">
          <input
            {...fieldProps("pageTitle")}
            value={pageTitle}
            onChange={(e) => update("pageTitle", e.target.value)}
          />
        </Field>
        <Field label="ভূমিকা / Intro">
          <textarea
            {...textareaProps("intro")}
            value={intro}
            onChange={(e) => update("intro", e.target.value)}
          />
        </Field>
      </Section>

      {/* Sections */}
      <Section
        title="📑 প্রশ্ন-উত্তরসমূহ"
        hint="↕️ বাম পাশের হ্যান্ডেল ধরে মাউস দিয়ে ড্র্যাগ করে ক্রম বদলানো যাবে"
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd("sections")}
        >
          <SortableContext
            items={sections.map((s) => s._key)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {sections.map((item, i) => {
                const headingPath = `sections.${i}.heading`;
                const contentPath = `sections.${i}.content`;
                const cardPaths = [headingPath, contentPath];
                const cardLocked =
                  isEditMode && activeField !== null && !cardPaths.includes(activeField);
                return (
                  <SortableItem key={item._key} id={item._key} disabled={dragDisabled}>
                    <div className="border rounded-lg p-3 space-y-2 bg-white">
                      <Field label="প্রশ্ন (Question)">
                        <input
                          disabled={fieldDisabled(headingPath)}
                          onFocus={() => setActiveField(headingPath)}
                          onBlur={() =>
                            setActiveField((cur) => (cur === headingPath ? null : cur))
                          }
                          className={`${inputBase} ${fieldDisabled(headingPath) ? disabledCls : ""}`}
                          value={item.heading}
                          onChange={(e) => updateArrayItem("sections", i, "heading", e.target.value)}
                        />
                      </Field>
                      <Field label="উত্তর (Answer)">
                        <textarea
                          disabled={fieldDisabled(contentPath)}
                          onFocus={() => setActiveField(contentPath)}
                          onBlur={() =>
                            setActiveField((cur) => (cur === contentPath ? null : cur))
                          }
                          className={`${textareaBase} ${fieldDisabled(contentPath) ? disabledCls : ""}`}
                          value={item.content}
                          onChange={(e) => updateArrayItem("sections", i, "content", e.target.value)}
                        />
                      </Field>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeArrayItem("sections", i)}
                          disabled={!isEditMode || cardLocked}
                          className="text-xs font-semibold px-3 py-1.5 rounded-md border text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          🗑️ এই প্রশ্ন মুছুন
                        </button>
                      </div>
                    </div>
                  </SortableItem>
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
        <button
          onClick={() => addArrayItem("sections", { heading: "", content: "" })}
          disabled={!isEditMode || activeField !== null}
          className="text-xs font-semibold px-3 py-2 rounded-md border text-indigo-600 hover:bg-indigo-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ➕ নতুন প্রশ্ন যুক্ত করুন
        </button>
      </Section>

      {/* Reset confirm modal */}
      {confirmReset && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-5 max-w-sm w-full">
            <p className="font-bold text-gray-800 mb-2">
              FAQ পেজ রিসেট করবেন?
            </p>
            <p className="text-sm text-gray-500 mb-4">
              এখন যা এডিট করা আছে সব মুছে ডিফল্ট কন্টেন্ট ফিরে আসবে। এই কাজটি
              undo করা যাবে না।
            </p>
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
              <button
                onClick={() => setConfirmReset(false)}
                className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100"
              >
                বাতিল
              </button>
              <button
                onClick={handleReset}
                disabled={resetting}
                className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-md text-sm text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {resetting ? "রিসেট হচ্ছে..." : "হ্যাঁ, Reset করুন"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
