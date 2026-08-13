// Shared between frontend/src/middleware.js (rewrite target), the
// server-side page tree (frontend/src/app/shop/[shopSlug]/**), and the
// client-side frontend/hooks/useShopPath.js hook — keeping one definition
// avoids the three drifting apart.
//
// Reserved shopSlug value the middleware rewrites plain custom-domain
// traffic to, so it flows through the same `/shop/[shopSlug]/...` route
// tree that real path-based traffic (`/shop/<slug>/...`) uses, without the
// visitor ever seeing "/shop/..." in their URL bar. No real shop can ever
// have this slug — generateUniqueSlug (backend/controllers/shop/admin.shop.controller.js)
// only ever emits [a-z0-9-]+.
export const DOMAIN_MODE_MARKER = "__domain__";

// The prefix to prepend to internal hrefs for the given shopSlug route
// param — "" when in domain-mode (custom-domain visitors keep clean URLs).
export function shopBasePath(shopSlug) {
  return shopSlug && shopSlug !== DOMAIN_MODE_MARKER ? `/shop/${shopSlug}` : "";
}

// Builds an href relative to the current shop base. External links,
// anchors, and mailto/tel links are left untouched.
export function shopHref(base, path) {
  if (!path) return base || "/";
  if (/^([a-z][a-z0-9+.-]*:)?\/\//i.test(path) || /^(#|mailto:|tel:)/i.test(path)) {
    return path;
  }
  if (path === "/") return base || "/";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
