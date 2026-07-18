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
"[project]/admin/components/productForm/HeaderSerialStatus.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>HeaderSerialStatus
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function HeaderSerialStatus({ product, form, setForm, maxSerial }) {
    _s();
    const safeMax = Number(maxSerial ?? 0);
    // ✅ new product -> default serial = last (max+1)
    // ✅ edit product -> keep existing serial
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HeaderSerialStatus.useEffect": ()=>{
            if (!product) {
                const last = safeMax + 1;
                // শুধু তখনই সেট করবে যখন order নেই/invalid বা last থেকে বড়/ছোট mismatch
                setForm({
                    "HeaderSerialStatus.useEffect": (p)=>{
                        const current = Number(p?.order ?? 0);
                        if (current >= 1 && current <= last) return p; // already valid
                        return {
                            ...p,
                            order: last
                        };
                    }
                }["HeaderSerialStatus.useEffect"]);
            }
        }
    }["HeaderSerialStatus.useEffect"], [
        product,
        safeMax,
        setForm
    ]);
    // ✅ options: edit -> max পর্যন্ত, add -> max+1 পর্যন্ত
    const totalOptions = product ? safeMax : safeMax + 1;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    className: "text-2xl font-bold text-indigo-600",
                    children: product ? "✏ Edit Product" : "🛍 Add Product"
                }, void 0, false, {
                    fileName: "[project]/admin/components/productForm/HeaderSerialStatus.jsx",
                    lineNumber: 34,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/admin/components/productForm/HeaderSerialStatus.jsx",
                lineNumber: 33,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-gray-50 rounded p-4 grid grid-cols-2 gap-3 mt-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-sm font-semibold block mb-1",
                                children: "Serial"
                            }, void 0, false, {
                                fileName: "[project]/admin/components/productForm/HeaderSerialStatus.jsx",
                                lineNumber: 41,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                value: Number(form.order ?? safeMax + 1),
                                onChange: (e)=>setForm((p)=>({
                                            ...p,
                                            order: Number(e.target.value)
                                        })),
                                className: "w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none bg-white transition-all",
                                children: Array.from({
                                    length: totalOptions
                                }, (_, i)=>i + 1).map((n)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: n,
                                        children: n
                                    }, n, false, {
                                        fileName: "[project]/admin/components/productForm/HeaderSerialStatus.jsx",
                                        lineNumber: 51,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/admin/components/productForm/HeaderSerialStatus.jsx",
                                lineNumber: 43,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[10px] text-gray-500 mt-1",
                                children: product ? "Current position" : "Automatically set to last"
                            }, void 0, false, {
                                fileName: "[project]/admin/components/productForm/HeaderSerialStatus.jsx",
                                lineNumber: 57,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/components/productForm/HeaderSerialStatus.jsx",
                        lineNumber: 40,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-sm font-semibold block mb-1",
                                children: "Status"
                            }, void 0, false, {
                                fileName: "[project]/admin/components/productForm/HeaderSerialStatus.jsx",
                                lineNumber: 63,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                value: form.isActive ? "active" : "hidden",
                                onChange: (e)=>setForm((p)=>({
                                            ...p,
                                            isActive: e.target.value === "active"
                                        })),
                                className: `w-full border p-2.5 rounded-lg focus:ring-2 outline-none transition-all ${form.isActive ? "border-green-200 bg-green-50 text-green-700 focus:ring-green-100" : "border-red-200 bg-red-50 text-red-700 focus:ring-red-100"}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "active",
                                        children: "Active"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/productForm/HeaderSerialStatus.jsx",
                                        lineNumber: 79,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "hidden",
                                        children: "Hidden"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/productForm/HeaderSerialStatus.jsx",
                                        lineNumber: 80,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/components/productForm/HeaderSerialStatus.jsx",
                                lineNumber: 65,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/components/productForm/HeaderSerialStatus.jsx",
                        lineNumber: 62,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/admin/components/productForm/HeaderSerialStatus.jsx",
                lineNumber: 39,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_s(HeaderSerialStatus, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c = HeaderSerialStatus;
var _c;
__turbopack_context__.k.register(_c, "HeaderSerialStatus");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/admin/components/productForm/BasicInfoCategory.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>BasicInfoCategory
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/admin/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2d$off$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ImageOff$3e$__ = __turbopack_context__.i("[project]/admin/node_modules/lucide-react/dist/esm/icons/image-off.js [app-client] (ecmascript) <export default as ImageOff>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function BasicInfoCategory({ form, setForm, categories = [], errors, setErrors }) {
    _s();
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [imgLoaded, setImgLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const boxRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const handleChange = (field, value)=>{
        setForm((p)=>({
                ...p,
                [field]: value
            }));
        if (errors[field]) setErrors((p)=>({
                ...p,
                [field]: null
            }));
    };
    const selectedCategory = categories.find((c)=>c._id === form.category);
    // ✅ ক্যাটাগরি বদলালে fade আবার শুরু থেকে হবে
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "BasicInfoCategory.useEffect": ()=>{
            setImgLoaded(false);
        }
    }["BasicInfoCategory.useEffect"], [
        form.category
    ]);
    // ✅ বাইরে ক্লিক করলে dropdown বন্ধ হবে
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "BasicInfoCategory.useEffect": ()=>{
            const onOutside = {
                "BasicInfoCategory.useEffect.onOutside": (e)=>{
                    if (boxRef.current && !boxRef.current.contains(e.target)) {
                        setOpen(false);
                    }
                }
            }["BasicInfoCategory.useEffect.onOutside"];
            document.addEventListener("mousedown", onOutside);
            return ({
                "BasicInfoCategory.useEffect": ()=>document.removeEventListener("mousedown", onOutside)
            })["BasicInfoCategory.useEffect"];
        }
    }["BasicInfoCategory.useEffect"], []);
    const inputBase = "mt-1 w-full px-4 py-2.5 rounded-xl border focus:outline-none transition-all";
    const ok = "border-gray-300 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400";
    const errClass = "border-red-500 bg-red-50 focus:ring-red-100";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "bg-white rounded-2xl border p-5 space-y-5 shadow-sm",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid sm:grid-cols-2 gap-5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "font-semibold text-gray-700 text-sm",
                                children: [
                                    "নাম ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-red-500",
                                        children: "*"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/productForm/BasicInfoCategory.jsx",
                                        lineNumber: 51,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/components/productForm/BasicInfoCategory.jsx",
                                lineNumber: 50,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                value: form.name,
                                onChange: (e)=>handleChange("name", e.target.value),
                                className: `${inputBase} ${errors.name ? errClass : ok}`,
                                placeholder: "প্রোডাক্ট নাম"
                            }, void 0, false, {
                                fileName: "[project]/admin/components/productForm/BasicInfoCategory.jsx",
                                lineNumber: 53,
                                columnNumber: 11
                            }, this),
                            errors.name && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-red-600 mt-1 font-medium",
                                children: errors.name
                            }, void 0, false, {
                                fileName: "[project]/admin/components/productForm/BasicInfoCategory.jsx",
                                lineNumber: 60,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/components/productForm/BasicInfoCategory.jsx",
                        lineNumber: 49,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        ref: boxRef,
                        className: "relative",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "font-semibold text-gray-700 text-sm",
                                children: [
                                    "ক্যাটাগরি ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-red-500",
                                        children: "*"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/productForm/BasicInfoCategory.jsx",
                                        lineNumber: 69,
                                        columnNumber: 23
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/components/productForm/BasicInfoCategory.jsx",
                                lineNumber: 68,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>setOpen((o)=>!o),
                                className: `${inputBase} ${errors.category ? errClass : ok} flex items-center justify-between gap-2 cursor-pointer bg-white text-left`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "flex items-center gap-2.5 min-w-0",
                                        children: selectedCategory ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "relative h-7 w-7 rounded-lg overflow-hidden border bg-gray-50 shrink-0",
                                                    children: selectedCategory.image ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                        src: selectedCategory.image,
                                                        alt: selectedCategory.name,
                                                        onLoad: ()=>setImgLoaded(true),
                                                        className: `h-full w-full object-cover transition-opacity duration-500 ease-out ${imgLoaded ? "opacity-100" : "opacity-0"}`
                                                    }, selectedCategory._id, false, {
                                                        fileName: "[project]/admin/components/productForm/BasicInfoCategory.jsx",
                                                        lineNumber: 84,
                                                        columnNumber: 23
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "flex h-full w-full items-center justify-center text-gray-300",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2d$off$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ImageOff$3e$__["ImageOff"], {
                                                            size: 14
                                                        }, void 0, false, {
                                                            fileName: "[project]/admin/components/productForm/BasicInfoCategory.jsx",
                                                            lineNumber: 95,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/admin/components/productForm/BasicInfoCategory.jsx",
                                                        lineNumber: 94,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/admin/components/productForm/BasicInfoCategory.jsx",
                                                    lineNumber: 82,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "truncate text-gray-800",
                                                    children: selectedCategory.name
                                                }, void 0, false, {
                                                    fileName: "[project]/admin/components/productForm/BasicInfoCategory.jsx",
                                                    lineNumber: 99,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-gray-400",
                                            children: "Select Category"
                                        }, void 0, false, {
                                            fileName: "[project]/admin/components/productForm/BasicInfoCategory.jsx",
                                            lineNumber: 104,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/productForm/BasicInfoCategory.jsx",
                                        lineNumber: 79,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                        size: 18,
                                        className: `text-gray-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/productForm/BasicInfoCategory.jsx",
                                        lineNumber: 107,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/components/productForm/BasicInfoCategory.jsx",
                                lineNumber: 72,
                                columnNumber: 11
                            }, this),
                            errors.category && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-red-600 mt-1 font-medium",
                                children: errors.category
                            }, void 0, false, {
                                fileName: "[project]/admin/components/productForm/BasicInfoCategory.jsx",
                                lineNumber: 116,
                                columnNumber: 13
                            }, this),
                            open && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute z-30 mt-1 w-full max-h-64 overflow-y-auto rounded-xl border bg-white shadow-lg py-1",
                                children: [
                                    categories.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "px-4 py-3 text-sm text-gray-400",
                                        children: "কোনো ক্যাটাগরি পাওয়া যায়নি"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/productForm/BasicInfoCategory.jsx",
                                        lineNumber: 125,
                                        columnNumber: 17
                                    }, this),
                                    categories.map((c)=>{
                                        const isSelected = c._id === form.category;
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>{
                                                handleChange("category", c._id);
                                                setOpen(false);
                                            },
                                            className: `flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${isSelected ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-gray-700 hover:bg-gray-50"}`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "relative h-8 w-8 rounded-lg overflow-hidden border bg-gray-50 shrink-0",
                                                    children: c.image ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                        src: c.image,
                                                        alt: c.name,
                                                        className: "h-full w-full object-cover"
                                                    }, void 0, false, {
                                                        fileName: "[project]/admin/components/productForm/BasicInfoCategory.jsx",
                                                        lineNumber: 148,
                                                        columnNumber: 25
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "flex h-full w-full items-center justify-center text-gray-300",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2d$off$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ImageOff$3e$__["ImageOff"], {
                                                            size: 14
                                                        }, void 0, false, {
                                                            fileName: "[project]/admin/components/productForm/BasicInfoCategory.jsx",
                                                            lineNumber: 155,
                                                            columnNumber: 27
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/admin/components/productForm/BasicInfoCategory.jsx",
                                                        lineNumber: 154,
                                                        columnNumber: 25
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/admin/components/productForm/BasicInfoCategory.jsx",
                                                    lineNumber: 146,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "truncate",
                                                    children: c.name
                                                }, void 0, false, {
                                                    fileName: "[project]/admin/components/productForm/BasicInfoCategory.jsx",
                                                    lineNumber: 159,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, c._id, true, {
                                            fileName: "[project]/admin/components/productForm/BasicInfoCategory.jsx",
                                            lineNumber: 133,
                                            columnNumber: 19
                                        }, this);
                                    })
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/components/productForm/BasicInfoCategory.jsx",
                                lineNumber: 123,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/components/productForm/BasicInfoCategory.jsx",
                        lineNumber: 67,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/admin/components/productForm/BasicInfoCategory.jsx",
                lineNumber: 47,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "font-semibold text-gray-700 text-sm",
                        children: "Description"
                    }, void 0, false, {
                        fileName: "[project]/admin/components/productForm/BasicInfoCategory.jsx",
                        lineNumber: 169,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                        rows: 6,
                        value: form.description,
                        onChange: (e)=>handleChange("description", e.target.value),
                        className: `${inputBase} ${ok} resize-y min-h-[140px] leading-relaxed`,
                        placeholder: "বিস্তারিত বিবরণ..."
                    }, void 0, false, {
                        fileName: "[project]/admin/components/productForm/BasicInfoCategory.jsx",
                        lineNumber: 172,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/admin/components/productForm/BasicInfoCategory.jsx",
                lineNumber: 168,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "font-semibold text-gray-700 text-sm",
                        children: "Additional Info"
                    }, void 0, false, {
                        fileName: "[project]/admin/components/productForm/BasicInfoCategory.jsx",
                        lineNumber: 182,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                        rows: 12,
                        value: form.additionalInfo,
                        onChange: (e)=>handleChange("additionalInfo", e.target.value),
                        className: `${inputBase} ${ok} resize-y min-h-[260px] leading-relaxed whitespace-pre-wrap`,
                        placeholder: "অতিরিক্ত তথ্য (বক্স কন্টেন্ট, ওয়ারেন্টি, রিটার্ন পলিসি ইত্যাদি)..."
                    }, void 0, false, {
                        fileName: "[project]/admin/components/productForm/BasicInfoCategory.jsx",
                        lineNumber: 185,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/admin/components/productForm/BasicInfoCategory.jsx",
                lineNumber: 181,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/admin/components/productForm/BasicInfoCategory.jsx",
        lineNumber: 46,
        columnNumber: 5
    }, this);
}
_s(BasicInfoCategory, "vWY6vX/pBSZblAtJdbYG9suNit8=");
_c = BasicInfoCategory;
var _c;
__turbopack_context__.k.register(_c, "BasicInfoCategory");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/admin/utils/imageConvert.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* ================== ✅ COMMON IMAGE CONVERT UTILS ================== */ /**
 * ✅ Load Image from File
 */ __turbopack_context__.s([
    "convertToWebpUnderLimit",
    ()=>convertToWebpUnderLimit,
    "loadImageFromFile",
    ()=>loadImageFromFile
]);
const loadImageFromFile = (file)=>new Promise((resolve, reject)=>{
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = ()=>{
            URL.revokeObjectURL(url);
            resolve(img);
        };
        img.onerror = ()=>{
            URL.revokeObjectURL(url);
            reject(new Error("এই file টি একটি valid image না। সঠিক image file দাও।"));
        };
        img.src = url;
    });
