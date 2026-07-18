module.exports = [
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/lib/incremental-cache/tags-manifest.external.js [external] (next/dist/server/lib/incremental-cache/tags-manifest.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/lib/incremental-cache/tags-manifest.external.js", () => require("next/dist/server/lib/incremental-cache/tags-manifest.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/admin/src/proxy.js [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "proxy",
    ()=>proxy
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/server.js [middleware] (ecmascript)");
;
function decodeJwtPayload(token) {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;
        const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
        return JSON.parse(atob(padded));
    } catch  {
        return null;
    }
}
function getSession(token) {
    if (!token) return null;
    const payload = decodeJwtPayload(token);
    if (!payload?.exp || !payload?.role) return null;
    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now ? payload : null;
}
function redirectWithClearedCookie(url) {
    const response = __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].redirect(url);
    response.cookies.set("admin_token", "", {
        path: "/",
        expires: new Date(0),
        sameSite: "lax"
    });
    return response;
}
function superAdminLegacyTarget(pathname) {
    if (pathname === "/admin/shops") return "/super-admin/shops";
    if (pathname === "/admin/profile") return "/super-admin/profile";
    return "/super-admin/dashboard";
}
function proxy(req) {
    const token = req.cookies.get("admin_token")?.value || "";
    const session = getSession(token);
    const { pathname, origin } = req.nextUrl;
    const isAdminLogin = pathname === "/login";
    const isSuperAdminLogin = pathname === "/super-admin/login";
    // Logged-in users should not remain on either login page.
    if (isAdminLogin || isSuperAdminLogin) {
        if (!session) return __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].next();
        const home = session.role === "superadmin" ? "/super-admin/dashboard" : "/admin/dashboard";
        return __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].redirect(`${origin}${home}`);
    }
    // Dedicated super admin portal.
    if (pathname.startsWith("/super-admin")) {
        if (!session) {
            return redirectWithClearedCookie(`${origin}/super-admin/login`);
        }
        if (session.role !== "superadmin") {
            return __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].redirect(`${origin}/admin/dashboard`);
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].next();
    }
    // Shop admin/staff portal. Super admins are moved to their own namespace.
    if (pathname.startsWith("/admin")) {
        if (!session) {
            return redirectWithClearedCookie(`${origin}/login`);
        }
        if (session.role === "superadmin") {
            return __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].redirect(`${origin}${superAdminLegacyTarget(pathname)}`);
        }
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].next();
}
const config = {
    matcher: [
        "/admin/:path*",
        "/super-admin/:path*",
        "/login"
    ]
};
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__875ed885._.js.map