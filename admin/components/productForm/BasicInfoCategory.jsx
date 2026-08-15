"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ImageOff } from "lucide-react";
import RichTextEditor from "../RichTextEditor";

export default function BasicInfoCategory({
  form,
  setForm,
  categories = [],
  errors,
  setErrors,
  fullStorefront = true,
}) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  const handleChange = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: null }));
  };

  const selectedIds = Array.isArray(form.categories) ? form.categories : [];
  const selectedCategories = categories.filter((c) =>
    selectedIds.includes(c._id),
  );

  const toggleCategory = (id) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((v) => v !== id)
      : [...selectedIds, id];
    handleChange("categories", next);
  };

  // ✅ বাইরে ক্লিক করলে dropdown বন্ধ হবে
  useEffect(() => {
    const onOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  const inputBase =
    "mt-1 w-full px-4 py-2.5 rounded-xl border focus:outline-none transition-all bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100";
  const ok =
    "border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-500";
  const errClass = "border-red-500 dark:border-red-500/60 bg-red-50 dark:bg-red-500/10 focus:ring-red-100 dark:focus:ring-red-500/30";

  return (
    <section className="bg-white dark:bg-slate-900 rounded-2xl border dark:border-slate-700 p-5 space-y-5 shadow-sm">
      <div className={fullStorefront ? "grid sm:grid-cols-2 gap-5" : "grid gap-5"}>
        {/* প্রোডাক্ট নাম */}
        <div>
          <label className="font-semibold text-gray-700 dark:text-slate-300 text-sm">
            নাম <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <input
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className={`${inputBase} ${errors.name ? errClass : ok}`}
            placeholder="প্রোডাক্ট নাম"
          />
          {errors.name && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
              {errors.name}
            </p>
          )}
        </div>

        {/* ✅ ক্যাটাগরি মাল্টি-সিলেক্ট — কাস্টম ড্রপডাউন, checkbox + ছবি সহ
            (landing-page-only প্ল্যানে (fullStorefront:false) কোনো ক্যাটাগরি
            ব্রাউজিং পেজ নেই বলে এই সিলেক্টর দেখানো হয় না — backend নিজে থেকেই
            hidden default category বসিয়ে দেয়) */}
        {fullStorefront && (
        <div ref={boxRef} className="relative">
          <label className="font-semibold text-gray-700 dark:text-slate-300 text-sm">
            ক্যাটাগরি <span className="text-red-500 dark:text-red-400">*</span>
          </label>

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className={`${inputBase} ${
              errors.categories ? errClass : ok
            } flex items-center justify-between gap-2 cursor-pointer bg-white dark:bg-slate-800 text-left`}
          >
            <span className="flex flex-wrap items-center gap-1.5 min-w-0 py-0.5">
              {selectedCategories.length > 0 ? (
                selectedCategories.map((c) => (
                  <span
                    key={c._id}
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 pl-1 pr-2 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-400"
                  >
                    <span className="relative h-5 w-5 rounded overflow-hidden border dark:border-slate-600 bg-gray-50 dark:bg-slate-700 shrink-0">
                      {c.image ? (
                        <img
                          src={c.image}
                          alt={c.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-gray-300 dark:text-slate-500">
                          <ImageOff size={10} />
                        </span>
                      )}
                    </span>
                    <span className="truncate max-w-[8rem]">{c.name}</span>
                  </span>
                ))
              ) : (
                <span className="text-gray-400 dark:text-slate-500">Select Categories</span>
              )}
            </span>
            <ChevronDown
              size={18}
              className={`text-gray-400 dark:text-slate-500 shrink-0 transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>

          {errors.categories && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
              {errors.categories}
            </p>
          )}

          {/* ✅ Dropdown list — checkbox + প্রতিটা ক্যাটাগরির থাম্বনেইল সহ */}
          {open && (
            <div className="absolute z-30 mt-1 w-full max-h-64 overflow-y-auto rounded-xl border dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg py-1">
              {categories.length === 0 && (
                <div className="px-4 py-3 text-sm text-gray-400 dark:text-slate-500">
                  কোনো ক্যাটাগরি পাওয়া যায়নি
                </div>
              )}

              {categories.map((c) => {
                const isSelected = selectedIds.includes(c._id);
                return (
                  <button
                    key={c._id}
                    type="button"
                    onClick={() => toggleCategory(c._id)}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                      isSelected
                        ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-semibold"
                        : "text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="accent-indigo-600 shrink-0"
                    />
                    <span className="relative h-8 w-8 rounded-lg overflow-hidden border dark:border-slate-600 bg-gray-50 dark:bg-slate-700 shrink-0">
                      {c.image ? (
                        <img
                          src={c.image}
                          alt={c.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-gray-300 dark:text-slate-500">
                          <ImageOff size={14} />
                        </span>
                      )}
                    </span>
                    <span className="truncate">{c.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        )}
      </div>

      {/* ✅ Admin-only ক্রয় মূল্য — এই ফিল্ড কখনোই কাস্টমারকে দেখানো হয় না,
          ব্যাকএন্ডে public API থেকে explicit ভাবে বাদ দেওয়া আছে। শুধু admin
          নিজের profit margin হিসাব করার জন্য এখানে দেখতে পাবে। */}
      <div className="rounded-xl border-2 border-dashed border-amber-300 dark:border-amber-500/40 bg-amber-50/60 dark:bg-amber-500/10 p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-amber-600 dark:text-amber-400">🔒</span>
          <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
            শুধুমাত্র Admin — কাস্টমার দেখতে পাবে না
          </span>
        </div>
        <label className="font-semibold text-gray-700 dark:text-slate-300 text-sm">
          ক্রয় মূল্য (Cost Price)
        </label>
        <input
          type="number"
          value={form.costPrice ?? ""}
          onChange={(e) => handleChange("costPrice", e.target.value)}
          className={`${inputBase} ${ok} max-w-xs`}
          placeholder="যেমন: 450"
          min="0"
        />
        <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 mt-1.5">
          এই দামে আপনি প্রোডাক্টটি কিনেছেন/সংগ্রহ করেছেন — শুধু admin panel এ profit হিসাব করতে দেখা যাবে।
        </p>
      </div>

      <div>
        <label className="font-semibold text-gray-700 dark:text-slate-300 text-sm">
          Description
        </label>
        <div className="mt-1">
          <RichTextEditor
            value={form.description}
            onChange={(html) => handleChange("description", html)}
            placeholder="বিস্তারিত বিবরণ..."
            minHeight={140}
          />
        </div>
      </div>

      <div>
        <label className="font-semibold text-gray-700 dark:text-slate-300 text-sm">
          Additional Info{" "}
          <span className="font-normal text-gray-400 dark:text-slate-500">
            (ওয়ারেন্টি, রিটার্ন পলিসি ইত্যাদি)
          </span>
        </label>
        <div className="mt-1">
          <RichTextEditor
            value={form.additionalInfo}
            onChange={(html) => handleChange("additionalInfo", html)}
            placeholder="অতিরিক্ত তথ্য (বক্স কন্টেন্ট, ওয়ারেন্টি, রিটার্ন পলিসি ইত্যাদি)..."
            minHeight={260}
          />
        </div>
      </div>
    </section>
  );
}
