"use client";

import { useEffect, useMemo, useState } from "react";
import {
  X,
  Edit3,
  Wallet,
  Truck,
  Receipt,
  Package,
  User,
  AlertTriangle,
  Minus,
  Plus,
} from "lucide-react";
import Toast from "../../Toast";
import { STATUS_LABEL } from "../shared/constants";

function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-8 w-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
        <Icon size={15} />
      </div>
      <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">
        {title}
      </div>
    </div>
  );
}

export default function EditOrderModal({
  open,
  form,
  setForm,
  onSave,
  onClose,
}) {
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialForm, setInitialForm] = useState(null);

  const [touched, setTouched] = useState({
    name: false,
    phone: false,
    address: false,
    cancelReason: false,
  });

  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (open) {
      setInitialForm(form ? JSON.stringify(form) : null);
      setSubmitted(false);
      setTouched({
        name: false,
        phone: false,
        address: false,
        cancelReason: false,
      });
    }
  }, [open]);

  const isDirty = useMemo(() => {
    if (!initialForm) return false;
    return JSON.stringify(form) !== initialForm;
  }, [form, initialForm]);

  if (!open) return null;

  const showToast = (message, type = "error", ms = 2000) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), ms);
  };

  const handleBillingChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      billing: {
        ...prev.billing,
        [field]: value,
      },
    }));
  };

  const handleDiscountChange = (value) => {
    let num = Number(value);
    if (isNaN(num) || num < 0) num = 0;

    setForm((prev) => {
      // ✅ discount কখনো subtotal + deliveryCharge এর বেশি হতে পারবে না
      // (server-side এর একই ক্ল্যাম্পের সাথে মিলিয়ে)
      const subtotal = (prev.items || []).reduce(
        (sum, it) => sum + Number(it.price || 0) * Number(it.qty || 0),
        0,
      );
      const maxDiscount = subtotal + Number(prev.deliveryCharge || 0);
      if (num > maxDiscount) num = maxDiscount;

      return { ...prev, discount: num };
    });
  };

  const handleDeliveryChargeChange = (value) => {
    let num = Number(value);
    if (isNaN(num) || num < 0) num = 0;

    setForm((prev) => ({
      ...prev,
      deliveryCharge: num,
    }));
  };

  // ✅ শুধু quantity এডিটযোগ্য — product/variant/price বদলানো যায় না
  // (server-side এর সাথে মিলিয়ে, দাম সবসময় product/variant থেকেই আসে)
  const handleItemQtyChange = (idx, nextQty) => {
    const qty = Math.max(1, Math.floor(Number(nextQty) || 1));
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((it, i) => (i === idx ? { ...it, qty } : it)),
    }));
  };

  const itemsSubtotal = (form.items || []).reduce(
    (sum, it) => sum + Number(it.price || 0) * Number(it.qty || 0),
    0,
  );
  const previewTotal = Math.max(
    0,
    itemsSubtotal + Number(form.deliveryCharge || 0) - Number(form.discount || 0),
  );

  const phoneValid = /^(01[3-9]\d{8})$/.test(form?.billing?.phone || "");
  const isCancelled = form.status === "cancelled";

  const errors = {
    name: !form?.billing?.name?.trim(),
    phone: !form?.billing?.phone?.trim() || !phoneValid,
    address: !form?.billing?.address?.trim(),
    cancelReason: isCancelled && !form?.cancelReason?.trim(),
  };

  const fieldClass = (hasError) =>
    `w-full h-11 rounded-2xl border px-4 text-sm font-semibold outline-none transition bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 ${
      hasError
        ? "border-red-400 dark:border-red-500/60 bg-red-50 dark:bg-red-500/10 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-500/30"
        : "border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30"
    }`;

  const areaClass = (hasError) =>
    `w-full rounded-2xl border px-4 py-3 text-sm font-semibold outline-none transition resize-y bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 ${
      hasError
        ? "border-red-400 dark:border-red-500/60 bg-red-50 dark:bg-red-500/10 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-500/30"
        : "border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30"
    }`;

  const labelClass = (hasError) =>
    `block text-xs font-bold uppercase tracking-wide mb-1.5 text-gray-500 dark:text-slate-400 ${
      hasError ? "text-red-600 dark:text-red-400" : ""
    }`;

  const handleSave = async () => {
    setSubmitted(true);

    if (errors.name || errors.phone || errors.address || errors.cancelReason) {
      showToast("⚠️ সব প্রয়োজনীয় তথ্য ঠিকমতো দিন!", "error", 2500);
      return;
    }

    if (!isDirty) {
      showToast("ℹ️ কোনো পরিবর্তন হয়নি!", "error", 1800);
      return;
    }

    setLoading(true);
    try {
      const result = await onSave(form);

      if (result?.success || result === true) {
        onClose();
        showToast("✅ Order updated successfully!", "success", 1500);
      } else {
        showToast("❌ Failed to update order!", "error", 2000);
      }
    } catch (err) {
      console.error(err);
      showToast(`❌ ${err?.message || "Something went wrong while saving!"}`, "error", 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div
        className={`fixed inset-0 z-50 ${
          open ? "flex" : "hidden"
        } items-end sm:items-center justify-center bg-black/60`}
      >
        {/* MOBILE FULL SCREEN / DESKTOP CENTER */}
        <div className="w-full sm:max-w-2xl sm:rounded-3xl bg-gray-50 dark:bg-slate-900 h-[92vh] sm:h-[88vh] overflow-hidden shadow-2xl flex flex-col">
          {/* STICKY HEADER */}
          <div className="shrink-0 overflow-hidden px-4 sm:px-6 py-5 flex items-center justify-between sticky top-0 z-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700">
            <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-14 left-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

            <div className="relative min-w-0 flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center border border-white/20 shrink-0">
                <Edit3 className="text-white" size={19} />
              </div>
              <div className="min-w-0">
                <div className="text-lg sm:text-xl font-semibold text-white truncate">
                  Edit Order
                </div>
                {form.status && (
                  <span className="inline-block mt-0.5 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border bg-white/10 border-white/25 text-white">
                    {STATUS_LABEL?.[form.status] || form.status}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={loading}
              className="relative h-10 w-10 rounded-2xl grid place-items-center bg-white/15 hover:bg-white/25 text-white font-black backdrop-blur transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X size={18} />
            </button>
          </div>

          {/* SCROLL BODY */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6 space-y-4">
              {/* ORDER DETAILS */}
              <div className="rounded-3xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm space-y-3">
                <SectionHeader icon={Wallet} title="Order Details" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass(false)}>Payment Method</label>
                    <select
                      className={fieldClass(false)}
                      value={form.paymentMethod}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          paymentMethod: e.target.value,
                        }))
                      }
                    >
                      <option value="cod">COD</option>
                      <option value="bkash">bKash</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass(false)}>Tracking ID</label>
                    <input
                      className={fieldClass(false)}
                      value={form.trackingId || ""}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          trackingId: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* CHARGES */}
              <div className="rounded-3xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm space-y-3">
                <SectionHeader icon={Receipt} title="Charges" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass(false)}>Delivery Charge (৳)</label>
                    <input
                      type="number"
                      min={0}
                      className={`${fieldClass(false)} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                      value={form.deliveryCharge ?? 0}
                      onWheel={(e) => e.target.blur()}
                      onChange={(e) => handleDeliveryChargeChange(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className={labelClass(false)}>Discount (৳)</label>
                    <input
                      type="number"
                      min={0}
                      className={`${fieldClass(false)} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                      value={form.discount ?? 0}
                      onWheel={(e) => e.target.blur()}
                      onChange={(e) => handleDiscountChange(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* ITEMS (quantity only — product/variant/price fixed) */}
              {(form.items || []).length > 0 && (
                <div className="rounded-3xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm space-y-3">
                  <SectionHeader icon={Package} title="Items" />

                  <div className="space-y-2">
                    {form.items.map((it, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl border border-gray-100 dark:border-slate-700 bg-gray-50/70 dark:bg-slate-900/40 p-2.5 flex items-center gap-3"
                      >
                        <img
                          src={it.image || "/placeholder.png"}
                          className="w-11 h-11 rounded-xl border dark:border-slate-600 object-cover shrink-0"
                          alt=""
                        />

                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold truncate text-gray-900 dark:text-slate-100">
                            {it.name}
                          </p>
                          {it.color && (
                            <p className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 truncate">
                              Color: {it.color}
                            </p>
                          )}
                          <p className="text-[11px] text-gray-500 dark:text-slate-400">
                            ৳{it.price} × {it.qty} = ৳
                            {Number(it.price || 0) * Number(it.qty || 0)}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 p-1">
                          <button
                            type="button"
                            onClick={() => handleItemQtyChange(idx, it.qty - 1)}
                            disabled={it.qty <= 1}
                            className="w-7 h-7 rounded-lg grid place-items-center text-gray-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-700"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="w-6 text-center text-sm font-bold text-gray-900 dark:text-slate-100">
                            {it.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleItemQtyChange(idx, it.qty + 1)}
                            className="w-7 h-7 rounded-lg grid place-items-center text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 px-4 py-3 space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-slate-400">
                      <span>Subtotal</span>
                      <span>৳{itemsSubtotal}</span>
                    </div>
                    <div className="flex justify-between text-base font-black text-blue-700 dark:text-blue-400">
                      <span>Total (preview)</span>
                      <span>৳{previewTotal}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* CANCEL REASON (only if already cancelled) */}
              {isCancelled && (
                <div className="rounded-3xl border border-red-100 dark:border-red-500/20 bg-red-50/60 dark:bg-red-500/5 p-4 shadow-sm space-y-3">
                  <SectionHeader icon={AlertTriangle} title="Cancel Reason" />
                  <div>
                    <label
                      className={labelClass(
                        (submitted || touched.cancelReason) && errors.cancelReason,
                      )}
                    >
                      Reason *
                    </label>
                    <textarea
                      rows={2}
                      className={areaClass(
                        (submitted || touched.cancelReason) && errors.cancelReason,
                      )}
                      value={form.cancelReason || ""}
                      onBlur={() =>
                        setTouched((t) => ({
                          ...t,
                          cancelReason: true,
                        }))
                      }
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          cancelReason: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              )}

              {/* CUSTOMER */}
              <div className="rounded-3xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm space-y-3">
                <SectionHeader icon={User} title="Customer" />

                <div>
                  <label
                    className={labelClass((submitted || touched.name) && errors.name)}
                  >
                    Name *
                  </label>
                  <input
                    className={fieldClass((submitted || touched.name) && errors.name)}
                    value={form.billing.name}
                    onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                    onChange={(e) => handleBillingChange("name", e.target.value)}
                  />
                </div>

                <div>
                  <label
                    className={labelClass(
                      (submitted || touched.phone) && errors.phone,
                    )}
                  >
                    Phone *
                  </label>
                  <input
                    className={fieldClass(
                      (submitted || touched.phone) && errors.phone,
                    )}
                    value={form.billing.phone}
                    onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                    onChange={(e) => handleBillingChange("phone", e.target.value)}
                  />
                  {(submitted || touched.phone) && errors.phone && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      01 দিয়ে শুরু হওয়া 11 ডিজিট নাম্বার দিন
                    </p>
                  )}
                </div>

                <div>
                  <label
                    className={labelClass(
                      (submitted || touched.address) && errors.address,
                    )}
                  >
                    Address *
                  </label>
                  <textarea
                    rows={3}
                    className={areaClass(
                      (submitted || touched.address) && errors.address,
                    )}
                    value={form.billing.address}
                    onBlur={() =>
                      setTouched((t) => ({
                        ...t,
                        address: true,
                      }))
                    }
                    onChange={(e) => handleBillingChange("address", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* STICKY FOOTER */}
          <div className="shrink-0 px-4 sm:px-6 py-3 border-t border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between gap-2 sticky bottom-0 z-20">
            <div className="text-[11px] font-bold text-gray-400 dark:text-slate-500">
              {isDirty ? "Unsaved changes" : "No changes yet"}
            </div>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                disabled={loading}
                className="h-11 px-4 rounded-2xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 font-black text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={loading || !isDirty}
                className={`h-11 px-5 rounded-2xl font-black text-white transition ${
                  loading || !isDirty
                    ? "bg-gray-300 dark:bg-slate-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90"
                }`}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
