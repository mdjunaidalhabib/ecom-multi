(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
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
"[project]/admin/components/TrashCard.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TrashCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
"use client";
;
const TYPE_BADGE_STYLE = {
    Product: "bg-indigo-100 border-indigo-200 text-indigo-700",
    Category: "bg-blue-100 border-blue-200 text-blue-700",
    Order: "bg-amber-100 border-amber-200 text-amber-700",
    Slider: "bg-rose-100 border-rose-200 text-rose-700",
    PaymentMethod: "bg-emerald-100 border-emerald-200 text-emerald-700",
    Shop: "bg-violet-100 border-violet-200 text-violet-700"
};
const TYPE_ICON = {
    Product: "📦",
    Category: "📁",
    Order: "🧾",
    Slider: "🖼️",
    PaymentMethod: "💳",
    Shop: "🏪"
};
function getImage(it) {
    const d = it?.data || {};
    if (it.collectionName === "Product") {
        return d.image || d.colors?.[0]?.images?.[0] || "";
    }
    if (it.collectionName === "Category") {
        return d.image || "";
    }
    if (it.collectionName === "Slider") {
        return d.src || "";
    }
    if (it.collectionName === "Order") {
        return d.items?.[0]?.image || "";
    }
    if (it.collectionName === "Shop") {
        return d.branding?.logo || "";
    }
    return "";
}
function getSubtitle(it) {
    const d = it?.data || {};
    if (it.collectionName === "Product") {
        return `৳ ${d.price ?? 0} · স্টক: ${d.stock ?? 0}`;
    }
    if (it.collectionName === "Category") {
        return `Serial: ${d.order ?? 0} · ${d.isActive ? "Active" : "Hidden"}`;
    }
    if (it.collectionName === "Slider") {
        return d.alt || d.href || "Slide";
    }
    if (it.collectionName === "Order") {
        return `৳ ${d.total ?? 0} · ${d.status || "pending"}`;
    }
    if (it.collectionName === "PaymentMethod") {
        return `${d.number || ""} · ${d.accountType || "personal"}`;
    }
    if (it.collectionName === "Shop") {
        return `${d.domain || "No domain"} · ${d.status || "trial"}`;
    }
    return "";
}
function timeLeftLabel(expiresAt) {
    const ms = new Date(expiresAt).getTime() - Date.now();
    if (ms <= 0) return "Deleting soon...";
    const hours = Math.floor(ms / (1000 * 60 * 60));
    if (hours >= 24) {
        const days = Math.floor(hours / 24);
        const remHours = hours % 24;
        return `${days}d ${remHours}h left`;
    }
    if (hours >= 1) return `${hours}h left`;
    const mins = Math.max(1, Math.floor(ms / (1000 * 60)));
    return `${mins}m left`;
}
function TrashCard({ item, busy, onRestore, onDelete }) {
    const image = getImage(item);
    const subtitle = getSubtitle(item);
    const badgeStyle = TYPE_BADGE_STYLE[item.collectionName] || "bg-gray-100 border-gray-200 text-gray-700";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative border rounded-xl shadow-md p-4 flex flex-col bg-white hover:shadow-lg transition opacity-90",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-full aspect-square overflow-hidden rounded-lg mb-3 relative bg-gray-50",
                children: [
                    image ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                        src: image,
                        alt: item.label,
                        className: "w-full h-full object-cover grayscale-[15%]"
                    }, void 0, false, {
                        fileName: "[project]/admin/components/TrashCard.jsx",
                        lineNumber: 92,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-full h-full flex items-center justify-center text-gray-400 text-xs",
                        children: "No Image"
                    }, void 0, false, {
                        fileName: "[project]/admin/components/TrashCard.jsx",
                        lineNumber: 98,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-0 bg-black/10"
                    }, void 0, false, {
                        fileName: "[project]/admin/components/TrashCard.jsx",
                        lineNumber: 104,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: `absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeStyle}`,
                        children: [
                            TYPE_ICON[item.collectionName] || "🗑️",
                            " ",
                            item.collectionName
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/components/TrashCard.jsx",
                        lineNumber: 106,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/60 text-white",
                        children: timeLeftLabel(item.expiresAt)
                    }, void 0, false, {
                        fileName: "[project]/admin/components/TrashCard.jsx",
                        lineNumber: 112,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/admin/components/TrashCard.jsx",
                lineNumber: 90,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                className: "font-semibold text-lg truncate text-gray-800",
                children: item.label || "Untitled"
            }, void 0, false, {
                fileName: "[project]/admin/components/TrashCard.jsx",
                lineNumber: 118,
                columnNumber: 7
            }, this),
            subtitle && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-gray-500 truncate",
                children: subtitle
            }, void 0, false, {
                fileName: "[project]/admin/components/TrashCard.jsx",
                lineNumber: 123,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs text-gray-400 mt-1",
                children: [
                    "Deleted: ",
                    new Date(item.deletedAt).toLocaleString()
                ]
            }, void 0, true, {
                fileName: "[project]/admin/components/TrashCard.jsx",
                lineNumber: 126,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-auto pt-3 flex gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        disabled: busy,
                        onClick: (e)=>{
                            e.stopPropagation();
                            onRestore();
                        },
                        className: "flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50",
                        children: "♻️ Restore"
                    }, void 0, false, {
                        fileName: "[project]/admin/components/TrashCard.jsx",
                        lineNumber: 132,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        disabled: busy,
                        onClick: (e)=>{
                            e.stopPropagation();
                            onDelete();
                        },
                        className: "flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50",
                        children: "🗑 মুছুন"
                    }, void 0, false, {
                        fileName: "[project]/admin/components/TrashCard.jsx",
                        lineNumber: 144,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/admin/components/TrashCard.jsx",
                lineNumber: 131,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/admin/components/TrashCard.jsx",
        lineNumber: 88,
        columnNumber: 5
    }, this);
}
_c = TrashCard;
var _c;
__turbopack_context__.k.register(_c, "TrashCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/admin/src/app/super-admin/(panel)/trash/page.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ShopTrashPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__ = __turbopack_context__.i("[project]/admin/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-client] (ecmascript) <export default as ArrowLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/admin/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$Toast$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/Toast.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$TrashCard$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/TrashCard.jsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
const TTL_DAYS = 3;
function ShopTrashPage() {
    _s();
    const [items, setItems] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [toast, setToast] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [confirmModal, setConfirmModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [busyId, setBusyId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [emptying, setEmptying] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const loadTrash = async ()=>{
        try {
            setLoading(true);
            const response = await fetch("/api/admin/shops/trash", {
                cache: "no-store"
            });
            const data = await response.json().catch(()=>[]);
            if (!response.ok) {
                throw new Error(data?.message || "Shop Trash load করা যায়নি");
            }
            setItems(Array.isArray(data) ? data : []);
        } catch (err) {
            setToast({
                message: `❌ ${err.message}`,
                type: "error"
            });
        } finally{
            setLoading(false);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ShopTrashPage.useEffect": ()=>{
            loadTrash();
        }
    }["ShopTrashPage.useEffect"], []);
    const handleRestore = async ()=>{
        const item = confirmModal?.item;
        if (!item) return;
        setBusyId(item._id);
        try {
            const response = await fetch(`/api/admin/shops/trash/${item._id}/restore`, {
                method: "POST"
            });
            const data = await response.json().catch(()=>({}));
            if (!response.ok) {
                throw new Error(data?.message || "Restore failed");
            }
            setToast({
                message: data.message || "♻️ Shop restored",
                type: "success"
            });
            await loadTrash();
        } catch (err) {
            setToast({
                message: `❌ ${err.message}`,
                type: "error"
            });
        } finally{
            setBusyId(null);
            setConfirmModal(null);
        }
    };
    const handlePermanentDelete = async ()=>{
        const item = confirmModal?.item;
        if (!item) return;
        setBusyId(item._id);
        try {
            const response = await fetch(`/api/admin/shops/trash/${item._id}`, {
                method: "DELETE"
            });
            const data = await response.json().catch(()=>({}));
            if (!response.ok) {
                throw new Error(data?.message || "Permanent delete failed");
            }
            setToast({
                message: data.message || "🗑️ Shop permanently deleted",
                type: "success"
            });
            await loadTrash();
        } catch (err) {
            setToast({
                message: `❌ ${err.message}`,
                type: "error"
            });
        } finally{
            setBusyId(null);
            setConfirmModal(null);
        }
    };
    const handleEmptyTrash = async ()=>{
        setEmptying(true);
        try {
            const response = await fetch("/api/admin/shops/trash/empty", {
                method: "DELETE"
            });
            const data = await response.json().catch(()=>({}));
            if (!response.ok) {
                throw new Error(data?.message || "Empty Trash failed");
            }
            setToast({
                message: data.message || "🗑️ Shop Trash emptied",
                type: "success"
            });
            await loadTrash();
        } catch (err) {
            setToast({
                message: `❌ ${err.message}`,
                type: "error"
            });
        } finally{
            setEmptying(false);
            setConfirmModal(null);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "p-3 sm:p-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-6 flex flex-col gap-3 lg:flex-row lg:items-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "flex items-center gap-2 text-2xl font-bold sm:text-3xl",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                        size: 28
                                    }, void 0, false, {
                                        fileName: "[project]/admin/src/app/super-admin/(panel)/trash/page.jsx",
                                        lineNumber: 125,
                                        columnNumber: 13
                                    }, this),
                                    " Shop Trash"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/src/app/super-admin/(panel)/trash/page.jsx",
                                lineNumber: 124,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-2 text-sm text-gray-500",
                                children: [
                                    "Deleted shops remain here for ",
                                    TTL_DAYS,
                                    " days. Restore করলে shop এবং আগের assigned admins ফিরে আসবে। কোনো action না নিলে shop ও তার সব data permanently delete হবে।"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/src/app/super-admin/(panel)/trash/page.jsx",
                                lineNumber: 127,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/src/app/super-admin/(panel)/trash/page.jsx",
                        lineNumber: 123,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-2 lg:ml-auto",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/super-admin/shops",
                                className: "flex items-center gap-1.5 rounded-lg border bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
                                        size: 16
                                    }, void 0, false, {
                                        fileName: "[project]/admin/src/app/super-admin/(panel)/trash/page.jsx",
                                        lineNumber: 137,
                                        columnNumber: 13
                                    }, this),
                                    " Shops"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/src/app/super-admin/(panel)/trash/page.jsx",
                                lineNumber: 133,
                                columnNumber: 11
                            }, this),
                            items.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>setConfirmModal({
                                        mode: "empty"
                                    }),
                                className: "rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700",
                                children: "Empty Trash"
                            }, void 0, false, {
                                fileName: "[project]/admin/src/app/super-admin/(panel)/trash/page.jsx",
                                lineNumber: 140,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/src/app/super-admin/(panel)/trash/page.jsx",
                        lineNumber: 132,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/admin/src/app/super-admin/(panel)/trash/page.jsx",
                lineNumber: 122,
                columnNumber: 7
            }, this),
            loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "py-12 text-center text-gray-500",
                children: "Loading..."
            }, void 0, false, {
                fileName: "[project]/admin/src/app/super-admin/(panel)/trash/page.jsx",
                lineNumber: 152,
                columnNumber: 9
            }, this) : items.length ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
                children: items.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$TrashCard$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        item: item,
                        busy: busyId === item._id,
                        onRestore: ()=>setConfirmModal({
                                mode: "restore",
                                item
                            }),
                        onDelete: ()=>setConfirmModal({
                                mode: "delete",
                                item
                            })
                    }, item._id, false, {
                        fileName: "[project]/admin/src/app/super-admin/(panel)/trash/page.jsx",
                        lineNumber: 156,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/admin/src/app/super-admin/(panel)/trash/page.jsx",
                lineNumber: 154,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-xl border border-dashed bg-white py-14 text-center text-gray-500",
                children: "Shop Trash is empty."
            }, void 0, false, {
                fileName: "[project]/admin/src/app/super-admin/(panel)/trash/page.jsx",
                lineNumber: 166,
                columnNumber: 9
            }, this),
            confirmModal && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "fixed inset-0 z-40 bg-white/50 backdrop-blur-sm"
                    }, void 0, false, {
                        fileName: "[project]/admin/src/app/super-admin/(panel)/trash/page.jsx",
                        lineNumber: 173,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "fixed inset-0 z-50 flex items-center justify-center p-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-full max-w-sm rounded-xl border bg-white p-6 shadow-xl",
                            children: [
                                confirmModal.mode === "restore" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "mb-3 text-xl font-bold text-green-600",
                                            children: "♻️ Restore Shop"
                                        }, void 0, false, {
                                            fileName: "[project]/admin/src/app/super-admin/(panel)/trash/page.jsx",
                                            lineNumber: 178,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "mb-6 text-gray-700",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                                    children: confirmModal.item?.data?.name
                                                }, void 0, false, {
                                                    fileName: "[project]/admin/src/app/super-admin/(panel)/trash/page.jsx",
                                                    lineNumber: 182,
                                                    columnNumber: 21
                                                }, this),
                                                " এবং আগের admin assignments Restore করবেন?"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/admin/src/app/super-admin/(panel)/trash/page.jsx",
                                            lineNumber: 181,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true),
                                confirmModal.mode === "delete" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "mb-3 text-xl font-bold text-red-600",
                                            children: "⚠ Delete Forever"
                                        }, void 0, false, {
                                            fileName: "[project]/admin/src/app/super-admin/(panel)/trash/page.jsx",
                                            lineNumber: 189,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "mb-6 text-gray-700",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                                    children: confirmModal.item?.data?.name
                                                }, void 0, false, {
                                                    fileName: "[project]/admin/src/app/super-admin/(panel)/trash/page.jsx",
                                                    lineNumber: 193,
                                                    columnNumber: 21
                                                }, this),
                                                ", products, orders, users, settings এবং related assets permanently delete হবে। এটি undo করা যাবে না।"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/admin/src/app/super-admin/(panel)/trash/page.jsx",
                                            lineNumber: 192,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true),
                                confirmModal.mode === "empty" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "mb-3 text-xl font-bold text-red-600",
                                            children: "⚠ Empty Shop Trash"
                                        }, void 0, false, {
                                            fileName: "[project]/admin/src/app/super-admin/(panel)/trash/page.jsx",
                                            lineNumber: 200,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "mb-6 text-gray-700",
                                            children: [
                                                "Trash-এর সব ",
                                                items.length,
                                                "টি shop এবং তাদের সব data permanently delete হবে।"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/admin/src/app/super-admin/(panel)/trash/page.jsx",
                                            lineNumber: 203,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex justify-end gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            disabled: Boolean(busyId) || emptying,
                                            onClick: ()=>setConfirmModal(null),
                                            className: "rounded-lg border px-4 py-2 disabled:opacity-60",
                                            children: "Cancel"
                                        }, void 0, false, {
                                            fileName: "[project]/admin/src/app/super-admin/(panel)/trash/page.jsx",
                                            lineNumber: 210,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            disabled: Boolean(busyId) || emptying,
                                            onClick: confirmModal.mode === "restore" ? handleRestore : confirmModal.mode === "delete" ? handlePermanentDelete : handleEmptyTrash,
                                            className: `rounded-lg px-4 py-2 text-white disabled:opacity-60 ${confirmModal.mode === "restore" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`,
                                            children: confirmModal.mode === "restore" ? busyId ? "Restoring..." : "Restore" : confirmModal.mode === "delete" ? busyId ? "Deleting..." : "Delete Forever" : emptying ? "Emptying..." : "Empty Trash"
                                        }, void 0, false, {
                                            fileName: "[project]/admin/src/app/super-admin/(panel)/trash/page.jsx",
                                            lineNumber: 218,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/admin/src/app/super-admin/(panel)/trash/page.jsx",
                                    lineNumber: 209,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/admin/src/app/super-admin/(panel)/trash/page.jsx",
                            lineNumber: 175,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/admin/src/app/super-admin/(panel)/trash/page.jsx",
                        lineNumber: 174,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true),
            toast && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$Toast$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                message: toast.message,
                type: toast.type,
                onClose: ()=>setToast(null)
            }, void 0, false, {
                fileName: "[project]/admin/src/app/super-admin/(panel)/trash/page.jsx",
                lineNumber: 253,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/admin/src/app/super-admin/(panel)/trash/page.jsx",
        lineNumber: 121,
        columnNumber: 5
    }, this);
}
_s(ShopTrashPage, "pNHbGzouw/YsKIMJoQTpuUo04xY=");
_c = ShopTrashPage;
var _c;
__turbopack_context__.k.register(_c, "ShopTrashPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/admin/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ __turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>ArrowLeft
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "m12 19-7-7 7-7",
            key: "1l729n"
        }
    ],
    [
        "path",
        {
            d: "M19 12H5",
            key: "x3x0zl"
        }
    ]
];
const ArrowLeft = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("arrow-left", __iconNode);
;
 //# sourceMappingURL=arrow-left.js.map
}),
"[project]/admin/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-client] (ecmascript) <export default as ArrowLeft>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ArrowLeft",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-client] (ecmascript)");
}),
]);

//# sourceMappingURL=admin_f08b1d12._.js.map