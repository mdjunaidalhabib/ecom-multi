import { NextResponse } from "next/server";

const BACKEND_API_URL = process.env.BACKEND_API_URL;

function getMissingBackendUrlResponse() {
  return NextResponse.json(
    {
      success: false,
      message: "Backend API URL is missing. Please set BACKEND_API_URL.",
    },
    { status: 500 },
  );
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

// ✅ localhost-এ admin panel আর super-admin panel একই domain শেয়ার করে বলে
// ব্রাউজার দুটো portal-এরই cookie (admin_token, super_admin_token) একসাথে
// পাঠায়। backend/src/middlewares/adminAuthMiddleware.js এর protect
// `admin_token`-কে অগ্রাধিকার দেয়, তাই সেটা না সরালে shop admin আর
// super-admin একই ব্রাউজারে লগইন থাকলে এই app-এর /admin/me কল ভুল করে
// shop admin-এর session রিটার্ন করবে।
function stripForeignAdminCookie(headers) {
  const cookieHeader = headers.get("cookie");
  if (!cookieHeader) return;

  const kept = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part && !part.startsWith("admin_token="));

  if (kept.length) {
    headers.set("cookie", kept.join("; "));
  } else {
    headers.delete("cookie");
  }
}

function rewriteLocationHeader(location, req) {
  if (!location) return location;

  const backendBase = BACKEND_API_URL.replace(/\/$/, "");
  const origin = new URL(req.url).origin;

  return location.startsWith(backendBase)
    ? location.replace(backendBase, `${origin}/api`)
    : location;
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

    if (path === "admin/super-login") {
      headers.delete("cookie");
    } else {
      stripForeignAdminCookie(headers);
    }

    const init = {
      method,
      headers,
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(30000),
    };

    if (!["GET", "HEAD"].includes(method)) {
      init.body = await req.arrayBuffer();
    }

    const backendRes = await fetch(targetUrl, init);
    const responseHeaders = new Headers(backendRes.headers);

    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");
    responseHeaders.delete("transfer-encoding");

    const rewrittenLocation = rewriteLocationHeader(
      responseHeaders.get("location"),
      req,
    );

    if (rewrittenLocation) {
      responseHeaders.set("location", rewrittenLocation);
    }

    const responseBody = await backendRes.arrayBuffer();

    return new NextResponse(responseBody, {
      status: backendRes.status,
      statusText: backendRes.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("API proxy error:", {
      targetUrl,
      error,
    });

    return NextResponse.json(
      {
        success: false,
        message: "Failed to connect to backend API.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 502 },
    );
  }
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
export const HEAD = proxy;
