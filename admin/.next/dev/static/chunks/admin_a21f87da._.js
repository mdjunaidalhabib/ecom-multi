(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/admin/hooks/useOrders.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>useOrders
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
function useOrders(API) {
    _s();
    const [orders, setOrders] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    /* ===============================
     🔁 QUEUE
     =============================== */ const queueRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(Promise.resolve());
    const enqueue = (task)=>{
        queueRef.current = queueRef.current.then(()=>task()).catch(()=>{});
        return queueRef.current;
    };
    /* ===============================
     🔔 TOAST
     =============================== */ const [toast, setToast] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    /* ===============================
     ❓ CONFIRM
     =============================== */ const [confirm, setConfirm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    /* ===============================
     🗑 DELETE LOADING
     =============================== */ const [deleting, setDeleting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    /* ===============================
     Auto hide toast
     =============================== */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useOrders.useEffect": ()=>{
            if (!toast) return;
            const t = setTimeout({
                "useOrders.useEffect.t": ()=>setToast(null)
            }["useOrders.useEffect.t"], 3000);
            return ({
                "useOrders.useEffect": ()=>clearTimeout(t)
            })["useOrders.useEffect"];
        }
    }["useOrders.useEffect"], [
        toast
    ]);
    /* ===============================
     Fetch orders
     =============================== */ const fetchOrders = async ()=>{
        try {
            setLoading(true);
            const res = await fetch(`${API}/admin/orders`);
            const data = await res.json();
            setOrders(Array.isArray(data) ? data : []);
        } catch  {
            setToast({
                message: "❌ Failed to load orders",
                type: "error"
            });
        } finally{
            setLoading(false);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useOrders.useEffect": ()=>{
            fetchOrders();
        }
    }["useOrders.useEffect"], []);
    /* ===============================
     Update status (single) – SILENT SUPPORT
     =============================== */ const updateStatus = (id, payload, options = {})=>enqueue(async ()=>{
            try {
                const res = await fetch(`${API}/admin/orders/${id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });
                const updated = await res.json();
                if (!res.ok) throw new Error(updated?.error);
                setOrders((prev)=>prev.map((o)=>o._id === updated._id ? updated : o));
                if (!options.silent) {
                    setToast({
                        message: "✔ Order updated",
                        type: "success"
                    });
                }
                return updated;
            } catch (err) {
                // ❗ error কখনো silent হবে না
                setToast({
                    message: err?.message || "❌ Status update failed",
                    type: "error"
                });
                throw err;
            }
        });
    /* ===============================
     Update status (bulk)
     =============================== */ const updateManyStatus = (ids, payload)=>setConfirm({
            title: "Update order status?",
            message: `Change status for ${ids.length} orders.`,
            onConfirm: async ()=>{
                try {
                    const res = await fetch(`${API}/admin/orders/bulk/status`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            ids,
                            status: payload.status,
                            cancelReason: payload.cancelReason
                        })
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error);
                    setOrders((prev)=>prev.map((o)=>data.updated.includes(o._id) ? {
                                ...o,
                                status: payload.status
                            } : o));
                    setToast({
                        message: `✔ ${data.updated.length} orders updated`,
                        type: "success"
                    });
                } catch (err) {
                    setToast({
                        message: err.message || "❌ Bulk update failed",
                        type: "error"
                    });
                } finally{
                    setConfirm(null);
                }
            }
        });
    /* ===============================
     🚚 COURIER (SINGLE) – FINAL & SAFE
     =============================== */ const sendCourierDirect = (order)=>enqueue(async ()=>{
            try {
                if (!order) throw new Error("Invalid order");
                /* 1️⃣ CREATE COURIER ORDER */ const res = await fetch(`${API}/admin/api/send-order`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        invoice: order._id,
                        name: order.billing?.name,
                        phone: order.billing?.phone,
                        address: order.billing?.address
                    })
                });
                const data = await res.json().catch(()=>({}));
                if (!res.ok) {
                    throw new Error(data?.error || data?.message || "Courier sending failed");
                }
                /* 2️⃣ LOCAL STATE SYNC (IMPORTANT) */ if (data.order) {
                    setOrders((prev)=>prev.map((o)=>o._id === data.order._id ? data.order : o));
                }
                /* 3️⃣ SUCCESS TOAST */ setToast({
                    message: "🚚 Courier order created & status updated",
                    type: "success"
                });
                return data;
            } catch (err) {
                const msg = err?.message?.toLowerCase() || "";
                const friendlyMessage = msg.includes("courier") || msg.includes("setting") ? "Courier সেটিং পাওয়া যায়নি বা inactive" : err.message;
                setToast({
                    message: friendlyMessage,
                    type: "error"
                });
                throw err;
            }
        });
    /* ===============================
     Courier (bulk)
     =============================== */ const sendCourierMany = (orders)=>setConfirm({
            title: "Send to courier?",
            message: `Send ${orders.length} orders to courier service.`,
            onConfirm: async ()=>{
                try {
                    for (const o of orders){
                        if (o.status !== "ready_to_delivery") continue;
                        await sendCourierDirect(o);
                    }
                    setToast({
                        message: "🚚 Orders sent to courier",
                        type: "success"
                    });
                } catch (err) {
                    setToast({
                        message: err.message || "❌ Courier sending failed",
                        type: "error"
                    });
                } finally{
                    setConfirm(null);
                }
            }
        });
    /* ===============================
     🗑 DELETE (single)
     =============================== */ const handleDelete = async (order)=>{
        if (!order) return;
        try {
            setDeleting(true);
            const res = await fetch(`${API}/admin/orders/${order._id}`, {
                method: "DELETE"
            });
            if (!res.ok) throw new Error();
            setOrders((prev)=>prev.filter((o)=>o._id !== order._id));
            setToast({
                message: "🗑 Order deleted",
                type: "success"
            });
        } catch  {
            setToast({
                message: "❌ Delete failed",
                type: "error"
            });
        } finally{
            setDeleting(false);
            setConfirm(null);
        }
    };
    /* ===============================
     Delete (bulk)
     =============================== */ const deleteMany = (ids)=>setConfirm({
            title: "Delete orders?",
            message: `${ids.length} orders will be permanently deleted.`,
            danger: true,
            confirmText: "Delete",
            onConfirm: async ()=>{
                try {
                    const res = await fetch(`${API}/admin/orders/bulk/delete`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            ids
                        })
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error);
                    setOrders((prev)=>prev.filter((o)=>!ids.includes(o._id)));
                    setToast({
                        message: `🗑 ${data.deletedCount} orders deleted`,
                        type: "success"
                    });
                } catch (err) {
                    setToast({
                        message: err.message || "❌ Bulk delete failed",
                        type: "error"
                    });
                } finally{
                    setConfirm(null);
                }
            }
        });
    /* ===============================
     RETURN
     =============================== */ return {
        filtered: orders,
        loading,
        fetchOrders,
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
        // ui
        toast,
        setToast,
        confirm,
        setConfirm
    };
}
_s(useOrders, "YkdlnnIKZdqUMD6yosai7zZv07U=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/admin/components/orders/shared/constants.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LOCKED_STATUSES",
    ()=>LOCKED_STATUSES,
    "READY_STATUS",
    ()=>READY_STATUS,
    "STATUS_BADGE_COLOR",
    ()=>STATUS_BADGE_COLOR,
    "STATUS_COLORS",
    ()=>STATUS_COLORS,
    "STATUS_FLOW",
    ()=>STATUS_FLOW,
    "STATUS_LABEL",
    ()=>STATUS_LABEL,
    "STATUS_OPTIONS",
    ()=>STATUS_OPTIONS,
    "STATUS_TEXT_COLOR",
    ()=>STATUS_TEXT_COLOR
]);
const STATUS_OPTIONS = [
    "pending",
    "ready_to_delivery",
    "send_to_courier",
    "delivered",
    "cancelled"
];
const STATUS_LABEL = {
    pending: "PENDING",
    ready_to_delivery: "READY TO DELIVERY",
    send_to_courier: "SEND TO COURIER",
    delivered: "DELIVERED",
    cancelled: "CANCELLED"
};
const LOCKED_STATUSES = [
    "delivered",
    "cancelled"
];
const STATUS_FLOW = {
    pending: [
        "ready_to_delivery",
        "cancelled"
    ],
    ready_to_delivery: [
        "send_to_courier",
        "cancelled"
    ],
    send_to_courier: [
        "delivered",
        "cancelled"
    ],
    delivered: [],
    cancelled: []
};
const READY_STATUS = "ready_to_delivery";
const STATUS_BADGE_COLOR = {
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    ready_to_delivery: "bg-blue-100 text-blue-700 border-blue-200",
    send_to_courier: "bg-purple-100 text-purple-700 border-purple-200",
    delivered: "bg-green-100 text-green-700 border-green-200",
    cancelled: "bg-red-100 text-red-700 border-red-200"
};
const STATUS_TEXT_COLOR = {
    pending: "text-yellow-600",
    ready_to_delivery: "text-blue-600",
    send_to_courier: "text-purple-600",
    delivered: "text-green-600",
    cancelled: "text-red-600"
};
const STATUS_COLORS = {
    pending: "text-yellow-700 bg-yellow-50 ring-yellow-200",
    ready_to_delivery: "text-blue-700 bg-blue-50 ring-blue-200",
    send_to_courier: "text-purple-700 bg-purple-50 ring-purple-200",
    delivered: "text-green-700 bg-green-50 ring-green-200",
    cancelled: "text-red-700 bg-red-50 ring-red-200"
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/admin/components/orders/hooks/useOrdersManager.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>useOrdersManager
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
function useOrdersManager({ orders = [], tabStatus = "", search = "", lockStatuses = [
    "delivered",
    "cancelled"
] }) {
    _s();
    /* ===============================
     FILTER
  =============================== */ const filteredOrders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useOrdersManager.useMemo[filteredOrders]": ()=>{
            let list = Array.isArray(orders) ? orders : [];
            if (tabStatus) {
                list = list.filter({
                    "useOrdersManager.useMemo[filteredOrders]": (o)=>o.status === tabStatus
                }["useOrdersManager.useMemo[filteredOrders]"]);
            }
            if (search?.trim()) {
                const q = search.toLowerCase();
                list = list.filter({
                    "useOrdersManager.useMemo[filteredOrders]": (o)=>o._id?.toLowerCase().includes(q) || o.billing?.name?.toLowerCase().includes(q) || o.billing?.phone?.toLowerCase().includes(q)
                }["useOrdersManager.useMemo[filteredOrders]"]);
            }
            return list;
        }
    }["useOrdersManager.useMemo[filteredOrders]"], [
        orders,
        tabStatus,
        search
    ]);
    /* ===============================
     SELECTION (✅ NO STATUS BLOCK)
  =============================== */ const [selected, setSelected] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    // ✅ all filtered orders are selectable
    const selectableIds = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useOrdersManager.useMemo[selectableIds]": ()=>filteredOrders.map({
                "useOrdersManager.useMemo[selectableIds]": (o)=>o._id
            }["useOrdersManager.useMemo[selectableIds]"])
    }["useOrdersManager.useMemo[selectableIds]"], [
        filteredOrders
    ]);
    const toggleOne = (id)=>{
        setSelected((p)=>p.includes(id) ? p.filter((x)=>x !== id) : [
                ...p,
                id
            ]);
    };
    const toggleAll = ()=>{
        setSelected((p)=>p.length === selectableIds.length ? [] : selectableIds);
    };
    const selectedOrders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useOrdersManager.useMemo[selectedOrders]": ()=>orders.filter({
                "useOrdersManager.useMemo[selectedOrders]": (o)=>selected.includes(o._id)
            }["useOrdersManager.useMemo[selectedOrders]"])
    }["useOrdersManager.useMemo[selectedOrders]"], [
        orders,
        selected
    ]);
    const allSelected = selectableIds.length > 0 && selectableIds.every((id)=>selected.includes(id));
    /* ===============================
     BULK RULES
  =============================== */ const sameStatus = selectedOrders.length > 0 && selectedOrders.every((o)=>o.status === selectedOrders[0].status);
    const bulkStatus = sameStatus ? selectedOrders[0].status : "";
    const canBulkSendCourier = selectedOrders.length > 0 && selectedOrders.every((o)=>o.status === "ready_to_delivery" && !o.trackingId);
    return {
        /* data */ filteredOrders,
        selected,
        selectedOrders,
        selectableIds,
        /* selection */ setSelected,
        toggleOne,
        toggleAll,
        allSelected,
        /* bulk helpers */ sameStatus,
        bulkStatus,
        canBulkSendCourier
    };
}
_s(useOrdersManager, "G3yrWZUs1GLBHrwH4auD2ZKP/Aw=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/admin/components/orders/ordersGrid/StatusSummary.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>StatusSummary
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$shared$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/orders/shared/constants.js [app-client] (ecmascript)");
"use client";
;
;
function StatusSummary({ orders, tabStatus, setTabStatus, statusCount }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "sticky top-0 z-30 bg-white border-b px-2 py-2",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
            value: tabStatus,
            onChange: (e)=>setTabStatus(e.target.value),
            className: "w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-bold bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                    value: "",
                    children: [
                        "ALL (",
                        orders.length,
                        ")"
                    ]
                }, void 0, true, {
                    fileName: "[project]/admin/components/orders/ordersGrid/StatusSummary.jsx",
                    lineNumber: 19,
                    columnNumber: 9
                }, this),
                __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$shared$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STATUS_OPTIONS"].map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                        value: s,
                        children: [
                            __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$shared$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STATUS_LABEL"][s],
                            " ",
                            statusCount?.[s] !== undefined ? `(${statusCount[s]})` : ""
                        ]
                    }, s, true, {
                        fileName: "[project]/admin/components/orders/ordersGrid/StatusSummary.jsx",
                        lineNumber: 23,
                        columnNumber: 11
                    }, this))
            ]
        }, void 0, true, {
            fileName: "[project]/admin/components/orders/ordersGrid/StatusSummary.jsx",
            lineNumber: 13,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/admin/components/orders/ordersGrid/StatusSummary.jsx",
        lineNumber: 12,
        columnNumber: 5
    }, this);
}
_c = StatusSummary;
var _c;
__turbopack_context__.k.register(_c, "StatusSummary");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/admin/components/Toast.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Toast
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function Toast({ message, type = "info", onClose }) {
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Toast.useEffect": ()=>{
            const timer = setTimeout(onClose, 2500);
            return ({
                "Toast.useEffect": ()=>clearTimeout(timer)
            })["Toast.useEffect"];
        }
    }["Toast.useEffect"], [
        onClose
    ]);
    const color = type === "success" ? "bg-green-500" : type === "error" ? "bg-red-500" : "bg-blue-500";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed top-6 right-6 z-50 animate-slideUp animate-fadeIn",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `${color} text-white px-5 py-3 rounded-lg shadow-xl text-sm font-medium flex items-center gap-2`,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                children: message
            }, void 0, false, {
                fileName: "[project]/admin/components/Toast.jsx",
                lineNumber: 22,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/admin/components/Toast.jsx",
            lineNumber: 19,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/admin/components/Toast.jsx",
        lineNumber: 18,
        columnNumber: 5
    }, this);
}
_s(Toast, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c = Toast;
var _c;
__turbopack_context__.k.register(_c, "Toast");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/admin/components/orders/ordersGrid/BulkBar.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>BulkBar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$shared$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/orders/shared/constants.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$Toast$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/Toast.jsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function BulkBar({ selected, selectedOrders, sameStatus, bulkStatus, setSelected, onStatusChange, onBulkStatusChange, onBulkSendCourier, onBulkDelete }) {
    _s();
    const [toast, setToast] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const showToast = (message, type = "error")=>{
        setToast({
            message,
            type
        });
    };
    const allowedNext = __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$shared$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STATUS_FLOW"][bulkStatus] || [];
    const disabled = selected.length === 0;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            toast && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$Toast$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                message: toast.message,
                type: toast.type,
                onClose: ()=>setToast(null)
            }, void 0, false, {
                fileName: "[project]/admin/components/orders/ordersGrid/BulkBar.jsx",
                lineNumber: 29,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "sticky top-[44px] z-20  flex flex-wrap gap-2 items-center",
                children: [
                    sameStatus && bulkStatus && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        className: "rounded-full py-1 text-xs bg-white border",
                        value: bulkStatus,
                        disabled: disabled,
                        onChange: async (e)=>{
                            const nextStatus = e.target.value;
                            if (!allowedNext.includes(nextStatus)) {
                                showToast("এই status এ bulk update করা যাবে না");
                                return;
                            }
                            try {
                                // 🚚 SEND TO COURIER
                                if (nextStatus === "send_to_courier") {
                                    await onBulkSendCourier(selectedOrders);
                                    showToast("Courier order তৈরি হয়েছে", "success");
                                    return;
                                }
                                // 🔁 NORMAL STATUS UPDATE
                                if (selected.length === 1) {
                                    await onStatusChange(selected[0], {
                                        status: nextStatus
                                    });
                                } else {
                                    await onBulkStatusChange(selected, {
                                        status: nextStatus
                                    });
                                }
                                showToast("Status update হয়েছে", "success");
                            } finally{
                                setSelected([]);
                            }
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: bulkStatus,
                                disabled: true,
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$shared$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STATUS_LABEL"][bulkStatus]
                            }, void 0, false, {
                                fileName: "[project]/admin/components/orders/ordersGrid/BulkBar.jsx",
                                lineNumber: 73,
                                columnNumber: 13
                            }, this),
                            __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$shared$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STATUS_OPTIONS"].filter((s)=>allowedNext.includes(s)).map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: s,
                                    children: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$shared$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STATUS_LABEL"][s]
                                }, s, false, {
                                    fileName: "[project]/admin/components/orders/ordersGrid/BulkBar.jsx",
                                    lineNumber: 78,
                                    columnNumber: 15
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/components/orders/ordersGrid/BulkBar.jsx",
                        lineNumber: 40,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        disabled: disabled,
                        onClick: ()=>{
                            if (!selected.length) {
                                showToast("Delete করার জন্য কোনো order select করা হয়নি");
                                return;
                            }
                            onBulkDelete(selected);
                            setSelected([]);
                            showToast("Order delete হয়েছে", "success");
                        },
                        className: `px-3 py-1 rounded-full text-xs text-white ${disabled ? "bg-red-300 cursor-not-allowed" : "bg-red-600"}`,
                        children: "Delete"
                    }, void 0, false, {
                        fileName: "[project]/admin/components/orders/ordersGrid/BulkBar.jsx",
                        lineNumber: 86,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/admin/components/orders/ordersGrid/BulkBar.jsx",
                lineNumber: 37,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_s(BulkBar, "F97EANJWsnaAE0wHKn9qNrF71cE=");
_c = BulkBar;
var _c;
__turbopack_context__.k.register(_c, "BulkBar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/admin/components/Badge.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Badge
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
function Badge({ children, type }) {
    const base = "inline-flex items-center justify-center rounded-full px-2 sm:py-0.5 text-[10px] font-bold border whitespace-nowrap w-fit uppercase tracking-tighter";
    const colors = {
        pending: "border-yellow-200 text-yellow-700 bg-yellow-50",
        ready_to_delivery: "border-blue-200 text-blue-700 bg-blue-50",
        send_to_courier: "border-purple-200 text-purple-700 bg-purple-50",
        delivered: "border-green-200 text-green-700 bg-green-50",
        cancelled: "border-red-200 text-red-700 bg-red-50"
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: `${base} ${colors[type] || "border-gray-300 text-gray-700 bg-gray-50"}`,
        children: children
    }, void 0, false, {
        fileName: "[project]/admin/components/Badge.jsx",
        lineNumber: 14,
        columnNumber: 5
    }, this);
}
_c = Badge;
var _c;
__turbopack_context__.k.register(_c, "Badge");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/admin/components/CopyButton.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CopyButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function CopyButton({ value, onCopied, className = "" }) {
    _s();
    const [copied, setCopied] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
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
            onCopied?.(true);
            setTimeout(()=>setCopied(false), 1500);
        } catch  {
            onCopied?.(false);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: "button",
        onClick: handleCopy,
        disabled: !value || value === "—",
        title: "Copy",
        className: `inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border transition shrink-0 ${copied ? "bg-green-50 text-green-600 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"} disabled:opacity-40 disabled:cursor-not-allowed ${className}`,
        children: copied ? "Copied ✓" : "Copy"
    }, void 0, false, {
        fileName: "[project]/admin/components/CopyButton.jsx",
        lineNumber: 41,
        columnNumber: 5
    }, this);
}
_s(CopyButton, "NE86rL3vg4NVcTTWDavsT0hUBJs=");
_c = CopyButton;
var _c;
__turbopack_context__.k.register(_c, "CopyButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/admin/components/CourierStatus.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CourierStatus
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$Badge$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/Badge.jsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function Modal({ isOpen, onClose, children }) {
    if (!isOpen) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-white rounded-2xl w-full max-w-5xl shadow-2xl relative flex flex-col max-h-[85vh]",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between px-8 py-5 border-b bg-gray-50 rounded-t-2xl",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-xl font-semibold text-gray-800",
                            children: "📦 Tracking Updates"
                        }, void 0, false, {
                            fileName: "[project]/admin/components/CourierStatus.jsx",
                            lineNumber: 14,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            className: "text-gray-500 hover:text-gray-800 text-xl",
                            "aria-label": "Close modal",
                            children: "✕"
                        }, void 0, false, {
                            fileName: "[project]/admin/components/CourierStatus.jsx",
                            lineNumber: 18,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/admin/components/CourierStatus.jsx",
                    lineNumber: 13,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-6 sm:p-10 overflow-y-auto",
                    children: children
                }, void 0, false, {
                    fileName: "[project]/admin/components/CourierStatus.jsx",
                    lineNumber: 28,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/admin/components/CourierStatus.jsx",
            lineNumber: 11,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/admin/components/CourierStatus.jsx",
        lineNumber: 9,
        columnNumber: 5
    }, this);
}
_c = Modal;
function CourierStatus({ trackingId, courier, orderId, orderStatus, onFinalStatus }) {
    _s();
    const activeTrackingId = courier?.trackingId || trackingId;
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(courier?.status || null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [modalOpen, setModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [events, setEvents] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [eventsLoading, setEventsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [eventsError, setEventsError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // ✅ guard: same order/tracking এ বারবার final status sync বন্ধ
    const notifiedFinalRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    // ✅ trackingId change হলে আবার allow (নতুন courier হলে)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CourierStatus.useEffect": ()=>{
            notifiedFinalRef.current = false;
        }
    }["CourierStatus.useEffect"], [
        activeTrackingId
    ]);
    const displayStatus = (status || courier?.status || "unknown").replaceAll("_", " ").toUpperCase();
    const normalizeFinalStatus = (raw)=>{
        const s = String(raw || "").toLowerCase().trim();
        if (!s) return null;
        // delivered variations: delivered, delivered_success, delivered to customer etc.
        if (s === "delivered" || s.includes("deliver")) return "delivered";
        // cancelled variations: cancelled, canceled, cancel, order_cancelled etc.
        if (s === "cancelled" || s === "canceled" || s.includes("cancel")) return "cancelled";
        return null;
    };
    /* ================= FETCH STATUS ================= */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CourierStatus.useEffect": ()=>{
            if (!activeTrackingId) return;
            const fetchCourierStatus = {
                "CourierStatus.useEffect.fetchCourierStatus": async ()=>{
                    setLoading(true);
                    setError(null);
                    try {
                        const apiUrl = "/api";
                        const url = `${apiUrl}/admin/api/courier/status?trackingId=${activeTrackingId}`;
                        const res = await fetch(url, {
                            cache: "no-store"
                        });
                        const data = await res.json();
                        const nextStatus = data?.status || "unknown";
                        setStatus(nextStatus);
                        // ✅ FINAL STATUS SYNC (DELIVERED/CANCELLED)
                        const finalStatus = normalizeFinalStatus(nextStatus);
                        if (finalStatus && typeof onFinalStatus === "function" && orderId && orderStatus && orderStatus !== finalStatus && !notifiedFinalRef.current) {
                            notifiedFinalRef.current = true;
                            onFinalStatus(orderId, finalStatus);
                        }
                    } catch (err) {
                        setError(err?.message || "Failed to load status");
                    } finally{
                        setLoading(false);
                    }
                }
            }["CourierStatus.useEffect.fetchCourierStatus"];
            fetchCourierStatus();
        }
    }["CourierStatus.useEffect"], [
        activeTrackingId,
        onFinalStatus,
        orderId,
        orderStatus
    ]);
    /* ================= FETCH EVENTS ================= */ const fetchEvents = async ()=>{
        if (!activeTrackingId) return;
        setEventsLoading(true);
        setEventsError(null);
        try {
            const apiUrl = "/api";
            const url = `${apiUrl}/admin/api/courier/live?trackingId=${activeTrackingId}`;
            const res = await fetch(url, {
                cache: "no-store"
            });
            const data = await res.json();
            const sorted = Array.isArray(data?.events) ? [
                ...data.events
            ].sort((a, b)=>new Date(b.timestamp) - new Date(a.timestamp)) : [];
            setEvents(sorted);
        } catch (err) {
            setEventsError(err?.message || "Failed to load events");
        } finally{
            setEventsLoading(false);
        }
    };
    const openModal = ()=>{
        setModalOpen(true);
        fetchEvents();
    };
    const closeModal = ()=>setModalOpen(false);
    if (!activeTrackingId) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mt-1 text-[12px] text-gray-400",
            children: "Courier not created"
        }, void 0, false, {
            fileName: "[project]/admin/components/CourierStatus.jsx",
            lineNumber: 160,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mt-1 flex items-center gap-2",
        children: [
            loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-[12px] text-gray-400",
                children: "Loading status..."
            }, void 0, false, {
                fileName: "[project]/admin/components/CourierStatus.jsx",
                lineNumber: 167,
                columnNumber: 9
            }, this) : error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-[12px] text-red-500",
                children: error
            }, void 0, false, {
                fileName: "[project]/admin/components/CourierStatus.jsx",
                lineNumber: 169,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$Badge$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                children: [
                    "🚚 ",
                    displayStatus
                ]
            }, void 0, true, {
                fileName: "[project]/admin/components/CourierStatus.jsx",
                lineNumber: 171,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: openModal,
                className: "text-[11px] px-1 py-0 rounded-md border bg-white hover:bg-gray-100 transition",
                children: "Live Tracking"
            }, void 0, false, {
                fileName: "[project]/admin/components/CourierStatus.jsx",
                lineNumber: 174,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Modal, {
                isOpen: modalOpen,
                onClose: closeModal,
                children: eventsLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center text-gray-500",
                    children: "Loading timeline..."
                }, void 0, false, {
                    fileName: "[project]/admin/components/CourierStatus.jsx",
                    lineNumber: 183,
                    columnNumber: 11
                }, this) : eventsError ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-red-500 text-center",
                    children: eventsError
                }, void 0, false, {
                    fileName: "[project]/admin/components/CourierStatus.jsx",
                    lineNumber: 185,
                    columnNumber: 11
                }, this) : events.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-gray-500 text-center",
                    children: "No tracking updates available."
                }, void 0, false, {
                    fileName: "[project]/admin/components/CourierStatus.jsx",
                    lineNumber: 187,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "relative pl-6 border-l-2 border-gray-300 space-y-3",
                    children: events.map((e, idx)=>{
                        const message = e?.status || "Unknown update";
                        const date = e?.timestamp ? new Date(e.timestamp).toLocaleString() : "—";
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "relative",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "absolute -left-[9px] top-1 w-4 h-4 md:w-5 md:h-5  rounded-full bg-green-500  flex items-center justify-center  text-white text-[9px] md:text-[10px] shadow",
                                    children: "✓"
                                }, void 0, false, {
                                    fileName: "[project]/admin/components/CourierStatus.jsx",
                                    lineNumber: 201,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "bg-gray-50 border rounded-lg  px-3 py-2 md:px-5 md:py-3 shadow-sm",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-[10px] md:text-xs text-gray-400 md:text-gray-500 mb-1",
                                            children: date
                                        }, void 0, false, {
                                            fileName: "[project]/admin/components/CourierStatus.jsx",
                                            lineNumber: 215,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-[12px] md:text-sm  font-normal md:font-medium  text-gray-700 md:text-gray-800  leading-tight md:leading-snug  break-words whitespace-pre-wrap",
                                            children: message
                                        }, void 0, false, {
                                            fileName: "[project]/admin/components/CourierStatus.jsx",
                                            lineNumber: 220,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/admin/components/CourierStatus.jsx",
                                    lineNumber: 211,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, idx, true, {
                            fileName: "[project]/admin/components/CourierStatus.jsx",
                            lineNumber: 199,
                            columnNumber: 17
                        }, this);
                    })
                }, void 0, false, {
                    fileName: "[project]/admin/components/CourierStatus.jsx",
                    lineNumber: 191,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/admin/components/CourierStatus.jsx",
                lineNumber: 181,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/admin/components/CourierStatus.jsx",
        lineNumber: 165,
        columnNumber: 5
    }, this);
}
_s(CourierStatus, "ETsoIgoz1C00es7ab2nafxaNDxw=");
_c1 = CourierStatus;
var _c, _c1;
__turbopack_context__.k.register(_c, "Modal");
__turbopack_context__.k.register(_c1, "CourierStatus");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/admin/components/orders/shared/utils.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * ✅ Manual/mobile-banking payments (bKash/Nagad/etc.) must be verified
 * (accepted/rejected) by admin from Payments > Pending Verification
 * before the order can move forward in the status flow.
 * COD orders are exempt (cash is collected on delivery).
 */ __turbopack_context__.s([
    "formatOrderTime",
    ()=>formatOrderTime,
    "needsPaymentVerification",
    ()=>needsPaymentVerification
]);
function needsPaymentVerification(o) {
    return !!o?.paymentMethod && o.paymentMethod !== "cod" && o.paymentStatus === "pending";
}
function formatOrderTime(o) {
    const raw = o?.createdAt || o?.orderDate || o?.date;
    if (!raw) return "—";
    const d = new Date(raw);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/admin/components/orders/ordersGrid/OrderCard.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>OrderCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pen$2d$line$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Edit3$3e$__ = __turbopack_context__.i("[project]/admin/node_modules/lucide-react/dist/esm/icons/pen-line.js [app-client] (ecmascript) <export default as Edit3>");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/admin/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__ = __turbopack_context__.i("[project]/admin/node_modules/lucide-react/dist/esm/icons/send.js [app-client] (ecmascript) <export default as Send>");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/admin/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUp$3e$__ = __turbopack_context__.i("[project]/admin/node_modules/lucide-react/dist/esm/icons/chevron-up.js [app-client] (ecmascript) <export default as ChevronUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/admin/node_modules/lucide-react/dist/esm/icons/file-text.js [app-client] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$Badge$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/Badge.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$CopyButton$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/CopyButton.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$CourierStatus$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/CourierStatus.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$shared$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/orders/shared/constants.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$shared$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/orders/shared/utils.js [app-client] (ecmascript)");
"use client";
;
;
;
;
;
;
;
function OrderCard({ o, expanded, setOpenId, selected, toggleOne, updatingId, onStatusChange, onEdit, onDelete, onSendCourier, // ✅ NEW: parent থেকে courier final sync handler পাঠাবেন
onFinalStatusSync }) {
    const locked = __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$shared$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LOCKED_STATUSES"].includes(o.status);
    const paymentHold = !locked && (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$shared$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["needsPaymentVerification"])(o);
    const itemCount = o.items?.reduce((s, it)=>s + (it.qty || 0), 0) || 0;
    const firstTwo = o.items?.slice(0, 2) || [];
    const moreCount = (o.items?.length || 0) - firstTwo.length;
    const isAdminCreated = o?.createdBy === "admin";
    const handleStatusUpdate = async (id, newStatus, order)=>{
        try {
            // ✅ READY → send_to_courier হলে auto courier create
            if (order?.status === __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$shared$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["READY_STATUS"] && newStatus === "send_to_courier") {
                await onSendCourier(order);
                return;
            }
            await onStatusChange(id, {
                status: newStatus
            });
        } catch (error) {
            console.error("Status update failed", error);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `border-b last:border-none transition-colors ${expanded ? "bg-gray-50/50" : "bg-white"}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-2 py-2 flex gap-2 items-center bg-white",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "checkbox",
                        className: "h-3.5 w-3.5 rounded border-gray-300",
                        checked: selected.includes(o._id),
                        onChange: ()=>toggleOne(o._id),
                        disabled: locked
                    }, void 0, false, {
                        fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                        lineNumber: 69,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setOpenId(expanded ? null : o._id),
                        className: "flex-1 flex justify-between items-center text-left min-w-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1 min-w-0 pr-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-1.5 flex-wrap leading-none",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[13px] font-bold text-gray-900 capitalize truncate",
                                                children: o.billing?.name || "Unknown"
                                            }, void 0, false, {
                                                fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                                lineNumber: 85,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "leading-none",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$Badge$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                    type: o.status,
                                                    children: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$shared$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STATUS_LABEL"][o.status]
                                                }, void 0, false, {
                                                    fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                                    lineNumber: 90,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                                lineNumber: 89,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                        lineNumber: 84,
                                        columnNumber: 13
                                    }, this),
                                    o.status === "cancelled" && o.cancelReason && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-[11px] text-red-600 leading-none mt-0.5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-semibold",
                                                children: "Reason:"
                                            }, void 0, false, {
                                                fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                                lineNumber: 97,
                                                columnNumber: 17
                                            }, this),
                                            " ",
                                            o.cancelReason
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                        lineNumber: 96,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center flex-wrap gap-x-2 gap-y-0 text-[10px] text-gray-400 leading-none mt-0.5",
                                        children: [
                                            isAdminCreated && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-blue-700 font-semibold",
                                                children: [
                                                    "Created by : ",
                                                    o?.createdByName || "Admin"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                                lineNumber: 104,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-mono",
                                                children: [
                                                    "#",
                                                    o.orderNumber ?? o._id.slice(-6)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                                lineNumber: 109,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    "• ",
                                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$shared$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatOrderTime"])(o)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                                lineNumber: 112,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    "• ",
                                                    itemCount,
                                                    " items"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                                lineNumber: 113,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                        lineNumber: 102,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                lineNumber: 82,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-right shrink-0 flex flex-col items-end",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-[14px] font-black text-gray-900 leading-tight",
                                        children: [
                                            "৳",
                                            o.total
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                        lineNumber: 119,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `flex items-center gap-0.5 text-[9px] font-bold uppercase leading-none ${expanded ? "text-blue-600" : "text-gray-400"}`,
                                        children: expanded ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUp$3e$__["ChevronUp"], {
                                            size: 12
                                        }, void 0, false, {
                                            fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                            lineNumber: 127,
                                            columnNumber: 27
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                            size: 12
                                        }, void 0, false, {
                                            fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                            lineNumber: 127,
                                            columnNumber: 53
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                        lineNumber: 122,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                lineNumber: 118,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                        lineNumber: 77,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                lineNumber: 68,
                columnNumber: 7
            }, this),
            expanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-3 pb-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-12 gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "col-span-5 rounded-lg bg-white border border-gray-100 p-2 shadow-sm",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-[9px] font-bold text-gray-400 uppercase mb-1",
                                        children: "Customer"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                        lineNumber: 138,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "font-bold text-gray-800 text-[11px] truncate",
                                        children: o.billing?.name
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                        lineNumber: 141,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-[10px] text-gray-600",
                                        children: o.billing?.phone
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                        lineNumber: 144,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-[10px] text-gray-500 line-clamp-2 mt-1 italic",
                                        children: o.billing?.address
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                        lineNumber: 147,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                lineNumber: 137,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "col-span-7 rounded-lg bg-white border border-gray-100 p-2 shadow-sm",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex justify-between text-[9px] font-bold text-gray-400 uppercase mb-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "Items"
                                            }, void 0, false, {
                                                fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                                lineNumber: 154,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    o.items?.length || 0,
                                                    " total"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                                lineNumber: 155,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                        lineNumber: 153,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-1.5",
                                        children: [
                                            firstTwo.map((it, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                            src: it.image || "/placeholder.png",
                                                            className: "w-7 h-7 rounded border object-cover",
                                                            alt: ""
                                                        }, void 0, false, {
                                                            fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                                            lineNumber: 160,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "min-w-0",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-[10px] font-bold truncate leading-tight",
                                                                    children: it.name
                                                                }, void 0, false, {
                                                                    fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                                                    lineNumber: 166,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-[9px] text-gray-500",
                                                                    children: [
                                                                        "Qty: ",
                                                                        it.qty,
                                                                        " • ৳",
                                                                        it.price
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                                                    lineNumber: 169,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                                            lineNumber: 165,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, idx, true, {
                                                    fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                                    lineNumber: 159,
                                                    columnNumber: 19
                                                }, this)),
                                            moreCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[9px] text-blue-500 font-medium",
                                                children: [
                                                    "+ ",
                                                    moreCount,
                                                    " more items"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                                lineNumber: 177,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                        lineNumber: 157,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                lineNumber: 152,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                        lineNumber: 136,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-100/50 rounded-lg p-2 text-[11px] space-y-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between text-gray-600",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Subtotal"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                        lineNumber: 187,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: [
                                            "৳",
                                            o.subtotal
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                        lineNumber: 188,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                lineNumber: 186,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between text-gray-600",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Delivery"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                        lineNumber: 191,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: [
                                            "৳",
                                            o.deliveryCharge
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                        lineNumber: 192,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                lineNumber: 190,
                                columnNumber: 13
                            }, this),
                            !!o.discount && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between text-red-500 font-medium",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Discount"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                        lineNumber: 196,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: [
                                            "-৳",
                                            o.discount
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                        lineNumber: 197,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                lineNumber: 195,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-1 mt-1 text-sm",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Total"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                        lineNumber: 201,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: [
                                            "৳",
                                            o.total
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                        lineNumber: 202,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                lineNumber: 200,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                        lineNumber: 185,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "rounded-lg bg-white border border-gray-100 p-2 shadow-sm text-[11px] space-y-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-1.5 flex-wrap",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[9px] font-bold text-gray-400 uppercase",
                                        children: "Payment"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                        lineNumber: 208,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$Badge$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        children: o.paymentMethod?.toUpperCase()
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                        lineNumber: 211,
                                        columnNumber: 15
                                    }, this),
                                    o.paymentMethod !== "cod" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full border ${o.paymentStatus === "paid" ? "bg-green-50 text-green-700 border-green-200" : o.paymentStatus === "failed" ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200"}`,
                                        children: o.paymentStatus === "paid" ? "Verified" : o.paymentStatus === "failed" ? "Rejected" : "Pending"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                        lineNumber: 213,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                lineNumber: 207,
                                columnNumber: 13
                            }, this),
                            o.paymentMethod !== "cod" && o.paymentDetails?.transactionId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-1 text-gray-600",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-gray-400",
                                        children: "TrxID:"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                        lineNumber: 233,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-mono font-semibold text-gray-800 truncate",
                                        children: o.paymentDetails.transactionId
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                        lineNumber: 234,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$CopyButton$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        value: o.paymentDetails.transactionId
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                        lineNumber: 237,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                lineNumber: 232,
                                columnNumber: 15
                            }, this),
                            o.paymentMethod !== "cod" && o.paymentDetails?.senderNumber && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-gray-500",
                                children: [
                                    "Sender: ",
                                    o.paymentDetails.senderNumber
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                lineNumber: 242,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                        lineNumber: 206,
                        columnNumber: 11
                    }, this),
                    paymentHold && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5",
                        children: "⏳ Payment verify হয়নি — status hold করা আছে। Payments পেজ থেকে Accept/Reject করুন।"
                    }, void 0, false, {
                        fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                        lineNumber: 249,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 w-full overflow-x-auto",
                        children: [
                            paymentHold ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-10 min-w-[140px] flex items-center justify-center rounded-lg border border-amber-200 bg-amber-50 px-3 text-[11px] font-bold text-amber-700 shadow-sm",
                                children: "🔒 Payment Pending"
                            }, void 0, false, {
                                fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                lineNumber: 257,
                                columnNumber: 15
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                className: "h-10 min-w-[140px] rounded-lg border border-gray-200 px-3 text-[11px] font-bold bg-white focus:ring-2 focus:ring-blue-500 outline-none shadow-sm",
                                value: o.status,
                                disabled: locked || updatingId === o._id,
                                onChange: (e)=>handleStatusUpdate(o._id, e.target.value, o),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: o.status,
                                        disabled: true,
                                        children: [
                                            __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$shared$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STATUS_LABEL"][o.status],
                                            " (Current)"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                        lineNumber: 267,
                                        columnNumber: 17
                                    }, this),
                                    __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$shared$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STATUS_OPTIONS"].filter((s)=>(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$shared$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STATUS_FLOW"][o.status] || []).includes(s) && s !== o.status).map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: s,
                                            children: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$shared$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STATUS_LABEL"][s]
                                        }, s, false, {
                                            fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                            lineNumber: 276,
                                            columnNumber: 19
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                lineNumber: 261,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-1.5 shrink-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(IconBtn, {
                                        onClick: ()=>onEdit(o),
                                        className: "bg-amber-400 hover:bg-amber-500 text-white transition",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pen$2d$line$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Edit3$3e$__["Edit3"], {
                                            size: 16
                                        }, void 0, false, {
                                            fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                            lineNumber: 289,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                        lineNumber: 285,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(IconBtn, {
                                        onClick: ()=>onDelete?.(o),
                                        className: "bg-red-500 hover:bg-red-600 text-white transition",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                            size: 16
                                        }, void 0, false, {
                                            fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                            lineNumber: 296,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                        lineNumber: 292,
                                        columnNumber: 15
                                    }, this),
                                    o.status === __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$shared$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["READY_STATUS"] && !o.courier?.trackingId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(IconBtn, {
                                        onClick: ()=>handleStatusUpdate(o._id, "send_to_courier", o),
                                        disabled: updatingId === o._id,
                                        className: "bg-indigo-600 hover:bg-indigo-700 text-white transition disabled:opacity-50",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__["Send"], {
                                            size: 16
                                        }, void 0, false, {
                                            fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                            lineNumber: 307,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                        lineNumber: 300,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                        href: `/api/invoice/${o._id}`,
                                        target: "_blank",
                                        rel: "noreferrer",
                                        className: "bg-blue-600 hover:bg-blue-700 text-white p-3  rounded-lg transition flex items-center justify-center",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
                                            size: 16
                                        }, void 0, false, {
                                            fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                            lineNumber: 317,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                        lineNumber: 311,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                lineNumber: 284,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                        lineNumber: 254,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$CourierStatus$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        trackingId: o.courier?.trackingId,
                        courier: o.courier,
                        orderId: o._id,
                        orderStatus: o.status,
                        onFinalStatus: (orderId, finalStatus)=>{
                            if (__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$shared$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LOCKED_STATUSES"].includes(o.status)) return;
                            if (o.status === finalStatus) return;
                            // ✅ Desktop এর মতো parent এ sync করাবে
                            onFinalStatusSync?.(orderId, finalStatus);
                        }
                    }, void 0, false, {
                        fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                        lineNumber: 323,
                        columnNumber: 11
                    }, this),
                    o.status === "cancelled" && o.cancelReason && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-[11px] text-red-600",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-semibold",
                                children: "Reason:"
                            }, void 0, false, {
                                fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                                lineNumber: 340,
                                columnNumber: 15
                            }, this),
                            " ",
                            o.cancelReason
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                        lineNumber: 339,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
                lineNumber: 135,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
        lineNumber: 62,
        columnNumber: 5
    }, this);
}
_c = OrderCard;
function IconBtn({ children, className = "", disabled, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        disabled: disabled,
        ...props,
        className: `h-10 w-10 grid place-items-center rounded-lg shadow-sm transition active:scale-95 ${disabled ? "opacity-40 cursor-not-allowed" : "hover:brightness-95"} ${className}`,
        children: children
    }, void 0, false, {
        fileName: "[project]/admin/components/orders/ordersGrid/OrderCard.jsx",
        lineNumber: 351,
        columnNumber: 5
    }, this);
}
_c1 = IconBtn;
var _c, _c1;
__turbopack_context__.k.register(_c, "OrderCard");
__turbopack_context__.k.register(_c1, "IconBtn");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/admin/components/orders/ordersGrid/OrdersGrid.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>OrdersGrid
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$shared$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/orders/shared/constants.js [app-client] (ecmascript)"); // ✅ add LOCKED_STATUSES
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$hooks$2f$useOrdersManager$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/orders/hooks/useOrdersManager.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$ordersGrid$2f$StatusSummary$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/orders/ordersGrid/StatusSummary.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$ordersGrid$2f$BulkBar$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/orders/ordersGrid/BulkBar.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$ordersGrid$2f$OrderCard$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/orders/ordersGrid/OrderCard.jsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
function OrdersGrid({ orders, onEdit, onDelete = null, onStatusChange, onSendCourier, onBulkStatusChange, onBulkDelete, onBulkSendCourier }) {
    _s();
    const [tabStatus, setTabStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [openId, setOpenId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [updatingId, setUpdatingId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const manager = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$hooks$2f$useOrdersManager$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
        orders,
        tabStatus
    });
    /* ===============================
     SINGLE ORDER STATUS CHANGE
     READY → SEND_TO_COURIER হলে auto courier create
  =============================== */ const handleChange = async (id, payload, order)=>{
        setUpdatingId(id);
        try {
            // 🚚 READY → SEND TO COURIER
            if (order?.status === __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$shared$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["READY_STATUS"] && payload.status === "send_to_courier") {
                await onSendCourier(order);
                // success হলে selection clear
                manager.setSelected([]);
                return; // ⛔ status update এখানেই থামবে
            }
            // 🔁 NORMAL STATUS UPDATE
            await onStatusChange(id, payload);
            manager.setSelected([]);
        } finally{
            setUpdatingId(null);
        }
    };
    /* ===============================
     COURIER FINAL STATUS SYNC (MOBILE)
     CourierStatus যদি DELIVERED/CANCELLED হয়
     তাহলে backend sync + UI status update হবে
  =============================== */ const handleCourierFinalStatus = async (orderId, finalStatus)=>{
        if (!orderId || !finalStatus) return;
        if (updatingId === orderId) return;
        // locked check (safe)
        const order = (orders || []).find((x)=>x._id === orderId);
        if (order && __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$shared$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LOCKED_STATUSES"]?.includes(order.status)) return;
        if (order && order.status === finalStatus) return;
        setUpdatingId(orderId);
        try {
            const apiUrl = "/api";
            // ✅ backend sync endpoint call
            await fetch(`${apiUrl}/admin/api/sync-courier-final`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    orderId,
                    finalStatus
                })
            });
            // ✅ UI instant update (parent handler)
            await onStatusChange(orderId, {
                status: finalStatus
            });
            manager.setSelected([]);
        } catch (err) {
            console.error("Courier final sync failed:", err);
        } finally{
            setUpdatingId(null);
        }
    };
    /* ===============================
     STATUS COUNT (SUMMARY)
  =============================== */ const statusCount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "OrdersGrid.useMemo[statusCount]": ()=>{
            const base = {
                pending: 0,
                ready_to_delivery: 0,
                send_to_courier: 0,
                delivered: 0,
                cancelled: 0
            };
            (orders || []).forEach({
                "OrdersGrid.useMemo[statusCount]": (o)=>{
                    if (base[o.status] !== undefined) {
                        base[o.status]++;
                    }
                }
            }["OrdersGrid.useMemo[statusCount]"]);
            return base;
        }
    }["OrdersGrid.useMemo[statusCount]"], [
        orders
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "md:hidden space-y-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$ordersGrid$2f$StatusSummary$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                orders: orders || [],
                tabStatus: tabStatus,
                setTabStatus: (s)=>{
                    setTabStatus(s);
                    manager.setSelected([]);
                },
                statusCount: statusCount
            }, void 0, false, {
                fileName: "[project]/admin/components/orders/ordersGrid/OrdersGrid.jsx",
                lineNumber: 119,
                columnNumber: 7
            }, this),
            manager.filteredOrders.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2 px-3 py-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "flex items-center gap-1 cursor-pointer",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "checkbox",
                                checked: manager.allSelected,
                                onChange: manager.toggleAll
                            }, void 0, false, {
                                fileName: "[project]/admin/components/orders/ordersGrid/OrdersGrid.jsx",
                                lineNumber: 134,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs font-semibold whitespace-nowrap",
                                children: [
                                    "Select all (",
                                    manager.filteredOrders.length,
                                    ")"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/components/orders/ordersGrid/OrdersGrid.jsx",
                                lineNumber: 139,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/components/orders/ordersGrid/OrdersGrid.jsx",
                        lineNumber: 133,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$ordersGrid$2f$BulkBar$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            selected: manager.selected,
                            selectedOrders: manager.selectedOrders,
                            sameStatus: manager.sameStatus,
                            bulkStatus: manager.bulkStatus,
                            setSelected: manager.setSelected,
                            onStatusChange: onStatusChange,
                            onBulkStatusChange: onBulkStatusChange,
                            onBulkDelete: onBulkDelete,
                            onBulkSendCourier: onBulkSendCourier
                        }, void 0, false, {
                            fileName: "[project]/admin/components/orders/ordersGrid/OrdersGrid.jsx",
                            lineNumber: 146,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/admin/components/orders/ordersGrid/OrdersGrid.jsx",
                        lineNumber: 145,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/admin/components/orders/ordersGrid/OrdersGrid.jsx",
                lineNumber: 131,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-xl border bg-white shadow-sm overflow-hidden",
                children: manager.filteredOrders.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-6 text-center text-gray-500 text-sm",
                    children: "No orders found."
                }, void 0, false, {
                    fileName: "[project]/admin/components/orders/ordersGrid/OrdersGrid.jsx",
                    lineNumber: 164,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "divide-y",
                    children: manager.filteredOrders.map((o)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$ordersGrid$2f$OrderCard$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            o: o,
                            expanded: openId === o._id,
                            setOpenId: setOpenId,
                            selected: manager.selected,
                            toggleOne: manager.toggleOne,
                            updatingId: updatingId,
                            onStatusChange: handleChange,
                            onEdit: onEdit,
                            onDelete: onDelete,
                            onSendCourier: onSendCourier,
                            onFinalStatusSync: handleCourierFinalStatus
                        }, o._id, false, {
                            fileName: "[project]/admin/components/orders/ordersGrid/OrdersGrid.jsx",
                            lineNumber: 170,
                            columnNumber: 15
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/admin/components/orders/ordersGrid/OrdersGrid.jsx",
                    lineNumber: 168,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/admin/components/orders/ordersGrid/OrdersGrid.jsx",
                lineNumber: 162,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/admin/components/orders/ordersGrid/OrdersGrid.jsx",
        lineNumber: 117,
        columnNumber: 5
    }, this);
}
_s(OrdersGrid, "3wVRLUPedOQqfPo6pKR8Fq3UIOc=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$hooks$2f$useOrdersManager$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
    ];
});
_c = OrdersGrid;
var _c;
__turbopack_context__.k.register(_c, "OrdersGrid");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/admin/components/orders/ordersTable/StatusTabs.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>StatusTabs
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$shared$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/orders/shared/constants.js [app-client] (ecmascript)");
;
;
function StatusTabs({ tabStatus, setTabStatus }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>setTabStatus(""),
                className: `px-3 py-1.5 rounded-full text-sm font-semibold border transition ${tabStatus === "" ? "bg-gray-900 text-white" : "bg-white hover:bg-gray-50"}`,
                children: "All"
            }, void 0, false, {
                fileName: "[project]/admin/components/orders/ordersTable/StatusTabs.jsx",
                lineNumber: 10,
                columnNumber: 7
            }, this),
            __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$shared$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STATUS_OPTIONS"].map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: ()=>setTabStatus(s),
                    className: `px-3 py-1.5 rounded-full text-sm font-semibold border transition ${tabStatus === s ? "bg-blue-600 text-white" : `bg-white hover:bg-gray-50 ${__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$shared$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STATUS_TEXT_COLOR"][s]}`}`,
                    children: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$shared$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STATUS_LABEL"][s]
                }, s, false, {
                    fileName: "[project]/admin/components/orders/ordersTable/StatusTabs.jsx",
                    lineNumber: 22,
                    columnNumber: 9
                }, this))
        ]
    }, void 0, true);
}
_c = StatusTabs;
var _c;
__turbopack_context__.k.register(_c, "StatusTabs");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/admin/components/orders/ordersTable/BulkActions.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>BulkActions
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$shared$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/orders/shared/constants.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$shared$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/orders/shared/utils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$Toast$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/Toast.jsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function BulkActions({ selected, selectedOrders, sameStatus, bulkStatus, canBulkSendCourier, onStatusChange, onBulkStatusChange, onSendCourier, onBulkSendCourier, onBulkDelete, setSelected }) {
    _s();
    const [toast, setToast] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const showToast = (message, type = "error")=>{
        setToast({
            message,
            type
        });
    };
    const allowedNext = __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$shared$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STATUS_FLOW"][bulkStatus] || [];
    const disabled = selected.length === 0;
    // 🔒 Any selected order still awaiting payment verification blocks
    // the bulk status change (cancel is exempt, same as backend rule).
    const hasPaymentHold = selectedOrders.some((o)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$shared$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["needsPaymentVerification"])(o));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            toast && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$Toast$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                message: toast.message,
                type: toast.type,
                onClose: ()=>setToast(null)
            }, void 0, false, {
                fileName: "[project]/admin/components/orders/ordersTable/BulkActions.jsx",
                lineNumber: 37,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2 bg-gray-50 border rounded-full px-3 py-1.5 shadow-sm mr-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xs font-semibold bg-blue-600 text-white px-2 py-0.5 rounded-full",
                        children: [
                            selected.length,
                            " Selected"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/components/orders/ordersTable/BulkActions.jsx",
                        lineNumber: 47,
                        columnNumber: 9
                    }, this),
                    hasPaymentHold && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5",
                        title: "Selected এর মধ্যে কিছু order এর Payment এখনো verify করা হয়নি",
                        children: "⏳ Payment Pending"
                    }, void 0, false, {
                        fileName: "[project]/admin/components/orders/ordersTable/BulkActions.jsx",
                        lineNumber: 53,
                        columnNumber: 11
                    }, this),
                    sameStatus && bulkStatus && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        className: "rounded-full px-2 py-1 text-xs bg-white border",
                        value: bulkStatus,
                        disabled: disabled || hasPaymentHold,
                        onChange: async (e)=>{
                            const nextStatus = e.target.value;
                            if (hasPaymentHold && nextStatus !== "cancelled") {
                                showToast("কিছু Order এর Payment এখনো verify করা হয়নি। আগে Payments পেজ থেকে Accept/Reject করুন।");
                                return;
                            }
                            if (!allowedNext.includes(nextStatus)) {
                                showToast("এই status এ bulk update করা যাবে না");
                                return;
                            }
                            try {
                                // 🚚 SEND TO COURIER (SPECIAL CASE)
                                if (nextStatus === "send_to_courier") {
                                    if (selected.length === 1) {
                                        await onSendCourier(selectedOrders[0]);
                                    } else {
                                        await onBulkSendCourier(selectedOrders);
                                    }
                                    showToast("Courier order তৈরি হয়েছে", "success");
                                    return;
                                }
                                // 🔁 NORMAL STATUS UPDATE
                                if (selected.length === 1) {
                                    await onStatusChange(selected[0], {
                                        status: nextStatus
                                    });
                                } else {
                                    await onBulkStatusChange(selected, {
                                        status: nextStatus
                                    });
                                }
                                showToast("Status update হয়েছে", "success");
                            } finally{
                                setSelected([]);
                            }
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: bulkStatus,
                                disabled: true,
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$shared$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STATUS_LABEL"][bulkStatus]
                            }, void 0, false, {
                                fileName: "[project]/admin/components/orders/ordersTable/BulkActions.jsx",
                                lineNumber: 108,
                                columnNumber: 13
                            }, this),
                            __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$shared$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STATUS_OPTIONS"].filter((s)=>allowedNext.includes(s)).map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: s,
                                    children: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$shared$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STATUS_LABEL"][s]
                                }, s, false, {
                                    fileName: "[project]/admin/components/orders/ordersTable/BulkActions.jsx",
                                    lineNumber: 113,
                                    columnNumber: 15
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/components/orders/ordersTable/BulkActions.jsx",
                        lineNumber: 63,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        disabled: disabled,
                        onClick: ()=>{
                            if (!selected.length) {
                                showToast("Delete করার জন্য কোনো order select করা হয়নি");
                                return;
                            }
                            onBulkDelete(selected);
                            setSelected([]);
                            showToast("Order delete হয়েছে", "success");
                        },
                        className: `px-3 py-1 rounded-full text-xs text-white ${disabled ? "bg-red-300 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}`,
                        children: "Delete"
                    }, void 0, false, {
                        fileName: "[project]/admin/components/orders/ordersTable/BulkActions.jsx",
                        lineNumber: 121,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/admin/components/orders/ordersTable/BulkActions.jsx",
                lineNumber: 45,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_s(BulkActions, "F97EANJWsnaAE0wHKn9qNrF71cE=");
_c = BulkActions;
var _c;
__turbopack_context__.k.register(_c, "BulkActions");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/admin/components/orders/ordersTable/OrdersTable.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>OrdersTable
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__ = __turbopack_context__.i("[project]/admin/node_modules/lucide-react/dist/esm/icons/send.js [app-client] (ecmascript) <export default as Send>");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/admin/node_modules/lucide-react/dist/esm/icons/file-text.js [app-client] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pen$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Edit2$3e$__ = __turbopack_context__.i("[project]/admin/node_modules/lucide-react/dist/esm/icons/pen.js [app-client] (ecmascript) <export default as Edit2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/admin/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$Badge$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/Badge.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$CopyButton$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/CopyButton.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$CourierStatus$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/CourierStatus.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$shared$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/orders/shared/constants.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$shared$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/orders/shared/utils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$hooks$2f$useOrdersManager$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/orders/hooks/useOrdersManager.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$ordersTable$2f$StatusTabs$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/orders/ordersTable/StatusTabs.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$ordersTable$2f$BulkActions$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/orders/ordersTable/BulkActions.jsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
;
function OrdersTable({ orders, onEdit, onDelete = null, onStatusChange, onSendCourier, onBulkStatusChange, onBulkDelete, onBulkSendCourier }) {
    _s();
    const [tabStatus, setTabStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [q, setQ] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [updatingId, setUpdatingId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const manager = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$hooks$2f$useOrdersManager$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
        orders,
        tabStatus,
        search: q
    });
    /* ===============================
     SINGLE ORDER STATUS CHANGE
  =============================== */ const handleChange = async (id, payload, order)=>{
        setUpdatingId(id);
        try {
            if (order?.status === __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$shared$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["READY_STATUS"] && payload.status === "send_to_courier") {
                await onSendCourier(order);
                manager.setSelected([]);
                return;
            }
            await onStatusChange(id, payload);
            manager.setSelected([]);
        } finally{
            setUpdatingId(null);
        }
    };
    /* ===============================
     COURIER FINAL STATUS SYNC
  =============================== */ const handleCourierFinalStatus = async (orderId, finalStatus)=>{
        if (!orderId || !finalStatus) return;
        if (updatingId === orderId) return;
        setUpdatingId(orderId);
        try {
            const apiUrl = "/api";
            await fetch(`${apiUrl}/admin/api/sync-courier-final`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    orderId,
                    finalStatus
                })
            });
            await onStatusChange(orderId, {
                status: finalStatus
            });
            manager.setSelected([]);
        } catch (err) {
            console.error("Courier final sync failed:", err);
        } finally{
            setUpdatingId(null);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "hidden md:block space-y-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-lg border shadow-sm p-3 space-y-3 sticky top-0 z-30 bg-white/95",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        className: "border rounded px-3 py-2 w-full",
                        placeholder: "Search by OrderID / Name / Phone",
                        value: q,
                        onChange: (e)=>{
                            setQ(e.target.value);
                            manager.setSelected([]);
                        }
                    }, void 0, false, {
                        fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                        lineNumber: 96,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-wrap items-center gap-2 px-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$ordersTable$2f$StatusTabs$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                tabStatus: tabStatus,
                                setTabStatus: (s)=>{
                                    setTabStatus(s);
                                    manager.setSelected([]);
                                }
                            }, void 0, false, {
                                fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                lineNumber: 107,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1"
                            }, void 0, false, {
                                fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                lineNumber: 115,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$ordersTable$2f$BulkActions$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                selected: manager.selected,
                                selectedOrders: manager.selectedOrders,
                                sameStatus: manager.sameStatus,
                                bulkStatus: manager.bulkStatus,
                                canBulkSendCourier: manager.canBulkSendCourier,
                                setSelected: manager.setSelected,
                                onStatusChange: onStatusChange,
                                onBulkStatusChange: onBulkStatusChange,
                                onSendCourier: onSendCourier,
                                onBulkSendCourier: onBulkSendCourier,
                                onBulkDelete: onBulkDelete
                            }, void 0, false, {
                                fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                lineNumber: 117,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                        lineNumber: 106,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-xs text-gray-500 px-1",
                        children: [
                            "Showing:",
                            " ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-semibold",
                                children: manager.filteredOrders.length
                            }, void 0, false, {
                                fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                lineNumber: 134,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                        lineNumber: 132,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                lineNumber: 95,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "overflow-x-auto bg-white rounded-lg border shadow-sm",
                children: !manager.filteredOrders.length ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-6 text-center text-gray-500",
                    children: "No orders found."
                }, void 0, false, {
                    fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                    lineNumber: 141,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                    className: "min-w-full text-sm",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                            className: "bg-gray-100",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "p-3",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "checkbox",
                                            checked: manager.allSelected,
                                            onChange: manager.toggleAll
                                        }, void 0, false, {
                                            fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                            lineNumber: 147,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                        lineNumber: 146,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "p-3 text-left",
                                        children: "Order"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                        lineNumber: 153,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "p-3 text-left",
                                        children: "Customer"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                        lineNumber: 154,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "p-3 text-left",
                                        children: "Items"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                        lineNumber: 155,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "p-3 text-left",
                                        children: "Totals"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                        lineNumber: 156,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "p-3 text-left",
                                        children: "Payment"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                        lineNumber: 157,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "p-3 text-left",
                                        children: "Status Info"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                        lineNumber: 158,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "p-3 text-left",
                                        children: "Control"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                        lineNumber: 159,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "p-3 text-left",
                                        children: "Actions"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                        lineNumber: 160,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                lineNumber: 145,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                            lineNumber: 144,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                            children: manager.filteredOrders.map((o)=>{
                                const locked = __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$shared$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LOCKED_STATUSES"].includes(o.status);
                                const allowedNext = __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$shared$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STATUS_FLOW"][o.status] || [];
                                const isAdminCreated = o?.createdBy === "admin";
                                const paymentHold = !locked && (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$shared$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["needsPaymentVerification"])(o);
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    className: `border-t hover:bg-gray-50 ${manager.selected.includes(o._id) ? "bg-blue-50" : ""}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "p-3",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "checkbox",
                                                checked: manager.selected.includes(o._id),
                                                onChange: ()=>manager.toggleOne(o._id),
                                                disabled: locked
                                            }, void 0, false, {
                                                fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                lineNumber: 180,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                            lineNumber: 179,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "p-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "font-mono text-xs text-gray-500",
                                                    children: [
                                                        "#",
                                                        o.orderNumber ?? o._id
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                    lineNumber: 189,
                                                    columnNumber: 23
                                                }, this),
                                                isAdminCreated && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "mt-1 inline-flex items-center gap-1 text-[10px] text-blue-700",
                                                    children: [
                                                        "Created by :",
                                                        o?.createdByName && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "font-semibold",
                                                            children: o.createdByName
                                                        }, void 0, false, {
                                                            fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                            lineNumber: 197,
                                                            columnNumber: 29
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                    lineNumber: 194,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-xs text-gray-500 mt-1",
                                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$shared$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatOrderTime"])(o)
                                                }, void 0, false, {
                                                    fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                    lineNumber: 204,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                            lineNumber: 188,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "p-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "font-semibold",
                                                    children: o.billing?.name
                                                }, void 0, false, {
                                                    fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                    lineNumber: 210,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: o.billing?.phone
                                                }, void 0, false, {
                                                    fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                    lineNumber: 211,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: o.billing?.address
                                                }, void 0, false, {
                                                    fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                    lineNumber: 212,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                            lineNumber: 209,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "p-2",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-2 max-w-[200px]",
                                                children: [
                                                    (o.items || []).slice(0, 2).map((it, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center gap-2 rounded-lg border bg-gray-50 p-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                    src: it.image || "/placeholder.png",
                                                                    className: "w-8 h-8 rounded-md border",
                                                                    alt: ""
                                                                }, void 0, false, {
                                                                    fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                                    lineNumber: 222,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "min-w-0",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-xs font-semibold truncate",
                                                                            children: it.name
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                                            lineNumber: 228,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-[11px] text-gray-500",
                                                                            children: [
                                                                                "Qty: ",
                                                                                it.qty,
                                                                                " • ৳",
                                                                                it.price
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                                            lineNumber: 231,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                                    lineNumber: 227,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, idx, true, {
                                                            fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                            lineNumber: 218,
                                                            columnNumber: 27
                                                        }, this)),
                                                    o.items?.length > 2 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-[11px] text-gray-500",
                                                        children: [
                                                            "+",
                                                            o.items.length - 2,
                                                            " more items"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                        lineNumber: 239,
                                                        columnNumber: 27
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                lineNumber: 216,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                            lineNumber: 215,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "p-1 text-xs space-y-1 min-w-[90px]",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex justify-between",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-gray-500",
                                                            children: "Subtotal"
                                                        }, void 0, false, {
                                                            fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                            lineNumber: 248,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: [
                                                                "৳",
                                                                o.subtotal
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                            lineNumber: 249,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                    lineNumber: 247,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex justify-between",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-gray-500",
                                                            children: "Delivery"
                                                        }, void 0, false, {
                                                            fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                            lineNumber: 253,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: [
                                                                "৳",
                                                                o.deliveryCharge
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                            lineNumber: 254,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                    lineNumber: 252,
                                                    columnNumber: 23
                                                }, this),
                                                !!o.discount && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex justify-between text-red-600",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: "Discount"
                                                        }, void 0, false, {
                                                            fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                            lineNumber: 259,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: [
                                                                "-৳",
                                                                o.discount
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                            lineNumber: 260,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                    lineNumber: 258,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex justify-between font-bold border-t pt-1",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: "Total"
                                                        }, void 0, false, {
                                                            fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                            lineNumber: 265,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: [
                                                                "৳",
                                                                o.total
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                            lineNumber: 266,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                    lineNumber: 264,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                            lineNumber: 246,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "p-2 space-y-1 min-w-[150px]",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-1 flex-wrap",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$Badge$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                            children: o.paymentMethod?.toUpperCase()
                                                        }, void 0, false, {
                                                            fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                            lineNumber: 272,
                                                            columnNumber: 25
                                                        }, this),
                                                        o.paymentMethod !== "cod" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: `text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full border ${o.paymentStatus === "paid" ? "bg-green-50 text-green-700 border-green-200" : o.paymentStatus === "failed" ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200"}`,
                                                            children: o.paymentStatus === "paid" ? "Verified" : o.paymentStatus === "failed" ? "Rejected" : "Pending"
                                                        }, void 0, false, {
                                                            fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                            lineNumber: 274,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                    lineNumber: 271,
                                                    columnNumber: 23
                                                }, this),
                                                o.paymentMethod !== "cod" && o.paymentDetails?.transactionId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-[11px] text-gray-600 flex items-center gap-1",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-gray-400",
                                                            children: "TrxID:"
                                                        }, void 0, false, {
                                                            fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                            lineNumber: 295,
                                                            columnNumber: 29
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "font-mono font-semibold text-gray-800 truncate max-w-[90px]",
                                                            children: o.paymentDetails.transactionId
                                                        }, void 0, false, {
                                                            fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                            lineNumber: 296,
                                                            columnNumber: 29
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$CopyButton$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                            value: o.paymentDetails.transactionId
                                                        }, void 0, false, {
                                                            fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                            lineNumber: 299,
                                                            columnNumber: 29
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                    lineNumber: 294,
                                                    columnNumber: 27
                                                }, this),
                                                o.paymentMethod !== "cod" && o.paymentDetails?.senderNumber && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-[11px] text-gray-500",
                                                    children: [
                                                        "Sender: ",
                                                        o.paymentDetails.senderNumber
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                    lineNumber: 307,
                                                    columnNumber: 27
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                            lineNumber: 270,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "p-2 space-y-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: `text-[11px] px-2 py-0 rounded-full border ${__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$shared$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STATUS_BADGE_COLOR"][o.status]}`,
                                                    children: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$shared$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STATUS_LABEL"][o.status]
                                                }, void 0, false, {
                                                    fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                    lineNumber: 314,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$CourierStatus$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                    trackingId: o.courier?.trackingId,
                                                    courier: o.courier,
                                                    orderId: o._id,
                                                    orderStatus: o.status,
                                                    onFinalStatus: (orderId, finalStatus)=>{
                                                        if (__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$shared$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LOCKED_STATUSES"].includes(o.status)) return;
                                                        if (o.status === finalStatus) return;
                                                        handleCourierFinalStatus(orderId, finalStatus);
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                    lineNumber: 320,
                                                    columnNumber: 23
                                                }, this),
                                                o.status === "cancelled" && o.cancelReason && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-[11px] text-red-600",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "font-semibold",
                                                            children: "Reason:"
                                                        }, void 0, false, {
                                                            fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                            lineNumber: 334,
                                                            columnNumber: 27
                                                        }, this),
                                                        " ",
                                                        o.cancelReason
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                    lineNumber: 333,
                                                    columnNumber: 25
                                                }, this),
                                                paymentHold && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 max-w-[180px]",
                                                    children: "⏳ Payment verify হয়নি — status hold করা আছে। Payments পেজ থেকে Accept/Reject করুন।"
                                                }, void 0, false, {
                                                    fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                    lineNumber: 340,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                            lineNumber: 313,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "p-3",
                                            children: paymentHold ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-xs text-amber-700 border border-amber-200 bg-amber-50 rounded px-2 py-1.5 text-center",
                                                title: "Payment এখনো verify করা হয়নি, তাই status পরিবর্তন করা যাবে না",
                                                children: "🔒 Payment Pending"
                                            }, void 0, false, {
                                                fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                lineNumber: 348,
                                                columnNumber: 25
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                className: "border rounded px-2 py-1 text-sm w-full",
                                                value: o.status,
                                                disabled: locked || updatingId === o._id,
                                                onChange: (e)=>handleChange(o._id, {
                                                        status: e.target.value
                                                    }, o),
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: o.status,
                                                        disabled: true,
                                                        children: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$shared$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STATUS_LABEL"][o.status]
                                                    }, void 0, false, {
                                                        fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                        lineNumber: 363,
                                                        columnNumber: 27
                                                    }, this),
                                                    __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$shared$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STATUS_OPTIONS"].filter((s)=>allowedNext.includes(s)).map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: s,
                                                            children: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$shared$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STATUS_LABEL"][s]
                                                        }, s, false, {
                                                            fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                            lineNumber: 370,
                                                            columnNumber: 29
                                                        }, this))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                lineNumber: 355,
                                                columnNumber: 25
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                            lineNumber: 346,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "p-3 ",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>onEdit(o),
                                                        className: "bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pen$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Edit2$3e$__["Edit2"], {
                                                                size: 14
                                                            }, void 0, false, {
                                                                fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                                lineNumber: 387,
                                                                columnNumber: 27
                                                            }, this),
                                                            "Edit"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                        lineNumber: 383,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>onDelete?.(o),
                                                        className: "bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                                                size: 14
                                                            }, void 0, false, {
                                                                fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                                lineNumber: 396,
                                                                columnNumber: 27
                                                            }, this),
                                                            "Delete"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                        lineNumber: 392,
                                                        columnNumber: 25
                                                    }, this),
                                                    o.status === __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$shared$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["READY_STATUS"] && !o.courier?.trackingId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>handleChange(o._id, {
                                                                status: "send_to_courier"
                                                            }, o),
                                                        disabled: updatingId === o._id,
                                                        className: "bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition disabled:opacity-50",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__["Send"], {
                                                                size: 14
                                                            }, void 0, false, {
                                                                fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                                lineNumber: 414,
                                                                columnNumber: 31
                                                            }, this),
                                                            "Send"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                        lineNumber: 403,
                                                        columnNumber: 29
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                        href: `/api/invoice/${o._id}`,
                                                        target: "_blank",
                                                        rel: "noreferrer",
                                                        className: "bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
                                                                size: 14
                                                            }, void 0, false, {
                                                                fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                                lineNumber: 426,
                                                                columnNumber: 27
                                                            }, this),
                                                            "Invoice"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                        lineNumber: 420,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                                lineNumber: 381,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                            lineNumber: 380,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, o._id, true, {
                                    fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                                    lineNumber: 172,
                                    columnNumber: 19
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                            lineNumber: 164,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                    lineNumber: 143,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
                lineNumber: 139,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/admin/components/orders/ordersTable/OrdersTable.jsx",
        lineNumber: 93,
        columnNumber: 5
    }, this);
}
_s(OrdersTable, "Qzd4PTA5NkFo48Ju4lJxJ65X9Ac=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$hooks$2f$useOrdersManager$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
    ];
});
_c = OrdersTable;
var _c;
__turbopack_context__.k.register(_c, "OrdersTable");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/admin/components/orders/modals/ModalWrapper.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ModalWrapper
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
"use client";
;
function ModalWrapper({ open, children }) {
    if (!open) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            }, void 0, false, {
                fileName: "[project]/admin/components/orders/modals/ModalWrapper.jsx",
                lineNumber: 9,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 flex justify-center items-center z-50 p-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-white p-6 rounded-xl w-full max-w-sm shadow",
                    children: children
                }, void 0, false, {
                    fileName: "[project]/admin/components/orders/modals/ModalWrapper.jsx",
                    lineNumber: 13,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/admin/components/orders/modals/ModalWrapper.jsx",
                lineNumber: 12,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_c = ModalWrapper;
var _c;
__turbopack_context__.k.register(_c, "ModalWrapper");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/admin/components/orders/modals/EditOrderModal.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>EditOrderModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$Toast$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/Toast.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$modals$2f$ModalWrapper$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/orders/modals/ModalWrapper.jsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function EditOrderModal({ open, form, setForm, onSave, onClose }) {
    _s();
    const [toast, setToast] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [initialForm, setInitialForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [touched, setTouched] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        name: false,
        phone: false,
        address: false,
        cancelReason: false
    });
    const [submitted, setSubmitted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "EditOrderModal.useEffect": ()=>{
            if (open) {
                setInitialForm(form ? JSON.stringify(form) : null);
                setSubmitted(false);
                setTouched({
                    name: false,
                    phone: false,
                    address: false,
                    cancelReason: false
                });
            }
        }
    }["EditOrderModal.useEffect"], [
        open
    ]);
    const isDirty = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "EditOrderModal.useMemo[isDirty]": ()=>{
            if (!initialForm) return false;
            return JSON.stringify(form) !== initialForm;
        }
    }["EditOrderModal.useMemo[isDirty]"], [
        form,
        initialForm
    ]);
    if (!open) return null;
    const showToast = (message, type = "error", ms = 2000)=>{
        setToast({
            message,
            type
        });
        setTimeout(()=>setToast(null), ms);
    };
    const handleBillingChange = (field, value)=>{
        setForm((prev)=>({
                ...prev,
                billing: {
                    ...prev.billing,
                    [field]: value
                }
            }));
    };
    const handleDiscountChange = (value)=>{
        let num = Number(value);
        if (isNaN(num) || num < 0) num = 0;
        setForm((prev)=>({
                ...prev,
                discount: num
            }));
    };
    const phoneValid = /^(01[3-9]\d{8})$/.test(form?.billing?.phone || "");
    const isCancelled = form.status === "cancelled";
    const errors = {
        name: !form?.billing?.name?.trim(),
        phone: !form?.billing?.phone?.trim() || !phoneValid,
        address: !form?.billing?.address?.trim(),
        cancelReason: isCancelled && !form?.cancelReason?.trim()
    };
    const fieldClass = (hasError)=>`border rounded px-3 py-2 w-full outline-none transition ${hasError ? "border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200" : "border-gray-300 focus:ring-2 focus:ring-green-200"}`;
    const labelClass = (hasError)=>`block text-sm font-medium mb-1 ${hasError ? "text-red-600" : ""}`;
    const handleSave = async ()=>{
        setSubmitted(true);
        if (errors.name || errors.phone || errors.address || errors.cancelReason) {
            showToast("⚠️ সব প্রয়োজনীয় তথ্য ঠিকমতো দিন!", "error", 2500);
            return;
        }
        if (!isDirty) {
            showToast("ℹ️ কোনো পরিবর্তন হয়নি!", "error", 1800);
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
            showToast("❌ Something went wrong while saving!", "error", 2000);
        } finally{
            setLoading(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            toast && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$Toast$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                message: toast.message,
                type: toast.type,
                onClose: ()=>setToast(null)
            }, void 0, false, {
                fileName: "[project]/admin/components/orders/modals/EditOrderModal.jsx",
                lineNumber: 126,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$modals$2f$ModalWrapper$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                open: open,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-xl font-bold text-blue-600 mb-3",
                        children: "✏️ Edit Order"
                    }, void 0, false, {
                        fileName: "[project]/admin/components/orders/modals/EditOrderModal.jsx",
                        lineNumber: 134,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-3 mb-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "block text-sm font-medium mb-1",
                                        children: "Payment Method"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/orders/modals/EditOrderModal.jsx",
                                        lineNumber: 139,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        className: "border rounded px-3 py-2 w-full",
                                        value: form.paymentMethod,
                                        onChange: (e)=>setForm((prev)=>({
                                                    ...prev,
                                                    paymentMethod: e.target.value
                                                })),
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "cod",
                                                children: "COD"
                                            }, void 0, false, {
                                                fileName: "[project]/admin/components/orders/modals/EditOrderModal.jsx",
                                                lineNumber: 152,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "bkash",
                                                children: "bKash"
                                            }, void 0, false, {
                                                fileName: "[project]/admin/components/orders/modals/EditOrderModal.jsx",
                                                lineNumber: 153,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/admin/components/orders/modals/EditOrderModal.jsx",
                                        lineNumber: 142,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/components/orders/modals/EditOrderModal.jsx",
                                lineNumber: 138,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "block text-sm font-medium mb-1",
                                        children: "Tracking ID"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/orders/modals/EditOrderModal.jsx",
                                        lineNumber: 159,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        className: "border rounded px-3 py-2 w-full",
                                        value: form.trackingId || "",
                                        onChange: (e)=>setForm((prev)=>({
                                                    ...prev,
                                                    trackingId: e.target.value
                                                }))
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/orders/modals/EditOrderModal.jsx",
                                        lineNumber: 162,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/components/orders/modals/EditOrderModal.jsx",
                                lineNumber: 158,
                                columnNumber: 11
                            }, this),
                            isCancelled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: labelClass((submitted || touched.cancelReason) && errors.cancelReason),
                                        children: "Cancel Reason *"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/orders/modals/EditOrderModal.jsx",
                                        lineNumber: 177,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                        rows: 2,
                                        className: `${fieldClass((submitted || touched.cancelReason) && errors.cancelReason)} resize-y`,
                                        value: form.cancelReason || "",
                                        onBlur: ()=>setTouched((t)=>({
                                                    ...t,
                                                    cancelReason: true
                                                })),
                                        onChange: (e)=>setForm((prev)=>({
                                                    ...prev,
                                                    cancelReason: e.target.value
                                                }))
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/orders/modals/EditOrderModal.jsx",
                                        lineNumber: 184,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/components/orders/modals/EditOrderModal.jsx",
                                lineNumber: 176,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "border rounded p-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "font-semibold text-sm mb-2",
                                        children: "Customer"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/orders/modals/EditOrderModal.jsx",
                                        lineNumber: 208,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mb-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: labelClass((submitted || touched.name) && errors.name),
                                                children: "Name *"
                                            }, void 0, false, {
                                                fileName: "[project]/admin/components/orders/modals/EditOrderModal.jsx",
                                                lineNumber: 211,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                className: fieldClass((submitted || touched.name) && errors.name),
                                                value: form.billing.name,
                                                onBlur: ()=>setTouched((t)=>({
                                                            ...t,
                                                            name: true
                                                        })),
                                                onChange: (e)=>handleBillingChange("name", e.target.value)
                                            }, void 0, false, {
                                                fileName: "[project]/admin/components/orders/modals/EditOrderModal.jsx",
                                                lineNumber: 218,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/admin/components/orders/modals/EditOrderModal.jsx",
                                        lineNumber: 210,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mb-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: labelClass((submitted || touched.phone) && errors.phone),
                                                children: "Phone *"
                                            }, void 0, false, {
                                                fileName: "[project]/admin/components/orders/modals/EditOrderModal.jsx",
                                                lineNumber: 229,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                className: fieldClass((submitted || touched.phone) && errors.phone),
                                                value: form.billing.phone,
                                                onBlur: ()=>setTouched((t)=>({
                                                            ...t,
                                                            phone: true
                                                        })),
                                                onChange: (e)=>handleBillingChange("phone", e.target.value)
                                            }, void 0, false, {
                                                fileName: "[project]/admin/components/orders/modals/EditOrderModal.jsx",
                                                lineNumber: 236,
                                                columnNumber: 15
                                            }, this),
                                            (submitted || touched.phone) && errors.phone && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-red-600 mt-1",
                                                children: "01 দিয়ে শুরু হওয়া 11 ডিজিট নাম্বার দিন"
                                            }, void 0, false, {
                                                fileName: "[project]/admin/components/orders/modals/EditOrderModal.jsx",
                                                lineNumber: 245,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/admin/components/orders/modals/EditOrderModal.jsx",
                                        lineNumber: 228,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: labelClass((submitted || touched.address) && errors.address),
                                                children: "Address *"
                                            }, void 0, false, {
                                                fileName: "[project]/admin/components/orders/modals/EditOrderModal.jsx",
                                                lineNumber: 252,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                rows: 3,
                                                className: `${fieldClass((submitted || touched.address) && errors.address)} resize-y`,
                                                value: form.billing.address,
                                                onBlur: ()=>setTouched((t)=>({
                                                            ...t,
                                                            address: true
                                                        })),
                                                onChange: (e)=>handleBillingChange("address", e.target.value)
                                            }, void 0, false, {
                                                fileName: "[project]/admin/components/orders/modals/EditOrderModal.jsx",
                                                lineNumber: 259,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/admin/components/orders/modals/EditOrderModal.jsx",
                                        lineNumber: 251,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/components/orders/modals/EditOrderModal.jsx",
                                lineNumber: 207,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/components/orders/modals/EditOrderModal.jsx",
                        lineNumber: 136,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex justify-end gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: onClose,
                                disabled: loading,
                                className: "px-4 py-2 border rounded",
                                children: "Cancel"
                            }, void 0, false, {
                                fileName: "[project]/admin/components/orders/modals/EditOrderModal.jsx",
                                lineNumber: 278,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleSave,
                                disabled: loading || !isDirty,
                                className: "px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60 disabled:cursor-not-allowed",
                                children: loading ? "Saving..." : "Save"
                            }, void 0, false, {
                                fileName: "[project]/admin/components/orders/modals/EditOrderModal.jsx",
                                lineNumber: 286,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/components/orders/modals/EditOrderModal.jsx",
                        lineNumber: 277,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/admin/components/orders/modals/EditOrderModal.jsx",
                lineNumber: 133,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_s(EditOrderModal, "v6YxFytiqeYhbZ2/2xj+ycuIqe8=");
_c = EditOrderModal;
var _c;
__turbopack_context__.k.register(_c, "EditOrderModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/admin/components/orders/modals/CreateOrderModal.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CreateOrderModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
const phoneRegex = /^(01[3-9]\d{8})$/;
function CreateOrderModal({ open, onClose, onCreate, API }) {
    _s();
    /* ===========================
     ✅ PRODUCTS
  ============================ */ const [products, setProducts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loadingProducts, setLoadingProducts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    /* ===========================
     ✅ DELIVERY CHARGE (DB)
  ============================ */ const [deliveryCharge, setDeliveryCharge] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [deliveryLoading, setDeliveryLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    /* ===========================
     ✅ PRODUCT PICKER POPUP
  ============================ */ const [pickerOpen, setPickerOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [pickerIndex, setPickerIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [productQuery, setProductQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    /* ===========================
     ✅ BILLING
  ============================ */ const [billing, setBilling] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        name: "",
        phone: "",
        address: "",
        note: ""
    });
    const [touched, setTouched] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        name: false,
        phone: false,
        address: false
    });
    /* ===========================
     ✅ ORDER SETTINGS
  ============================ */ const [discount, setDiscount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [paymentMethod, setPaymentMethod] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("cod");
    const [paymentStatus, setPaymentStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("pending");
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("pending");
    /* ===========================
     ✅ ITEMS
  ============================ */ const [items, setItems] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([
        {
            productId: "",
            qty: 1,
            color: null
        }
    ]);
    /* ===========================
     ✅ LOAD PRODUCTS WHEN OPEN
  ============================ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CreateOrderModal.useEffect": ()=>{
            if (!open) return;
            let alive = true;
            setLoadingProducts(true);
            fetch(`${API}/products`).then({
                "CreateOrderModal.useEffect": (res)=>res.json()
            }["CreateOrderModal.useEffect"]).then({
                "CreateOrderModal.useEffect": (data)=>{
                    if (!alive) return;
                    setProducts(Array.isArray(data) ? data : []);
                }
            }["CreateOrderModal.useEffect"]).catch({
                "CreateOrderModal.useEffect": ()=>{
                    if (!alive) return;
                    setProducts([]);
                }
            }["CreateOrderModal.useEffect"]).finally({
                "CreateOrderModal.useEffect": ()=>{
                    if (!alive) return;
                    setLoadingProducts(false);
                }
            }["CreateOrderModal.useEffect"]);
            return ({
                "CreateOrderModal.useEffect": ()=>{
                    alive = false;
                }
            })["CreateOrderModal.useEffect"];
        }
    }["CreateOrderModal.useEffect"], [
        open,
        API
    ]);
    /* ===========================
     ✅ LOAD DELIVERY CHARGE FROM DB
  ============================ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CreateOrderModal.useEffect": ()=>{
            if (!open) return;
            let alive = true;
            setDeliveryLoading(true);
            fetch(`${API}/deliveryCharge`).then({
                "CreateOrderModal.useEffect": (res)=>res.json()
            }["CreateOrderModal.useEffect"]).then({
                "CreateOrderModal.useEffect": (data)=>{
                    if (!alive) return;
                    const fee = Number(data?.fee);
                    setDeliveryCharge(Number.isFinite(fee) ? fee : 0);
                }
            }["CreateOrderModal.useEffect"]).catch({
                "CreateOrderModal.useEffect": ()=>{
                    if (!alive) return;
                    setDeliveryCharge(0);
                }
            }["CreateOrderModal.useEffect"]).finally({
                "CreateOrderModal.useEffect": ()=>{
                    if (!alive) return;
                    setDeliveryLoading(false);
                }
            }["CreateOrderModal.useEffect"]);
            return ({
                "CreateOrderModal.useEffect": ()=>{
                    alive = false;
                }
            })["CreateOrderModal.useEffect"];
        }
    }["CreateOrderModal.useEffect"], [
        open,
        API
    ]);
    /* ===========================
     ✅ RESET ON OPEN
  ============================ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CreateOrderModal.useEffect": ()=>{
            if (!open) return;
            setPickerOpen(false);
            setPickerIndex(null);
            setProductQuery("");
            setTouched({
                name: false,
                phone: false,
                address: false
            });
            setBilling({
                name: "",
                phone: "",
                address: "",
                note: ""
            });
            setItems([
                {
                    productId: "",
                    qty: 1,
                    color: null
                }
            ]);
            setDiscount(0);
            setPaymentMethod("cod");
            setPaymentStatus("pending");
            setStatus("pending");
        }
    }["CreateOrderModal.useEffect"], [
        open
    ]);
    /* ===========================
     ✅ HELPERS
  ============================ */ const toNumber = (v, fallback = 0)=>{
        const n = Number(v);
        return Number.isFinite(n) ? n : fallback;
    };
    const getProduct = (pid)=>products.find((p)=>String(p._id) === String(pid));
    const findVariant = (p, color)=>{
        if (!p || !color) return null;
        const target = String(color).trim().toLowerCase();
        const colors = Array.isArray(p.colors) ? p.colors : [];
        return colors.find((c)=>String(c?.name || "").trim().toLowerCase() === target) || null;
    };
    /* ===========================
     ✅ FILTER PRODUCTS (SEARCH)
  ============================ */ const filteredProducts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CreateOrderModal.useMemo[filteredProducts]": ()=>{
            if (!productQuery.trim()) return products;
            const q = productQuery.trim().toLowerCase();
            return products.filter({
                "CreateOrderModal.useMemo[filteredProducts]": (p)=>{
                    const name = String(p?.name || "").toLowerCase();
                    const id = String(p?._id || "").toLowerCase();
                    return name.includes(q) || id.includes(q);
                }
            }["CreateOrderModal.useMemo[filteredProducts]"]);
        }
    }["CreateOrderModal.useMemo[filteredProducts]"], [
        productQuery,
        products
    ]);
    /* ===========================
     ✅ VIEW ITEMS FOR SUMMARY
  ============================ */ const viewItems = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CreateOrderModal.useMemo[viewItems]": ()=>{
            return items.map({
                "CreateOrderModal.useMemo[viewItems]": (it)=>{
                    const p = getProduct(it.productId);
                    if (!p) return null;
                    const variant = findVariant(p, it.color);
                    const stock = toNumber(variant?.stock ?? p?.stock ?? 0, 0);
                    const image = variant?.images?.[0] || p.image || (Array.isArray(p.images) ? p.images[0] : null) || "/no-image.png";
                    return {
                        ...it,
                        name: p.name || "Product",
                        price: toNumber(p.price, 0),
                        stock,
                        image,
                        colorLabel: variant?.name || it.color || null
                    };
                }
            }["CreateOrderModal.useMemo[viewItems]"]).filter(Boolean);
        }
    }["CreateOrderModal.useMemo[viewItems]"], [
        items,
        products
    ]);
    const subtotal = viewItems.reduce((sum, it)=>sum + toNumber(it.price, 0) * toNumber(it.qty, 0), 0);
    const total = Math.max(0, subtotal + toNumber(deliveryCharge, 0) - toNumber(discount, 0));
    /* ===========================
     ✅ VALIDATION
  ============================ */ const errors = {
        name: !billing.name.trim(),
        phone: !billing.phone.trim() || !phoneRegex.test(billing.phone.trim()),
        address: !billing.address.trim()
    };
    const canSubmit = !deliveryLoading && !errors.name && !errors.phone && !errors.address && items.some((x)=>x.productId && toNumber(x.qty, 0) > 0);
    const inputClass = (hasError)=>`w-full h-12 rounded-2xl border px-4 text-sm font-semibold outline-none transition ${hasError ? "border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200" : "border-gray-200 bg-white focus:ring-2 focus:ring-blue-200"}`;
    /* ===========================
     ✅ ITEM HELPERS
  ============================ */ const addItem = ()=>setItems((p)=>[
                ...p,
                {
                    productId: "",
                    qty: 1,
                    color: null
                }
            ]);
    const removeItem = (idx)=>setItems((p)=>p.filter((_, i)=>i !== idx));
    const updateItem = (idx, key, value)=>{
        setItems((p)=>{
            const next = [
                ...p
            ];
            next[idx] = {
                ...next[idx],
                [key]: value
            };
            return next;
        });
    };
    const openPicker = (idx)=>{
        setPickerIndex(idx);
        setPickerOpen(true);
        setProductQuery("");
    };
    const pickProduct = (prod)=>{
        if (pickerIndex === null) return;
        updateItem(pickerIndex, "productId", String(prod._id));
        updateItem(pickerIndex, "color", null);
        updateItem(pickerIndex, "qty", 1);
        setPickerOpen(false);
        setPickerIndex(null);
        setProductQuery("");
    };
    const changeQty = (idx, delta)=>{
        const it = items[idx];
        const p = getProduct(it.productId);
        if (!p) return;
        const variant = findVariant(p, it.color);
        const stock = toNumber(variant?.stock ?? p?.stock ?? 0, 0);
        const current = toNumber(it.qty, 1);
        let next = current + delta;
        next = Math.max(1, next);
        if (stock > 0) next = Math.min(stock, next);
        updateItem(idx, "qty", next);
    };
    /* ===========================
     ✅ SUBMIT
  ============================ */ const submit = ()=>{
        setTouched({
            name: true,
            phone: true,
            address: true
        });
        if (errors.name || errors.phone || errors.address) return;
        const cleaned = items.map((it)=>{
            const p = getProduct(it.productId);
            if (!p) return null;
            const variant = findVariant(p, it.color);
            const image = variant?.images?.[0] || p.image || (Array.isArray(p.images) ? p.images[0] : null) || "/no-image.png";
            return {
                productId: String(p._id),
                name: p.name || "",
                price: toNumber(p.price, 0),
                qty: Math.max(1, toNumber(it.qty, 1)),
                image,
                color: it.color || null,
                stock: toNumber(variant?.stock ?? p?.stock ?? 0, 0)
            };
        }).filter(Boolean);
        if (!cleaned.length) return;
        onCreate({
            items: cleaned,
            billing,
            discount: toNumber(discount, 0),
            paymentMethod,
            paymentStatus,
            status,
            createdBy: "admin",
            createdByName: "Admin"
        });
    };
    /* ===========================
     ✅ HIDE WHEN CLOSED
  ============================ */ return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `fixed inset-0 z-50 ${open ? "flex" : "hidden"} items-end sm:items-center justify-center bg-black/60`,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-full sm:max-w-6xl sm:rounded-3xl bg-white h-[92vh] sm:h-[88vh] overflow-hidden shadow-2xl border border-gray-200 flex flex-col",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "shrink-0 px-4 sm:px-6 py-4 border-b bg-white flex items-center justify-between sticky top-0 z-20",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "min-w-0",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-lg sm:text-xl font-black text-gray-900 truncate",
                                            children: "Create New Order"
                                        }, void 0, false, {
                                            fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                            lineNumber: 349,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-[11px] text-gray-500 font-semibold",
                                            children: "✅ Created by Admin • Delivery charge from DB"
                                        }, void 0, false, {
                                            fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                            lineNumber: 352,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                    lineNumber: 348,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: onClose,
                                    className: "h-10 w-10 rounded-2xl grid place-items-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-black",
                                    children: "✕"
                                }, void 0, false, {
                                    fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                    lineNumber: 357,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                            lineNumber: 347,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex-1 overflow-y-auto",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "rounded-3xl border bg-white p-4 shadow-sm space-y-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center justify-between",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-sm font-black text-gray-900",
                                                                children: "Customer Info"
                                                            }, void 0, false, {
                                                                fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                lineNumber: 373,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-[11px] text-gray-500 font-semibold",
                                                                children: "Required *"
                                                            }, void 0, false, {
                                                                fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                lineNumber: 376,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                        lineNumber: 372,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "grid grid-cols-1 sm:grid-cols-3 gap-3",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "space-y-1",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "text-[11px] font-semibold text-gray-600",
                                                                        children: "Name *"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                        lineNumber: 383,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                        className: inputClass(touched.name && errors.name),
                                                                        placeholder: "Customer name",
                                                                        value: billing.name,
                                                                        onChange: (e)=>setBilling((p)=>({
                                                                                    ...p,
                                                                                    name: e.target.value
                                                                                })),
                                                                        onBlur: ()=>setTouched((p)=>({
                                                                                    ...p,
                                                                                    name: true
                                                                                }))
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                        lineNumber: 386,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    touched.name && errors.name && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "text-[11px] text-red-600",
                                                                        children: "Name required"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                        lineNumber: 396,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                lineNumber: 382,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "space-y-1",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "text-[11px] font-semibold text-gray-600",
                                                                        children: "Phone *"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                        lineNumber: 403,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                        className: inputClass(touched.phone && errors.phone),
                                                                        placeholder: "01XXXXXXXXX",
                                                                        value: billing.phone,
                                                                        onChange: (e)=>setBilling((p)=>({
                                                                                    ...p,
                                                                                    phone: e.target.value
                                                                                })),
                                                                        onBlur: ()=>setTouched((p)=>({
                                                                                    ...p,
                                                                                    phone: true
                                                                                }))
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                        lineNumber: 406,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    touched.phone && errors.phone && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "text-[11px] text-red-600",
                                                                        children: "Valid number required"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                        lineNumber: 418,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                lineNumber: 402,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "space-y-1",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "text-[11px] font-semibold text-gray-600",
                                                                        children: "Address *"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                        lineNumber: 425,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                        className: inputClass(touched.address && errors.address),
                                                                        placeholder: "Full address",
                                                                        value: billing.address,
                                                                        onChange: (e)=>setBilling((p)=>({
                                                                                    ...p,
                                                                                    address: e.target.value
                                                                                })),
                                                                        onBlur: ()=>setTouched((p)=>({
                                                                                    ...p,
                                                                                    address: true
                                                                                }))
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                        lineNumber: 428,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    touched.address && errors.address && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "text-[11px] text-red-600",
                                                                        children: "Address required"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                        lineNumber: 442,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                lineNumber: 424,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                        lineNumber: 381,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "space-y-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-[11px] font-semibold text-gray-600",
                                                                children: "Note (optional)"
                                                            }, void 0, false, {
                                                                fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                lineNumber: 450,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                className: "w-full h-12 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-200",
                                                                placeholder: "Note...",
                                                                value: billing.note,
                                                                onChange: (e)=>setBilling((p)=>({
                                                                            ...p,
                                                                            note: e.target.value
                                                                        }))
                                                            }, void 0, false, {
                                                                fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                lineNumber: 453,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                        lineNumber: 449,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                lineNumber: 371,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "rounded-3xl border bg-white p-4 shadow-sm space-y-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center justify-between",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-sm font-black text-gray-900",
                                                                children: "Items"
                                                            }, void 0, false, {
                                                                fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                lineNumber: 467,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                onClick: addItem,
                                                                className: "h-10 px-4 rounded-2xl bg-gray-900 text-white text-xs font-black hover:opacity-90",
                                                                children: "+ Add item"
                                                            }, void 0, false, {
                                                                fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                lineNumber: 470,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                        lineNumber: 466,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "space-y-3",
                                                        children: items.map((it, idx)=>{
                                                            const p = getProduct(it.productId);
                                                            const colors = Array.isArray(p?.colors) ? p.colors : [];
                                                            const variant = findVariant(p, it.color);
                                                            const stock = toNumber(variant?.stock ?? p?.stock ?? 0, 0);
                                                            const image = variant?.images?.[0] || p?.image || (Array.isArray(p?.images) ? p.images[0] : null) || "/no-image.png";
                                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "rounded-3xl border bg-gray-50 p-3 space-y-2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        type: "button",
                                                                        onClick: ()=>openPicker(idx),
                                                                        className: "w-full h-14 rounded-3xl border bg-white px-3 flex items-center gap-3 hover:bg-gray-50",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                                src: p ? image : "/no-image.png",
                                                                                alt: "",
                                                                                className: "w-11 h-11 rounded-2xl border object-cover"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                                lineNumber: 505,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "min-w-0 text-left",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "text-sm font-black truncate",
                                                                                        children: p ? p.name : "Select product"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                                        lineNumber: 511,
                                                                                        columnNumber: 31
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "text-[11px] text-gray-500 font-semibold",
                                                                                        children: p ? `৳${toNumber(p.price, 0)} • Stock: ${stock}` : "Click to choose product"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                                        lineNumber: 514,
                                                                                        columnNumber: 31
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                                lineNumber: 510,
                                                                                columnNumber: 29
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                        lineNumber: 500,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "grid grid-cols-12 gap-2",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                                                className: "col-span-7 h-12 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-200",
                                                                                value: it.color || "",
                                                                                onChange: (e)=>updateItem(idx, "color", e.target.value || null),
                                                                                disabled: !p || !colors.length,
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                        value: "",
                                                                                        children: colors.length ? "Select Color" : "No colors"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                                        lineNumber: 533,
                                                                                        columnNumber: 31
                                                                                    }, this),
                                                                                    colors.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                            value: c.name,
                                                                                            children: [
                                                                                                c.name,
                                                                                                " (stock: ",
                                                                                                toNumber(c.stock, 0),
                                                                                                ")"
                                                                                            ]
                                                                                        }, c.name, true, {
                                                                                            fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                                            lineNumber: 537,
                                                                                            columnNumber: 33
                                                                                        }, this))
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                                lineNumber: 525,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "col-span-5 h-12 rounded-2xl border bg-white px-2 flex items-center justify-between",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                        type: "button",
                                                                                        onClick: ()=>changeQty(idx, -1),
                                                                                        disabled: !p || toNumber(it.qty, 1) <= 1,
                                                                                        className: `w-9 h-9 rounded-2xl font-black ${!p || toNumber(it.qty, 1) <= 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300"}`,
                                                                                        children: "−"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                                        lineNumber: 545,
                                                                                        columnNumber: 31
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "text-base font-black",
                                                                                        children: it.qty
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                                        lineNumber: 558,
                                                                                        columnNumber: 31
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                        type: "button",
                                                                                        onClick: ()=>changeQty(idx, 1),
                                                                                        disabled: !p || stock > 0 && it.qty >= stock,
                                                                                        className: `w-9 h-9 rounded-2xl font-black ${!p || stock > 0 && it.qty >= stock ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300"}`,
                                                                                        children: "+"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                                        lineNumber: 562,
                                                                                        columnNumber: 31
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                                lineNumber: 544,
                                                                                columnNumber: 29
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                        lineNumber: 523,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "flex justify-between items-center pt-1",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "text-[11px] text-gray-500 font-semibold",
                                                                                children: p ? `Stock: ${stock}` : "Pick a product first"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                                lineNumber: 578,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                type: "button",
                                                                                onClick: ()=>removeItem(idx),
                                                                                className: "text-xs font-black text-red-600 hover:text-red-700",
                                                                                children: "Remove"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                                lineNumber: 582,
                                                                                columnNumber: 29
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                        lineNumber: 577,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, idx, true, {
                                                                fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                lineNumber: 495,
                                                                columnNumber: 25
                                                            }, this);
                                                        })
                                                    }, void 0, false, {
                                                        fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                        lineNumber: 478,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                lineNumber: 465,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "rounded-3xl border bg-white p-4 shadow-sm space-y-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-sm font-black text-gray-900",
                                                        children: "Payment & Status"
                                                    }, void 0, false, {
                                                        fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                        lineNumber: 598,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "grid grid-cols-1 sm:grid-cols-2 gap-3",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "space-y-1",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "text-[11px] font-semibold text-gray-600",
                                                                        children: "Payment Method"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                        lineNumber: 604,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                                        className: "w-full h-12 rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-200",
                                                                        value: paymentMethod,
                                                                        onChange: (e)=>setPaymentMethod(e.target.value),
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                value: "cod",
                                                                                children: "Cash On Delivery"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                                lineNumber: 612,
                                                                                columnNumber: 25
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                value: "bkash",
                                                                                children: "bKash"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                                lineNumber: 613,
                                                                                columnNumber: 25
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                        lineNumber: 607,
                                                                        columnNumber: 23
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                lineNumber: 603,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "space-y-1",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "text-[11px] font-semibold text-gray-600",
                                                                        children: "Payment Status"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                        lineNumber: 618,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                                        className: "w-full h-12 rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-200",
                                                                        value: paymentStatus,
                                                                        onChange: (e)=>setPaymentStatus(e.target.value),
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                value: "pending",
                                                                                children: "Pending"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                                lineNumber: 626,
                                                                                columnNumber: 25
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                value: "paid",
                                                                                children: "Paid"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                                lineNumber: 627,
                                                                                columnNumber: 25
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                value: "failed",
                                                                                children: "Failed"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                                lineNumber: 628,
                                                                                columnNumber: 25
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                        lineNumber: 621,
                                                                        columnNumber: 23
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                lineNumber: 617,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "space-y-1",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "text-[11px] font-semibold text-gray-600",
                                                                        children: "Order Status"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                        lineNumber: 633,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                                        className: "w-full h-12 rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-200",
                                                                        value: status,
                                                                        onChange: (e)=>setStatus(e.target.value),
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                value: "pending",
                                                                                children: "Pending"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                                lineNumber: 641,
                                                                                columnNumber: 25
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                value: "ready_to_delivery",
                                                                                children: "Ready To Delivery"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                                lineNumber: 642,
                                                                                columnNumber: 25
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                value: "send_to_courier",
                                                                                children: "Send To Courier"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                                lineNumber: 645,
                                                                                columnNumber: 25
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                value: "delivered",
                                                                                children: "Delivered"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                                lineNumber: 646,
                                                                                columnNumber: 25
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                value: "cancelled",
                                                                                children: "Cancelled"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                                lineNumber: 647,
                                                                                columnNumber: 25
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                        lineNumber: 636,
                                                                        columnNumber: 23
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                lineNumber: 632,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "space-y-1",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "text-[11px] font-semibold text-gray-600",
                                                                        children: "Discount"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                        lineNumber: 652,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "relative",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black",
                                                                                children: "৳"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                                lineNumber: 656,
                                                                                columnNumber: 25
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                type: "number",
                                                                                className: "w-full h-12 rounded-2xl border border-gray-200 bg-white pl-10 pr-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-200",
                                                                                value: discount,
                                                                                onChange: (e)=>setDiscount(Number(e.target.value || 0)),
                                                                                placeholder: "0"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                                lineNumber: 659,
                                                                                columnNumber: 25
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                        lineNumber: 655,
                                                                        columnNumber: 23
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                lineNumber: 651,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                        lineNumber: 602,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "rounded-3xl border border-blue-100 bg-blue-50 p-4 flex items-center justify-between",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "text-sm font-black text-gray-900",
                                                                        children: "Delivery Charge (DB)"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                        lineNumber: 675,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "text-[11px] text-gray-500 font-semibold",
                                                                        children: "locked • not editable"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                        lineNumber: 678,
                                                                        columnNumber: 23
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                lineNumber: 674,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-lg font-black text-blue-700",
                                                                children: deliveryLoading ? "..." : `৳${deliveryCharge}`
                                                            }, void 0, false, {
                                                                fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                lineNumber: 682,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                        lineNumber: 673,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                lineNumber: 597,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                        lineNumber: 369,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-4",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "rounded-3xl border bg-white p-4 shadow-sm space-y-3 lg:sticky lg:top-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-sm font-black text-gray-900",
                                                    children: "Order Summary"
                                                }, void 0, false, {
                                                    fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                    lineNumber: 692,
                                                    columnNumber: 19
                                                }, this),
                                                !viewItems.length ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-sm text-gray-500",
                                                    children: "No items added yet."
                                                }, void 0, false, {
                                                    fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                    lineNumber: 697,
                                                    columnNumber: 21
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "space-y-2 max-h-[360px] overflow-y-auto pr-1",
                                                    children: viewItems.map((it, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "rounded-3xl border bg-gray-50 p-3 flex gap-3 items-center",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                    src: it.image,
                                                                    alt: "",
                                                                    className: "w-14 h-14 rounded-2xl border object-cover"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                    lineNumber: 707,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex-1 min-w-0",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "text-sm font-black truncate",
                                                                            children: it.name
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                            lineNumber: 713,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        it.colorLabel && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "text-[11px] font-black text-pink-600",
                                                                            children: [
                                                                                "Color: ",
                                                                                it.colorLabel
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                            lineNumber: 717,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "text-[11px] text-gray-500 font-semibold",
                                                                            children: [
                                                                                "৳",
                                                                                toNumber(it.price, 0),
                                                                                " × ",
                                                                                toNumber(it.qty, 0)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                            lineNumber: 721,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                    lineNumber: 712,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "text-sm font-black",
                                                                    children: [
                                                                        "৳",
                                                                        toNumber(it.price, 0) * toNumber(it.qty, 0)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                    lineNumber: 725,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, i, true, {
                                                            fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                            lineNumber: 703,
                                                            columnNumber: 25
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                    lineNumber: 701,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "border-t pt-3 text-sm space-y-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex justify-between",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-gray-600 font-semibold",
                                                                    children: "Subtotal"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                    lineNumber: 735,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "font-black",
                                                                    children: [
                                                                        "৳",
                                                                        subtotal
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                    lineNumber: 738,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                            lineNumber: 734,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex justify-between",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-gray-600 font-semibold",
                                                                    children: "Delivery"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                    lineNumber: 742,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "font-black",
                                                                    children: deliveryLoading ? "..." : `৳${deliveryCharge}`
                                                                }, void 0, false, {
                                                                    fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                    lineNumber: 745,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                            lineNumber: 741,
                                                            columnNumber: 21
                                                        }, this),
                                                        !!discount && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex justify-between text-red-600",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "font-semibold",
                                                                    children: "Discount"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                    lineNumber: 752,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "font-black",
                                                                    children: [
                                                                        "-৳",
                                                                        toNumber(discount, 0)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                    lineNumber: 753,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                            lineNumber: 751,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex justify-between text-lg font-black border-t pt-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    children: "Total"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                    lineNumber: 760,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-blue-700",
                                                                    children: [
                                                                        "৳",
                                                                        total
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                                    lineNumber: 761,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                            lineNumber: 759,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                                    lineNumber: 733,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                            lineNumber: 691,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                        lineNumber: 690,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                lineNumber: 367,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                            lineNumber: 366,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "shrink-0 px-4 sm:px-6 py-3 border-t bg-white flex items-center justify-between sticky bottom-0 z-20",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-[11px] text-gray-500 font-semibold",
                                    children: canSubmit ? "Ready to create ✅" : "Fill required fields..."
                                }, void 0, false, {
                                    fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                    lineNumber: 771,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: onClose,
                                            className: "h-11 px-4 rounded-2xl border bg-white font-black text-gray-700 hover:bg-gray-50",
                                            children: "Cancel"
                                        }, void 0, false, {
                                            fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                            lineNumber: 776,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: submit,
                                            disabled: !canSubmit,
                                            className: `h-11 px-5 rounded-2xl font-black text-white ${canSubmit ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-300 cursor-not-allowed"}`,
                                            children: "Create Order"
                                        }, void 0, false, {
                                            fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                            lineNumber: 783,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                    lineNumber: 775,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                            lineNumber: 770,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                    lineNumber: 345,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                lineNumber: 339,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ProductPickerModal, {
                open: pickerOpen,
                onClose: ()=>{
                    setPickerOpen(false);
                    setPickerIndex(null);
                    setProductQuery("");
                },
                query: productQuery,
                setQuery: setProductQuery,
                products: filteredProducts,
                loading: loadingProducts,
                onPick: pickProduct
            }, void 0, false, {
                fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                lineNumber: 800,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_s(CreateOrderModal, "PbZ1eE7Ccma4EXZbfBTdlUSCQu4=");
_c = CreateOrderModal;
/* ===========================
   ✅ PRODUCT PICKER POPUP
=========================== */ function ProductPickerModal({ open, onClose, query, setQuery, products, loading, onPick }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `fixed inset-0 z-[60] bg-black/70 px-2 ${open ? "flex" : "hidden"} items-end sm:items-center justify-center`,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-white w-full sm:max-w-3xl h-[85vh] sm:h-auto sm:rounded-3xl rounded-t-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "px-4 py-3 border-b bg-white flex items-center justify-between sticky top-0 z-10",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-base font-black text-gray-900",
                            children: "Select Product"
                        }, void 0, false, {
                            fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                            lineNumber: 838,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            className: "h-10 w-10 rounded-2xl grid place-items-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-black",
                            children: "✕"
                        }, void 0, false, {
                            fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                            lineNumber: 841,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                    lineNumber: 837,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-4 border-b bg-gray-50",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            autoFocus: true,
                            className: "w-full h-12 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-200",
                            placeholder: "Search product by name or ID...",
                            value: query,
                            onChange: (e)=>setQuery(e.target.value)
                        }, void 0, false, {
                            fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                            lineNumber: 851,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-[11px] text-gray-500 mt-2 font-semibold",
                            children: [
                                "Showing ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                    children: products.length
                                }, void 0, false, {
                                    fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                    lineNumber: 859,
                                    columnNumber: 21
                                }, this),
                                " products"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                            lineNumber: 858,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                    lineNumber: 850,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-4 overflow-y-auto space-y-2",
                    children: loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-10 text-center text-gray-500",
                        children: "Loading..."
                    }, void 0, false, {
                        fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                        lineNumber: 866,
                        columnNumber: 13
                    }, this) : !products.length ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-10 text-center text-gray-500",
                        children: "No products found."
                    }, void 0, false, {
                        fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                        lineNumber: 868,
                        columnNumber: 13
                    }, this) : products.map((p)=>{
                        const img = p.image || (Array.isArray(p.images) ? p.images[0] : null) || "/no-image.png";
                        const stock = Number.isFinite(Number(p.stock)) ? Number(p.stock) : 0;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: ()=>onPick(p),
                            className: "w-full text-left border rounded-3xl p-3 hover:bg-gray-50 flex items-center gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                    src: img,
                                    alt: "",
                                    className: "w-14 h-14 rounded-3xl border object-cover"
                                }, void 0, false, {
                                    fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                    lineNumber: 889,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-1 min-w-0",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-sm font-black truncate",
                                            children: p.name
                                        }, void 0, false, {
                                            fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                            lineNumber: 896,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-[11px] text-gray-600 font-semibold",
                                            children: [
                                                "Price: ৳",
                                                Number(p.price || 0),
                                                " • Stock: ",
                                                stock
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                            lineNumber: 897,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-[10px] text-gray-400 font-mono truncate",
                                            children: String(p._id)
                                        }, void 0, false, {
                                            fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                            lineNumber: 900,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                    lineNumber: 895,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-xs bg-blue-600 text-white px-4 py-2 rounded-2xl font-black",
                                    children: "Select"
                                }, void 0, false, {
                                    fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                                    lineNumber: 905,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, p._id, true, {
                            fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                            lineNumber: 883,
                            columnNumber: 17
                        }, this);
                    })
                }, void 0, false, {
                    fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                    lineNumber: 864,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-3 border-t bg-white",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onClose,
                        className: "w-full h-12 rounded-2xl bg-gray-900 text-white font-black hover:opacity-90",
                        children: "Close"
                    }, void 0, false, {
                        fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                        lineNumber: 916,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
                    lineNumber: 915,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
            lineNumber: 835,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/admin/components/orders/modals/CreateOrderModal.jsx",
        lineNumber: 830,
        columnNumber: 5
    }, this);
}
_c1 = ProductPickerModal;
var _c, _c1;
__turbopack_context__.k.register(_c, "CreateOrderModal");
__turbopack_context__.k.register(_c1, "ProductPickerModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/admin/components/Skeleton/OrdersSkeleton.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>OrdersSkeleton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/styled-jsx/style.js [app-client] (ecmascript)");
"use client";
;
;
function OrdersSkeleton() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "jsx-9ff4464f4502d786" + " " + "space-y-5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                id: "9ff4464f4502d786",
                children: "@keyframes shimmer{0%{background-position:-450px 0}to{background-position:450px 0}}.shimmer.jsx-9ff4464f4502d786{background:linear-gradient(90deg,#f0f0f0 8%,#fff 18%,#f0f0f0 33%) 0 0/800px 104px;animation:1.3s linear infinite shimmer}"
            }, void 0, false, void 0, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-9ff4464f4502d786" + " " + "grid gap-4 md:hidden",
                children: Array.from({
                    length: 4
                }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-9ff4464f4502d786" + " " + "border border-gray-200 rounded-2xl p-4 bg-white shadow-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-9ff4464f4502d786" + " " + "flex justify-between items-start",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-9ff4464f4502d786" + " " + "w-24 h-3 shimmer rounded"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/Skeleton/OrdersSkeleton.jsx",
                                        lineNumber: 36,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-9ff4464f4502d786" + " " + "w-16 h-5 shimmer rounded"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/Skeleton/OrdersSkeleton.jsx",
                                        lineNumber: 37,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/components/Skeleton/OrdersSkeleton.jsx",
                                lineNumber: 35,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-9ff4464f4502d786" + " " + "mt-3 space-y-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-9ff4464f4502d786" + " " + "w-32 h-4 shimmer rounded"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/Skeleton/OrdersSkeleton.jsx",
                                        lineNumber: 42,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-9ff4464f4502d786" + " " + "w-24 h-3 shimmer rounded"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/Skeleton/OrdersSkeleton.jsx",
                                        lineNumber: 43,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-9ff4464f4502d786" + " " + "w-40 h-3 shimmer rounded"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/Skeleton/OrdersSkeleton.jsx",
                                        lineNumber: 44,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/components/Skeleton/OrdersSkeleton.jsx",
                                lineNumber: 41,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-9ff4464f4502d786" + " " + "mt-4 space-y-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-9ff4464f4502d786" + " " + "w-20 h-3 shimmer rounded"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/Skeleton/OrdersSkeleton.jsx",
                                        lineNumber: 49,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-9ff4464f4502d786" + " " + "w-48 h-3 shimmer rounded"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/Skeleton/OrdersSkeleton.jsx",
                                        lineNumber: 50,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-9ff4464f4502d786" + " " + "w-36 h-3 shimmer rounded"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/Skeleton/OrdersSkeleton.jsx",
                                        lineNumber: 51,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/components/Skeleton/OrdersSkeleton.jsx",
                                lineNumber: 48,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-9ff4464f4502d786" + " " + "mt-4 space-y-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-9ff4464f4502d786" + " " + "w-24 h-3 shimmer rounded"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/Skeleton/OrdersSkeleton.jsx",
                                        lineNumber: 56,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-9ff4464f4502d786" + " " + "w-32 h-3 shimmer rounded"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/Skeleton/OrdersSkeleton.jsx",
                                        lineNumber: 57,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-9ff4464f4502d786" + " " + "w-28 h-3 shimmer rounded"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/Skeleton/OrdersSkeleton.jsx",
                                        lineNumber: 58,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/components/Skeleton/OrdersSkeleton.jsx",
                                lineNumber: 55,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-9ff4464f4502d786" + " " + "mt-4 flex gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-9ff4464f4502d786" + " " + "w-20 h-7 shimmer rounded-lg"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/Skeleton/OrdersSkeleton.jsx",
                                        lineNumber: 63,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-9ff4464f4502d786" + " " + "w-20 h-7 shimmer rounded-lg"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/Skeleton/OrdersSkeleton.jsx",
                                        lineNumber: 64,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/components/Skeleton/OrdersSkeleton.jsx",
                                lineNumber: 62,
                                columnNumber: 13
                            }, this)
                        ]
                    }, i, true, {
                        fileName: "[project]/admin/components/Skeleton/OrdersSkeleton.jsx",
                        lineNumber: 30,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/admin/components/Skeleton/OrdersSkeleton.jsx",
                lineNumber: 28,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-9ff4464f4502d786" + " " + "hidden md:block overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                    className: "jsx-9ff4464f4502d786" + " " + "min-w-full text-sm",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                            className: "jsx-9ff4464f4502d786" + " " + "bg-gray-100",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                className: "jsx-9ff4464f4502d786",
                                children: [
                                    "Order",
                                    "Customer",
                                    "Items",
                                    "Totals",
                                    "Payment",
                                    "Status",
                                    "Actions"
                                ].map((h)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "jsx-9ff4464f4502d786" + " " + "text-left p-3 font-medium text-gray-600",
                                        children: h
                                    }, h, false, {
                                        fileName: "[project]/admin/components/Skeleton/OrdersSkeleton.jsx",
                                        lineNumber: 77,
                                        columnNumber: 19
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/admin/components/Skeleton/OrdersSkeleton.jsx",
                                lineNumber: 74,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/admin/components/Skeleton/OrdersSkeleton.jsx",
                            lineNumber: 73,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                            className: "jsx-9ff4464f4502d786",
                            children: Array.from({
                                length: 5
                            }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    className: "jsx-9ff4464f4502d786" + " " + "border-t border-gray-100",
                                    children: Array.from({
                                        length: 7
                                    }).map((_, j)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "jsx-9ff4464f4502d786" + " " + "p-3 align-top",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-9ff4464f4502d786" + " " + "w-full h-4 shimmer rounded mb-2"
                                                }, void 0, false, {
                                                    fileName: "[project]/admin/components/Skeleton/OrdersSkeleton.jsx",
                                                    lineNumber: 89,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-9ff4464f4502d786" + " " + "w-2/3 h-3 shimmer rounded"
                                                }, void 0, false, {
                                                    fileName: "[project]/admin/components/Skeleton/OrdersSkeleton.jsx",
                                                    lineNumber: 90,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, j, true, {
                                            fileName: "[project]/admin/components/Skeleton/OrdersSkeleton.jsx",
                                            lineNumber: 88,
                                            columnNumber: 19
                                        }, this))
                                }, i, false, {
                                    fileName: "[project]/admin/components/Skeleton/OrdersSkeleton.jsx",
                                    lineNumber: 86,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/admin/components/Skeleton/OrdersSkeleton.jsx",
                            lineNumber: 84,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/admin/components/Skeleton/OrdersSkeleton.jsx",
                    lineNumber: 72,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/admin/components/Skeleton/OrdersSkeleton.jsx",
                lineNumber: 71,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/admin/components/Skeleton/OrdersSkeleton.jsx",
        lineNumber: 5,
        columnNumber: 5
    }, this);
}
_c = OrdersSkeleton;
var _c;
__turbopack_context__.k.register(_c, "OrdersSkeleton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/admin/components/orders/modals/ConfirmModal.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ConfirmModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$modals$2f$ModalWrapper$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/orders/modals/ModalWrapper.jsx [app-client] (ecmascript)");
"use client";
;
;
function ConfirmModal({ data, onClose }) {
    if (!data) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$modals$2f$ModalWrapper$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        open: !!data,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                className: "text-lg font-bold mb-2",
                children: data.title
            }, void 0, false, {
                fileName: "[project]/admin/components/orders/modals/ConfirmModal.jsx",
                lineNumber: 10,
                columnNumber: 7
            }, this),
            data.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-gray-600 mb-5",
                children: data.description
            }, void 0, false, {
                fileName: "[project]/admin/components/orders/modals/ConfirmModal.jsx",
                lineNumber: 13,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-end gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onClose,
                        className: "px-4 py-2 border rounded",
                        children: "Cancel"
                    }, void 0, false, {
                        fileName: "[project]/admin/components/orders/modals/ConfirmModal.jsx",
                        lineNumber: 17,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: data.onConfirm,
                        className: `px-4 py-2 rounded text-white ${data.danger ? "bg-red-600" : "bg-blue-600"}`,
                        children: data.confirmText || "Confirm"
                    }, void 0, false, {
                        fileName: "[project]/admin/components/orders/modals/ConfirmModal.jsx",
                        lineNumber: 21,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/admin/components/orders/modals/ConfirmModal.jsx",
                lineNumber: 16,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/admin/components/orders/modals/ConfirmModal.jsx",
        lineNumber: 9,
        columnNumber: 5
    }, this);
}
_c = ConfirmModal;
var _c;
__turbopack_context__.k.register(_c, "ConfirmModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/admin/components/orders/pages/OrdersPage.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>OrdersPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$hooks$2f$useOrders$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/hooks/useOrders.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$ordersGrid$2f$OrdersGrid$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/orders/ordersGrid/OrdersGrid.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$ordersTable$2f$OrdersTable$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/orders/ordersTable/OrdersTable.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$modals$2f$EditOrderModal$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/orders/modals/EditOrderModal.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$modals$2f$CreateOrderModal$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/orders/modals/CreateOrderModal.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$Skeleton$2f$OrdersSkeleton$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/Skeleton/OrdersSkeleton.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$Toast$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/Toast.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$modals$2f$ConfirmModal$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/orders/modals/ConfirmModal.jsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
function OrdersPage() {
    _s();
    const API = "/api";
    const { filtered, loading, fetchOrders, deleting, handleDelete, toast, setToast, updateStatus, updateManyStatus, deleteMany, sendCourierDirect, sendCourierMany, confirm, setConfirm } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$hooks$2f$useOrders$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(API);
    // ✅ Edit modal state
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [currentId, setCurrentId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // ✅ Create modal state
    const [createOpen, setCreateOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [form, setForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        status: "pending",
        paymentMethod: "cod",
        trackingId: "",
        cancelReason: "",
        discount: 0,
        billing: {
            name: "",
            phone: "",
            address: ""
        }
    });
    /* =======================
     🗑 DELETE CONFIRM
     ======================= */ const confirmDelete = (order)=>{
        setConfirm({
            title: "Delete Order",
            message: "আপনি কি নিশ্চিত এই order টি delete করতে চান?",
            danger: true,
            loading: deleting,
            onConfirm: ()=>handleDelete(order)
        });
    };
    /* =======================
     ✏️ EDIT ORDER
     ======================= */ const openEdit = (order)=>{
        // ✅ Debug (remove later if you want)
        // console.log("EDIT ORDER:", order);
        setCurrentId(order._id);
        setForm({
            status: order.status,
            paymentMethod: order.paymentMethod,
            trackingId: order.trackingId || "",
            cancelReason: order.cancelReason || "",
            discount: Number(order.discount || 0),
            billing: order.billing
        });
        setOpen(true);
    };
    /* =======================
     💾 UPDATE ORDER
     ======================= */ const updateOrder = async (updatedForm)=>{
        try {
            const res = await fetch(`${API}/admin/orders/${currentId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatedForm)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Update failed");
            fetchOrders();
            setToast({
                message: "✅ Order updated successfully!",
                type: "success"
            });
            return {
                success: true
            };
        } catch (err) {
            setToast({
                message: err.message,
                type: "error"
            });
            return {
                success: false
            };
        }
    };
    /* =======================
     ✅ CREATE ORDER
     ======================= */ const createOrder = async (payload)=>{
        try {
            const res = await fetch(`${API}/admin/orders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.error || "Order create failed");
            }
            setToast({
                message: "✅ Order created successfully!",
                type: "success"
            });
            setCreateOpen(false);
            fetchOrders();
        } catch (err) {
            setToast({
                message: err.message,
                type: "error"
            });
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-4 px-2 sm:px-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-lg font-bold",
                        children: "Orders"
                    }, void 0, false, {
                        fileName: "[project]/admin/components/orders/pages/OrdersPage.jsx",
                        lineNumber: 141,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setCreateOpen(true),
                                className: "bg-blue-600 text-white px-4 py-2 rounded text-sm",
                                children: "+ New Order"
                            }, void 0, false, {
                                fileName: "[project]/admin/components/orders/pages/OrdersPage.jsx",
                                lineNumber: 145,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: fetchOrders,
                                className: "bg-gray-700 text-white px-4 py-2 rounded text-sm",
                                children: "Refresh"
                            }, void 0, false, {
                                fileName: "[project]/admin/components/orders/pages/OrdersPage.jsx",
                                lineNumber: 152,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/components/orders/pages/OrdersPage.jsx",
                        lineNumber: 143,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/admin/components/orders/pages/OrdersPage.jsx",
                lineNumber: 140,
                columnNumber: 7
            }, this),
            loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$Skeleton$2f$OrdersSkeleton$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/admin/components/orders/pages/OrdersPage.jsx",
                lineNumber: 162,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$ordersGrid$2f$OrdersGrid$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        orders: filtered,
                        onEdit: openEdit,
                        onDelete: confirmDelete,
                        onStatusChange: updateStatus,
                        onSendCourier: sendCourierDirect,
                        onBulkStatusChange: updateManyStatus,
                        onBulkDelete: deleteMany,
                        onBulkSendCourier: sendCourierMany
                    }, void 0, false, {
                        fileName: "[project]/admin/components/orders/pages/OrdersPage.jsx",
                        lineNumber: 165,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$ordersTable$2f$OrdersTable$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        orders: filtered,
                        onEdit: openEdit,
                        onDelete: confirmDelete,
                        onStatusChange: updateStatus,
                        onSendCourier: sendCourierDirect,
                        onBulkStatusChange: updateManyStatus,
                        onBulkDelete: deleteMany,
                        onBulkSendCourier: sendCourierMany
                    }, void 0, false, {
                        fileName: "[project]/admin/components/orders/pages/OrdersPage.jsx",
                        lineNumber: 176,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$modals$2f$CreateOrderModal$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                open: createOpen,
                onClose: ()=>setCreateOpen(false),
                onCreate: createOrder,
                API: API
            }, void 0, false, {
                fileName: "[project]/admin/components/orders/pages/OrdersPage.jsx",
                lineNumber: 190,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$modals$2f$EditOrderModal$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                open: open,
                form: form,
                setForm: setForm,
                onSave: ()=>updateOrder(form),
                onClose: ()=>setOpen(false)
            }, void 0, false, {
                fileName: "[project]/admin/components/orders/pages/OrdersPage.jsx",
                lineNumber: 198,
                columnNumber: 7
            }, this),
            confirm && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$orders$2f$modals$2f$ConfirmModal$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                data: confirm,
                onClose: ()=>setConfirm(null)
            }, void 0, false, {
                fileName: "[project]/admin/components/orders/pages/OrdersPage.jsx",
                lineNumber: 208,
                columnNumber: 9
            }, this),
            toast && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$Toast$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                message: toast.message,
                type: toast.type,
                onClose: ()=>setToast(null)
            }, void 0, false, {
                fileName: "[project]/admin/components/orders/pages/OrdersPage.jsx",
                lineNumber: 213,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/admin/components/orders/pages/OrdersPage.jsx",
        lineNumber: 138,
        columnNumber: 5
    }, this);
}
_s(OrdersPage, "7+eMsBRxmGyDyeUtWyeiHJOE+Is=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$hooks$2f$useOrders$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
    ];
});
_c = OrdersPage;
var _c;
__turbopack_context__.k.register(_c, "OrdersPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=admin_a21f87da._.js.map