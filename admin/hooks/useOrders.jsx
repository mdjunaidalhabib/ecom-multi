"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { FINAL_STATUSES, STATUS_LABEL } from "../components/orders/shared/constants";

const orderLabel = (o) => `#${o?.orderNumber ?? String(o?._id || "").slice(-6)}`;

export default function useOrders(API) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  /* ===============================
     📄 PAGINATION
     =============================== */
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  /* ===============================
     🌐 SALE CHANNEL FILTER (online/offline/wholesale/"")
     =============================== */
  const [saleChannel, setSaleChannelState] = useState("");

  // 🏭 Wholesale-এর "শুধু বাকি আছে" ফিল্টার — শুধু wholesale চ্যানেলে অর্থবহ
  const [dueOnly, setDueOnly] = useState(false);

  // চ্যানেল বদলে wholesale ছাড়া অন্য কিছু হলে due ফিল্টার আপনাআপনি বন্ধ হয়
  const setSaleChannel = (channel) => {
    if (channel !== "wholesale") setDueOnly(false);
    setSaleChannelState(channel);
  };

  /* ===============================
     🏷️ STATUS TAB FILTER (pending/confirmed/shipped/delivered/cancelled/"")
     — server-side, সব পেজ মিলিয়ে ফিল্টার করে (আগে শুধু বর্তমান পেজের ২০টার
     মধ্যে client-side ফিল্টার হতো, ফলে ট্যাবে "Cancelled (3)" দেখালেও লিস্টে
     মাত্র ১টা দেখাতো যদি বাকি ২টা অন্য পেজে থাকতো)
     =============================== */
  const [tabStatus, setTabStatus] = useState("");

  /* ===============================
     🔍 SEARCH — সার্ভার-সাইড, সব পেজ মিলিয়ে খোঁজে (শুধু বর্তমান পেজের
     ২০টার মধ্যে না)। `search` ইনপুটে সাথে সাথে বসে, `debouncedSearch`
     ৪০০ms পর আপডেট হয়ে আসল fetch ট্রিগার করে (প্রতি কি-স্ট্রোকে না)।
     =============================== */
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  /* ===============================
     🔢 TAB COUNTS (accurate totals across ALL pages — not just the
     20 orders currently loaded — for the sale-channel pills & status tabs)
     =============================== */
  const [counts, setCounts] = useState({
    total: 0,
    bySaleChannel: { online: 0, offline: 0, wholesale: 0 },
    filteredTotal: 0,
    byStatus: {},
  });

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
     📝 STATUS ACTION (confirm + কারণ) — StatusActionModal
     =============================== */
  const [actionModal, setActionModal] = useState(null);

  /* ===============================
     ↩️ UNDO SNACKBAR (final status দেওয়ার পর কয়েক সেকেন্ড)
     =============================== */
  const [undoSnack, setUndoSnack] = useState(null);

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
  // ✅ `silent` — সার্চে টাইপ করার সময় ব্যবহার হয়, যাতে পুরো পেজ (এবং তার
  // ভেতরের সার্চ বক্সটাই) `loading` skeleton দিয়ে unmount/remount না হয়ে
  // যায় — নাহলে প্রতি debounce-এ ইনপুট থেকে ফোকাস হারিয়ে যেত।
  const fetchOrders = async (targetPage = page, { silent = false } = {}) => {
    try {
      if (silent) setSearching(true);
      else setLoading(true);

      const channelParam = saleChannel ? `&saleChannel=${saleChannel}` : "";
      const dueParam = dueOnly && saleChannel === "wholesale" ? "&dueOnly=true" : "";
      const statusParam = tabStatus ? `&status=${tabStatus}` : "";
      const searchParam = debouncedSearch
        ? `&search=${encodeURIComponent(debouncedSearch)}`
        : "";
      const res = await fetch(
        `${API}/admin/orders?page=${targetPage}&limit=20${channelParam}${dueParam}${statusParam}${searchParam}`
      );
      const data = await res.json();
      setOrders(Array.isArray(data.orders) ? data.orders : []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setPage(data.page || targetPage);
    } catch {
      setToast({ message: "❌ Failed to load orders", type: "error" });
    } finally {
      if (silent) setSearching(false);
      else setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  /* ===============================
     Fetch tab counts (mount + whenever channel filter changes)
     =============================== */
  const fetchCounts = async () => {
    try {
      const channelParam = saleChannel ? `?saleChannel=${saleChannel}` : "";
      const res = await fetch(`${API}/admin/orders/counts${channelParam}`);
      const data = await res.json();

      if (!res.ok) {
        console.error("❌ /admin/orders/counts failed:", res.status, data);
        return;
      }

      setCounts({
        total: data.total || 0,
        bySaleChannel: data.bySaleChannel || { online: 0, offline: 0, wholesale: 0 },
        filteredTotal: data.filteredTotal || 0,
        byStatus: data.byStatus || {},
      });
    } catch (err) {
      // ✅ counts শুধু tab badge-এর জন্য — fail হলেও order list normally কাজ করবে
      console.error("❌ fetchCounts error:", err);
    }
  };

  useEffect(() => {
    fetchCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saleChannel]);

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
  }, [saleChannel, dueOnly]);

  // ✅ Status ট্যাব বদলালে ১ম পেজ থেকে আবার fetch হবে (সব পেজ মিলিয়ে সঠিক লিস্ট আসার জন্য)
  const isFirstTabStatusRun = useRef(true);
  useEffect(() => {
    if (isFirstTabStatusRun.current) {
      isFirstTabStatusRun.current = false;
      return;
    }
    if (page !== 1) {
      setPage(1);
      return;
    }
    fetchOrders(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabStatus]);

  // ✅ সার্চ টার্ম বদলালে (debounce এর পর) ১ম পেজ থেকে আবার fetch হবে
  const isFirstSearchRun = useRef(true);
  useEffect(() => {
    if (isFirstSearchRun.current) {
      isFirstSearchRun.current = false;
      return;
    }
    if (page !== 1) {
      setPage(1);
      return;
    }
    fetchOrders(1, { silent: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

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
        fetchCounts();

        if (updated?.warnings?.length) {
          setToast({ message: `⚠️ ${updated.warnings.join(" ")}`, type: "error" });
        } else if (!options.silent) {
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
     ✅ Dropdown থেকে single status পরিবর্তন
     Delivered/Cancelled (lock হয়ে যায়) হলে আগে confirm + কারণ, তারপর
     কয়েক সেকেন্ডের "Undo" বার। অন্য status সরাসরি আপডেট।
     =============================== */
  const requestStatusChange = (order, status) => {
    if (!FINAL_STATUSES.includes(status)) {
      return updateStatus(order._id, { status });
    }

    const isCancel = status === "cancelled";
    setActionModal({
      title: isCancel
        ? `Order ${orderLabel(order)} Cancel করবেন?`
        : `Order ${orderLabel(order)} Delivered করবেন?`,
      message: isCancel
        ? "Stock ফেরত যাবে, promo code ছেড়ে দেওয়া হবে, আর অর্ডারটি lock হয়ে যাবে।"
        : "অর্ডারটি বিক্রি হিসেবে গণনা হবে আর lock হয়ে যাবে। পণ্য পরে ফেরত এলে History থেকে Return করুন।",
      tone: isCancel ? "danger" : "primary",
      reason: isCancel
        ? {
            required: true,
            label: "Cancel এর কারণ",
            placeholder: "যেমন: কাস্টমার ফোন ধরেনি / কাস্টমার বাতিল করেছে",
          }
        : null,
      confirmText: isCancel ? "Cancel Order" : "Mark Delivered",
      onConfirm: async ({ reason }) => {
        const updated = await updateStatus(
          order._id,
          isCancel ? { status, cancelReason: reason } : { status },
          { silent: true },
        );
        setUndoSnack({
          orderId: order._id,
          message: `Order ${orderLabel(order)} → ${STATUS_LABEL[status]}`,
        });
        return updated;
      },
    });
    return Promise.resolve();
  };

  /* ===============================
     Update status (bulk)
     =============================== */
  const updateManyStatus = (ids, payload) => {
    const isCancel = payload.status === "cancelled";
    const isFinal = FINAL_STATUSES.includes(payload.status);

    setActionModal({
      title: `${ids.length} টি অর্ডার ${STATUS_LABEL[payload.status] || payload.status} করবেন?`,
      message: isFinal
        ? `${ids.length} টি অর্ডার lock হয়ে যাবে।${
            isCancel ? " সবগুলোর stock ও promo ফেরত যাবে।" : ""
          } ভুল হলে প্রতিটা অর্ডারের History থেকে আলাদাভাবে Undo/Reopen করতে হবে।`
        : `${ids.length} টি অর্ডারের status পরিবর্তন হবে।`,
      tone: isCancel ? "danger" : isFinal ? "warning" : "primary",
      reason: isCancel
        ? { required: true, label: "Cancel এর কারণ (সবগুলোর জন্য)" }
        : null,
      confirmText: `${ids.length} টি আপডেট করুন`,
      onConfirm: async ({ reason }) => {
        const res = await fetch(`${API}/admin/orders/bulk/status`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ids,
            status: payload.status,
            cancelReason: isCancel ? reason : payload.cancelReason,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "❌ Bulk update failed");

        // ✅ status/stock/history সার্ভারে বদলেছে — পুরো লিস্ট আবার আনা হয়
        fetchOrders();
        fetchCounts();

        const skipped =
          (data.skipped?.length || 0) +
          (data.paymentHold?.length || 0) +
          (data.errors?.length || 0);
        setToast({
          message: `✔ ${data.updated.length} orders updated${
            skipped ? ` • ${skipped} টি বাদ গেছে` : ""
          }`,
          type: skipped ? "error" : "success",
        });
      },
    });
  };

  /* ===============================
     🕘 ORDER HISTORY (status log + stock ledger)
     useCallback — OrderHistoryModal এর useEffect dependency
     =============================== */
  const fetchOrderHistory = useCallback(
    async (id) => {
      const res = await fetch(`${API}/admin/orders/${id}/history`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "History লোড করা যায়নি");
      return data;
    },
    [API],
  );

  const applyOrderUpdate = (data, successMessage) => {
    if (data?.order) {
      setOrders((prev) =>
        prev.map((o) => (o._id === data.order._id ? data.order : o))
      );
    }
    fetchCounts();
    setToast(
      data?.warnings?.length
        ? { message: `⚠️ ${data.warnings.join(" ")}`, type: "error" }
        : { message: successMessage, type: "success" },
    );
  };

  /* ===============================
     ↩️ UNDO / REOPEN (আগের status-এ ফেরত — stock/promo উল্টে যায়)
     =============================== */
  const revertOrder = (orderId, reason) =>
    enqueue(async () => {
      const res = await fetch(`${API}/admin/orders/${orderId}/revert`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Undo করা যায়নি");
      applyOrderUpdate(
        data,
        `↩️ Order আগের status (${STATUS_LABEL[data.order?.status] || data.order?.status}) এ ফেরত নেওয়া হয়েছে`,
      );
      return data;
    });

  /* ===============================
     🚚 MANUAL COURIER (কুরিয়ার API ছাড়া — নাম + Tracking ID রেকর্ড, status shipped)
     =============================== */
  const sendManualCourier = (orderId, payload) =>
    enqueue(async () => {
      const res = await fetch(`${API}/admin/orders/${orderId}/manual-courier`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "ম্যানুয়াল কুরিয়ার এন্ট্রি করা যায়নি");
      applyOrderUpdate(data, "🚚 ম্যানুয়াল কুরিয়ার তথ্য সেভ হয়েছে");
      return data;
    });

  /* ===============================
     🏭 WHOLESALE: বাকি আদায় / ভুল এন্ট্রি Reverse
     =============================== */
  const collectPayment = (orderId, payload) =>
    enqueue(async () => {
      const res = await fetch(`${API}/admin/orders/${orderId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "পেমেন্ট সেভ করা যায়নি");
      applyOrderUpdate(data, `💰 ৳${payload.amount} আদায় রেকর্ড হয়েছে`);
      return data;
    });

  const reversePayment = (orderId, paymentId) =>
    enqueue(async () => {
      const res = await fetch(
        `${API}/admin/orders/${orderId}/payments/${paymentId}`,
        { method: "DELETE" },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Reverse করা যায়নি");
      applyOrderUpdate(data, "↩️ পেমেন্ট এন্ট্রি Reverse করা হয়েছে");
      return data;
    });

  /* ===============================
     📦 RETURN (delivered → returned, stock ফেরত + refund রেকর্ড)
     =============================== */
  const returnOrder = (orderId, { reason, refundAmount }) =>
    enqueue(async () => {
      const res = await fetch(`${API}/admin/orders/${orderId}/return`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, refundAmount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Return করা যায়নি");
      applyOrderUpdate(data, "📦 Order Returned — stock ফেরত গেছে");
      return data;
    });

  // ✅ History মডালের বাটন → confirm + কারণ মডাল
  const openRevert = (order, history, onDone) => {
    const status = history?.status || order.status;
    const target = history?.revert?.target;
    setActionModal({
      title:
        status === "cancelled"
          ? `Order ${orderLabel(order)} আবার চালু করবেন?`
          : `Order ${orderLabel(order)} আগের status-এ ফেরত নেবেন?`,
      message: `${STATUS_LABEL[status]} → ${STATUS_LABEL[target] || target}\n${
        status === "cancelled"
          ? "Stock আবার কাটা হবে (stock না থাকলে হবে না) আর promo আবার গোনা হবে।"
          : status === "returned"
            ? "Return বাতিল হবে, ফেরত আসা stock আবার কাটা হবে।"
            : status === "delivered"
              ? "অর্ডারটি আর বিক্রি হিসেবে গণনা হবে না, যতক্ষণ না আবার Delivered হয়।"
              : "অর্ডারটি আগের status-এ ফিরে যাবে।"
      }\nকারণসহ History-তে রেকর্ড থাকবে।`,
      tone: "warning",
      reason: {
        required: true,
        label: "কেন ফেরত নিচ্ছেন",
        placeholder: "যেমন: ভুল অর্ডারে cancel চাপা হয়েছিল",
      },
      confirmText: status === "cancelled" ? "Reopen" : "ফেরত নিন",
      onConfirm: async ({ reason }) => {
        await revertOrder(order._id, reason);
        onDone?.();
      },
    });
  };

  const openReturn = (order, onDone) => {
    const total = Number(order.total || 0);
    setActionModal({
      title: `Order ${orderLabel(order)} Return করবেন?`,
      message:
        "পণ্য ফেরত এসেছে — stock ফেরত যাবে, অর্ডারটি বিক্রি থেকে বাদ যাবে। আসল Delivered রেকর্ড History-তে থেকে যাবে।",
      tone: "warning",
      reason: {
        required: true,
        label: "Return এর কারণ",
        placeholder: "যেমন: পণ্য ড্যামেজ / সাইজ মেলেনি",
      },
      refund: { defaultValue: total, max: total },
      confirmText: "Return করুন",
      onConfirm: async ({ reason, refundAmount }) => {
        await returnOrder(order._id, { reason, refundAmount });
        onDone?.();
      },
    });
  };

  // ✅ Undo বার থেকে — নিজের সদ্য করা পরিবর্তন ফেরত
  const undoLastChange = async (snack) => {
    try {
      await revertOrder(snack.orderId, "Undo — ভুল ক্লিক");
    } catch (err) {
      setToast({ message: err?.message || "Undo করা যায়নি", type: "error" });
    } finally {
      setUndoSnack(null);
    }
  };

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
        fetchCounts();
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
            if (o.status !== "confirmed") continue;
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
        fetchCounts();
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

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "❌ Delete failed");
      }

      setOrders((prev) => prev.filter((o) => o._id !== order._id));
      fetchCounts();
      setToast({ message: "🗑 Order deleted", type: "success" });
    } catch (err) {
      // ✅ Active অর্ডার delete আটকানো (আগে Cancel করতে হবে) — কারণ সহ দেখানো
      setAlertBox({
        title: "❌ Delete করা যায়নি",
        message: err?.message || "Delete failed",
      });
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
      message: `${ids.length} orders Trash-এ যাবে। শুধু Cancelled/Returned অর্ডার delete হয় — active অর্ডার আগে Cancel করুন।`,
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

          // ✅ কিছু অর্ডার (active) delete আটকানো হতে পারে — তাই লিস্ট আবার আনা
          fetchOrders();
          fetchCounts();
          setToast({
            message: `🗑 ${data.deletedCount} orders deleted${
              data.blocked
                ? ` • ${data.blocked} টি active অর্ডার বাদ (আগে Cancel করুন)`
                : ""
            }`,
            type: data.blocked ? "error" : "success",
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
    dueOnly,
    setDueOnly,

    // status tab filter (server-side, all pages)
    tabStatus,
    setTabStatus,

    // search (server-side, all pages)
    search,
    setSearch,
    searching,

    // tab counts
    counts,
    fetchCounts,

    // status
    updateStatus,
    updateManyStatus,
    requestStatusChange,

    // undo / reopen / return / history
    fetchOrderHistory,
    openRevert,
    openReturn,
    actionModal,
    setActionModal,
    undoSnack,
    setUndoSnack,
    undoLastChange,

    // courier
    sendCourierDirect,
    sendCourierMany,
    sendManualCourier,

    // wholesale due
    collectPayment,
    reversePayment,

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
