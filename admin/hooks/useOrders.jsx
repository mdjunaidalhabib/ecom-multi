"use client";
import { useEffect, useRef, useState } from "react";

export default function useOrders(API) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ===============================
     📄 PAGINATION
     =============================== */
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  /* ===============================
     🌐 SALE CHANNEL FILTER (online/offline/"")
     =============================== */
  const [saleChannel, setSaleChannel] = useState("");

  /* ===============================
     🔁 QUEUE
     =============================== */
  const queueRef = useRef(Promise.resolve());

  const enqueue = (task) => {
    // ✅ `result` is the task's own promise — it must resolve/reject exactly
    // as task() does, so callers (e.g. CreateOrderModal awaiting onCreate)
    // can tell success from failure. `queueRef.current` is a *separate*
    // derived promise that swallows rejection only so the queue itself
    // keeps advancing — a failed task must not block the next enqueued one.
    const result = queueRef.current.then(() => task());
    queueRef.current = result.catch(() => {});
    return result;
  };

  /* ===============================
     🔔 TOAST
     =============================== */
  const [toast, setToast] = useState(null);

  /* ===============================
     🚨 ALERT (persistent card — for actionable errors that need more
     than a 2.5s toast, e.g. "delete the old order or fix Settings")
     =============================== */
  const [alertBox, setAlertBox] = useState(null);

  /* ===============================
     ❓ CONFIRM
     =============================== */
  const [confirm, setConfirm] = useState(null);

  /* ===============================
     🗑 DELETE LOADING
     =============================== */
  const [deleting, setDeleting] = useState(false);

  /* ===============================
     ➕ CREATE ORDER LOADING
     =============================== */
  const [creating, setCreating] = useState(false);

  /* ===============================
     Auto hide toast
     =============================== */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  /* ===============================
     Fetch orders
     =============================== */
  const fetchOrders = async (targetPage = page) => {
    try {
      setLoading(true);
      const channelParam = saleChannel ? `&saleChannel=${saleChannel}` : "";
      const res = await fetch(
        `${API}/admin/orders?page=${targetPage}&limit=50${channelParam}`
      );
      const data = await res.json();
      setOrders(Array.isArray(data.orders) ? data.orders : []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setPage(data.page || targetPage);
    } catch {
      setToast({ message: "❌ Failed to load orders", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // ✅ চ্যানেল ফিল্টার বদলালে ১ম পেজ থেকে আবার fetch হবে (প্রথমবার mount-এ skip)
  const isFirstChannelRun = useRef(true);
  useEffect(() => {
    if (isFirstChannelRun.current) {
      isFirstChannelRun.current = false;
      return;
    }
    if (page !== 1) {
      setPage(1);
      return;
    }
    fetchOrders(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saleChannel]);

  /* ===============================
     Update status (single) – SILENT SUPPORT
     =============================== */
  const updateStatus = (id, payload, options = {}) =>
    enqueue(async () => {
      try {
        const res = await fetch(`${API}/admin/orders/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const updated = await res.json();
        if (!res.ok) throw new Error(updated?.error);

        setOrders((prev) =>
          prev.map((o) => (o._id === updated._id ? updated : o))
        );

        if (!options.silent) {
          setToast({ message: "✔ Order updated", type: "success" });
        }

        return updated;
      } catch (err) {
        // ❗ error কখনো silent হবে না
        setToast({
          message: err?.message || "❌ Status update failed",
          type: "error",
        });
        throw err;
      }
    });

  /* ===============================
     Update status (bulk)
     =============================== */
  const updateManyStatus = (ids, payload) =>
    setConfirm({
      title: "Update order status?",
      message: `Change status for ${ids.length} orders.`,
      onConfirm: async () => {
        try {
          const res = await fetch(`${API}/admin/orders/bulk/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ids,
              status: payload.status,
              cancelReason: payload.cancelReason,
            }),
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.error);

          setOrders((prev) =>
            prev.map((o) =>
              data.updated.includes(o._id)
                ? { ...o, status: payload.status }
                : o
            )
          );

          setToast({
            message: `✔ ${data.updated.length} orders updated`,
            type: "success",
          });
        } catch (err) {
          setToast({
            message: err.message || "❌ Bulk update failed",
            type: "error",
          });
        } finally {
          setConfirm(null);
        }
      },
    });

  /* ===============================
     🚚 COURIER (SINGLE) – FINAL & SAFE
     =============================== */
const sendCourierDirect = (order) =>
  enqueue(async () => {
    try {
      if (!order) throw new Error("Invalid order");

      /* 1️⃣ CREATE COURIER ORDER */
      const res = await fetch(`${API}/admin/api/send-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice: order._id,
          name: order.billing?.name,
          phone: order.billing?.phone,
          address: order.billing?.address,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data?.error || data?.message || "Courier sending failed"
        );
      }

      /* 2️⃣ LOCAL STATE SYNC (IMPORTANT) */
      if (data.order) {
        setOrders((prev) =>
          prev.map((o) => (o._id === data.order._id ? data.order : o))
        );
      }

      /* 3️⃣ SUCCESS TOAST */
      setToast({
        message: "🚚 Courier order created & status updated",
        type: "success",
      });

      return data;
    } catch (err) {
      const msg = err?.message?.toLowerCase() || "";

      const friendlyMessage =
        msg.includes("courier") || msg.includes("setting")
          ? "Courier সেটিং পাওয়া যায়নি বা inactive"
          : err.message;

      setToast({
        message: friendlyMessage,
        type: "error",
      });

      throw err;
    }
  });


  /* ===============================
     Courier (bulk)
     =============================== */
  const sendCourierMany = (orders) =>
    setConfirm({
      title: "Send to courier?",
      message: `Send ${orders.length} orders to courier service.`,
      onConfirm: async () => {
        try {
          for (const o of orders) {
            if (o.status !== "ready_to_delivery") continue;
            await sendCourierDirect(o);
          }

          setToast({
            message: "🚚 Orders sent to courier",
            type: "success",
          });
        } catch (err) {
          setToast({
            message: err.message || "❌ Courier sending failed",
            type: "error",
          });
        } finally {
          setConfirm(null);
        }
      },
    });

  /* ===============================
     ➕ CREATE ORDER
     Routed through the same `enqueue` queue as every other mutation so a
     fast double-click can never fire two concurrent POST requests — the
     second click's task simply waits for the first to finish.
     =============================== */
  const createOrder = (payload) =>
    enqueue(async () => {
      try {
        setCreating(true);
        const res = await fetch(`${API}/admin/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Order create failed");

        setToast({ message: "✅ Order created successfully!", type: "success" });
        fetchOrders();
        return data;
      } catch (err) {
        setAlertBox({
          title: "❌ Order create করা যায়নি",
          message: err?.message || "Order create failed",
        });
        throw err;
      } finally {
        setCreating(false);
      }
    });

  /* ===============================
     🗑 DELETE (single)
     =============================== */
  const handleDelete = async (order) => {
    if (!order) return;

    try {
      setDeleting(true);
      const res = await fetch(`${API}/admin/orders/${order._id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      setOrders((prev) => prev.filter((o) => o._id !== order._id));
      setToast({ message: "🗑 Order deleted", type: "success" });
    } catch {
      setToast({ message: "❌ Delete failed", type: "error" });
    } finally {
      setDeleting(false);
      setConfirm(null);
    }
  };

  /* ===============================
     Delete (bulk)
     =============================== */
  const deleteMany = (ids) =>
    setConfirm({
      title: "Delete orders?",
      message: `${ids.length} orders will be permanently deleted.`,
      danger: true,
      confirmText: "Delete",
      onConfirm: async () => {
        try {
          const res = await fetch(`${API}/admin/orders/bulk/delete`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids }),
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.error);

          setOrders((prev) => prev.filter((o) => !ids.includes(o._id)));
          setToast({
            message: `🗑 ${data.deletedCount} orders deleted`,
            type: "success",
          });
        } catch (err) {
          setToast({
            message: err.message || "❌ Bulk delete failed",
            type: "error",
          });
        } finally {
          setConfirm(null);
        }
      },
    });

  /* ===============================
     RETURN
     =============================== */
  return {
    filtered: orders,
    loading,
    fetchOrders,

    // pagination
    page,
    setPage,
    total,
    totalPages,

    // channel filter
    saleChannel,
    setSaleChannel,

    // status
    updateStatus,
    updateManyStatus,

    // courier
    sendCourierDirect,
    sendCourierMany,

    // delete
    handleDelete,
    deleteMany,
    deleting,

    // create
    createOrder,
    creating,

    // ui
    toast,
    setToast,
    alertBox,
    setAlertBox,
    confirm,
    setConfirm,
  };
}