/**
 * ✅ HEIC/HEIF detect করা (iPhone-এর default photo format)
 * - Chrome/Firefox/Edge কখনো এই format <img> এ load করতে পারে না,
 *   তাই canvas pipeline-এ পাঠানোর আগেই JPEG-এ convert করে নিতে হয়।
 */ const isHeicFile = (file)=>{
    const type = (file?.type || "").toLowerCase();
    const name = (file?.name || "").toLowerCase();
    return type === "image/heic" || type === "image/heif" || type === "image/heic-sequence" || type === "image/heif-sequence" || name.endsWith(".heic") || name.endsWith(".heif");
};
/**
 * ✅ HEIC/HEIF -> JPEG (heic2any দিয়ে, WebAssembly based, browser-only)
 * dynamic import করা হয়েছে যাতে SSR/Next.js build এ সমস্যা না হয়
 */ const convertHeicToJpegFile = async (file)=>{
    const heic2any = (await __turbopack_context__.A("[project]/admin/node_modules/heic2any/dist/heic2any.js [app-client] (ecmascript, async loader)")).default;
    const result = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: 0.92
    });
    // ✅ কোনো কোনো multi-image HEIC ফাইলে array রিটার্ন হতে পারে — প্রথমটা নেওয়া হলো
    const jpegBlob = Array.isArray(result) ? result[0] : result;
    const newName = (file.name || "image").replace(/\.[^.]+$/, "").trim() + ".jpg";
    return new File([
        jpegBlob
    ], newName, {
        type: "image/jpeg",
        lastModified: Date.now()
    });
};
/**
 * ✅ Check WebP support (iOS Safari/Chrome এ false আসবে)
 */ const checkWebPSupport = ()=>new Promise((resolve)=>{
        const canvas = document.createElement("canvas");
        canvas.width = 1;
        canvas.height = 1;
        canvas.toBlob((b)=>resolve(b !== null && b.size > 0), "image/webp", 0.5);
    });
