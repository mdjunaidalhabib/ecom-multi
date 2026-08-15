import { headers } from "next/headers";

// Server Component data fetching — calls the backend directly (no /api proxy
// hop, since this already runs on the Next.js server) and uses Next's fetch
// cache so repeat visits within the window are served without hitting the
// backend at all. `revalidate` should stay close to the backend's own
// micro-cache TTL (see backend/src/middlewares/cacheResponse.js).
const BACKEND_API_URL = process.env.BACKEND_API_URL;

export async function serverFetch(path, { revalidate = 30, ...options } = {}) {
  if (!BACKEND_API_URL) {
    throw new Error("BACKEND_API_URL is not set");
  }

  // frontend/src/middleware.js already resolved this request to a shop and
  // stamped x-shop-slug (path-based /shop/<slug>) or x-shop-domain (custom
  // domain) on it — forward whichever is present so the backend scopes this
  // fetch to the right shop instead of resolving with no signal at all.
  const incomingHeaders = await headers();
  const shopHeaders = {};
  const shopSlug = incomingHeaders.get("x-shop-slug");
  const shopDomain = incomingHeaders.get("x-shop-domain");
  if (shopSlug) shopHeaders["x-shop-slug"] = shopSlug;
  if (shopDomain) shopHeaders["x-shop-domain"] = shopDomain;

  // Next's fetch cache keys on the request URL (+ a few options) but not on
  // arbitrary headers — without this, two different shops requesting the
  // same backend path (e.g. every shop's homepage calling "/products")
  // would collide on one cached response. Folding the shop identity into
  // the URL itself (a query param the backend safely ignores) forces a
  // distinct cache entry per shop.
  const shopCacheKey = shopSlug || shopDomain || "";
  const base = BACKEND_API_URL.replace(/\/$/, "");
  const separator = path.includes("?") ? "&" : "?";
  const url = shopCacheKey
    ? `${base}${path}${separator}__shop=${encodeURIComponent(shopCacheKey)}`
    : `${base}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: { ...shopHeaders, ...(options.headers || {}) },
    next: { revalidate },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} → ${path}`);
  }

  return res.json();
}

// Shop identity + which storefront theme to render (see backend
// controllers/shop/public.shop.controller.js). Called from both
// shop/[shopSlug]/layout.js and page.js — Next's per-request fetch cache
// dedupes the two calls into one actual backend hit.
export async function getShopInfo() {
  return serverFetch("/shop-info");
}

// Single-product ad landing page — publicly readable only when isPublished
// (backend/controllers/landingPage/public.landingPage.controller.js 404s
// otherwise). Called from shop/[shopSlug]/lp/[landingSlug]/page.jsx.
export async function getLandingPageBySlug(slug) {
  return serverFetch(`/landing-pages/by-slug/${encodeURIComponent(slug)}`);
}
