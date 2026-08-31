"use client";

import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "../../../../utils/api";
import Toast from "../../../../components/Toast";
import ConfirmDialog from "../../../../components/ConfirmDialog";
import Pagination from "../../../../components/Pagination";
import RequireFeature from "../../../../components/RequireFeature";
import { formatDateTime } from "../../../../lib/utils";

/* =========================================================
   ✅ Small skeleton for initial loading
========================================================= */
function RowsSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-16 bg-gray-100 dark:bg-slate-700 rounded-xl animate-pulse" />
      ))}
    </div>
  );
}

/* =========================================================
   ✅ Copy-to-clipboard button (used for TrxID etc.)
========================================================= */
function CopyButton({ value, showToast }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy(e) {
    e.stopPropagation();
    if (!value || value === "—") return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        // fallback for older/insecure contexts
        const ta = document.createElement("textarea");
        ta.value = value;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }

      setCopied(true);
      showToast?.("✅ TrxID কপি হয়েছে!", "success");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      showToast?.("❌ Copy করা যায়নি!", "error");
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={!value || value === "—"}
      title="Copy TrxID"
      className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border transition ${
        copied
          ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/20"
          : "bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700"
      } disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {copied ? "Copied ✓" : "Copy"}
    </button>
  );
}

/* =========================================================
   ✅ TAB 1: Pending Verification Queue
========================================================= */
function PendingVerificationTab({ showToast }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // { orderId, status, label }

  const load = useCallback(() => {
    setLoading(true);
    apiFetch("/admin/payments/pending")
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => showToast("❌ Pending payment লোড করা যায়নি!", "error"))
      .finally(() => setLoading(false));
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(orderId, paymentStatus) {
    setBusyId(orderId);
    try {
      await apiFetch(`/admin/payments/${orderId}/verify`, {
        method: "PATCH",
        body: JSON.stringify({ paymentStatus }),
      });

      setOrders((prev) => prev.filter((o) => o._id !== orderId));
      showToast(
        paymentStatus === "paid"
          ? "✅ Payment Verified হয়েছে!"
          : "❌ Payment Rejected করা হয়েছে!",
        paymentStatus === "paid" ? "success" : "error",
      );
    } catch (err) {
      showToast(`❌ ${err?.message || "আপডেট ব্যর্থ হয়েছে!"}`, "error");
    } finally {
      setBusyId(null);
      setConfirmAction(null);
    }
  }

  if (loading) return <RowsSkeleton />;

  if (!orders.length) {
    return (
      <div className="text-center py-16 text-gray-400 dark:text-slate-500">
        <p className="text-3xl mb-2">🎉</p>
        <p className="text-sm font-medium">
          Verify করার মতো কোনো Pending Payment নেই।
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {orders.map((o) => (
          <div
            key={o._id}
            className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-gray-800 dark:text-slate-200">
                  #{o.orderNumber}
                </span>
                <span className="text-[10px] font-bold uppercase bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-100 dark:border-pink-500/20 px-2 py-0.5 rounded-full">
                  {o.paymentMethod}
                </span>
                <span className="text-xs text-gray-500 dark:text-slate-400">
                  {o.billing?.name} · {o.billing?.phone}
                </span>
              </div>

              <div className="text-xs text-gray-600 dark:text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
                <span>
                  Sender:{" "}
                  <b className="text-gray-800 dark:text-slate-200">
                    {o.paymentDetails?.senderNumber || "—"}
                  </b>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  TrxID:{" "}
                  <b className="text-gray-800 dark:text-slate-200 tracking-wide">
                    {o.paymentDetails?.transactionId || "—"}
                  </b>
                  <CopyButton
                    value={o.paymentDetails?.transactionId}
                    showToast={showToast}
                  />
                </span>
                <span>
                  Amount: <b className="text-gray-800 dark:text-slate-200">৳{o.deliveryCharge}</b>
                </span>
              </div>

              <p className="text-[10px] text-gray-400 dark:text-slate-500">
                {formatDateTime(o.createdAt)}
              </p>
            </div>

            <div className="flex gap-2 md:shrink-0">
              <button
                disabled={busyId === o._id}
                onClick={() =>
                  setConfirmAction({
                    orderId: o._id,
                    status: "failed",
                    label: `অর্ডার #${o.orderNumber} এর payment Reject করবেন?`,
                  })
                }
                className="flex-1 md:flex-none px-3 py-2 text-xs font-bold rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 disabled:opacity-50"
              >
                ❌ Reject
              </button>
              <button
                disabled={busyId === o._id}
                onClick={() =>
                  setConfirmAction({
                    orderId: o._id,
                    status: "paid",
                    label: `অর্ডার #${o.orderNumber} এর payment Verify (Paid মার্ক) করবেন?`,
                  })
                }
                className="flex-1 md:flex-none px-3 py-2 text-xs font-bold rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
              >
                {busyId === o._id ? "..." : "✅ Verify"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        show={!!confirmAction}
        title="নিশ্চিত করুন"
        message={confirmAction?.label}
        onCancel={() => setConfirmAction(null)}
        onConfirm={() =>
          confirmAction &&
          updateStatus(confirmAction.orderId, confirmAction.status)
        }
      />
    </>
  );
}

/* =========================================================
   ✅ TAB 3: Verified Payments (Accept/Reject হয়ে যাওয়া গুলো)
   — admin accept করার পরও TrxID এখানে থেকে যায়, 1-click copy করা যায়
========================================================= */
function VerifiedPaymentsTab({ showToast }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // "all" | "paid" | "failed"
  const [showHidden, setShowHidden] = useState(false); // false = normal view, true = "removed" items
  const [busyId, setBusyId] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null); // order pending remove/restore confirm

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter !== "all") params.set("paymentStatus", filter);
    if (showHidden) params.set("hidden", "true");
    params.set("page", page);
    params.set("limit", 50);
    const qs = `?${params.toString()}`;

    apiFetch(`/admin/payments/verified${qs}`)
      .then((data) => {
        setOrders(Array.isArray(data.orders) ? data.orders : []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      })
      .catch(() =>
        showToast("❌ Verified payment history লোড করা যায়নি!", "error"),
      )
      .finally(() => setLoading(false));
  }, [filter, showHidden, page, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  // ✅ Filter/hidden-view বদলালে page 1 এ ফিরিয়ে আনা — নাহলে নতুন
  // ফলাফলে totalPages এর চেয়ে বেশি page নম্বরে আটকে থাকতে পারে
  useEffect(() => {
    setPage(1);
  }, [filter, showHidden]);

  async function setVisibility(orderId, hidden) {
    setBusyId(orderId);
    try {
      // ✅ Order delete/trash করা হচ্ছে না — শুধু এই flag টা টগল হচ্ছে,
      // Order নিজে Orders পেজে ঠিকই থেকে যায়।
      await apiFetch(`/admin/payments/verified/${orderId}/visibility`, {
        method: "PATCH",
        body: JSON.stringify({ hidden }),
      });
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
      showToast(
        hidden
          ? "🗑️ Payments history থেকে সরানো হয়েছে!"
          : "♻️ Payments history-তে ফিরিয়ে আনা হয়েছে!",
        "success",
      );
    } catch (err) {
      showToast(`❌ ${err?.message || "আপডেট ব্যর্থ হয়েছে!"}`, "error");
    } finally {
      setBusyId(null);
      setConfirmTarget(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div className="flex bg-gray-100 dark:bg-slate-800 rounded-lg p-1 w-fit">
          {[
            { key: "all", label: "সব" },
            { key: "paid", label: "✅ Accepted" },
            { key: "failed", label: "❌ Rejected" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${
                filter === t.key
                  ? "bg-white dark:bg-slate-700 shadow text-pink-600 dark:text-pink-400"
                  : "text-gray-500 dark:text-slate-400"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ✅ Removed/hidden items এখান থেকে দেখে আবার Restore করা যাবে */}
        <button
          onClick={() => setShowHidden((v) => !v)}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${
            showHidden
              ? "bg-gray-800 dark:bg-slate-700 text-white border-gray-800 dark:border-slate-600"
              : "bg-white dark:bg-slate-900 text-gray-500 dark:text-slate-400 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800"
          }`}
        >
          {showHidden ? "🗂️ Normal View দেখাও" : "🙈 Removed Items দেখাও"}
        </button>
      </div>

      {loading ? (
        <RowsSkeleton />
      ) : !orders.length ? (
        <div className="text-center py-16 text-gray-400 dark:text-slate-500">
          <p className="text-3xl mb-2">{showHidden ? "🙈" : "📄"}</p>
          <p className="text-sm font-medium">
            {showHidden
              ? "কোনো removed item নেই।"
              : "এখনো কোনো verified payment নেই।"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div
              key={o._id}
              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-gray-800 dark:text-slate-200">
                    #{o.orderNumber}
                  </span>
                  <span className="text-[10px] font-bold uppercase bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-100 dark:border-pink-500/20 px-2 py-0.5 rounded-full">
                    {o.paymentMethod}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                      o.paymentStatus === "paid"
                        ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/20"
                        : "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20"
                    }`}
                  >
                    {o.paymentStatus === "paid" ? "Accepted" : "Rejected"}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-slate-400">
                    {o.billing?.name} · {o.billing?.phone}
                  </span>
                </div>

                <div className="text-xs text-gray-600 dark:text-slate-400 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span>
                    Sender:{" "}
                    <b className="text-gray-800 dark:text-slate-200">
                      {o.paymentDetails?.senderNumber || "—"}
                    </b>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    TrxID:{" "}
                    <b className="text-gray-800 dark:text-slate-200 tracking-wide">
                      {o.paymentDetails?.transactionId || "—"}
                    </b>
                    <CopyButton
                      value={o.paymentDetails?.transactionId}
                      showToast={showToast}
                    />
                  </span>
                  <span>
                    Amount: <b className="text-gray-800 dark:text-slate-200">৳{o.deliveryCharge}</b>
                  </span>
                </div>

                <p className="text-[10px] text-gray-400 dark:text-slate-500">
                  Verified: {formatDateTime(o.updatedAt)}
                </p>
              </div>

              <div className="flex gap-2 md:shrink-0">
                {showHidden ? (
                  <button
                    disabled={busyId === o._id}
                    onClick={() => setVisibility(o._id, false)}
                    className="w-full md:w-auto px-3 py-2 text-xs font-bold rounded-lg bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/20 hover:bg-green-100 dark:hover:bg-green-500/20 disabled:opacity-50"
                  >
                    {busyId === o._id ? "..." : "♻️ Restore"}
                  </button>
                ) : (
                  <button
                    disabled={busyId === o._id}
                    onClick={() => setConfirmTarget(o)}
                    className="w-full md:w-auto px-3 py-2 text-xs font-bold rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 disabled:opacity-50"
                  >
                    {busyId === o._id ? "..." : "🗑️ Remove"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
      />

      <ConfirmDialog
        show={!!confirmTarget}
        title="Remove Verified Payment"
        message={`অর্ডার #${confirmTarget?.orderNumber} এই লিস্ট থেকে সরাতে চান? Order নিজে Orders পেজে ঠিকই থেকে যাবে, শুধু এই Payments history-তে আর দেখা যাবে না — পরে "Removed Items" থেকে আবার Restore করা যাবে।`}
        onCancel={() => setConfirmTarget(null)}
        onConfirm={() =>
          confirmTarget && setVisibility(confirmTarget._id, true)
        }
      />
    </div>
  );
}

/* =========================================================
   ✅ TAB 2: Payment Methods Settings (bKash/Nagad/Rocket etc.)
========================================================= */
const emptyForm = {
  name: "",
  number: "",
  accountType: "personal",
  actionLabel: "Send Money",
  instructions: "",
  active: true,
  order: 0,
};

// ✅ Account type বদলালে একটা reasonable default action suggest করা হয়,
// কিন্তু অ্যাডমিন চাইলে নিজের মতো বদলে দিতে পারবে (এটা শুধু suggestion)
const suggestActionLabel = (accountType) => {
  if (accountType === "merchant") return "Payment";
  if (accountType === "agent") return "Cash Out";
  return "Send Money";
};

function PaymentMethodsTab({ showToast }) {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    apiFetch("/admin/payments/methods")
      .then((data) => setMethods(Array.isArray(data) ? data : []))
      .catch(() => showToast("❌ Payment methods লোড করা যায়নি!", "error"))
      .finally(() => setLoading(false));
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  function startEdit(m) {
    setEditingId(m._id);
    setForm({
      name: m.name || "",
      number: m.number || "",
      accountType: m.accountType || "personal",
      actionLabel: m.actionLabel || "Send Money",
      instructions: m.instructions || "",
      active: !!m.active,
      order: m.order || 0,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function submitForm(e) {
    e.preventDefault();

    if (!form.name.trim() || !form.number.trim()) {
      showToast("⚠️ Method নাম ও নম্বর দিন!", "error");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        const updated = await apiFetch(`/admin/payments/methods/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
        setMethods((prev) =>
          prev.map((m) => (m._id === editingId ? updated : m)),
        );
        showToast("✅ Payment method আপডেট হয়েছে!", "success");
      } else {
        const created = await apiFetch("/admin/payments/methods", {
          method: "POST",
          body: JSON.stringify(form),
        });
        setMethods((prev) => [...prev, created]);
        showToast("✅ নতুন Payment method যোগ হয়েছে!", "success");
      }
      resetForm();
    } catch (err) {
      showToast(`❌ ${err?.message || "সেভ করা যায়নি!"}`, "error");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(m) {
    try {
      const updated = await apiFetch(`/admin/payments/methods/${m._id}`, {
        method: "PUT",
        body: JSON.stringify({ active: !m.active }),
      });
      setMethods((prev) => prev.map((x) => (x._id === m._id ? updated : x)));
    } catch (err) {
      showToast(`❌ ${err?.message || "Status পরিবর্তন করা যায়নি!"}`, "error");
    }
  }

  async function deleteMethod(id) {
    try {
      await apiFetch(`/admin/payments/methods/${id}`, { method: "DELETE" });
      setMethods((prev) => prev.filter((m) => m._id !== id));
      showToast("🗑️ Payment method Trash-এ পাঠানো হয়েছে!", "success");
    } catch (err) {
      showToast(`❌ ${err?.message || "মুছতে ব্যর্থ হয়েছে!"}`, "error");
    } finally {
      setDeleteTarget(null);
    }
  }

  const inputClass =
    "mt-1 w-full p-2 border rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none text-sm focus:ring-2 focus:ring-pink-200 dark:focus:ring-pink-500/30";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Form */}
      <form
        onSubmit={submitForm}
        className="lg:col-span-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-4 space-y-3 h-fit"
      >
        <h3 className="font-bold text-gray-800 dark:text-slate-200 text-sm">
          {editingId ? "✏️ Method এডিট করুন" : "➕ নতুন Method যোগ করুন"}
        </h3>

        <label className="block">
          <span className="text-xs font-medium text-gray-700 dark:text-slate-300">
            নাম * (যেমন: bKash, Nagad, Rocket)
          </span>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className={inputClass}
            placeholder="bKash"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-gray-700 dark:text-slate-300">
            নাম্বার * (Merchant/Personal)
          </span>
          <input
            value={form.number}
            onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))}
            className={inputClass}
            placeholder="01XXXXXXXXX"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-gray-700 dark:text-slate-300">
            Account Type
          </span>
          <select
            value={form.accountType}
            onChange={(e) => {
              const nextType = e.target.value;
              setForm((f) => ({
                ...f,
                accountType: nextType,
                // ✅ অ্যাডমিন যদি এখনো actionLabel হাতে না বদলে থাকে,
                // তাহলে account type অনুযায়ী reasonable default suggest করা হয়
                actionLabel:
                  !editingId ||
                  f.actionLabel === suggestActionLabel(f.accountType)
                    ? suggestActionLabel(nextType)
                    : f.actionLabel,
              }));
            }}
            className={inputClass}
          >
            <option value="personal">Personal</option>
            <option value="merchant">Merchant</option>
            <option value="agent">Agent</option>
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-medium text-gray-700 dark:text-slate-300">
            কাস্টমারকে কোন Action করতে বলবেন? *
          </span>
          <input
            value={form.actionLabel}
            onChange={(e) =>
              setForm((f) => ({ ...f, actionLabel: e.target.value }))
            }
            className={inputClass}
            placeholder="Send Money / Payment / Cash Out"
          />
          <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">
            Personal নাম্বারে সাধারণত "Send Money", Merchant নাম্বারে "Payment",
            Agent নাম্বারে "Cash Out" — checkout পেজে ঠিক এই শব্দটাই কাস্টমারকে
            দেখানো হবে।
          </p>
        </label>

        <label className="block">
          <span className="text-xs font-medium text-gray-700 dark:text-slate-300">
            Instructions (কাস্টমারকে দেখাবে)
          </span>
          <textarea
            value={form.instructions}
            onChange={(e) =>
              setForm((f) => ({ ...f, instructions: e.target.value }))
            }
            className={inputClass}
            placeholder="Send Money অপশনে গিয়ে টাকা পাঠান, তারপর TrxID এখানে দিন।"
          />
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) =>
              setForm((f) => ({ ...f, active: e.target.checked }))
            }
          />
          <span className="text-xs font-medium text-gray-700 dark:text-slate-300">
            Active (checkout-এ দেখাবে)
          </span>
        </label>

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-pink-600 hover:bg-pink-700 text-white text-sm font-bold py-2 rounded-lg disabled:opacity-50"
          >
            {saving ? "Saving..." : editingId ? "Update" : "Add Method"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-3 py-2 text-sm font-bold rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* List */}
      <div className="lg:col-span-3 space-y-3">
        {loading ? (
          <RowsSkeleton />
        ) : !methods.length ? (
          <div className="text-center py-16 text-gray-400 dark:text-slate-500">
            <p className="text-3xl mb-2">💳</p>
            <p className="text-sm font-medium">
              এখনো কোনো Payment Method যোগ করা হয়নি।
            </p>
          </div>
        ) : (
          methods.map((m) => (
            <div
              key={m._id}
              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-gray-800 dark:text-slate-200 text-sm">
                    {m.name}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      m.active
                        ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/20"
                        : "bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500 border border-gray-200 dark:border-slate-600"
                    }`}
                  >
                    {m.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 break-words">
                  {m.number} · {m.accountType} · &ldquo;
                  {m.actionLabel || "Send Money"}&rdquo;
                </p>
              </div>

              <div className="flex items-center flex-wrap gap-2 shrink-0">
                <button
                  onClick={() => toggleActive(m)}
                  className="text-[11px] font-bold text-gray-600 dark:text-slate-300 border border-gray-300 dark:border-slate-600 rounded-md px-2 py-1 hover:bg-gray-50 dark:hover:bg-slate-800"
                >
                  {m.active ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => startEdit(m)}
                  className="text-[11px] font-bold text-pink-600 dark:text-pink-400 border border-pink-300 dark:border-pink-500/30 rounded-md px-2 py-1 hover:bg-pink-50 dark:hover:bg-pink-500/10"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteTarget(m)}
                  className="text-[11px] font-bold text-red-600 dark:text-red-400 border border-red-300 dark:border-red-500/30 rounded-md px-2 py-1 hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        show={!!deleteTarget}
        title="Delete Payment Method"
        message={`"${deleteTarget?.name}" Trash-এ পাঠাতে চান? এটি checkout থেকে সরে যাবে, পরে Trash থেকে Restore করা যাবে।`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMethod(deleteTarget._id)}
      />
    </div>
  );
}

/* =========================================================
   ✅ MAIN PAGE
========================================================= */
function PaymentsPage() {
  const [tab, setTab] = useState("pending"); // "pending" | "methods"
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
  }, []);

  return (
    <div className="max-w-5xl mx-auto">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-slate-100">💳 Payments</h2>

        <div className="grid grid-cols-3 sm:flex gap-1 bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
          <button
            onClick={() => setTab("pending")}
            className={`px-2 sm:px-4 py-2 text-[11px] sm:text-sm font-bold rounded-md transition text-center leading-tight ${
              tab === "pending"
                ? "bg-white dark:bg-slate-700 shadow text-pink-600 dark:text-pink-400"
                : "text-gray-500 dark:text-slate-400"
            }`}
          >
            Pending Verification
          </button>
          <button
            onClick={() => setTab("verified")}
            className={`px-2 sm:px-4 py-2 text-[11px] sm:text-sm font-bold rounded-md transition text-center leading-tight ${
              tab === "verified"
                ? "bg-white dark:bg-slate-700 shadow text-pink-600 dark:text-pink-400"
                : "text-gray-500 dark:text-slate-400"
            }`}
          >
            Verified / TrxID
          </button>
          <button
            onClick={() => setTab("methods")}
            className={`px-2 sm:px-4 py-2 text-[11px] sm:text-sm font-bold rounded-md transition text-center leading-tight ${
              tab === "methods"
                ? "bg-white dark:bg-slate-700 shadow text-pink-600 dark:text-pink-400"
                : "text-gray-500 dark:text-slate-400"
            }`}
          >
            Payment Methods
          </button>
        </div>
      </div>

      {tab === "pending" ? (
        <PendingVerificationTab showToast={showToast} />
      ) : tab === "verified" ? (
        <VerifiedPaymentsTab showToast={showToast} />
      ) : (
        <PaymentMethodsTab showToast={showToast} />
      )}
    </div>
  );
}

export default function PaymentsPageGate() {
  return (
    <RequireFeature feature="payment">
      <PaymentsPage />
    </RequireFeature>
  );
}