const convertToWebpUnderLimit = async (file, rule)=>{
    if (!file) throw new Error("কোনো file select করা হয়নি।");
    // ✅ HEIC/HEIF (iPhone default) হলে আগেই JPEG-এ convert করে নেওয়া হচ্ছে,
    // কারণ Chrome/Firefox/Edge HEIC সরাসরি <img>-এ load করতে পারে না
    let workingFile = file;
    if (isHeicFile(file)) {
        try {
            workingFile = await convertHeicToJpegFile(file);
        } catch (err) {
            throw new Error("এই HEIC/HEIF ছবিটি convert করা যাচ্ছে না। অনুগ্রহ করে JPG/PNG ফরম্যাটে try করো।");
        }
    }
    const { width = 300, height = 300, maxBytes = 100 * 1024, startQuality = 0.88, minQuality = 0.2, qualityStep = 0.05 } = rule || {};
    // ✅ iOS check — WebP support না থাকলে JPEG use করো
    const supportsWebP = await checkWebPSupport();
    const outputType = supportsWebP ? "image/webp" : "image/jpeg";
    const outputExt = supportsWebP ? ".webp" : ".jpg";
    const img = await loadImageFromFile(workingFile);
    const sw = img.naturalWidth;
    const sh = img.naturalHeight;
    let dims = {
        width,
        height
    };
    let bestBlob = null;
    // ✅ প্রথমে quality কমিয়ে চেষ্টা, তারপরও বড় হলে dimension ছোট করে আবার চেষ্টা
    outer: for(let attempt = 0; attempt < 5; attempt++){
        // ✅ fit:inside — aspect ratio বজায় রেখে max dimension এর মধ্যে রাখো
        // (sharp এর fit:"inside" এর মতো — portrait ছবি crop হবে না)
        const ratio = Math.min(dims.width / sw, dims.height / sh, 1); // withoutEnlargement
        const canvasW = Math.round(sw * ratio);
        const canvasH = Math.round(sh * ratio);
        const canvas = document.createElement("canvas");
        canvas.width = canvasW;
        canvas.height = canvasH;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("তোমার browser canvas support করে না।");
        ctx.clearRect(0, 0, canvasW, canvasH);
        ctx.drawImage(img, 0, 0, sw, sh, 0, 0, canvasW, canvasH);
        let quality = startQuality;
        while(quality >= minQuality){
            const blob = await new Promise((res)=>canvas.toBlob(res, outputType, quality));
            if (blob) {
                bestBlob = blob; // ✅ সবসময় শেষ successful blob রাখি (fallback এর জন্য)
                if (blob.size <= maxBytes) break outer; // ✅ লক্ষ্যে পৌঁছে গেছি
            }
            quality -= qualityStep;
        }
        // ✅ quality কমিয়েও কাজ হয়নি — dimension আরও ছোট করে আবার চেষ্টা
        dims = {
            width: Math.max(200, Math.round(dims.width * 0.8)),
            height: Math.max(200, Math.round(dims.height * 0.8))
        };
    }
    // ✅ guaranteed fallback (প্রায় অসম্ভব edge case): একদম ছোট সাইজে শেষ চেষ্টা
    if (!bestBlob) {
        const fbRatio = Math.min(200 / sw, 200 / sh, 1);
        const fbW = Math.round(sw * fbRatio);
        const fbH = Math.round(sh * fbRatio);
        const canvas = document.createElement("canvas");
        canvas.width = fbW;
        canvas.height = fbH;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, sw, sh, 0, 0, fbW, fbH);
        bestBlob = await new Promise((res)=>canvas.toBlob(res, outputType, 0.5));
    }
    if (!bestBlob) throw new Error("Image convert করা যাচ্ছে না।");
    // ✅ এখন থেকে আর কখনো size এর কারণে error throw হবে না —
    // যত ছোট করা সম্ভব হয়েছে, সেটাই নিয়ে upload এগিয়ে যাবে।
    // ✅ file name
    const newName = (workingFile.name || "image").replace(/\.[^.]+$/, "").trim() + outputExt;
    return new File([
        bestBlob
    ], newName, {
        type: outputType,
        lastModified: Date.now()
    });
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/admin/components/productForm/VariantSection.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>VariantSection
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/react-icons/fa/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/@dnd-kit/core/dist/core.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f40$dnd$2d$kit$2f$sortable$2f$dist$2f$sortable$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/@dnd-kit/sortable/dist/sortable.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/@dnd-kit/utilities/dist/utilities.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$utils$2f$imageConvert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/utils/imageConvert.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
/* ---------------- RULES ---------------- */ const IMAGE_RULE = {
    type: "image/webp",
    maxBytes: 100 * 1024,
    width: 1200,
    height: 1200,
    startQuality: 0.92,
    minQuality: 0.55,
    qualityStep: 0.05
};
// ✅ প্রতিটি variant (বা default/base) এ সর্বোচ্চ কতটি image রাখা যাবে
// ⚠️ এই সংখ্যা backend/controllers/product/product.controller.js এর
// MAX_VARIANT_IMAGES এর সাথে মিলিয়ে রাখতে হবে, নাহলে frontend এ pass হলেও
// backend আপলোড কেটে দেবে।
const MAX_VARIANT_IMAGES = 8;
/* ---------------- Helpers ---------------- */ const safeUrlId = (url)=>{
    try {
        return btoa(url).replace(/=/g, "");
    } catch  {
        return encodeURIComponent(url);
    }
};
const createFileId = (f)=>`file_${f.name}_${f.size}_${f.lastModified}`;
const createUrlId = (u)=>`url_${safeUrlId(u)}`;
const normalizeOne = (f)=>{
    if (!f) return null;
    if (f && typeof f === "object" && "id" in f && "src" in f) {
        return {
            id: String(f.id),
            src: f.src
        };
    }
    if (typeof f === "string") {
        return {
            id: createUrlId(f),
            src: f
        };
    }
    if (f instanceof File) {
        return {
            id: createFileId(f),
            src: f
        };
    }
    return null;
};
const normalizeList = (files)=>{
    const used = new Set();
    return (files || []).map(normalizeOne).filter(Boolean).map((it, idx)=>{
        let id = it.id;
        if (used.has(id)) id = `${id}_${idx}`;
        used.add(id);
        return {
            ...it,
            id
        };
    });
};
/* ---------------- Sortable Image Item ---------------- */ function SortableImage({ item, vIdx, removeFile }) {
    _s();
    const { attributes, listeners, setNodeRef, transform, transition } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f40$dnd$2d$kit$2f$sortable$2f$dist$2f$sortable$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSortable"])({
        id: item.id
    });
    const style = {
        transform: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CSS"].Transform.toString(transform),
        transition
    };
    const [imageUrl, setImageUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SortableImage.useEffect": ()=>{
            const src = item?.src;
            if (typeof src === "string") {
                setImageUrl(src);
                return;
            }
            if (src instanceof File) {
                const url = URL.createObjectURL(src);
                setImageUrl(url);
                return ({
                    "SortableImage.useEffect": ()=>URL.revokeObjectURL(url)
                })["SortableImage.useEffect"];
            }
            setImageUrl("");
        }
    }["SortableImage.useEffect"], [
        item?.src
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: setNodeRef,
        style: style,
        className: "relative w-24 h-24 rounded-xl overflow-hidden border group shadow-sm bg-white",
        children: [
            imageUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                src: imageUrl,
                className: "w-full h-full object-cover",
                alt: "preview"
            }, void 0, false, {
                fileName: "[project]/admin/components/productForm/VariantSection.jsx",
                lineNumber: 117,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs",
                children: "No Preview"
            }, void 0, false, {
                fileName: "[project]/admin/components/productForm/VariantSection.jsx",
                lineNumber: 123,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ...attributes,
                ...listeners,
                className: "absolute top-1 left-1 bg-black/50 text-white p-1 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-10",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaGripVertical"], {
                    size: 10
                }, void 0, false, {
                    fileName: "[project]/admin/components/productForm/VariantSection.jsx",
                    lineNumber: 133,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/admin/components/productForm/VariantSection.jsx",
                lineNumber: 128,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: ()=>removeFile(vIdx, item.id),
                className: "absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none z-10",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaTimes"], {
                    size: 10
                }, void 0, false, {
                    fileName: "[project]/admin/components/productForm/VariantSection.jsx",
                    lineNumber: 141,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/admin/components/productForm/VariantSection.jsx",
                lineNumber: 136,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/admin/components/productForm/VariantSection.jsx",
        lineNumber: 111,
        columnNumber: 5
    }, this);
}
_s(SortableImage, "Z1Zvb4irX75h5wpq3HECJTam3lI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f40$dnd$2d$kit$2f$sortable$2f$dist$2f$sortable$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSortable"]
    ];
});
_c = SortableImage;
function VariantSection({ variants, setVariants, mode, errors, setErrors, onFilesReadyChange }) {
    _s1();
    const sensors = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSensors"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSensor"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PointerSensor"]), (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSensor"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["KeyboardSensor"], {
        coordinateGetter: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f40$dnd$2d$kit$2f$sortable$2f$dist$2f$sortable$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sortableKeyboardCoordinates"]
    }));
    const baseInput = "mt-1 w-full border p-2.5 rounded-lg focus:outline-none transition-all text-sm";
    const okClass = "border-gray-300 focus:ring-2 focus:ring-indigo-100";
    const disabledStyle = "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200";
    const errClass = "border-red-500 bg-red-50 focus:ring-red-100";
    // ✅ FIX: আগে এই normalize effect মাত্র একবার (component mount এ) চলত।
    // কিন্তু ProductForm যখন কোনো existing product edit করার জন্য খোলে, তখন
    // product এর real data (ছবির URL string গুলো) আসে একটু পরে — একটা আলাদা
    // useEffect দিয়ে, mount হওয়ার পরে। তাই প্রথমবার এই effect চলার সময়
    // variants ছিল খালি (placeholder), normalize করার কিছু ছিল না, এবং
    // normalizedOnceRef সাথে সাথে true হয়ে যেত। পরে আসল image URL গুলো
    // (string) আসলেও আর কখনো normalize হতো না — ফলে প্রতিটি item হয়ে যেত
    // raw string, যার `.id`/.src` কিছুই নেই → preview "No Preview" দেখাত,
    // এবং একটা ছবি delete করতে গেলে সব ছবির id === undefined হওয়ায়
    // filter এ সবগুলোই বাদ পড়ে যেত (সব ছবি একসাথে ডিলিট হয়ে যেত)।
    //
    // ফিক্স: "once" গার্ড সরিয়ে দিয়ে variants পরিবর্তন হলেই আবার চেক করা হচ্ছে।
    // normalizeOne ইতিমধ্যে normalize করা item কে অপরিবর্তিত রাখে (idempotent),
    // তাই এটা infinite loop তৈরি করবে না — প্রয়োজন হলেই একবার ঠিক হয়ে যাবে।
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "VariantSection.useEffect": ()=>{
            const needsNormalize = (variants || []).some({
                "VariantSection.useEffect.needsNormalize": (v)=>(v.files || []).some({
                        "VariantSection.useEffect.needsNormalize": (f)=>typeof f === "string" || f instanceof File
                    }["VariantSection.useEffect.needsNormalize"])
            }["VariantSection.useEffect.needsNormalize"]);
            if (!needsNormalize) return;
            const next = (variants || []).map({
                "VariantSection.useEffect.next": (v)=>({
                        ...v,
                        files: normalizeList(v.files)
                    })
            }["VariantSection.useEffect.next"]);
            setVariants(next);
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["VariantSection.useEffect"], [
        variants
    ]);
    const update = (i, field, value)=>{
        const next = [
            ...variants
        ];
        next[i] = {
            ...next[i],
            [field]: value
        };
        setVariants(next);
        let errKey;
        if (next[i].isBase) {
            if (field === "name") errKey = "baseName";
            if (field === "price") errKey = "basePrice";
        } else {
            const cap = field.charAt(0).toUpperCase() + field.slice(1);
            errKey = `variant${cap}_${i}`;
        }
        if (errKey && value?.toString().trim() !== "") {
            setErrors((prev)=>{
                const n = {
                    ...prev
                };
                delete n[errKey];
                return n;
            });
        }
    };
    // ✅ NOTE: আগে এখানে convert হওয়া ফাইলের size আবার চেক করে error দেখানো হতো।
    // এখন convertToWebpUnderLimit() নিজেই guarantee করে যে ফাইল maxBytes এর
    // মধ্যে থাকবে (দরকার হলে dimension কমিয়ে), তাই এই ডুপ্লিকেট ব্লকিং চেক
    // সরিয়ে দেওয়া হলো — যাতে কোনো অবস্থাতেই upload error না দেখায়।
    const handleFileChange = async (i, files)=>{
        const raw = Array.from(files || []);
        if (raw.length === 0) return;
        onFilesReadyChange?.(false);
        const next = [
            ...variants
        ];
        const current = Array.isArray(next[i].files) ? next[i].files : [];
        const key = next[i].isBase ? "baseImages" : `variantImages_${i}`;
        // ✅ প্রতি variant এ সর্বোচ্চ MAX_VARIANT_IMAGES টা image রাখার limit
        const remainingSlots = MAX_VARIANT_IMAGES - current.length;
        if (remainingSlots <= 0) {
            setErrors((prev)=>({
                    ...prev,
                    [key]: `❌ সর্বোচ্চ ${MAX_VARIANT_IMAGES}টি image রাখা যাবে। আগে কিছু image মুছে তারপর নতুন যোগ করুন।`
                }));
            onFilesReadyChange?.(true);
            return;
        }
        const acceptedRaw = raw.slice(0, remainingSlots);
        const rejectedCount = raw.length - acceptedRaw.length;
        try {
            setErrors((prev)=>{
                const n = {
                    ...prev
                };
                delete n[key];
                delete n[`${key}_processing`];
                if (rejectedCount > 0) {
                    n[key] = `⚠️ সর্বোচ্চ ${MAX_VARIANT_IMAGES}টি image এর limit থাকায় শেষের ${rejectedCount}টি image বাদ দেওয়া হয়েছে।`;
                }
                return n;
            });
            const converted = [];
            for (const f of acceptedRaw){
                setErrors((prev)=>({
                        ...prev,
                        [`${key}_processing`]: `⏳ "${f.name}" processing...`
                    }));
                try {
                    const convertedFile = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$utils$2f$imageConvert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["convertToWebpUnderLimit"])(f, IMAGE_RULE);
                    converted.push(convertedFile);
                } catch (err) {
                    setErrors((prev)=>({
                            ...prev,
                            [key]: `❌ "${f.name}" — ${err?.message || "Image process করতে সমস্যা হয়েছে।"}`
                        }));
                    onFilesReadyChange?.(true);
                    return;
                }
            }
            setErrors((prev)=>{
                const n = {
                    ...prev
                };
                delete n[`${key}_processing`];
                return n;
            });
            const added = normalizeList(converted);
            const merged = [
                ...current,
                ...added
            ];
            next[i].files = merged;
            setVariants(next);
        } catch (err) {
            setErrors((prev)=>({
                    ...prev,
                    [key]: `❌ ${err?.message || "Image process করতে সমস্যা হয়েছে।"}`
                }));
        } finally{
            setErrors((prev)=>{
                const n = {
                    ...prev
                };
                delete n[`${key}_processing`];
                return n;
            });
            onFilesReadyChange?.(true);
        }
    };
    const removeFile = (vIdx, fileId)=>{
        const next = [
            ...variants
        ];
        const list = Array.isArray(next[vIdx].files) ? next[vIdx].files : [];
        next[vIdx].files = list.filter((it)=>it.id !== fileId);
        setVariants(next);
    };
    const handleDragEnd = (event, vIdx)=>{
        const { active, over } = event;
        if (!active || !over || active.id === over.id) return;
        const next = [
            ...variants
        ];
        const files = Array.isArray(next[vIdx].files) ? next[vIdx].files : [];
        const oldIndex = files.findIndex((x)=>x.id === active.id);
        const newIndex = files.findIndex((x)=>x.id === over.id);
        if (oldIndex < 0 || newIndex < 0) return;
        next[vIdx].files = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f40$dnd$2d$kit$2f$sortable$2f$dist$2f$sortable$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["arrayMove"])(files, oldIndex, newIndex);
        setVariants(next);
    };
    const visibleVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "VariantSection.useMemo[visibleVariants]": ()=>{
            return mode === "default" ? (variants || []).map({
                "VariantSection.useMemo[visibleVariants]": (v, idx)=>({
                        v,
                        idx
                    })
            }["VariantSection.useMemo[visibleVariants]"]).filter({
                "VariantSection.useMemo[visibleVariants]": ({ v })=>v.isBase
            }["VariantSection.useMemo[visibleVariants]"]) : (variants || []).map({
                "VariantSection.useMemo[visibleVariants]": (v, idx)=>({
                        v,
                        idx
                    })
            }["VariantSection.useMemo[visibleVariants]"]).filter({
                "VariantSection.useMemo[visibleVariants]": ({ v })=>!v.isBase
            }["VariantSection.useMemo[visibleVariants]"]);
        }
    }["VariantSection.useMemo[visibleVariants]"], [
        variants,
        mode
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-6",
        children: [
            visibleVariants.map(({ v, idx: i })=>{
                const nameErr = v.isBase ? errors.baseName : errors[`variantName_${i}`];
                const priceErr = v.isBase ? errors.basePrice : errors[`variantPrice_${i}`];
                const imgErr = v.isBase ? errors.baseImages : errors[`variantImages_${i}`];
                const imgProcessing = v.isBase ? errors["baseImages_processing"] : errors[`variantImages_${i}_processing`];
                const fileItems = Array.isArray(v.files) ? v.files : [];
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: `border rounded-2xl p-5 shadow-sm transition-all ${v.isBase ? "bg-indigo-50/20 border-indigo-100" : "bg-gray-50 border-gray-200"}`,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-between items-center mb-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "font-bold text-gray-700",
                                    children: v.isBase ? "Default Settings (Main Product)" : `Variant #${i + 1}`
                                }, void 0, false, {
                                    fileName: "[project]/admin/components/productForm/VariantSection.jsx",
                                    lineNumber: 368,
                                    columnNumber: 15
                                }, this),
                                !v.isBase && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>setVariants(variants.filter((_, idx)=>idx !== i)),
                                    className: "text-red-500 hover:bg-red-50 p-2 rounded-full transition",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaTrash"], {
                                        size: 14
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/productForm/VariantSection.jsx",
                                        lineNumber: 382,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/admin/components/productForm/VariantSection.jsx",
                                    lineNumber: 375,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/admin/components/productForm/VariantSection.jsx",
                            lineNumber: 367,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-1 md:grid-cols-5 gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "md:col-span-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "text-xs font-bold text-gray-600 uppercase tracking-wide",
                                            children: [
                                                "Variant Name ",
                                                v.isBase ? "" : "*"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/admin/components/productForm/VariantSection.jsx",
                                            lineNumber: 389,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            value: v.name === "Default Variant" && v.isBase ? "Default Variant" : v.name || "",
                                            disabled: v.isBase,
                                            onChange: (e)=>update(i, "name", e.target.value),
                                            className: `${baseInput} ${v.isBase ? disabledStyle : nameErr ? errClass : okClass}`,
                                            placeholder: v.isBase ? "" : "e.g. Red / XL"
                                        }, void 0, false, {
                                            fileName: "[project]/admin/components/productForm/VariantSection.jsx",
                                            lineNumber: 392,
                                            columnNumber: 17
                                        }, this),
                                        nameErr && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[10px] text-red-500 mt-1 font-semibold",
                                            children: nameErr
                                        }, void 0, false, {
                                            fileName: "[project]/admin/components/productForm/VariantSection.jsx",
                                            lineNumber: 406,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/admin/components/productForm/VariantSection.jsx",
                                    lineNumber: 388,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "text-xs font-bold text-gray-600 uppercase tracking-wide",
                                            children: "Price *"
                                        }, void 0, false, {
                                            fileName: "[project]/admin/components/productForm/VariantSection.jsx",
                                            lineNumber: 413,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "number",
                                            value: v.price ?? "",
                                            onChange: (e)=>update(i, "price", e.target.value),
                                            className: `${baseInput} ${priceErr ? errClass : okClass}`,
                                            placeholder: "0.00"
                                        }, void 0, false, {
                                            fileName: "[project]/admin/components/productForm/VariantSection.jsx",
                                            lineNumber: 416,
                                            columnNumber: 17
                                        }, this),
                                        priceErr && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[10px] text-red-500 mt-1 font-semibold",
                                            children: priceErr
                                        }, void 0, false, {
                                            fileName: "[project]/admin/components/productForm/VariantSection.jsx",
                                            lineNumber: 424,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/admin/components/productForm/VariantSection.jsx",
                                    lineNumber: 412,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "text-xs font-bold text-gray-600 uppercase tracking-wide",
                                            children: "Old Price"
                                        }, void 0, false, {
                                            fileName: "[project]/admin/components/productForm/VariantSection.jsx",
                                            lineNumber: 431,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "number",
                                            value: v.oldPrice ?? "",
                                            onChange: (e)=>update(i, "oldPrice", e.target.value),
                                            className: `${baseInput} ${okClass}`,
                                            placeholder: "0.00"
                                        }, void 0, false, {
                                            fileName: "[project]/admin/components/productForm/VariantSection.jsx",
                                            lineNumber: 434,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/admin/components/productForm/VariantSection.jsx",
                                    lineNumber: 430,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "text-xs font-bold text-gray-600 uppercase tracking-wide",
                                            children: "Stock"
                                        }, void 0, false, {
                                            fileName: "[project]/admin/components/productForm/VariantSection.jsx",
                                            lineNumber: 444,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "number",
                                            value: v.stock ?? 0,
                                            onChange: (e)=>update(i, "stock", e.target.value),
                                            className: `${baseInput} ${okClass}`
                                        }, void 0, false, {
                                            fileName: "[project]/admin/components/productForm/VariantSection.jsx",
                                            lineNumber: 447,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/admin/components/productForm/VariantSection.jsx",
                                    lineNumber: 443,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "text-xs font-bold text-gray-600 uppercase tracking-wide",
                                            children: "Sold"
                                        }, void 0, false, {
                                            fileName: "[project]/admin/components/productForm/VariantSection.jsx",
                                            lineNumber: 456,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "number",
                                            value: v.sold ?? 0,
                                            onChange: (e)=>update(i, "sold", e.target.value),
                                            className: `${baseInput} ${okClass}`
                                        }, void 0, false, {
                                            fileName: "[project]/admin/components/productForm/VariantSection.jsx",
                                            lineNumber: 459,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/admin/components/productForm/VariantSection.jsx",
                                    lineNumber: 455,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/admin/components/productForm/VariantSection.jsx",
                            lineNumber: 387,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: `text-xs font-bold uppercase tracking-wide block mb-2 ${imgErr ? "text-red-500" : "text-gray-600"}`,
                                    children: [
                                        "Variant Images (Required) *",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "ml-2 text-[10px] font-semibold text-gray-500 normal-case",
                                            children: [
                                                "(যেকোনো image format → Auto ",
                                                IMAGE_RULE.width,
                                                "×",
                                                IMAGE_RULE.height,
                                                ")"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/admin/components/productForm/VariantSection.jsx",
                                            lineNumber: 476,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: `ml-2 text-[10px] font-bold normal-case ${fileItems.length >= MAX_VARIANT_IMAGES ? "text-red-500" : "text-gray-500"}`,
                                            children: [
                                                "(",
                                                fileItems.length,
                                                "/",
                                                MAX_VARIANT_IMAGES,
                                                ")"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/admin/components/productForm/VariantSection.jsx",
                                            lineNumber: 480,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/admin/components/productForm/VariantSection.jsx",
                                    lineNumber: 470,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-wrap gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DndContext"], {
                                            sensors: sensors,
                                            collisionDetection: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["closestCenter"],
                                            onDragEnd: (e)=>handleDragEnd(e, i),
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f40$dnd$2d$kit$2f$sortable$2f$dist$2f$sortable$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SortableContext"], {
                                                items: fileItems.map((it)=>it.id),
                                                strategy: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f40$dnd$2d$kit$2f$sortable$2f$dist$2f$sortable$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["horizontalListSortingStrategy"],
                                                children: fileItems.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SortableImage, {
                                                        item: item,
                                                        vIdx: i,
                                                        removeFile: removeFile
                                                    }, item.id, false, {
                                                        fileName: "[project]/admin/components/productForm/VariantSection.jsx",
                                                        lineNumber: 502,
                                                        columnNumber: 23
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/admin/components/productForm/VariantSection.jsx",
                                                lineNumber: 497,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/admin/components/productForm/VariantSection.jsx",
                                            lineNumber: 492,
                                            columnNumber: 17
                                        }, this),
                                        fileItems.length < MAX_VARIANT_IMAGES && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>document.getElementById(`file-${i}`)?.click(),
                                            className: `w-24 h-24 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all ${imgErr ? "border-red-500 bg-red-50 text-red-500 shadow-inner" : imgProcessing ? "border-orange-300 bg-orange-50 text-orange-400" : "border-gray-300 text-gray-400 hover:border-indigo-300 hover:text-indigo-400"}`,
                                            children: imgProcessing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-lg animate-spin",
                                                        children: "⏳"
                                                    }, void 0, false, {
                                                        fileName: "[project]/admin/components/productForm/VariantSection.jsx",
                                                        lineNumber: 528,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[10px] mt-1 font-bold",
                                                        children: "Processing"
                                                    }, void 0, false, {
                                                        fileName: "[project]/admin/components/productForm/VariantSection.jsx",
                                                        lineNumber: 529,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaImages"], {
                                                        size: 20
                                                    }, void 0, false, {
                                                        fileName: "[project]/admin/components/productForm/VariantSection.jsx",
                                                        lineNumber: 535,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[10px] mt-1 font-bold",
                                                        children: "Upload"
                                                    }, void 0, false, {
                                                        fileName: "[project]/admin/components/productForm/VariantSection.jsx",
                                                        lineNumber: 536,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true)
                                        }, void 0, false, {
                                            fileName: "[project]/admin/components/productForm/VariantSection.jsx",
                                            lineNumber: 513,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/admin/components/productForm/VariantSection.jsx",
                                    lineNumber: 491,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    id: `file-${i}`,
                                    type: "file",
                                    multiple: true,
                                    hidden: true,
                                    accept: "image/*,.heic,.heif",
                                    onChange: (e)=>{
                                        handleFileChange(i, e.target.files);
                                        e.target.value = "";
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/admin/components/productForm/VariantSection.jsx",
                                    lineNumber: 545,
                                    columnNumber: 15
                                }, this),
                                imgProcessing && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-[10px] text-orange-500 mt-1 font-bold",
                                    children: imgProcessing
                                }, void 0, false, {
                                    fileName: "[project]/admin/components/productForm/VariantSection.jsx",
                                    lineNumber: 558,
                                    columnNumber: 17
                                }, this),
                                imgErr && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-[10px] text-red-500 mt-1 font-bold italic",
                                    children: imgErr
                                }, void 0, false, {
                                    fileName: "[project]/admin/components/productForm/VariantSection.jsx",
                                    lineNumber: 564,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/admin/components/productForm/VariantSection.jsx",
                            lineNumber: 469,
                            columnNumber: 13
                        }, this)
                    ]
                }, i, true, {
                    fileName: "[project]/admin/components/productForm/VariantSection.jsx",
                    lineNumber: 359,
                    columnNumber: 11
                }, this);
            }),
            mode === "variant" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: ()=>setVariants([
                        ...variants,
                        {
                            name: "",
                            price: "",
                            oldPrice: "",
                            stock: 0,
                            sold: 0,
                            files: [],
                            isBase: false
                        }
                    ]),
                className: "bg-purple-100 text-purple-700 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-purple-600 hover:text-white transition-all shadow-sm text-sm",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaPlus"], {
                        size: 12
                    }, void 0, false, {
                        fileName: "[project]/admin/components/productForm/VariantSection.jsx",
                        lineNumber: 592,
                        columnNumber: 11
                    }, this),
                    " Add Another Variant"
                ]
            }, void 0, true, {
                fileName: "[project]/admin/components/productForm/VariantSection.jsx",
                lineNumber: 574,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/admin/components/productForm/VariantSection.jsx",
        lineNumber: 343,
        columnNumber: 5
    }, this);
}
_s1(VariantSection, "eb+GxmMZTflcRjQyjUeONzVuM3M=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSensors"]
    ];
});
_c1 = VariantSection;
var _c, _c1;
__turbopack_context__.k.register(_c, "SortableImage");
__turbopack_context__.k.register(_c1, "VariantSection");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/admin/components/productForm/ReviewsSection.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ReviewsSection
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
function ReviewsSection({ form, averageRating, addReview, handleReviewChange, removeReview, errors = {}, setErrors = ()=>{} }) {
    const base = "w-full border p-2 rounded transition focus:outline-none";
    const ok = "border-gray-300 focus:ring-2 focus:ring-indigo-200";
    const err = "border-red-500 focus:ring-2 focus:ring-red-200";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "bg-gray-50 rounded-xl p-4 space-y-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-between items-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "font-bold",
                        children: "⭐ রিভিউ"
                    }, void 0, false, {
                        fileName: "[project]/admin/components/productForm/ReviewsSection.jsx",
                        lineNumber: 18,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: addReview,
                        className: "text-indigo-600 text-sm font-semibold",
                        children: "+ নতুন"
                    }, void 0, false, {
                        fileName: "[project]/admin/components/productForm/ReviewsSection.jsx",
                        lineNumber: 19,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/admin/components/productForm/ReviewsSection.jsx",
                lineNumber: 17,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white p-3 border rounded",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "text-sm font-semibold",
                        children: "Average Rating"
                    }, void 0, false, {
                        fileName: "[project]/admin/components/productForm/ReviewsSection.jsx",
                        lineNumber: 30,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        value: averageRating,
                        disabled: true,
                        className: "w-full border bg-gray-100 p-2 rounded mt-1"
                    }, void 0, false, {
                        fileName: "[project]/admin/components/productForm/ReviewsSection.jsx",
                        lineNumber: 31,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/admin/components/productForm/ReviewsSection.jsx",
                lineNumber: 29,
                columnNumber: 7
            }, this),
            form.reviews.map((r, i)=>{
                const ratingError = errors[`reviewRating_${i}`];
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-white p-3 border rounded space-y-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "text-xs font-semibold",
                                    children: "নাম"
                                }, void 0, false, {
                                    fileName: "[project]/admin/components/productForm/ReviewsSection.jsx",
                                    lineNumber: 46,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    value: r.user,
                                    placeholder: "নাম",
                                    onChange: (e)=>handleReviewChange(i, "user", e.target.value),
                                    className: `${base} ${ok}`
                                }, void 0, false, {
                                    fileName: "[project]/admin/components/productForm/ReviewsSection.jsx",
                                    lineNumber: 47,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/admin/components/productForm/ReviewsSection.jsx",
                            lineNumber: 45,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "text-xs font-semibold",
                                    children: [
                                        "Rating ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-red-500",
                                            children: "*"
                                        }, void 0, false, {
                                            fileName: "[project]/admin/components/productForm/ReviewsSection.jsx",
                                            lineNumber: 58,
                                            columnNumber: 24
                                        }, this),
                                        " ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-gray-400",
                                            children: "(0 – 5)"
                                        }, void 0, false, {
                                            fileName: "[project]/admin/components/productForm/ReviewsSection.jsx",
                                            lineNumber: 59,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/admin/components/productForm/ReviewsSection.jsx",
                                    lineNumber: 57,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "number",
                                    min: 0,
                                    max: 5,
                                    value: r.rating,
                                    placeholder: "0 - 5",
                                    onChange: (e)=>{
                                        const raw = e.target.value;
                                        const val = Number(raw);
                                        // ❌ invalid number
                                        if (raw === "") {
                                            handleReviewChange(i, "rating", "");
                                            setErrors((p)=>({
                                                    ...p,
                                                    [`reviewRating_${i}`]: "রেটিং দিন (০–৫)"
                                                }));
                                            return;
                                        }
                                        // ❌ greater than 5
                                        if (val > 5) {
                                            handleReviewChange(i, "rating", 5); // clamp
                                            setErrors((p)=>({
                                                    ...p,
                                                    [`reviewRating_${i}`]: "রেটিং ৫ এর বেশি হতে পারে না"
                                                }));
                                            return;
                                        }
                                        // ❌ less than 0
                                        if (val < 0) {
                                            handleReviewChange(i, "rating", 0); // clamp
                                            setErrors((p)=>({
                                                    ...p,
                                                    [`reviewRating_${i}`]: "রেটিং ০ এর কম হতে পারে না"
                                                }));
                                            return;
                                        }
                                        // ✅ valid
                                        handleReviewChange(i, "rating", val);
                                        setErrors((p)=>({
                                                ...p,
                                                [`reviewRating_${i}`]: null
                                            }));
                                    },
                                    className: `${base} ${ratingError ? err : ok}`
                                }, void 0, false, {
                                    fileName: "[project]/admin/components/productForm/ReviewsSection.jsx",
                                    lineNumber: 61,
                                    columnNumber: 15
                                }, this),
                                ratingError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-red-600 mt-1",
                                    children: ratingError
                                }, void 0, false, {
                                    fileName: "[project]/admin/components/productForm/ReviewsSection.jsx",
                                    lineNumber: 112,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/admin/components/productForm/ReviewsSection.jsx",
                            lineNumber: 56,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "text-xs font-semibold",
                                    children: "Comment"
                                }, void 0, false, {
                                    fileName: "[project]/admin/components/productForm/ReviewsSection.jsx",
                                    lineNumber: 118,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    value: r.comment,
                                    placeholder: "Comment",
                                    onChange: (e)=>handleReviewChange(i, "comment", e.target.value),
                                    className: `${base} ${ok}`
                                }, void 0, false, {
                                    fileName: "[project]/admin/components/productForm/ReviewsSection.jsx",
                                    lineNumber: 119,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/admin/components/productForm/ReviewsSection.jsx",
                            lineNumber: 117,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: ()=>removeReview(i),
                            className: "text-red-600 text-xs font-semibold",
                            children: "Remove"
                        }, void 0, false, {
                            fileName: "[project]/admin/components/productForm/ReviewsSection.jsx",
                            lineNumber: 130,
                            columnNumber: 13
                        }, this)
                    ]
                }, i, true, {
                    fileName: "[project]/admin/components/productForm/ReviewsSection.jsx",
                    lineNumber: 43,
                    columnNumber: 11
                }, this);
            })
        ]
    }, void 0, true, {
        fileName: "[project]/admin/components/productForm/ReviewsSection.jsx",
        lineNumber: 15,
        columnNumber: 5
    }, this);
}
_c = ReviewsSection;
var _c;
__turbopack_context__.k.register(_c, "ReviewsSection");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/admin/components/productForm/ProductForm.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ProductForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$Toast$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/Toast.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$productForm$2f$HeaderSerialStatus$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/productForm/HeaderSerialStatus.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$productForm$2f$BasicInfoCategory$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/productForm/BasicInfoCategory.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$productForm$2f$VariantSection$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/productForm/VariantSection.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$productForm$2f$ReviewsSection$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/productForm/ReviewsSection.jsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
const EMPTY_DEFAULT_VARIANT = {
    name: "Default Variant",
    price: "",
    oldPrice: "",
    stock: 0,
    sold: 0,
    files: [],
    isBase: true
};
function ProductForm({ product, productsLength = 0, onClose, onSaved }) {
    _s();
    const [processing, setProcessing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [toast, setToast] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [variantMode, setVariantMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("default");
    const [errors, setErrors] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [categories, setCategories] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [homeBadges, setHomeBadges] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    // drafts (mode switch data safe)
    const [baseDraft, setBaseDraft] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(EMPTY_DEFAULT_VARIANT);
    const [variantDrafts, setVariantDrafts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    // disable save until image normalize/preview ready
    const [filesReady, setFilesReady] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    // dirty tracking
    const initialSnapshotRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [initDone, setInitDone] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [form, setForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        name: "",
        category: "",
        description: "",
        additionalInfo: "",
        order: 1,
        isActive: true,
        freeDelivery: false,
        bestDiscount: false,
        cartvanBox: false,
        variants: [
            EMPTY_DEFAULT_VARIANT
        ],
        reviews: []
    });
    // ✅ sanitize helper for compare
    const sanitizeFormForCompare = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ProductForm.useCallback[sanitizeFormForCompare]": (f)=>{
            const safeVariants = (Array.isArray(f?.variants) ? f.variants : []).map({
                "ProductForm.useCallback[sanitizeFormForCompare].safeVariants": (v)=>({
                        name: v?.name || "",
                        price: v?.price ?? "",
                        oldPrice: v?.oldPrice ?? "",
                        stock: Number(v?.stock ?? 0),
                        sold: Number(v?.sold ?? 0),
                        isBase: !!v?.isBase,
                        filesMeta: (Array.isArray(v?.files) ? v.files : []).map({
                            "ProductForm.useCallback[sanitizeFormForCompare].safeVariants": (x)=>{
                                const src = x?.src ?? x;
                                if (src instanceof File) return `FILE:${src.name}:${src.size}:${src.lastModified}`;
                                return `URL:${String(src)}`;
                            }
                        }["ProductForm.useCallback[sanitizeFormForCompare].safeVariants"])
                    })
            }["ProductForm.useCallback[sanitizeFormForCompare].safeVariants"]);
            const safeReviews = (Array.isArray(f?.reviews) ? f.reviews : []).map({
                "ProductForm.useCallback[sanitizeFormForCompare].safeReviews": (r)=>({
                        user: r?.user || "",
                        rating: Number(r?.rating || 0),
                        comment: r?.comment || ""
                    })
            }["ProductForm.useCallback[sanitizeFormForCompare].safeReviews"]);
            return {
                name: f?.name || "",
                category: f?.category || "",
                description: f?.description || "",
                additionalInfo: f?.additionalInfo || "",
                order: Number(f?.order || 1),
                isActive: !!f?.isActive,
                freeDelivery: !!f?.freeDelivery,
                bestDiscount: !!f?.bestDiscount,
                cartvanBox: !!f?.cartvanBox,
                variants: safeVariants,
                reviews: safeReviews
            };
        }
    }["ProductForm.useCallback[sanitizeFormForCompare]"], []);
    const isDirty = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ProductForm.useMemo[isDirty]": ()=>{
            if (!initialSnapshotRef.current) return false;
            const now = JSON.stringify(sanitizeFormForCompare(form));
            return now !== initialSnapshotRef.current;
        }
    }["ProductForm.useMemo[isDirty]"], [
        form,
        sanitizeFormForCompare
    ]);
    /* ---------------- Fetch Categories ---------------- */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProductForm.useEffect": ()=>{
            const fetchCategories = {
                "ProductForm.useEffect.fetchCategories": async ()=>{
                    try {
                        const res = await fetch(`/api/admin/categories`);
                        const data = await res.json();
                        setCategories(Array.isArray(data) ? data : data.categories || []);
                    } catch (err) {
                        console.error("Category load error:", err);
                    }
                }
            }["ProductForm.useEffect.fetchCategories"];
            fetchCategories();
        }
    }["ProductForm.useEffect"], []);
    /* ---------------- Fetch Home Badges (Offer Badge label ও Admin panel থেকে আসবে) ---------------- */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProductForm.useEffect": ()=>{
            const fetchHomeBadges = {
                "ProductForm.useEffect.fetchHomeBadges": async ()=>{
                    try {
                        const res = await fetch(`/api/admin/homeBadges`);
                        const data = await res.json();
                        setHomeBadges(Array.isArray(data?.badges) ? data.badges : []);
                    } catch (err) {
                        console.error("Home badge load error:", err);
                    }
                }
            }["ProductForm.useEffect.fetchHomeBadges"];
            fetchHomeBadges();
        }
    }["ProductForm.useEffect"], []);
    // ✅ field অনুযায়ী admin-এর দেওয়া label বের করা, না থাকলে fallback
    const getBadgeLabel = (field, fallback)=>{
        const b = homeBadges.find((x)=>x.field === field);
        return b?.name || fallback;
    };
    /* ---------------- Initialize Form (UPDATED) ---------------- */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProductForm.useEffect": ()=>{
            setInitDone(false);
            const safeLen = Number(productsLength ?? 0);
            if (!product) {
                const last = safeLen + 1;
                setVariantMode("default");
                setErrors({});
                setFilesReady(true);
                setBaseDraft({
                    ...EMPTY_DEFAULT_VARIANT
                });
                setVariantDrafts([]);
                setForm({
                    name: "",
                    category: "",
                    description: "",
                    additionalInfo: "",
                    order: last,
                    isActive: true,
                    freeDelivery: false,
                    bestDiscount: false,
                    cartvanBox: false,
                    variants: [
                        {
                            ...EMPTY_DEFAULT_VARIANT
                        }
                    ],
                    reviews: []
                });
                setInitDone(true);
                return;
            }
            const rawVariants = product.colors || [];
            const orderValue = Number(product?.order ?? safeLen) || 1;
            if (rawVariants.length > 0) {
                setVariantMode("variant");
                const mappedVariants = rawVariants.map({
                    "ProductForm.useEffect.mappedVariants": (v)=>({
                            ...v,
                            price: v.price ?? product.price ?? "",
                            oldPrice: v.oldPrice ?? product.oldPrice ?? "",
                            stock: v.stock ?? product.stock ?? 0,
                            sold: v.sold ?? product.sold ?? 0,
                            files: v.images || [],
                            isBase: false
                        })
                }["ProductForm.useEffect.mappedVariants"]);
                setVariantDrafts(mappedVariants);
                const base = {
                    ...EMPTY_DEFAULT_VARIANT,
                    price: product.price || "",
                    oldPrice: product.oldPrice || "",
                    stock: product.stock || 0,
                    sold: product.sold || 0,
                    files: product.images || [],
                    isBase: true
                };
                setBaseDraft(base);
                setForm({
                    name: product.name || "",
                    category: product.category?._id || product.category || "",
                    description: product.description || "",
                    additionalInfo: product.additionalInfo || "",
                    order: orderValue,
                    isActive: product.isActive ?? true,
                    freeDelivery: product.freeDelivery ?? false,
                    bestDiscount: product.bestDiscount ?? false,
                    cartvanBox: product.cartvanBox ?? false,
                    variants: mappedVariants,
                    reviews: product.reviews || []
                });
                setFilesReady(true);
                setInitDone(true);
                return;
            }
            // default mode
            setVariantMode("default");
            const base = {
                ...EMPTY_DEFAULT_VARIANT,
                price: product.price || "",
                oldPrice: product.oldPrice || "",
                stock: product.stock || 0,
                sold: product.sold || 0,
                files: product.images || [],
                isBase: true
            };
            setBaseDraft(base);
            setVariantDrafts([]);
            setForm({
                name: product.name || "",
                category: product.category?._id || product.category || "",
                description: product.description || "",
                additionalInfo: product.additionalInfo || "",
                order: orderValue,
                isActive: product.isActive ?? true,
                freeDelivery: product.freeDelivery ?? false,
                bestDiscount: product.bestDiscount ?? false,
                cartvanBox: product.cartvanBox ?? false,
                variants: [
                    base
                ],
                reviews: product.reviews || []
            });
            setFilesReady(true);
            setInitDone(true);
        }
    }["ProductForm.useEffect"], [
        product,
        productsLength
    ]);
    // snapshot once per init
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProductForm.useEffect": ()=>{
            if (!initDone) return;
            initialSnapshotRef.current = JSON.stringify(sanitizeFormForCompare(form));
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["ProductForm.useEffect"], [
        initDone
    ]);
    /* ---------------- Rating ---------------- */ const averageRating = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ProductForm.useMemo[averageRating]": ()=>{
            if (!Array.isArray(form.reviews) || form.reviews.length === 0) return 0;
            const total = form.reviews.reduce({
                "ProductForm.useMemo[averageRating].total": (sum, r)=>sum + Number(r.rating || 0)
            }["ProductForm.useMemo[averageRating].total"], 0);
            return (total / form.reviews.length).toFixed(1);
        }
    }["ProductForm.useMemo[averageRating]"], [
        form.reviews
    ]);
    /* ---------------- Validation ---------------- */ const validateForm = ()=>{
        const e = {};
        if (!form.name?.trim()) e.name = "প্রোডাক্ট নাম দিতে হবে";
        if (!form.category) e.category = "ক্যাটাগরি নির্বাচন করুন";
        const list = Array.isArray(form.variants) ? form.variants : [];
        list.forEach((v, i)=>{
            if (variantMode === "default") {
                if (!v.price) e.basePrice = "মূল্য দিতে হবে";
                if (!v.files || v.files.length === 0) e.baseImages = "অন্তত একটি ছবি দিন";
            } else {
                if (!v.name?.trim()) e[`variantName_${i}`] = "নাম দিতে হবে";
                if (!v.price) e[`variantPrice_${i}`] = "মূল্য দিতে হবে";
                if (!v.files || v.files.length === 0) e[`variantImages_${i}`] = "ছবি দিতে হবে";
            }
        });
        setErrors(e);
        return Object.keys(e).length === 0;
    };
    /* ---------------- Enable Variant ---------------- */ const handleEnableVariant = ()=>{
        if (variantMode === "variant") return;
        setErrors({});
        const firstVariant = {
            ...baseDraft,
            files: Array.isArray(baseDraft?.files) ? baseDraft.files : [],
            price: baseDraft.price ?? form.variants?.[0]?.price ?? product?.price ?? "",
            oldPrice: baseDraft.oldPrice ?? product?.oldPrice ?? "",
            stock: baseDraft.stock ?? product?.stock ?? 0,
            sold: baseDraft.sold ?? product?.sold ?? 0,
            name: baseDraft.name === "Default Variant" ? "" : baseDraft.name,
            isBase: false
        };
        setVariantDrafts([
            firstVariant
        ]);
        setForm((p)=>({
                ...p,
                variants: [
                    firstVariant
                ]
            }));
        setVariantMode("variant");
        setFilesReady(true);
    };
    /* ---------------- Back to Default ---------------- */ const handleDefaultMode = ()=>{
        if (variantMode === "default") return;
        setErrors({});
        const first = variantDrafts[0] || EMPTY_DEFAULT_VARIANT;
        const restoredBase = {
            ...first,
            files: Array.isArray(first?.files) ? first.files : [],
            name: "Default Variant",
            isBase: true
        };
        setBaseDraft(restoredBase);
        setForm((p)=>({
                ...p,
                variants: [
                    restoredBase
                ]
            }));
        setVariantMode("default");
        setFilesReady(true);
    };
    /* ---------------- Submit ---------------- */ const handleSubmit = async (e)=>{
        e.preventDefault();
        // no update block
        if (!isDirty) {
            return setToast({
                type: "error",
                message: "কোনো পরিবর্তন করা হয়নি"
            });
        }
        // files normalize not ready
        if (!filesReady) {
            return setToast({
                type: "error",
                message: "ছবি লোড হচ্ছে... একটু অপেক্ষা করুন"
            });
        }
        if (!validateForm()) {
            return setToast({
                type: "error",
                message: "লাল চিহ্নিত ঘরগুলো সঠিকভাবে পূরণ করুন"
            });
        }
        setProcessing(true);
        try {
            const formData = new FormData();
            formData.append("name", form.name);
            formData.append("category", form.category);
            formData.append("description", form.description || "");
            formData.append("additionalInfo", form.additionalInfo || "");
            formData.append("order", String(form.order));
            formData.append("isActive", form.isActive ? "true" : "false");
            formData.append("freeDelivery", form.freeDelivery ? "true" : "false");
            formData.append("bestDiscount", form.bestDiscount ? "true" : "false");
            formData.append("cartvanBox", form.cartvanBox ? "true" : "false");
            formData.append("rating", String(averageRating));
            formData.append("reviews", JSON.stringify(form.reviews || []));
            if (variantMode === "default") {
                const base = Array.isArray(form.variants) ? form.variants[0] : null;
                formData.append("price", String(base?.price || 0));
                formData.append("oldPrice", String(base?.oldPrice || 0));
                formData.append("stock", String(base?.stock || 0));
                formData.append("sold", String(base?.sold || 0));
                const existingImg = [];
                (base?.files || []).forEach((fileItem)=>{
                    const src = fileItem?.src ?? fileItem;
                    if (src instanceof File) {
                        formData.append("images", src);
                    } else if (typeof src === "string") {
                        existingImg.push(src);
                    }
                });
                formData.append("existingImages", JSON.stringify(existingImg));
                formData.append("colors", JSON.stringify([]));
            } else {
                const variants = Array.isArray(form.variants) ? form.variants : [];
                // ✅ Upload new files for each variant
                variants.forEach((v, idx)=>{
                    (v.files || []).forEach((fileItem)=>{
                        const src = fileItem?.src ?? fileItem;
                        if (src instanceof File) {
                            formData.append(`color_images_${idx}`, src);
                        }
                    });
                });
                // ✅ existing image urls
                formData.append("colors", JSON.stringify(variants.map(({ files, ...rest })=>({
                        ...rest,
                        images: (files || []).map((f)=>f?.src ?? f).filter((src)=>typeof src === "string")
                    }))));
                formData.append("price", String(variants[0]?.price || 0));
            }
            const url = product ? `/api/admin/products/${product._id}` : `/api/admin/products`;
            const res = await fetch(url, {
                method: product ? "PUT" : "POST",
                body: formData
            });
            if (!res.ok) {
                const errData = await res.json().catch(()=>({}));
                throw new Error(errData.error || "Failed to save");
            }
            setToast({
                message: "সফলভাবে সংরক্ষিত হয়েছে",
                type: "success"
            });
            // reset dirty snapshot after save
            initialSnapshotRef.current = JSON.stringify(sanitizeFormForCompare(form));
            onSaved?.();
            onClose?.();
        } catch (err) {
            setToast({
                message: err.message,
                type: "error"
            });
        } finally{
            setProcessing(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                onSubmit: handleSubmit,
                className: "relative bg-white rounded-2xl w-full max-w-5xl max-h-[98vh] overflow-y-auto shadow-xl",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "sticky top-0 z-20 bg-white/95 backdrop-blur border-b",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between px-6 py-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-sm font-bold text-gray-700 flex items-center gap-2",
                                    children: [
                                        product ? "✏️ Edit Product" : "➕ Add Product",
                                        !isDirty && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[11px] font-semibold text-gray-400",
                                            children: "(No changes)"
                                        }, void 0, false, {
                                            fileName: "[project]/admin/components/productForm/ProductForm.jsx",
                                            lineNumber: 470,
                                            columnNumber: 17
                                        }, this),
                                        !filesReady && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[11px] font-semibold text-orange-500",
                                            children: "(Images loading…)"
                                        }, void 0, false, {
                                            fileName: "[project]/admin/components/productForm/ProductForm.jsx",
                                            lineNumber: 475,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/admin/components/productForm/ProductForm.jsx",
                                    lineNumber: 467,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: onClose,
                                            disabled: processing,
                                            className: `px-4 py-2 rounded-xl font-bold text-sm border bg-white active:scale-[0.99] ${processing ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"}`,
                                            children: "✖ Cancel"
                                        }, void 0, false, {
                                            fileName: "[project]/admin/components/productForm/ProductForm.jsx",
                                            lineNumber: 482,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "submit",
                                            disabled: processing || !filesReady || !isDirty,
                                            className: `px-5 py-2 rounded-xl text-white font-bold text-sm transition-all ${processing || !filesReady || !isDirty ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99]"}`,
                                            children: processing ? "প্রসেসিং..." : !filesReady ? "ছবি লোড হচ্ছে..." : !isDirty ? "No changes" : product ? "💾 আপডেট করুন" : "💾 সংরক্ষণ করুন"
                                        }, void 0, false, {
                                            fileName: "[project]/admin/components/productForm/ProductForm.jsx",
                                            lineNumber: 495,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/admin/components/productForm/ProductForm.jsx",
                                    lineNumber: 481,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/admin/components/productForm/ProductForm.jsx",
                            lineNumber: 466,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/admin/components/productForm/ProductForm.jsx",
                        lineNumber: 465,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative",
                        children: [
                            processing && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute inset-0 z-40 flex items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-b-2xl cursor-not-allowed",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"
                                        }, void 0, false, {
                                            fileName: "[project]/admin/components/productForm/ProductForm.jsx",
                                            lineNumber: 522,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-sm font-bold text-indigo-700",
                                            children: "প্রসেসিং হচ্ছে... অপেক্ষা করুন"
                                        }, void 0, false, {
                                            fileName: "[project]/admin/components/productForm/ProductForm.jsx",
                                            lineNumber: 523,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/admin/components/productForm/ProductForm.jsx",
                                    lineNumber: 521,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/admin/components/productForm/ProductForm.jsx",
                                lineNumber: 520,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `p-6 space-y-6 transition-all ${processing ? "blur-sm pointer-events-none select-none" : ""}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$productForm$2f$HeaderSerialStatus$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        product: product,
                                        form: form,
                                        setForm: setForm,
                                        maxSerial: productsLength
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/productForm/ProductForm.jsx",
                                        lineNumber: 535,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-gray-50 border rounded-xl p-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between mb-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm font-bold text-gray-700",
                                                        children: "🏷️ Offer Badge"
                                                    }, void 0, false, {
                                                        fileName: "[project]/admin/components/productForm/ProductForm.jsx",
                                                        lineNumber: 545,
                                                        columnNumber: 15
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                        href: "/admin/home-badges",
                                                        target: "_blank",
                                                        rel: "noopener noreferrer",
                                                        className: "text-xs text-indigo-600 hover:underline",
                                                        children: "নাম/আইকন এডিট করুন →"
                                                    }, void 0, false, {
                                                        fileName: "[project]/admin/components/productForm/ProductForm.jsx",
                                                        lineNumber: 548,
                                                        columnNumber: 15
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/admin/components/productForm/ProductForm.jsx",
                                                lineNumber: 544,
                                                columnNumber: 13
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-wrap gap-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "flex items-center gap-2 cursor-pointer select-none",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "checkbox",
                                                                checked: !!form.freeDelivery,
                                                                onChange: (e)=>setForm((p)=>({
                                                                            ...p,
                                                                            freeDelivery: e.target.checked
                                                                        })),
                                                                className: "w-4 h-4 accent-orange-500"
                                                            }, void 0, false, {
                                                                fileName: "[project]/admin/components/productForm/ProductForm.jsx",
                                                                lineNumber: 559,
                                                                columnNumber: 17
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-sm font-medium text-orange-600",
                                                                children: [
                                                                    "🚚 ",
                                                                    getBadgeLabel("freeDelivery", "Free Delivery")
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/admin/components/productForm/ProductForm.jsx",
                                                                lineNumber: 567,
                                                                columnNumber: 17
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/admin/components/productForm/ProductForm.jsx",
                                                        lineNumber: 558,
                                                        columnNumber: 15
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "flex items-center gap-2 cursor-pointer select-none",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "checkbox",
                                                                checked: !!form.bestDiscount,
                                                                onChange: (e)=>setForm((p)=>({
                                                                            ...p,
                                                                            bestDiscount: e.target.checked
                                                                        })),
                                                                className: "w-4 h-4 accent-blue-500"
                                                            }, void 0, false, {
                                                                fileName: "[project]/admin/components/productForm/ProductForm.jsx",
                                                                lineNumber: 573,
                                                                columnNumber: 17
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-sm font-medium text-blue-600",
                                                                children: [
                                                                    "🛍️ ",
                                                                    getBadgeLabel("bestDiscount", "Best Discount")
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/admin/components/productForm/ProductForm.jsx",
                                                                lineNumber: 581,
                                                                columnNumber: 17
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/admin/components/productForm/ProductForm.jsx",
                                                        lineNumber: 572,
                                                        columnNumber: 15
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "flex items-center gap-2 cursor-pointer select-none",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "checkbox",
                                                                checked: !!form.cartvanBox,
                                                                onChange: (e)=>setForm((p)=>({
                                                                            ...p,
                                                                            cartvanBox: e.target.checked
                                                                        })),
                                                                className: "w-4 h-4 accent-rose-500"
                                                            }, void 0, false, {
                                                                fileName: "[project]/admin/components/productForm/ProductForm.jsx",
                                                                lineNumber: 587,
                                                                columnNumber: 17
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-sm font-medium text-rose-600",
                                                                children: [
                                                                    "🎁 ",
                                                                    getBadgeLabel("cartvanBox", "Gift Box")
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/admin/components/productForm/ProductForm.jsx",
                                                                lineNumber: 595,
                                                                columnNumber: 17
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/admin/components/productForm/ProductForm.jsx",
                                                        lineNumber: 586,
                                                        columnNumber: 15
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/admin/components/productForm/ProductForm.jsx",
                                                lineNumber: 557,
                                                columnNumber: 13
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/admin/components/productForm/ProductForm.jsx",
                                        lineNumber: 543,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$productForm$2f$BasicInfoCategory$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        form: form,
                                        setForm: setForm,
                                        categories: categories,
                                        errors: errors,
                                        setErrors: setErrors
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/productForm/ProductForm.jsx",
                                        lineNumber: 602,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex p-1 bg-gray-100 rounded-xl w-fit border",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: handleDefaultMode,
                                                className: `px-8 py-2.5 rounded-lg font-bold text-sm transition-all ${variantMode === "default" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500"}`,
                                                children: "Default Mode"
                                            }, void 0, false, {
                                                fileName: "[project]/admin/components/productForm/ProductForm.jsx",
                                                lineNumber: 611,
                                                columnNumber: 13
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: handleEnableVariant,
                                                className: `px-8 py-2.5 rounded-lg font-bold text-sm transition-all ${variantMode === "variant" ? "bg-indigo-600 text-white shadow-sm" : "text-gray-500"}`,
                                                children: "Enable Variants"
                                            }, void 0, false, {
                                                fileName: "[project]/admin/components/productForm/ProductForm.jsx",
                                                lineNumber: 623,
                                                columnNumber: 13
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/admin/components/productForm/ProductForm.jsx",
                                        lineNumber: 610,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$productForm$2f$VariantSection$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        variants: Array.isArray(form.variants) ? form.variants : [],
                                        setVariants: (v)=>{
                                            const nextVariants = Array.isArray(v) ? v : [];
                                            setForm((p)=>({
                                                    ...p,
                                                    variants: nextVariants
                                                }));
                                            if (variantMode === "default") setBaseDraft(nextVariants[0] || EMPTY_DEFAULT_VARIANT);
                                            else setVariantDrafts(nextVariants);
                                        },
                                        mode: variantMode,
                                        errors: errors,
                                        setErrors: setErrors,
                                        onFilesReadyChange: setFilesReady
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/productForm/ProductForm.jsx",
                                        lineNumber: 636,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$productForm$2f$ReviewsSection$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        form: form,
                                        averageRating: averageRating,
                                        handleReviewChange: (i, f, v)=>{
                                            const next = Array.isArray(form.reviews) ? [
                                                ...form.reviews
                                            ] : [];
                                            next[i] = {
                                                ...next[i],
                                                [f]: v
                                            };
                                            setForm((p)=>({
                                                    ...p,
                                                    reviews: next
                                                }));
                                        },
                                        addReview: ()=>setForm((p)=>({
                                                    ...p,
                                                    reviews: [
                                                        ...Array.isArray(p.reviews) ? p.reviews : [],
                                                        {
                                                            user: "",
                                                            rating: 5,
                                                            comment: ""
                                                        }
                                                    ]
                                                })),
                                        removeReview: (i)=>setForm((p)=>({
                                                    ...p,
                                                    reviews: (Array.isArray(p.reviews) ? p.reviews : []).filter((_, idx)=>idx !== i)
                                                }))
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/productForm/ProductForm.jsx",
                                        lineNumber: 652,
                                        columnNumber: 11
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/components/productForm/ProductForm.jsx",
                                lineNumber: 530,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/components/productForm/ProductForm.jsx",
                        lineNumber: 518,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/admin/components/productForm/ProductForm.jsx",
                lineNumber: 460,
                columnNumber: 7
            }, this),
            toast && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$Toast$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                ...toast,
                onClose: ()=>setToast(null)
            }, void 0, false, {
                fileName: "[project]/admin/components/productForm/ProductForm.jsx",
                lineNumber: 682,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/admin/components/productForm/ProductForm.jsx",
        lineNumber: 459,
        columnNumber: 5
    }, this);
}
_s(ProductForm, "fyb/vt53gspSVMgSXGZHFhCNjWk=");
_c = ProductForm;
var _c;
__turbopack_context__.k.register(_c, "ProductForm");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/admin/components/ProductCard.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ProductCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
"use client";
;
function ProductCard({ product, onEdit, onDelete }) {
    const cat = product?.category;
    const isHidden = product?.isActive === false;
    // ✅ Total Variants Count (colors)
    const totalVariants = Array.isArray(product?.colors) ? product.colors.length : 0;
    // ✅ Total Sold
    const totalSold = totalVariants > 0 ? product.colors.reduce((sum, v)=>sum + Number(v?.sold || 0), 0) : Number(product?.sold || 0);
    // ✅ Total Stock
    const totalStock = product?.stock !== undefined && product?.stock !== null ? Number(product.stock || 0) : totalVariants > 0 ? product.colors.reduce((sum, v)=>sum + Number(v?.stock || 0), 0) : 0;
    const displayImage = product?.image || "";
    const hasDiscount = !!product?.oldPrice;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `group relative flex flex-col rounded-xl border overflow-hidden transition-all duration-200
        ${isHidden ? "bg-gray-50 border-gray-200 opacity-75" : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-md"}
      `,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative w-full aspect-square bg-gray-50",
                children: [
                    displayImage ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                        src: displayImage,
                        alt: product.name,
                        className: `w-full h-full object-cover transition-transform duration-300
              ${isHidden ? "grayscale-[30%]" : "group-hover:scale-[1.03]"}
            `
                    }, void 0, false, {
                        fileName: "[project]/admin/components/ProductCard.jsx",
                        lineNumber: 42,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-full h-full flex items-center justify-center text-gray-300 text-xs font-medium",
                        children: "No Image"
                    }, void 0, false, {
                        fileName: "[project]/admin/components/ProductCard.jsx",
                        lineNumber: 50,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/55 backdrop-blur-sm text-white text-[9px] font-medium",
                        children: [
                            "#",
                            product.order || 0
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/components/ProductCard.jsx",
                        lineNumber: 56,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: `absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md backdrop-blur-sm text-[9px] font-semibold tracking-wide ${product.isActive ? "bg-green-600/85 text-white" : "bg-gray-900/80 text-white"}`,
                        children: product.isActive ? "Active" : "Hidden"
                    }, void 0, false, {
                        fileName: "[project]/admin/components/ProductCard.jsx",
                        lineNumber: 61,
                        columnNumber: 9
                    }, this),
                    totalVariants > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute bottom-2 left-2 flex items-center gap-1 bg-white/85 backdrop-blur-sm px-1.5 py-1 rounded-full shadow-sm",
                        children: [
                            product.colors.slice(0, 4).map((c, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "w-2.5 h-2.5 rounded-full border border-white ring-1 ring-gray-300",
                                    style: {
                                        backgroundColor: c.name?.toLowerCase()
                                    },
                                    title: c.name
                                }, i, false, {
                                    fileName: "[project]/admin/components/ProductCard.jsx",
                                    lineNumber: 75,
                                    columnNumber: 15
                                }, this)),
                            totalVariants > 4 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[9px] font-bold text-gray-600 pr-0.5",
                                children: [
                                    "+",
                                    totalVariants - 4
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/components/ProductCard.jsx",
                                lineNumber: 83,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/components/ProductCard.jsx",
                        lineNumber: 73,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/admin/components/ProductCard.jsx",
                lineNumber: 40,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-1 p-2 flex-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-start justify-between gap-1.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "font-semibold text-[13px] leading-snug text-gray-900 truncate",
                                title: product.name,
                                children: product.name
                            }, void 0, false, {
                                fileName: "[project]/admin/components/ProductCard.jsx",
                                lineNumber: 95,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-baseline gap-1 shrink-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm font-bold text-gray-900",
                                        children: [
                                            "৳",
                                            product.price
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/admin/components/ProductCard.jsx",
                                        lineNumber: 102,
                                        columnNumber: 13
                                    }, this),
                                    hasDiscount && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[10px] line-through text-gray-400",
                                        children: [
                                            "৳",
                                            product.oldPrice
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/admin/components/ProductCard.jsx",
                                        lineNumber: 106,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/components/ProductCard.jsx",
                                lineNumber: 101,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/components/ProductCard.jsx",
                        lineNumber: 94,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between text-[10px] text-gray-500",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: [
                                    "স্টক: ",
                                    totalStock
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/components/ProductCard.jsx",
                                lineNumber: 115,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: [
                                    "Total Sold: ",
                                    totalSold
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/components/ProductCard.jsx",
                                lineNumber: 116,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/components/ProductCard.jsx",
                        lineNumber: 114,
                        columnNumber: 9
                    }, this),
                    totalVariants > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-50 border border-gray-100 rounded-md p-1",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-wrap gap-1",
                            children: product.colors.map((v, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[9px] px-1 py-0.5 rounded-full border border-gray-200 bg-white text-gray-700",
                                    title: `${v.name} sold`,
                                    children: [
                                        v.name,
                                        ": ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                            children: Number(v?.sold || 0)
                                        }, void 0, false, {
                                            fileName: "[project]/admin/components/ProductCard.jsx",
                                            lineNumber: 129,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, idx, true, {
                                    fileName: "[project]/admin/components/ProductCard.jsx",
                                    lineNumber: 124,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/admin/components/ProductCard.jsx",
                            lineNumber: 122,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/admin/components/ProductCard.jsx",
                        lineNumber: 121,
                        columnNumber: 11
                    }, this),
                    totalVariants > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "self-start px-1.5 py-[1px] rounded-full bg-purple-50 border border-purple-200 text-purple-600 text-[9px] font-medium",
                        children: [
                            totalVariants,
                            " Variants"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/components/ProductCard.jsx",
                        lineNumber: 138,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between text-[10px] text-gray-500",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "truncate",
                                children: cat ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-medium text-gray-700",
                                    children: cat.name
                                }, void 0, false, {
                                    fileName: "[project]/admin/components/ProductCard.jsx",
                                    lineNumber: 147,
                                    columnNumber: 15
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-gray-400",
                                    children: "ক্যাটাগরি নেই"
                                }, void 0, false, {
                                    fileName: "[project]/admin/components/ProductCard.jsx",
                                    lineNumber: 149,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/admin/components/ProductCard.jsx",
                                lineNumber: 145,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "flex items-center gap-0.5 shrink-0 text-gray-600 font-medium",
                                children: [
                                    "⭐ ",
                                    product.rating || 0
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/components/ProductCard.jsx",
                                lineNumber: 152,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/components/ProductCard.jsx",
                        lineNumber: 144,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-1.5 mt-auto pt-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: (e)=>{
                                    e.stopPropagation();
                                    onEdit();
                                },
                                title: "সম্পাদনা",
                                className: "flex-1 flex items-center justify-center gap-1 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white py-1.5 rounded-md text-xs font-semibold transition",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "✏"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/ProductCard.jsx",
                                        lineNumber: 168,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "hidden sm:inline",
                                        children: "সম্পাদনা"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/ProductCard.jsx",
                                        lineNumber: 169,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/components/ProductCard.jsx",
                                lineNumber: 159,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: (e)=>{
                                    e.stopPropagation();
                                    onDelete();
                                },
                                title: "মুছুন",
                                className: "flex-1 flex items-center justify-center gap-1 bg-red-500 hover:bg-red-600 active:scale-[0.98] text-white py-1.5 rounded-md text-xs font-semibold transition",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "🗑"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/ProductCard.jsx",
                                        lineNumber: 181,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "hidden sm:inline",
                                        children: "মুছুন"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/ProductCard.jsx",
                                        lineNumber: 182,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/components/ProductCard.jsx",
                                lineNumber: 172,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/components/ProductCard.jsx",
                        lineNumber: 158,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/admin/components/ProductCard.jsx",
                lineNumber: 92,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/admin/components/ProductCard.jsx",
        lineNumber: 30,
        columnNumber: 5
    }, this);
}
_c = ProductCard;
var _c;
__turbopack_context__.k.register(_c, "ProductCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/admin/components/Skeleton/ProductsSkeleton.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ProductsSkeleton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/styled-jsx/style.js [app-client] (ecmascript)");
"use client";
;
;
function ProductsSkeleton() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "jsx-9ff4464f4502d786" + " " + "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-pulse",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                id: "9ff4464f4502d786",
                children: "@keyframes shimmer{0%{background-position:-450px 0}to{background-position:450px 0}}.shimmer.jsx-9ff4464f4502d786{background:linear-gradient(90deg,#f0f0f0 8%,#fff 18%,#f0f0f0 33%) 0 0/800px 104px;animation:1.3s linear infinite shimmer}"
            }, void 0, false, void 0, this),
            Array.from({
                length: 6
            }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "jsx-9ff4464f4502d786" + " " + "border border-gray-200 bg-white rounded-2xl p-4 shadow-sm space-y-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-9ff4464f4502d786" + " " + "w-full h-40 shimmer rounded-lg"
                        }, void 0, false, {
                            fileName: "[project]/admin/components/Skeleton/ProductsSkeleton.jsx",
                            lineNumber: 32,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-9ff4464f4502d786" + " " + "w-3/4 h-4 shimmer rounded"
                        }, void 0, false, {
                            fileName: "[project]/admin/components/Skeleton/ProductsSkeleton.jsx",
                            lineNumber: 33,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-9ff4464f4502d786" + " " + "w-1/2 h-4 shimmer rounded"
                        }, void 0, false, {
                            fileName: "[project]/admin/components/Skeleton/ProductsSkeleton.jsx",
                            lineNumber: 34,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-9ff4464f4502d786" + " " + "flex justify-between mt-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-9ff4464f4502d786" + " " + "w-16 h-6 shimmer rounded"
                                }, void 0, false, {
                                    fileName: "[project]/admin/components/Skeleton/ProductsSkeleton.jsx",
                                    lineNumber: 36,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-9ff4464f4502d786" + " " + "w-16 h-6 shimmer rounded"
                                }, void 0, false, {
                                    fileName: "[project]/admin/components/Skeleton/ProductsSkeleton.jsx",
                                    lineNumber: 37,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/admin/components/Skeleton/ProductsSkeleton.jsx",
                            lineNumber: 35,
                            columnNumber: 11
                        }, this)
                    ]
                }, i, true, {
                    fileName: "[project]/admin/components/Skeleton/ProductsSkeleton.jsx",
                    lineNumber: 28,
                    columnNumber: 9
                }, this))
        ]
    }, void 0, true, {
        fileName: "[project]/admin/components/Skeleton/ProductsSkeleton.jsx",
        lineNumber: 5,
        columnNumber: 5
    }, this);
}
_c = ProductsSkeleton;
var _c;
__turbopack_context__.k.register(_c, "ProductsSkeleton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/admin/src/app/admin/products/page.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ProductsPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/styled-jsx/style.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$productForm$2f$ProductForm$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/productForm/ProductForm.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$ProductCard$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/ProductCard.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$Toast$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/Toast.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$Skeleton$2f$ProductsSkeleton$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/Skeleton/ProductsSkeleton.jsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
function ProductsPage() {
    _s();
    const [products, setProducts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [filter, setFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("all"); // all / active / hidden
    // ✅ NEW: Products সাব-মেনু — All Product / Free Delivery / Best Discount / Gift Box
    const [badgeFilter, setBadgeFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("all");
    const [homeBadges, setHomeBadges] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [showForm, setShowForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [editProduct, setEditProduct] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [toast, setToast] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [deleteModal, setDeleteModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [deleting, setDeleting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // ================== LOAD PRODUCTS ==================
    const loadProducts = async ()=>{
        try {
            setLoading(true);
            const res = await fetch(`/api/admin/products`);
            const data = await res.json();
            const arr = Array.isArray(data) ? data : [];
            // ✅ SERIAL (order) FIRST (ASC), tie -> newer first
            arr.sort((a, b)=>{
                const ao = Number(a?.order ?? 0);
                const bo = Number(b?.order ?? 0);
                if (ao !== bo) return ao - bo;
                return new Date(b?.createdAt) - new Date(a?.createdAt);
            });
            setProducts(arr);
        } catch (error) {
            console.error(error);
            setToast({
                message: "⚠ Failed to load products",
                type: "error"
            });
        } finally{
            setLoading(false);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProductsPage.useEffect": ()=>{
            loadProducts();
            // ✅ Admin থেকে দেওয়া Offer Badge নাম লোড করা (dynamic tab label)
            fetch(`/api/admin/homeBadges`).then({
                "ProductsPage.useEffect": (res)=>res.json()
            }["ProductsPage.useEffect"]).then({
                "ProductsPage.useEffect": (data)=>setHomeBadges(Array.isArray(data?.badges) ? data.badges : [])
            }["ProductsPage.useEffect"]).catch({
                "ProductsPage.useEffect": ()=>setHomeBadges([])
            }["ProductsPage.useEffect"]);
        }
    }["ProductsPage.useEffect"], []);
    const getBadgeName = (field, fallback)=>{
        const b = homeBadges.find((x)=>x.field === field);
        return b?.name || fallback;
    };
    // ================== FILTERED LIST ==================
    const statusFiltered = filter === "active" ? products.filter((p)=>p.isActive) : filter === "hidden" ? products.filter((p)=>!p.isActive) : products;
    // ✅ NEW: সাব-মেনু অনুযায়ী filter (Free Delivery / Best Discount / Gift Box)
    const filteredProducts = badgeFilter === "freeDelivery" ? statusFiltered.filter((p)=>p.freeDelivery) : badgeFilter === "bestDiscount" ? statusFiltered.filter((p)=>p.bestDiscount) : badgeFilter === "cartvanBox" ? statusFiltered.filter((p)=>p.cartvanBox) : statusFiltered;
    // ✅ সাব-মেনুর প্রতিটি ট্যাবে কতগুলো প্রোডাক্ট আছে তার count
    const badgeCounts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ProductsPage.useMemo[badgeCounts]": ()=>({
                all: products.length,
                freeDelivery: products.filter({
                    "ProductsPage.useMemo[badgeCounts]": (p)=>p.freeDelivery
                }["ProductsPage.useMemo[badgeCounts]"]).length,
                bestDiscount: products.filter({
                    "ProductsPage.useMemo[badgeCounts]": (p)=>p.bestDiscount
                }["ProductsPage.useMemo[badgeCounts]"]).length,
                cartvanBox: products.filter({
                    "ProductsPage.useMemo[badgeCounts]": (p)=>p.cartvanBox
                }["ProductsPage.useMemo[badgeCounts]"]).length
            })
    }["ProductsPage.useMemo[badgeCounts]"], [
        products
    ]);
    // check if ANY product is active → then bulk button = Hide All
    const hasAnyActive = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ProductsPage.useMemo[hasAnyActive]": ()=>products.some({
                "ProductsPage.useMemo[hasAnyActive]": (p)=>p.isActive
            }["ProductsPage.useMemo[hasAnyActive]"])
    }["ProductsPage.useMemo[hasAnyActive]"], [
        products
    ]);
    // ================== DELETE PRODUCT ==================
    const confirmDelete = (product)=>setDeleteModal(product);
    const handleDelete = async ()=>{
        if (!deleteModal) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/admin/products/${deleteModal._id}`, {
                method: "DELETE"
            });
            if (res.ok) {
                setToast({
                    message: "🗑 Product deleted!",
                    type: "success"
                });
                loadProducts();
            } else {
                setToast({
                    message: "❌ Error deleting product",
                    type: "error"
                });
            }
            setDeleteModal(null);
        } catch  {
            setToast({
                message: "🌐 Network error",
                type: "error"
            });
        }
        setDeleting(false);
    };
    // ================== BULK HIDE / SHOW ==================
    const toggleAllProducts = async ()=>{
        try {
            setLoading(true);
            const newStatus = !hasAnyActive;
            await Promise.all(products.map((p)=>fetch(`/api/admin/products/${p._id}`, {
                    method: "PUT",
                    body: (()=>{
                        const d = new FormData();
                        d.append("isActive", newStatus ? "true" : "false");
                        d.append("order", String(p?.order ?? 0)); // keep serial same
                        return d;
                    })()
                })));
            setToast({
                message: newStatus ? "✅ All products activated!" : "👁 All products hidden!",
                type: "success"
            });
            loadProducts();
        } catch (err) {
            console.error(err);
            setToast({
                message: "❌ Bulk update failed",
                type: "error"
            });
            setLoading(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "jsx-f5bdb6b0e42bb7ae" + " " + "p-4 sm:p-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-f5bdb6b0e42bb7ae" + " " + "flex flex-col lg:flex-row lg:items-center gap-3 mb-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "jsx-f5bdb6b0e42bb7ae" + " " + "text-2xl sm:text-3xl font-bold",
                        children: "✨ Product Manager"
                    }, void 0, false, {
                        fileName: "[project]/admin/src/app/admin/products/page.jsx",
                        lineNumber: 173,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-f5bdb6b0e42bb7ae" + " " + "flex flex-col items-end gap-2 lg:flex-row lg:items-center lg:gap-2 lg:ml-auto",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>{
                                    setEditProduct(null); // ✅ IMPORTANT: must be null for Add mode
                                    setShowForm(true);
                                },
                                className: "jsx-f5bdb6b0e42bb7ae" + " " + "order-1 lg:order-last bg-blue-600 text-white shadow font-semibold px-3 py-1.5 rounded-md text-sm hover:bg-blue-700 active:scale-[0.98] lg:px-4 lg:py-2 lg:text-base lg:rounded-lg",
                                children: "+ Add Product"
                            }, void 0, false, {
                                fileName: "[project]/admin/src/app/admin/products/page.jsx",
                                lineNumber: 178,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-f5bdb6b0e42bb7ae" + " " + "order-2 lg:order-first flex flex-wrap justify-end gap-1.5 lg:gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setFilter("all"),
                                        className: "jsx-f5bdb6b0e42bb7ae" + " " + `px-2.5 py-1.5 rounded-md border text-xs leading-none lg:px-4 lg:py-2.5 lg:text-base lg:rounded-lg ${filter === "all" ? "bg-indigo-600 text-white" : "bg-white"}`,
                                        children: "All"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/src/app/admin/products/page.jsx",
                                        lineNumber: 190,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setFilter("active"),
                                        className: "jsx-f5bdb6b0e42bb7ae" + " " + `px-2.5 py-1.5 rounded-md border text-xs leading-none lg:px-4 lg:py-2.5 lg:text-base lg:rounded-lg ${filter === "active" ? "bg-green-600 text-white" : "bg-white"}`,
                                        children: "Active"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/src/app/admin/products/page.jsx",
                                        lineNumber: 199,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setFilter("hidden"),
                                        className: "jsx-f5bdb6b0e42bb7ae" + " " + `px-2.5 py-1.5 rounded-md border text-xs leading-none lg:px-4 lg:py-2.5 lg:text-base lg:rounded-lg ${filter === "hidden" ? "bg-gray-600 text-white" : "bg-white"}`,
                                        children: "Hidden"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/src/app/admin/products/page.jsx",
                                        lineNumber: 208,
                                        columnNumber: 13
                                    }, this),
                                    products.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: toggleAllProducts,
                                        className: "jsx-f5bdb6b0e42bb7ae" + " " + `px-2.5 py-1.5 rounded-md border text-xs leading-none font-semibold text-white lg:px-4 lg:py-2.5 lg:text-base lg:rounded-lg ${hasAnyActive ? "bg-gray-700 hover:bg-gray-800" : "bg-green-600 hover:bg-green-700"}`,
                                        children: hasAnyActive ? "Hide All" : "Show All"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/src/app/admin/products/page.jsx",
                                        lineNumber: 219,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/src/app/admin/products/page.jsx",
                                lineNumber: 189,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/src/app/admin/products/page.jsx",
                        lineNumber: 176,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/admin/src/app/admin/products/page.jsx",
                lineNumber: 172,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-f5bdb6b0e42bb7ae" + " " + "flex flex-wrap gap-2 mb-5 border-b pb-3",
                children: [
                    {
                        key: "all",
                        label: "🗂️ All Product",
                        color: "indigo"
                    },
                    {
                        key: "freeDelivery",
                        label: `🚚 ${getBadgeName("freeDelivery", "Free Delivery")}`,
                        color: "orange"
                    },
                    {
                        key: "bestDiscount",
                        label: `🛍️ ${getBadgeName("bestDiscount", "Best Discount")}`,
                        color: "blue"
                    },
                    {
                        key: "cartvanBox",
                        label: `🎁 ${getBadgeName("cartvanBox", "Gift Box")}`,
                        color: "rose"
                    }
                ].map((tab)=>{
                    const active = badgeFilter === tab.key;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>setBadgeFilter(tab.key),
                        className: "jsx-f5bdb6b0e42bb7ae" + " " + `px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold border transition-all ${active ? "bg-indigo-600 text-white border-indigo-600 shadow" : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"}`,
                        children: [
                            tab.label,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "jsx-f5bdb6b0e42bb7ae" + " " + `ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${active ? "bg-white/20" : "bg-gray-100"}`,
                                children: badgeCounts[tab.key] ?? 0
                            }, void 0, false, {
                                fileName: "[project]/admin/src/app/admin/products/page.jsx",
                                lineNumber: 267,
                                columnNumber: 15
                            }, this)
                        ]
                    }, tab.key, true, {
                        fileName: "[project]/admin/src/app/admin/products/page.jsx",
                        lineNumber: 256,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/admin/src/app/admin/products/page.jsx",
                lineNumber: 235,
                columnNumber: 7
            }, this),
            loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$Skeleton$2f$ProductsSkeleton$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/admin/src/app/admin/products/page.jsx",
                lineNumber: 281,
                columnNumber: 9
            }, this) : filteredProducts.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-f5bdb6b0e42bb7ae" + " " + "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 2xl:grid-cols-6  gap-4",
                children: filteredProducts.map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$ProductCard$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        product: p,
                        onEdit: ()=>{
                            setEditProduct(p);
                            setShowForm(true);
                        },
                        onDelete: ()=>confirmDelete(p)
                    }, p._id, false, {
                        fileName: "[project]/admin/src/app/admin/products/page.jsx",
                        lineNumber: 285,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/admin/src/app/admin/products/page.jsx",
                lineNumber: 283,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-f5bdb6b0e42bb7ae" + " " + "text-center text-gray-500 py-10",
                children: "No products found."
            }, void 0, false, {
                fileName: "[project]/admin/src/app/admin/products/page.jsx",
                lineNumber: 297,
                columnNumber: 9
            }, this),
            showForm && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-f5bdb6b0e42bb7ae" + " " + "fixed inset-0 bg-white/50 backdrop-blur-sm z-40"
                    }, void 0, false, {
                        fileName: "[project]/admin/src/app/admin/products/page.jsx",
                        lineNumber: 305,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-f5bdb6b0e42bb7ae" + " " + "fixed inset-0 z-50 flex justify-center items-center p-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-f5bdb6b0e42bb7ae" + " " + "bg-white rounded-2xl shadow-lg w-full max-w-4xl p-6 overflow-y-auto max-h-[90vh] relative animate-[zoomIn_.2s_ease-out]",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$productForm$2f$ProductForm$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                product: editProduct,
                                productsLength: products.length,
                                onClose: ()=>{
                                    setShowForm(false);
                                    setEditProduct(null); // ✅ reset
                                },
                                onSaved: ()=>{
                                    setShowForm(false);
                                    setEditProduct(null); // ✅ reset
                                    loadProducts();
                                    setToast({
                                        message: editProduct?._id ? "✅ Product updated!" : "✅ Product added!",
                                        type: "success"
                                    });
                                }
                            }, void 0, false, {
                                fileName: "[project]/admin/src/app/admin/products/page.jsx",
                                lineNumber: 309,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/admin/src/app/admin/products/page.jsx",
                            lineNumber: 308,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/admin/src/app/admin/products/page.jsx",
                        lineNumber: 307,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true),
            deleteModal && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-f5bdb6b0e42bb7ae" + " " + "fixed inset-0 bg-white/50 backdrop-blur-sm z-40"
                    }, void 0, false, {
                        fileName: "[project]/admin/src/app/admin/products/page.jsx",
                        lineNumber: 336,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-f5bdb6b0e42bb7ae" + " " + "fixed inset-0 z-50 flex items-center justify-center p-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-f5bdb6b0e42bb7ae" + " " + "bg-white rounded-xl p-6 w-full max-w-sm shadow-xl border animate-[zoomIn_.2s_ease-out]",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "jsx-f5bdb6b0e42bb7ae" + " " + "text-xl font-bold text-red-600 mb-3",
                                    children: "⚠ Delete Product"
                                }, void 0, false, {
                                    fileName: "[project]/admin/src/app/admin/products/page.jsx",
                                    lineNumber: 340,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "jsx-f5bdb6b0e42bb7ae" + " " + "text-gray-700 mb-6",
                                    children: [
                                        "Are you sure you want to delete",
                                        " ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "jsx-f5bdb6b0e42bb7ae" + " " + "font-semibold",
                                            children: deleteModal.name
                                        }, void 0, false, {
                                            fileName: "[project]/admin/src/app/admin/products/page.jsx",
                                            lineNumber: 346,
                                            columnNumber: 17
                                        }, this),
                                        "?"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/admin/src/app/admin/products/page.jsx",
                                    lineNumber: 344,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-f5bdb6b0e42bb7ae" + " " + "flex justify-end gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setDeleteModal(null),
                                            className: "jsx-f5bdb6b0e42bb7ae" + " " + "px-4 py-2 border rounded",
                                            children: "Cancel"
                                        }, void 0, false, {
                                            fileName: "[project]/admin/src/app/admin/products/page.jsx",
                                            lineNumber: 350,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: handleDelete,
                                            className: "jsx-f5bdb6b0e42bb7ae" + " " + "px-4 py-2 bg-red-600 text-white rounded shadow",
                                            children: deleting ? "Deleting..." : "Delete"
                                        }, void 0, false, {
                                            fileName: "[project]/admin/src/app/admin/products/page.jsx",
                                            lineNumber: 357,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/admin/src/app/admin/products/page.jsx",
                                    lineNumber: 349,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/admin/src/app/admin/products/page.jsx",
                            lineNumber: 339,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/admin/src/app/admin/products/page.jsx",
                        lineNumber: 338,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true),
            toast && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$Toast$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                message: toast.message,
                type: toast.type,
                onClose: ()=>setToast(null)
            }, void 0, false, {
                fileName: "[project]/admin/src/app/admin/products/page.jsx",
                lineNumber: 371,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                id: "f5bdb6b0e42bb7ae",
                children: "@keyframes zoomIn{0%{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}"
            }, void 0, false, void 0, this)
        ]
    }, void 0, true, {
        fileName: "[project]/admin/src/app/admin/products/page.jsx",
        lineNumber: 170,
        columnNumber: 5
    }, this);
}
_s(ProductsPage, "PdJt8RvhmdA0GwVpT/4EfAjo/0o=");
_c = ProductsPage;
var _c;
__turbopack_context__.k.register(_c, "ProductsPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=admin_398a7363._.js.map