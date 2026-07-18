module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/admin/src/app/api/[...path]/route.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DELETE",
    ()=>DELETE,
    "GET",
    ()=>GET,
    "HEAD",
    ()=>HEAD,
    "OPTIONS",
    ()=>OPTIONS,
    "PATCH",
    ()=>PATCH,
    "POST",
    ()=>POST,
    "PUT",
    ()=>PUT,
    "dynamic",
    ()=>dynamic,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/server.js [app-route] (ecmascript)");
;
const BACKEND_API_URL = process.env.BACKEND_API_URL;
function getMissingBackendUrlResponse() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        success: false,
        message: "Backend API URL is missing. Please set BACKEND_API_URL."
    }, {
        status: 500
    });
}
function buildBackendUrl(pathSegments = [], search = "") {
    const base = BACKEND_API_URL.replace(/\/$/, "");
    const path = pathSegments.map(encodeURIComponent).join("/");
    return `${base}/${path}${search || ""}`;
}
function copyRequestHeaders(req) {
    const headers = new Headers(req.headers);
    headers.delete("host");
    headers.delete("connection");
    headers.delete("content-length");
    headers.delete("accept-encoding");
    headers.delete("origin");
    headers.delete("referer");
    if (!headers.get("accept")) {
        headers.set("accept", "application/json");
    }
    return headers;
}
function rewriteLocationHeader(location, req) {
    if (!location) return location;
    const backendBase = BACKEND_API_URL.replace(/\/$/, "");
    const origin = new URL(req.url).origin;
    return location.startsWith(backendBase) ? location.replace(backendBase, `${origin}/api`) : location;
}
async function proxy(req, context) {
    if (!BACKEND_API_URL) {
        return getMissingBackendUrlResponse();
    }
    const params = await context.params;
    const pathSegments = Array.isArray(params?.path) ? params.path : [];
    const path = pathSegments.join("/");
    const targetUrl = buildBackendUrl(pathSegments, new URL(req.url).search);
    const method = req.method.toUpperCase();
    try {
        const headers = copyRequestHeaders(req);
        if (path === "admin/login" || path === "admin/super-login") {
            headers.delete("cookie");
        }
        const init = {
            method,
            headers,
            redirect: "manual",
            cache: "no-store",
            signal: AbortSignal.timeout(30000)
        };
        if (![
            "GET",
            "HEAD"
        ].includes(method)) {
            init.body = await req.arrayBuffer();
        }
        const backendRes = await fetch(targetUrl, init);
        const responseHeaders = new Headers(backendRes.headers);
        responseHeaders.delete("content-encoding");
        responseHeaders.delete("content-length");
        responseHeaders.delete("transfer-encoding");
        const rewrittenLocation = rewriteLocationHeader(responseHeaders.get("location"), req);
        if (rewrittenLocation) {
            responseHeaders.set("location", rewrittenLocation);
        }
        const responseBody = await backendRes.arrayBuffer();
        return new __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](responseBody, {
            status: backendRes.status,
            statusText: backendRes.statusText,
            headers: responseHeaders
        });
    } catch (error) {
        console.error("API proxy error:", {
            targetUrl,
            error
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            message: "Failed to connect to backend API.",
            error: error instanceof Error ? error.message : "Unknown error"
        }, {
            status: 502
        });
    }
}
const dynamic = "force-dynamic";
const runtime = "nodejs";
const GET = proxy;
const POST = proxy;
const PUT = proxy;
const PATCH = proxy;
const DELETE = proxy;
const OPTIONS = proxy;
const HEAD = proxy;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1c896943._.js.map