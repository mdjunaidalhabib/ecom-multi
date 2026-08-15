"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "../../../../utils/api";
import Toast from "../../../../components/Toast";

function Skeleton() {
  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-slate-900 shadow rounded-xl mt-10">
      <div className="h-5 w-44 bg-gray-200 dark:bg-slate-700 rounded mb-6 animate-pulse" />
      <div className="h-4 w-20 bg-gray-200 dark:bg-slate-700 rounded mb-2 animate-pulse" />
      <div className="h-10 w-full bg-gray-200 dark:bg-slate-700 rounded mb-5 animate-pulse" />
      <div className="h-10 w-full bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
    </div>
  );
}

const DEFAULT_LABEL = "🚚 ডেলিভারি চার্জ";

export default function AdminDeliveryChargePage() {
  const [fee, setFee] = useState(0);
  const [originalFee, setOriginalFee] = useState(0);

  const [label, setLabel] = useState(DEFAULT_LABEL);
  const [originalLabel, setOriginalLabel] = useState(DEFAULT_LABEL);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState(null);

  // ✅ Read Mode by default
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    apiFetch("/admin/deliveryCharge")
      .then((data) => {
        const loadedFee = Number(data?.fee ?? 0);
        setFee(Number.isFinite(loadedFee) ? loadedFee : 0);
        setOriginalFee(Number.isFinite(loadedFee) ? loadedFee : 0);

        const loadedLabel = data?.label?.trim() || DEFAULT_LABEL;
        setLabel(loadedLabel);
        setOriginalLabel(loadedLabel);
      })
      .catch(() =>
        setToast({
          message: "❌ Failed to load delivery charge!",
          type: "error",
        })
      )
      .finally(() => setLoading(false));
  }, []);

  async function saveFee() {
    if (fee < 0) {
      setToast({ message: "❌ Charge cannot be negative!", type: "error" });
      return;
    }

    if (!label.trim()) {
      setToast({ message: "❌ Text খালি রাখা যাবে না!", type: "error" });
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(
        `/api/admin/deliveryCharge`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fee, label: label.trim() }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      setOriginalFee(fee);
      setOriginalLabel(label.trim());
      setIsEditing(false); // ✅ back to read mode after save
      setToast({ message: "✅ Delivery charge updated!", type: "success" });
    } catch (err) {
      setToast({ message: "❌ Update failed!", type: "error" });
    } finally {
      setSaving(false);
    }
  }

  function cancelEdit() {
    setFee(originalFee);
    setLabel(originalLabel);
    setIsEditing(false);
  }

  const isUnchanged = fee === originalFee && label === originalLabel;

  return (
    <>
      {/* ✅ Toast Render */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* ✅ Loading */}
      {loading ? (
        <Skeleton />
      ) : (
        <div className="max-w-md mx-auto p-6 bg-white dark:bg-slate-900 shadow rounded-xl mt-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold mb-1 text-gray-900 dark:text-slate-100">🚚 Delivery Charge</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Update the delivery charge for all customers.
              </p>
            </div>

            {/* ✅ Toggle Button */}
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm font-semibold text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300"
              >
                ✏️ Edit
              </button>
            ) : (
              <button
                onClick={cancelEdit}
                disabled={saving}
                className="text-sm font-semibold text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 disabled:opacity-50"
              >
                ❌ Cancel
              </button>
            )}
          </div>

          {/* ✅ READ MODE */}
          {!isEditing ? (
            <div className="mt-6">
              <div className="flex items-center justify-between bg-gray-50 dark:bg-slate-800 border dark:border-slate-700 rounded-lg p-2">
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  Charge
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-slate-100">৳ {fee}</span>
              </div>
              <div className="flex items-center justify-between bg-gray-50 dark:bg-slate-800 border dark:border-slate-700 rounded-lg p-2 mt-2">
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Text</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-slate-100 text-right">
                  {label}
                </span>
              </div>
              <p className="mt-3 text-xs text-gray-400 dark:text-slate-500">
                Click <span className="font-semibold">Edit</span> to update.
              </p>
            </div>
          ) : (
            /* ✅ EDIT MODE */
            <div className="mt-6">
              <label className="block mb-4">
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  Charge (৳)
                </span>
                <input
                  type="number"
                  value={fee}
                  min={0}
                  onChange={(e) => setFee(Number(e.target.value))}
                  className="mt-1 w-full border dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </label>

              <label className="block mb-4">
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  Text (checkout পেজে দেখাবে)
                </span>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder={DEFAULT_LABEL}
                  className="mt-1 w-full border dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
                <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">
                  যেমন: &ldquo;🚚 ডেলিভারি চার্জ&rdquo; — checkout পেজে এই টেক্সট ও
                  পাশে চার্জ দেখানো হবে।
                </p>
              </label>

              <button
                onClick={saveFee}
                disabled={saving || isUnchanged}
                className={`w-full text-white py-2 rounded-md font-bold transition ${
                  saving || isUnchanged
                    ? "bg-pink-400 dark:bg-pink-500/40 cursor-not-allowed"
                    : "bg-pink-600 hover:bg-pink-700"
                }`}
              >
                {saving ? "Saving..." : "Save"}
              </button>

              {isUnchanged && (
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-2 text-center">
                  No changes to save.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
