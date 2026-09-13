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

  // 🔥 FIX: bare "/privacy-policy" / "/terms-of-service" শুধু প্ল্যাটফর্মের
  // নিজের ডোমেইনে (PLATFORM_DOMAIN) ECMS-এর static content দেখাবে। আগে এই
  // চেকটা hostname না দেখেই "legalPathMatch হলেই rewrite স্কিপ" করত (নিচের
  // মন্তব্যে "on ANY domain" লেখা ছিল) — ফলে প্রতিটা শপের নিজের কাস্টম
  // ডোমেইনে (যেমন https://<shop-domain>/privacy-policy) গেলেও Next.js শুধু
  // pathname মিলিয়ে সরাসরি frontend/src/app/privacy-policy/page.js (ECMS-এর
  // নিজস্ব static page) রেন্ডার করে ফেলত — শপের নিজের
  // /shop/[shopSlug]/privacy-policy/page.jsx (যেটা backend থেকে সেই শপের
  // admin-সেট প্রাইভেসি পলিসি fetch করে) পর্যন্ত পৌঁছাতই পারত না, কারণ কোনো
  // rewrite হতোই না। এখন শুধু আসল প্ল্যাটফর্ম ডোমেইনেই bypass করা হয়; বাকি
  // সব ডোমেইন (শপের কাস্টম ডোমেইন) নিচের সাধারণ rewrite লজিকেই পড়ে, তাই
  // "/shop/__domain__/privacy-policy" এ গিয়ে শপের নিজের পেজটাই রেন্ডার হয় —
  // path-based (/shop/<slug>/privacy-policy) এমনিতেই এই ব্লকে পড়ে না, কারণ
  // সেই path "/shop/" prefix দিয়ে শুরু, যেটা নিচের regex বাদ রাখে।
  const legalPathMatch = pathname.match(/^\/(privacy-policy|terms-of-service)\/?$/);
  const isPlatformDomain = hostname === process.env.PLATFORM_DOMAIN;

  if (legalPathMatch && isPlatformDomain) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // ✅ পুরনো "?view=privacy-policy"/"?view=terms-of-service" query form —
  // এটা ইচ্ছাকৃতভাবেই সব ডোমেইনে (শপের কাস্টম ডোমেইন/path-based সহ) কাজ করে,
  // কারণ আগে শেয়ার করা লিংকগুলো সবসময় ECMS-এর নিজের content দেখানোর কথা।
  // বেয়ার path-এর মতো hostname-বাছাই এখানে প্রযোজ্য নয় — এটা শুধু সরাসরি এই
  // নির্দিষ্ট query param ব্যবহার করলেই ট্রিগার হয়, নতুন কোনো ব্যবহারকারী
  // এমনি এমনি hit করবে না।
  const legalView = req.nextUrl.searchParams.get("view");
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
