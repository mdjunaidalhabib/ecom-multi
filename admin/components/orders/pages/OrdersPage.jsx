"use client";

import { useState } from "react";
import { Toaster } from "react-hot-toast";
import useOrders from "../../../hooks/useOrders";

import OrdersGrid from "../ordersGrid/OrdersGrid";
import OrdersTable from "../ordersTable/OrdersTable";
import EditOrderModal from "../modals/EditOrderModal";
import CreateOrderModal from "../modals/CreateOrderModal";
import OrdersSkeleton from "../../Skeleton/OrdersSkeleton";
import Toast from "../../Toast";
import Pagination from "../../Pagination";

import ConfirmModal from "../modals/ConfirmModal";
import AlertModal from "../modals/AlertModal";

export default function OrdersPage() {
  const API = "/api";

  const {
    filtered,
    loading,
    fetchOrders,

    page,
    setPage,
    total,
    totalPages,

    saleChannel,
    setSaleChannel,

    search,
    setSearch,
    searching,

    counts,
    fetchCounts,

    deleting,
    handleDelete,

    toast,
    setToast,
    alertBox,
    setAlertBox,

    updateStatus,
    updateManyStatus,
    deleteMany,
    sendCourierDirect,
    sendCourierMany,

    createOrder,
    creating,

    confirm,
    setConfirm,
  } = useOrders(API);

  // ✅ Status tab — lifted up (shared by OrdersGrid + OrdersTable) so the
  // heading count and status-tab badges can all read the same value
  const [tabStatus, setTabStatus] = useState("");

  // ✅ বর্তমান পেজে (max ২০টা) যতগুলো অর্ডার আসলে দেখা যাচ্ছে তার হিসাব —
  // counts.filteredTotal/byStatus সব পেজ মিলিয়ে গ্লোবাল টোটাল (ট্যাব badge-এর
  // জন্য ঠিক আছে), কিন্তু হেডিং-এর "Showing" এ বর্তমান পেজের actual count দরকার
  const showingCount = tabStatus
    ? filtered.filter((o) => o.status === tabStatus).length
    : filtered.length;

  // ✅ Edit modal state
  const [open, setOpen] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // ✅ Create modal state
  const [createOpen, setCreateOpen] = useState(false);

  const [form, setForm] = useState({
    status: "pending",
    paymentMethod: "cod",
    trackingId: "",
    cancelReason: "",
    discount: 0, // ✅ added
    deliveryCharge: 0,
    billing: { name: "", phone: "", address: "" },
    items: [],
  });

  /* =======================
     🗑 DELETE CONFIRM
     ======================= */
  const confirmDelete = (order) => {
    setConfirm({
      title: "Delete Order",
      message: "আপনি কি নিশ্চিত এই order টি delete করতে চান?",
      danger: true,
      loading: deleting,
      onConfirm: () => handleDelete(order),
    });
  };

  /* =======================
     ✏️ EDIT ORDER
     ======================= */
  const openEdit = (order) => {
    // ✅ Debug (remove later if you want)
    // console.log("EDIT ORDER:", order);

    setCurrentId(order._id);
    setForm({
      status: order.status,
      paymentMethod: order.paymentMethod,
      trackingId: order.trackingId || "",
      cancelReason: order.cancelReason || "",
      discount: Number(order.discount || 0), // ✅ important
      deliveryCharge: Number(order.deliveryCharge || 0),
      billing: order.billing,
      items: (order.items || []).map((it) => ({ ...it })),
    });
    setOpen(true);
  };

  /* =======================
     💾 UPDATE ORDER
     ======================= */
  const updateOrder = async (updatedForm) => {
    try {
      const res = await fetch(`${API}/admin/orders/${currentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedForm),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Update failed");

      fetchOrders();
      setToast({ message: "✅ Order updated successfully!", type: "success" });

      return { success: true };
    } catch (err) {
      setToast({ message: err.message, type: "error" });
      return { success: false };
    }
  };

  /* =======================
     ✅ CREATE ORDER
     Actual request lives in useOrders (queue-serialized); this just
     closes the modal once it resolves. Errors already toast inside
     createOrder, so the modal stays open on failure for the admin to retry.
     ======================= */
  const handleCreateOrder = async (payload) => {
    await createOrder(payload);
    setCreateOpen(false);
  };

  return (
    <div className="flex flex-col h-full min-h-0 gap-2 px-2 sm:px-4">
      {/* TOP BAR */}
      <div className="flex items-center justify-between flex-wrap gap-2 shrink-0">
        <div className="flex items-baseline gap-2">
          <h1 className="text-base font-bold text-gray-900 dark:text-slate-100">Orders</h1>
          <span className="text-xs text-gray-500 dark:text-slate-400">
            Showing: <span className="font-semibold text-gray-700 dark:text-slate-300">{showingCount}</span>
          </span>
        </div>

        <div className="flex gap-2">
          {/* ✅ NEW ORDER BUTTON */}
          <button
            onClick={() => setCreateOpen(true)}
            className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-semibold"
          >
            + New Order
          </button>

          <button
            onClick={() => {
              fetchOrders();
              fetchCounts();
            }}
            className="bg-gray-700 text-white px-3 py-1.5 rounded text-xs font-semibold"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* ✅ SALE CHANNEL FILTER */}
      <div className="flex items-center gap-1.5 shrink-0">
        {[
          { key: "", label: "All", count: counts.total, active: "bg-indigo-600 border-indigo-600" },
          { key: "online", label: "🌐 Online", count: counts.bySaleChannel?.online ?? 0, active: "bg-blue-600 border-blue-600" },
          { key: "offline", label: "🏬 Offline", count: counts.bySaleChannel?.offline ?? 0, active: "bg-purple-600 border-purple-600" },
        ].map((c) => (
          <button
            key={c.key}
            onClick={() => setSaleChannel(c.key)}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition ${
              saleChannel === c.key
                ? `${c.active} text-white`
                : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
            }`}
          >
            {c.label} ({c.count})
          </button>
        ))}
      </div>

      {loading ? (
        <OrdersSkeleton />
      ) : (
        <>
          {/* ✅ এই wrapper-ই একমাত্র scroll করে — TopBar/Filter উপরে আর
          Pagination নিচে সবসময় দেখা যাবে, আলাদা করে page scroll করে
          পেজিনেশন পর্যন্ত পৌঁছাতে হবে না */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <OrdersGrid
              orders={filtered}
              tabStatus={tabStatus}
              setTabStatus={setTabStatus}
              statusCount={counts.byStatus}
              allCount={counts.filteredTotal}
              onEdit={openEdit}
              onDelete={confirmDelete}
              onStatusChange={updateStatus}
              onSendCourier={sendCourierDirect}
              onBulkStatusChange={updateManyStatus}
              onBulkDelete={deleteMany}
              onBulkSendCourier={sendCourierMany}
            />

            <OrdersTable
              orders={filtered}
              tabStatus={tabStatus}
              setTabStatus={setTabStatus}
              statusCount={counts.byStatus}
              search={search}
              setSearch={setSearch}
              searching={searching}
              onEdit={openEdit}
              onDelete={confirmDelete}
              onStatusChange={updateStatus}
              onSendCourier={sendCourierDirect}
              onBulkStatusChange={updateManyStatus}
              onBulkDelete={deleteMany}
              onBulkSendCourier={sendCourierMany}
            />
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={setPage}
          />
        </>
      )}

      {/* ✅ CREATE MODAL */}
      <CreateOrderModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreateOrder}
        submitting={creating}
        API={API}
      />

      {/* EDIT MODAL */}
      <EditOrderModal
        open={open}
        form={form}
        setForm={setForm}
        onSave={() => updateOrder(form)}
        onClose={() => setOpen(false)}
      />

      {/* CONFIRM MODAL */}
      {confirm && (
        <ConfirmModal data={confirm} onClose={() => setConfirm(null)} />
      )}

      {/* ALERT MODAL (actionable errors — order create, etc.) */}
      {alertBox && (
        <AlertModal data={alertBox} onClose={() => setAlertBox(null)} />
      )}

      {/* TOAST */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* ✅ ইনভয়েস PDF ডাউনলোড (OrdersGrid/OrdersTable → downloadInvoicePdf)
      react-hot-toast ব্যবহার করে লোডিং/ক্যানসেল/এরর দেখায় — এই পেজের কোথাও
      react-hot-toast এর <Toaster/> মাউন্ট করা ছিল না বলে সেই toast কল
      আগে সাইলেন্টলি কিছুই দেখাতো না। */}
      <Toaster position="top-right" />
    </div>
  );
}
