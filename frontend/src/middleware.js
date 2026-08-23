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

  const pathSlugMatch = pathname.match(/^\/shop\/([^/]+)/);

  if (pathSlugMatch && pathSlugMatch[1] !== DOMAIN_MODE_MARKER) {
    // Path-based access (/shop/<slug>/...) — forward the slug so the
    // backend resolves the shop by slug instead of by domain.
    requestHeaders.set("x-shop-slug", pathSlugMatch[1]);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // API routes, the OAuth callback, and static files served from /public
  // (manifest.json, sw.js, robots.txt, images, ...) are never part of the
  // shop page tree — leave their URL alone. They still carry
  // x-shop-domain, which the /api proxy forwards to the backend.
  const isNonPageRequest =
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth") ||
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
