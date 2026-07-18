module.exports = [
"[project]/admin/utils/api.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// frontend/utils/api.js
__turbopack_context__.s([
    "apiFetch",
    ()=>apiFetch
]);
async function apiFetch(path, options = {}) {
    const baseUrl = "/api";
    const url = `${baseUrl}${path}`;
    try {
        const res = await fetch(url, {
            credentials: "include",
            cache: "no-store",
            headers: {
                "Content-Type": "application/json",
                ...options.headers || {}
            },
            ...options
        });
        // 🔒 Unauthorized / token expired
        if (res.status === 401) {
            try {
                // backend logout → cookie clear
                await fetch(`${baseUrl}/admin/logout`, {
                    method: "POST",
                    credentials: "include",
                    cache: "no-store"
                });
            } catch  {
            // ignore
            }
            // ✅ client-side full cleanup
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            throw new Error("Session expired");
        }
        // ❌ Other API errors
        if (!res.ok) {
            let errorText = "";
            try {
                errorText = await res.text();
            } catch  {
                errorText = "Unknown error";
            }
            throw new Error(`API error: ${res.status} ${res.statusText} → ${errorText}`);
        }
        // ✅ Success
        return await res.json();
    } catch (err) {
        throw err;
    }
}
}),
"[project]/admin/components/Toast.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Toast
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
function Toast({ message, type = "info", onClose }) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const timer = setTimeout(onClose, 2500);
        return ()=>clearTimeout(timer);
    }, [
        onClose
    ]);
    const color = type === "success" ? "bg-green-500" : type === "error" ? "bg-red-500" : "bg-blue-500";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed top-6 right-6 z-50 animate-slideUp animate-fadeIn",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `${color} text-white px-5 py-3 rounded-lg shadow-xl text-sm font-medium flex items-center gap-2`,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
}),
"[project]/admin/components/ConfirmDialog.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ConfirmDialog
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
"use client";
;
function ConfirmDialog({ show, title, message, onConfirm, onCancel }) {
    if (!show) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 bg-black/50 flex justify-center items-center z-50 animate-fadeIn",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-white rounded-xl shadow-2xl p-6 w-[90%] max-w-sm animate-slideUp",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                    className: "text-lg font-bold text-gray-800 mb-2",
                    children: title
                }, void 0, false, {
                    fileName: "[project]/admin/components/ConfirmDialog.jsx",
                    lineNumber: 9,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-gray-600 mb-6",
                    children: message
                }, void 0, false, {
                    fileName: "[project]/admin/components/ConfirmDialog.jsx",
                    lineNumber: 10,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex justify-end gap-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onCancel,
                            className: "px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition",
                            children: "Cancel"
                        }, void 0, false, {
                            fileName: "[project]/admin/components/ConfirmDialog.jsx",
                            lineNumber: 12,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onConfirm,
                            className: "px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition",
                            children: "Confirm"
                        }, void 0, false, {
                            fileName: "[project]/admin/components/ConfirmDialog.jsx",
                            lineNumber: 18,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/admin/components/ConfirmDialog.jsx",
                    lineNumber: 11,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/admin/components/ConfirmDialog.jsx",
            lineNumber: 8,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/admin/components/ConfirmDialog.jsx",
        lineNumber: 7,
        columnNumber: 5
    }, this);
}
}),
"[project]/admin/src/app/admin/payments/page.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PaymentsPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$utils$2f$api$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/utils/api.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$Toast$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/Toast.jsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$ConfirmDialog$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/ConfirmDialog.jsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
/* =========================================================
   ✅ Small skeleton for initial loading
========================================================= */ function RowsSkeleton() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-3",
        children: [
            ...Array(4)
        ].map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-16 bg-gray-100 rounded-xl animate-pulse"
            }, i, false, {
                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                lineNumber: 15,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/admin/src/app/admin/payments/page.jsx",
        lineNumber: 13,
        columnNumber: 5
    }, this);
}
/* =========================================================
   ✅ Copy-to-clipboard button (used for TrxID etc.)
========================================================= */ function CopyButton({ value, showToast }) {
    const [copied, setCopied] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
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
            setTimeout(()=>setCopied(false), 1500);
        } catch  {
            showToast?.("❌ Copy করা যায়নি!", "error");
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: "button",
        onClick: handleCopy,
        disabled: !value || value === "—",
        title: "Copy TrxID",
        className: `inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border transition ${copied ? "bg-green-50 text-green-600 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"} disabled:opacity-40 disabled:cursor-not-allowed`,
        children: copied ? "Copied ✓" : "Copy"
    }, void 0, false, {
        fileName: "[project]/admin/src/app/admin/payments/page.jsx",
        lineNumber: 56,
        columnNumber: 5
    }, this);
}
/* =========================================================
   ✅ TAB 1: Pending Verification Queue
========================================================= */ function PendingVerificationTab({ showToast }) {
    const [orders, setOrders] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [busyId, setBusyId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [confirmAction, setConfirmAction] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null); // { orderId, status, label }
    const load = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setLoading(true);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$utils$2f$api$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiFetch"])("/admin/payments/pending").then((data)=>setOrders(Array.isArray(data) ? data : [])).catch(()=>showToast("❌ Pending payment লোড করা যায়নি!", "error")).finally(()=>setLoading(false));
    }, [
        showToast
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        load();
    }, [
        load
    ]);
    async function updateStatus(orderId, paymentStatus) {
        setBusyId(orderId);
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$utils$2f$api$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiFetch"])(`/admin/payments/${orderId}/verify`, {
                method: "PATCH",
                body: JSON.stringify({
                    paymentStatus
                })
            });
            setOrders((prev)=>prev.filter((o)=>o._id !== orderId));
            showToast(paymentStatus === "paid" ? "✅ Payment Verified হয়েছে!" : "❌ Payment Rejected করা হয়েছে!", paymentStatus === "paid" ? "success" : "error");
        } catch (err) {
            showToast("❌ আপডেট ব্যর্থ হয়েছে!", "error");
        } finally{
            setBusyId(null);
            setConfirmAction(null);
        }
    }
    if (loading) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(RowsSkeleton, {}, void 0, false, {
        fileName: "[project]/admin/src/app/admin/payments/page.jsx",
        lineNumber: 116,
        columnNumber: 23
    }, this);
    if (!orders.length) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-center py-16 text-gray-400",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-3xl mb-2",
                    children: "🎉"
                }, void 0, false, {
                    fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                    lineNumber: 121,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm font-medium",
                    children: "Verify করার মতো কোনো Pending Payment নেই।"
                }, void 0, false, {
                    fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                    lineNumber: 122,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/admin/src/app/admin/payments/page.jsx",
            lineNumber: 120,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-3",
                children: orders.map((o)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2 flex-wrap",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs font-bold text-gray-800",
                                                children: [
                                                    "#",
                                                    o.orderNumber
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                                lineNumber: 139,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[10px] font-bold uppercase bg-pink-50 text-pink-600 border border-pink-100 px-2 py-0.5 rounded-full",
                                                children: o.paymentMethod
                                            }, void 0, false, {
                                                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                                lineNumber: 142,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs text-gray-500",
                                                children: [
                                                    o.billing?.name,
                                                    " · ",
                                                    o.billing?.phone
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                                lineNumber: 145,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                        lineNumber: 138,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-xs text-gray-600 flex flex-wrap gap-x-4 gap-y-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    "Sender:",
                                                    " ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                                        className: "text-gray-800",
                                                        children: o.paymentDetails?.senderNumber || "—"
                                                    }, void 0, false, {
                                                        fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                                        lineNumber: 153,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                                lineNumber: 151,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "inline-flex items-center gap-1.5",
                                                children: [
                                                    "TrxID:",
                                                    " ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                                        className: "text-gray-800 tracking-wide",
                                                        children: o.paymentDetails?.transactionId || "—"
                                                    }, void 0, false, {
                                                        fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                                        lineNumber: 159,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CopyButton, {
                                                        value: o.paymentDetails?.transactionId,
                                                        showToast: showToast
                                                    }, void 0, false, {
                                                        fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                                        lineNumber: 162,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                                lineNumber: 157,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    "Amount: ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                                        className: "text-gray-800",
                                                        children: [
                                                            "৳",
                                                            o.deliveryCharge
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                                        lineNumber: 168,
                                                        columnNumber: 27
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                                lineNumber: 167,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                        lineNumber: 150,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[10px] text-gray-400",
                                        children: new Date(o.createdAt).toLocaleString("bn-BD")
                                    }, void 0, false, {
                                        fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                        lineNumber: 172,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                lineNumber: 137,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex gap-2 shrink-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        disabled: busyId === o._id,
                                        onClick: ()=>setConfirmAction({
                                                orderId: o._id,
                                                status: "failed",
                                                label: `অর্ডার #${o.orderNumber} এর payment Reject করবেন?`
                                            }),
                                        className: "px-3 py-2 text-xs font-bold rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 disabled:opacity-50",
                                        children: "❌ Reject"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                        lineNumber: 178,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        disabled: busyId === o._id,
                                        onClick: ()=>setConfirmAction({
                                                orderId: o._id,
                                                status: "paid",
                                                label: `অর্ডার #${o.orderNumber} এর payment Verify (Paid মার্ক) করবেন?`
                                            }),
                                        className: "px-3 py-2 text-xs font-bold rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50",
                                        children: busyId === o._id ? "..." : "✅ Verify"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                        lineNumber: 191,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                lineNumber: 177,
                                columnNumber: 13
                            }, this)
                        ]
                    }, o._id, true, {
                        fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                        lineNumber: 133,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                lineNumber: 131,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$ConfirmDialog$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                show: !!confirmAction,
                title: "নিশ্চিত করুন",
                message: confirmAction?.label,
                onCancel: ()=>setConfirmAction(null),
                onConfirm: ()=>confirmAction && updateStatus(confirmAction.orderId, confirmAction.status)
            }, void 0, false, {
                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                lineNumber: 209,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
/* =========================================================
   ✅ TAB 3: Verified Payments (Accept/Reject হয়ে যাওয়া গুলো)
   — admin accept করার পরও TrxID এখানে থেকে যায়, 1-click copy করা যায়
========================================================= */ function VerifiedPaymentsTab({ showToast }) {
    const [orders, setOrders] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [filter, setFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("all"); // "all" | "paid" | "failed"
    const [showHidden, setShowHidden] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false); // false = normal view, true = "removed" items
    const [busyId, setBusyId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [confirmTarget, setConfirmTarget] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null); // order pending remove/restore confirm
    const load = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setLoading(true);
        const params = new URLSearchParams();
        if (filter !== "all") params.set("paymentStatus", filter);
        if (showHidden) params.set("hidden", "true");
        const qs = params.toString() ? `?${params.toString()}` : "";
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$utils$2f$api$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiFetch"])(`/admin/payments/verified${qs}`).then((data)=>setOrders(Array.isArray(data) ? data : [])).catch(()=>showToast("❌ Verified payment history লোড করা যায়নি!", "error")).finally(()=>setLoading(false));
    }, [
        filter,
        showHidden,
        showToast
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        load();
    }, [
        load
    ]);
    async function setVisibility(orderId, hidden) {
        setBusyId(orderId);
        try {
            // ✅ Order delete/trash করা হচ্ছে না — শুধু এই flag টা টগল হচ্ছে,
            // Order নিজে Orders পেজে ঠিকই থেকে যায়।
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$utils$2f$api$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiFetch"])(`/admin/payments/verified/${orderId}/visibility`, {
                method: "PATCH",
                body: JSON.stringify({
                    hidden
                })
            });
            setOrders((prev)=>prev.filter((o)=>o._id !== orderId));
            showToast(hidden ? "🗑️ Payments history থেকে সরানো হয়েছে!" : "♻️ Payments history-তে ফিরিয়ে আনা হয়েছে!", "success");
        } catch  {
            showToast("❌ আপডেট ব্যর্থ হয়েছে!", "error");
        } finally{
            setBusyId(null);
            setConfirmTarget(null);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between flex-wrap gap-3 mb-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex bg-gray-100 rounded-lg p-1 w-fit",
                        children: [
                            {
                                key: "all",
                                label: "সব"
                            },
                            {
                                key: "paid",
                                label: "✅ Accepted"
                            },
                            {
                                key: "failed",
                                label: "❌ Rejected"
                            }
                        ].map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setFilter(t.key),
                                className: `px-3 py-1.5 text-xs font-bold rounded-md transition ${filter === t.key ? "bg-white shadow text-pink-600" : "text-gray-500"}`,
                                children: t.label
                            }, t.key, false, {
                                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                lineNumber: 287,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                        lineNumber: 281,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setShowHidden((v)=>!v),
                        className: `px-3 py-1.5 text-xs font-bold rounded-lg border transition ${showHidden ? "bg-gray-800 text-white border-gray-800" : "bg-white text-gray-500 border-gray-300 hover:bg-gray-50"}`,
                        children: showHidden ? "🗂️ Normal View দেখাও" : "🙈 Removed Items দেখাও"
                    }, void 0, false, {
                        fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                        lineNumber: 302,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                lineNumber: 280,
                columnNumber: 7
            }, this),
            loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(RowsSkeleton, {}, void 0, false, {
                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                lineNumber: 315,
                columnNumber: 9
            }, this) : !orders.length ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center py-16 text-gray-400",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-3xl mb-2",
                        children: showHidden ? "🙈" : "📄"
                    }, void 0, false, {
                        fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                        lineNumber: 318,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm font-medium",
                        children: showHidden ? "কোনো removed item নেই।" : "এখনো কোনো verified payment নেই।"
                    }, void 0, false, {
                        fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                        lineNumber: 319,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                lineNumber: 317,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-3",
                children: orders.map((o)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2 flex-wrap",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs font-bold text-gray-800",
                                                children: [
                                                    "#",
                                                    o.orderNumber
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                                lineNumber: 334,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[10px] font-bold uppercase bg-pink-50 text-pink-600 border border-pink-100 px-2 py-0.5 rounded-full",
                                                children: o.paymentMethod
                                            }, void 0, false, {
                                                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                                lineNumber: 337,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: `text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${o.paymentStatus === "paid" ? "bg-green-50 text-green-600 border-green-200" : "bg-red-50 text-red-600 border-red-200"}`,
                                                children: o.paymentStatus === "paid" ? "Accepted" : "Rejected"
                                            }, void 0, false, {
                                                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                                lineNumber: 340,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs text-gray-500",
                                                children: [
                                                    o.billing?.name,
                                                    " · ",
                                                    o.billing?.phone
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                                lineNumber: 349,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                        lineNumber: 333,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-xs text-gray-600 flex flex-wrap items-center gap-x-4 gap-y-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    "Sender:",
                                                    " ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                                        className: "text-gray-800",
                                                        children: o.paymentDetails?.senderNumber || "—"
                                                    }, void 0, false, {
                                                        fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                                        lineNumber: 357,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                                lineNumber: 355,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "inline-flex items-center gap-1.5",
                                                children: [
                                                    "TrxID:",
                                                    " ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                                        className: "text-gray-800 tracking-wide",
                                                        children: o.paymentDetails?.transactionId || "—"
                                                    }, void 0, false, {
                                                        fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                                        lineNumber: 363,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CopyButton, {
                                                        value: o.paymentDetails?.transactionId,
                                                        showToast: showToast
                                                    }, void 0, false, {
                                                        fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                                        lineNumber: 366,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                                lineNumber: 361,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    "Amount: ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                                        className: "text-gray-800",
                                                        children: [
                                                            "৳",
                                                            o.deliveryCharge
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                                        lineNumber: 372,
                                                        columnNumber: 29
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                                lineNumber: 371,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                        lineNumber: 354,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[10px] text-gray-400",
                                        children: [
                                            "Verified: ",
                                            new Date(o.updatedAt).toLocaleString("bn-BD")
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                        lineNumber: 376,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                lineNumber: 332,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex gap-2 shrink-0",
                                children: showHidden ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    disabled: busyId === o._id,
                                    onClick: ()=>setVisibility(o._id, false),
                                    className: "px-3 py-2 text-xs font-bold rounded-lg bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 disabled:opacity-50",
                                    children: busyId === o._id ? "..." : "♻️ Restore"
                                }, void 0, false, {
                                    fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                    lineNumber: 383,
                                    columnNumber: 19
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    disabled: busyId === o._id,
                                    onClick: ()=>setConfirmTarget(o),
                                    className: "px-3 py-2 text-xs font-bold rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 disabled:opacity-50",
                                    children: busyId === o._id ? "..." : "🗑️ Remove"
                                }, void 0, false, {
                                    fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                    lineNumber: 391,
                                    columnNumber: 19
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                lineNumber: 381,
                                columnNumber: 15
                            }, this)
                        ]
                    }, o._id, true, {
                        fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                        lineNumber: 328,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                lineNumber: 326,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$ConfirmDialog$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                show: !!confirmTarget,
                title: "Remove Verified Payment",
                message: `অর্ডার #${confirmTarget?.orderNumber} এই লিস্ট থেকে সরাতে চান? Order নিজে Orders পেজে ঠিকই থেকে যাবে, শুধু এই Payments history-তে আর দেখা যাবে না — পরে "Removed Items" থেকে আবার Restore করা যাবে।`,
                onCancel: ()=>setConfirmTarget(null),
                onConfirm: ()=>confirmTarget && setVisibility(confirmTarget._id, true)
            }, void 0, false, {
                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                lineNumber: 405,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/admin/src/app/admin/payments/page.jsx",
        lineNumber: 279,
        columnNumber: 5
    }, this);
}
/* =========================================================
   ✅ TAB 2: Payment Methods Settings (bKash/Nagad/Rocket etc.)
========================================================= */ const emptyForm = {
    name: "",
    number: "",
    accountType: "personal",
    actionLabel: "Send Money",
    instructions: "",
    active: true,
    order: 0
};
// ✅ Account type বদলালে একটা reasonable default action suggest করা হয়,
// কিন্তু অ্যাডমিন চাইলে নিজের মতো বদলে দিতে পারবে (এটা শুধু suggestion)
const suggestActionLabel = (accountType)=>{
    if (accountType === "merchant") return "Payment";
    if (accountType === "agent") return "Cash Out";
    return "Send Money";
};
function PaymentMethodsTab({ showToast }) {
    const [methods, setMethods] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [form, setForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(emptyForm);
    const [editingId, setEditingId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [deleteTarget, setDeleteTarget] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const load = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setLoading(true);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$utils$2f$api$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiFetch"])("/admin/payments/methods").then((data)=>setMethods(Array.isArray(data) ? data : [])).catch(()=>showToast("❌ Payment methods লোড করা যায়নি!", "error")).finally(()=>setLoading(false));
    }, [
        showToast
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        load();
    }, [
        load
    ]);
    function startEdit(m) {
        setEditingId(m._id);
        setForm({
            name: m.name || "",
            number: m.number || "",
            accountType: m.accountType || "personal",
            actionLabel: m.actionLabel || "Send Money",
            instructions: m.instructions || "",
            active: !!m.active,
            order: m.order || 0
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
                const updated = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$utils$2f$api$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiFetch"])(`/admin/payments/methods/${editingId}`, {
                    method: "PUT",
                    body: JSON.stringify(form)
                });
                setMethods((prev)=>prev.map((m)=>m._id === editingId ? updated : m));
                showToast("✅ Payment method আপডেট হয়েছে!", "success");
            } else {
                const created = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$utils$2f$api$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiFetch"])("/admin/payments/methods", {
                    method: "POST",
                    body: JSON.stringify(form)
                });
                setMethods((prev)=>[
                        ...prev,
                        created
                    ]);
                showToast("✅ নতুন Payment method যোগ হয়েছে!", "success");
            }
            resetForm();
        } catch (err) {
            showToast("❌ সেভ করা যায়নি!", "error");
        } finally{
            setSaving(false);
        }
    }
    async function toggleActive(m) {
        try {
            const updated = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$utils$2f$api$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiFetch"])(`/admin/payments/methods/${m._id}`, {
                method: "PUT",
                body: JSON.stringify({
                    active: !m.active
                })
            });
            setMethods((prev)=>prev.map((x)=>x._id === m._id ? updated : x));
        } catch  {
            showToast("❌ Status পরিবর্তন করা যায়নি!", "error");
        }
    }
    async function deleteMethod(id) {
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$utils$2f$api$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiFetch"])(`/admin/payments/methods/${id}`, {
                method: "DELETE"
            });
            setMethods((prev)=>prev.filter((m)=>m._id !== id));
            showToast("🗑️ Payment method Trash-এ পাঠানো হয়েছে!", "success");
        } catch  {
            showToast("❌ মুছতে ব্যর্থ হয়েছে!", "error");
        } finally{
            setDeleteTarget(null);
        }
    }
    const inputClass = "mt-1 w-full p-2 border rounded-md border-gray-300 outline-none text-sm focus:ring-2 focus:ring-pink-200";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "grid grid-cols-1 lg:grid-cols-5 gap-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                onSubmit: submitForm,
                className: "lg:col-span-2 bg-white border border-gray-200 rounded-xl p-4 space-y-3 h-fit",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "font-bold text-gray-800 text-sm",
                        children: editingId ? "✏️ Method এডিট করুন" : "➕ নতুন Method যোগ করুন"
                    }, void 0, false, {
                        fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                        lineNumber: 546,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "block",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs font-medium text-gray-700",
                                children: "নাম * (যেমন: bKash, Nagad, Rocket)"
                            }, void 0, false, {
                                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                lineNumber: 551,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                value: form.name,
                                onChange: (e)=>setForm((f)=>({
                                            ...f,
                                            name: e.target.value
                                        })),
                                className: inputClass,
                                placeholder: "bKash"
                            }, void 0, false, {
                                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                lineNumber: 554,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                        lineNumber: 550,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "block",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs font-medium text-gray-700",
                                children: "নাম্বার * (Merchant/Personal)"
                            }, void 0, false, {
                                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                lineNumber: 563,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                value: form.number,
                                onChange: (e)=>setForm((f)=>({
                                            ...f,
                                            number: e.target.value
                                        })),
                                className: inputClass,
                                placeholder: "01XXXXXXXXX"
                            }, void 0, false, {
                                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                lineNumber: 566,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                        lineNumber: 562,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "block",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs font-medium text-gray-700",
                                children: "Account Type"
                            }, void 0, false, {
                                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                lineNumber: 575,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                value: form.accountType,
                                onChange: (e)=>{
                                    const nextType = e.target.value;
                                    setForm((f)=>({
                                            ...f,
                                            accountType: nextType,
                                            // ✅ অ্যাডমিন যদি এখনো actionLabel হাতে না বদলে থাকে,
                                            // তাহলে account type অনুযায়ী reasonable default suggest করা হয়
                                            actionLabel: !editingId || f.actionLabel === suggestActionLabel(f.accountType) ? suggestActionLabel(nextType) : f.actionLabel
                                        }));
                                },
                                className: inputClass,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "personal",
                                        children: "Personal"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                        lineNumber: 596,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "merchant",
                                        children: "Merchant"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                        lineNumber: 597,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "agent",
                                        children: "Agent"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                        lineNumber: 598,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                lineNumber: 578,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                        lineNumber: 574,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "block",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs font-medium text-gray-700",
                                children: "কাস্টমারকে কোন Action করতে বলবেন? *"
                            }, void 0, false, {
                                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                lineNumber: 603,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                value: form.actionLabel,
                                onChange: (e)=>setForm((f)=>({
                                            ...f,
                                            actionLabel: e.target.value
                                        })),
                                className: inputClass,
                                placeholder: "Send Money / Payment / Cash Out"
                            }, void 0, false, {
                                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                lineNumber: 606,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[10px] text-gray-400 mt-1",
                                children: 'Personal নাম্বারে সাধারণত "Send Money", Merchant নাম্বারে "Payment", Agent নাম্বারে "Cash Out" — checkout পেজে ঠিক এই শব্দটাই কাস্টমারকে দেখানো হবে।'
                            }, void 0, false, {
                                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                lineNumber: 614,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                        lineNumber: 602,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "block",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs font-medium text-gray-700",
                                children: "Instructions (কাস্টমারকে দেখাবে)"
                            }, void 0, false, {
                                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                lineNumber: 622,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                value: form.instructions,
                                onChange: (e)=>setForm((f)=>({
                                            ...f,
                                            instructions: e.target.value
                                        })),
                                className: inputClass,
                                placeholder: "Send Money অপশনে গিয়ে টাকা পাঠান, তারপর TrxID এখানে দিন।"
                            }, void 0, false, {
                                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                lineNumber: 625,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                        lineNumber: 621,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "checkbox",
                                checked: form.active,
                                onChange: (e)=>setForm((f)=>({
                                            ...f,
                                            active: e.target.checked
                                        }))
                            }, void 0, false, {
                                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                lineNumber: 636,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs font-medium text-gray-700",
                                children: "Active (checkout-এ দেখাবে)"
                            }, void 0, false, {
                                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                lineNumber: 643,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                        lineNumber: 635,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-2 pt-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "submit",
                                disabled: saving,
                                className: "flex-1 bg-pink-600 hover:bg-pink-700 text-white text-sm font-bold py-2 rounded-lg disabled:opacity-50",
                                children: saving ? "Saving..." : editingId ? "Update" : "Add Method"
                            }, void 0, false, {
                                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                lineNumber: 649,
                                columnNumber: 11
                            }, this),
                            editingId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: resetForm,
                                className: "px-3 py-2 text-sm font-bold rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200",
                                children: "Cancel"
                            }, void 0, false, {
                                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                lineNumber: 657,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                        lineNumber: 648,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                lineNumber: 542,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "lg:col-span-3 space-y-3",
                children: loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(RowsSkeleton, {}, void 0, false, {
                    fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                    lineNumber: 671,
                    columnNumber: 11
                }, this) : !methods.length ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center py-16 text-gray-400",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-3xl mb-2",
                            children: "💳"
                        }, void 0, false, {
                            fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                            lineNumber: 674,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm font-medium",
                            children: "এখনো কোনো Payment Method যোগ করা হয়নি।"
                        }, void 0, false, {
                            fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                            lineNumber: 675,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                    lineNumber: 673,
                    columnNumber: 11
                }, this) : methods.map((m)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-bold text-gray-800 text-sm",
                                                children: m.name
                                            }, void 0, false, {
                                                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                                lineNumber: 687,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: `text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${m.active ? "bg-green-50 text-green-600 border border-green-200" : "bg-gray-100 text-gray-400 border border-gray-200"}`,
                                                children: m.active ? "Active" : "Inactive"
                                            }, void 0, false, {
                                                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                                lineNumber: 690,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                        lineNumber: 686,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-gray-500 mt-0.5",
                                        children: [
                                            m.number,
                                            " · ",
                                            m.accountType,
                                            " · “",
                                            m.actionLabel || "Send Money",
                                            "”"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                        lineNumber: 700,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                lineNumber: 685,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 shrink-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>toggleActive(m),
                                        className: "text-[11px] font-bold text-gray-600 border border-gray-300 rounded-md px-2 py-1 hover:bg-gray-50",
                                        children: m.active ? "Deactivate" : "Activate"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                        lineNumber: 707,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>startEdit(m),
                                        className: "text-[11px] font-bold text-pink-600 border border-pink-300 rounded-md px-2 py-1 hover:bg-pink-50",
                                        children: "Edit"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                        lineNumber: 713,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setDeleteTarget(m),
                                        className: "text-[11px] font-bold text-red-600 border border-red-300 rounded-md px-2 py-1 hover:bg-red-50",
                                        children: "Delete"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                        lineNumber: 719,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                lineNumber: 706,
                                columnNumber: 15
                            }, this)
                        ]
                    }, m._id, true, {
                        fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                        lineNumber: 681,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                lineNumber: 669,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$ConfirmDialog$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                show: !!deleteTarget,
                title: "Delete Payment Method",
                message: `"${deleteTarget?.name}" Trash-এ পাঠাতে চান? এটি checkout থেকে সরে যাবে, পরে Trash থেকে Restore করা যাবে।`,
                onCancel: ()=>setDeleteTarget(null),
                onConfirm: ()=>deleteTarget && deleteMethod(deleteTarget._id)
            }, void 0, false, {
                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                lineNumber: 731,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/admin/src/app/admin/payments/page.jsx",
        lineNumber: 540,
        columnNumber: 5
    }, this);
}
function PaymentsPage() {
    const [tab, setTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("pending"); // "pending" | "methods"
    const [toast, setToast] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const showToast = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((message, type = "info")=>{
        setToast({
            message,
            type
        });
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "max-w-5xl mx-auto",
        children: [
            toast && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$Toast$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                message: toast.message,
                type: toast.type,
                onClose: ()=>setToast(null)
            }, void 0, false, {
                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                lineNumber: 756,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between mb-6 flex-wrap gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-2xl font-bold text-gray-800",
                        children: "💳 Payments"
                    }, void 0, false, {
                        fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                        lineNumber: 764,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex bg-gray-100 rounded-lg p-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setTab("pending"),
                                className: `px-4 py-2 text-sm font-bold rounded-md transition ${tab === "pending" ? "bg-white shadow text-pink-600" : "text-gray-500"}`,
                                children: "Pending Verification"
                            }, void 0, false, {
                                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                lineNumber: 767,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setTab("verified"),
                                className: `px-4 py-2 text-sm font-bold rounded-md transition ${tab === "verified" ? "bg-white shadow text-pink-600" : "text-gray-500"}`,
                                children: "Verified / TrxID"
                            }, void 0, false, {
                                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                lineNumber: 777,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setTab("methods"),
                                className: `px-4 py-2 text-sm font-bold rounded-md transition ${tab === "methods" ? "bg-white shadow text-pink-600" : "text-gray-500"}`,
                                children: "Payment Methods"
                            }, void 0, false, {
                                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                                lineNumber: 787,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                        lineNumber: 766,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                lineNumber: 763,
                columnNumber: 7
            }, this),
            tab === "pending" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(PendingVerificationTab, {
                showToast: showToast
            }, void 0, false, {
                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                lineNumber: 801,
                columnNumber: 9
            }, this) : tab === "verified" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(VerifiedPaymentsTab, {
                showToast: showToast
            }, void 0, false, {
                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                lineNumber: 803,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(PaymentMethodsTab, {
                showToast: showToast
            }, void 0, false, {
                fileName: "[project]/admin/src/app/admin/payments/page.jsx",
                lineNumber: 805,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/admin/src/app/admin/payments/page.jsx",
        lineNumber: 754,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=admin_35249874._.js.map