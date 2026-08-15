"use client";

import { useEffect } from "react";

export default function HeaderSerialStatus({
  product,
  form,
  setForm,
  maxSerial, // সাধারণত productsLength
}) {
  const safeMax = Number(maxSerial ?? 0);

  // ✅ new product -> default serial = last (max+1)
  // ✅ edit product -> keep existing serial
  useEffect(() => {
    if (!product) {
      const last = safeMax + 1;

      // শুধু তখনই সেট করবে যখন order নেই/invalid বা last থেকে বড়/ছোট mismatch
      setForm((p) => {
        const current = Number(p?.order ?? 0);
        if (current >= 1 && current <= last) return p; // already valid
        return { ...p, order: last };
      });
    }
  }, [product, safeMax, setForm]);

  // ✅ options: edit -> max পর্যন্ত, add -> max+1 পর্যন্ত
  const totalOptions = product ? safeMax : safeMax + 1;

  return (
    <>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
          {product ? "✏ Edit Product" : "🛍 Add Product"}
        </h1>
      </div>

      <div className="bg-gray-50 dark:bg-slate-800 rounded p-4 grid grid-cols-2 gap-3 mt-4">
        <div>
          <label className="text-sm font-semibold block mb-1 text-gray-700 dark:text-slate-300">Serial</label>

          <select
            value={Number(form.order ?? safeMax + 1)}
            onChange={(e) =>
              setForm((p) => ({ ...p, order: Number(e.target.value) }))
            }
            className="w-full border border-gray-300 dark:border-slate-600 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/30 outline-none bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 transition-all"
          >
            {Array.from({ length: totalOptions }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-1">
            {product ? "Current position" : "Automatically set to last"}
          </p>
        </div>

        <div>
          <label className="text-sm font-semibold block mb-1 text-gray-700 dark:text-slate-300">Status</label>

          <select
            value={form.isActive ? "active" : "hidden"}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                isActive: e.target.value === "active",
              }))
            }
            className={`w-full border p-2.5 rounded-lg focus:ring-2 outline-none transition-all ${
              form.isActive
                ? "border-green-200 dark:border-green-500/20 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 focus:ring-green-100 dark:focus:ring-green-500/20"
                : "border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 focus:ring-red-100 dark:focus:ring-red-500/20"
            }`}
          >
            <option value="active">Active</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>
      </div>
    </>
  );
}
