import { NextResponse } from "next/server";
import { DOMAIN_MODE_MARKER } from "../lib/shopMode";

function getPublicHostname(req) {
  // Coolify/Traefik forwards the original public host in x-forwarded-host.
  // Use only the first value and strip any port defensively.
  const forwardedHost = req.headers.get("x-forwarded-host");
  const rawHost = forwardedHost?.split(",")[0]?.trim() || req.headers.get("host") || "";

  return rawHost.split(":")[0].toLowerCase();
}

export function middleware(req) {
  const hostname = getPublicHostname(req);

  // "www.<any shop domain>" → "<shop domain>", generic across every
  // tenant's custom domain (not just the platform's own) — each shop is
  // expected to point both the apex and "www" A record at this server.
  if (hostname.startsWith("www.")) {
    const url = req.nextUrl.clone();

    // Set each URL part explicitly so an internal port such as :3007
    // cannot leak into the external redirect Location header.
    url.protocol = "https:";
    url.hostname = hostname.slice(4);
    url.port = "";

    return NextResponse.redirect(url, 308);
  }

  const { pathname } = req.nextUrl;

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-shop-domain", hostname);

  // Fallback platform legal pages, shown in place of PlatformLanding on any
  // *other* domain (a shop's own domain, or one bound to no shop at all) that
  // hits a bare "/privacy-policy" or "/terms-of-service" — see
  // frontend/src/app/shop/[shopSlug]/layout.js. On PLATFORM_DOMAIN itself
  // these paths are real routes (frontend/src/app/privacy-policy/page.js,
  // .../terms-of-service/page.js) and never reach that fallback — see the
  // PLATFORM_DOMAIN check below. Forwarded as a header since the layout only
  // sees params.shopSlug, not the rest of the request. These bare top-level
  // paths never collide with a real shop's own /shop/<slug>/privacy-policy
  // page because that path always carries the "/shop/" prefix, which this
  // regex deliberately excludes. The old "?view=" query form is kept working
  // too, for any links already shared.
  const legalPathMatch = pathname.match(/^\/(privacy-policy|terms-of-service)\/?$/);
  const legalView = legalPathMatch?.[1] || req.nextUrl.searchParams.get("view");
  if (legalView === "privacy-policy" || legalView === "terms-of-service") {
    requestHeaders.set("x-legal-view", legalView);
  }

  const pathSlugMatch = pathname.match(/^\/shop\/([^/]+)/);

  if (pathSlugMatch && pathSlugMatch[1] !== DOMAIN_MODE_MARKER) {
    // Path-based access (/shop/<slug>/...) — forward the slug so the
    // backend resolves the shop by slug instead of by domain.
    requestHeaders.set("x-shop-slug", pathSlugMatch[1]);
    // Also forward the full original path+query so the shop layout
    // (frontend/src/app/shop/[shopSlug]/layout.js) can 301 this slug URL to
    // the shop's verified custom domain, if it has one, at the equivalent
    // path — it only gets `params.shopSlug` from Next.js, not the rest of
    // the nested route.
    requestHeaders.set("x-original-path", pathname + req.nextUrl.search);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // API routes, the OAuth callback, and static files served from /public
  // (manifest.json, sw.js, robots.txt, images, ...) are never part of the
  // shop page tree — leave their URL alone. They still carry
  // x-shop-domain, which the /api proxy forwards to the backend.
  const isNonPageRequest =
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth") ||
    // ✅ headless Chromium (backend/src/services/invoiceExportService.js)
    // সরাসরি এই path-এ নেভিগেট করে PDF জেনারেট করে — শপ-ডোমেইন রিরাইটে
    // পড়লে navbar/footer chrome-সহ ShopLayout-এ ঢুকে যেত (data-print-size/
    // no-chrome দুটোই ভেঙে যেত), তাই /api, /auth এর মতো এটাও বাদ রাখা হলো।
    pathname.startsWith("/print") ||
    /\.[^/]+$/.test(pathname);

  if (isNonPageRequest) {
    // Client-side calls to /api/... never carry the page's own
    // "/shop/<slug>" prefix in their own URL (apiFetch always hits the
    // literal "/api/..." path) — recover it from the browser's Referer
    // (the page the fetch was made from) so these calls still resolve to
    // the right shop instead of silently falling back to x-shop-domain
    // (the platform's own host, which matches no real shop).
    if (pathname.startsWith("/api")) {
      const referer = req.headers.get("referer");
      if (referer) {
        try {
          const refererSlugMatch = new URL(referer).pathname.match(
            /^\/shop\/([^/]+)/,
          );
          if (refererSlugMatch && refererSlugMatch[1] !== DOMAIN_MODE_MARKER) {
            requestHeaders.set("x-shop-slug", refererSlugMatch[1]);
          }
        } catch {
          // Malformed/absent referer — fall back to x-shop-domain below.
        }
      }
    }

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (pathSlugMatch) {
    // Someone hit the reserved marker path directly — collapse it back to
    // plain domain-based routing rather than exposing it as a real route.
    const url = req.nextUrl.clone();
    url.pathname = pathname.slice(`/shop/${DOMAIN_MODE_MARKER}`.length) || "/";
    return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  }

  // Platform's own domain (PLATFORM_DOMAIN) never has a shop bound to it —
  // its marketing pages (landing, privacy policy, terms of service) now live
  // as real routes (frontend/src/app/page.js, .../privacy-policy/page.js,
  // .../terms-of-service/page.js) instead of going through the
  // /shop/[shopSlug] tree's "no shop found" fallback. Leave the URL alone so
  // Next's own file-based router resolves it directly.
  if (hostname === process.env.PLATFORM_DOMAIN) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Plain custom-domain access — internally route through the same
  // `/shop/[shopSlug]/...` tree, but keep the URL bar clean.
  const url = req.nextUrl.clone();
  url.pathname = `/shop/${DOMAIN_MODE_MARKER}${pathname}`;
  return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    // Run on all pages except Next.js static/image assets and the favicon.
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
