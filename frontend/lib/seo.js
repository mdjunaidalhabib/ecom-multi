import { headers } from "next/headers";
import { shopBasePath } from "./shopMode";

// Shared SEO helpers for the storefront (metadata, JSON-LD, sitemap, robots).
// Every shop is served from its own host (custom domain) or from
// "/shop/<slug>" on the platform host, so anything that needs an absolute URL
// must be derived from the *incoming request*, never a hardcoded domain.

// Public origin of the current request, e.g. "https://myshop.com". Mirrors
// frontend/src/middleware.js: Coolify/Traefik forwards the real public host in
// x-forwarded-host. Returns null if the host can't be determined.
export async function getSiteOrigin() {
  const h = await headers();
  const host = (h.get("x-forwarded-host") || h.get("host") || "")
    .split(",")[0]
    .trim();
  if (!host) return null;

  const proto =
    (h.get("x-forwarded-proto") || "").split(",")[0].trim() ||
    (process.env.NODE_ENV === "production" ? "https" : "http");

  return `${proto}://${host}`;
}

// Site-relative path for a shop page ("" base in domain-mode, "/shop/<slug>"
// in path-mode). Used as the canonical path — Next resolves it against
// metadataBase, which shop/[shopSlug]/layout.js sets.
export function pagePath(shopSlug, path = "") {
  return `${shopBasePath(shopSlug)}${path}` || "/";
}

export function absoluteUrl(origin, url) {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  if (!origin) return undefined;
  return `${origin}${url.startsWith("/") ? "" : "/"}${url}`;
}

// Product/category descriptions may contain rich-text HTML — search engines
// want a clean plain-text snippet.
export function toPlainText(html) {
  return String(html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function toSeoDescription(html, max = 160) {
  const text = toPlainText(html);
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

// Brand shown in titles/snippets: the shop's own name (Navbar brand set by the
// admin) — see backend controllers/shop/public.shop.controller.js.
export function shopBrand(shop) {
  return shop?.branding?.title || shop?.name || "";
}

export function defaultShopDescription(brand) {
  return `${brand} — অনলাইনে মানসম্পন্ন প্রোডাক্ট কিনুন। ক্যাশ অন ডেলিভারি ও সারা বাংলাদেশে হোম ডেলিভারি।`;
}

export function buildOrganizationJsonLd({ origin, base, shop }) {
  const brand = shopBrand(shop);
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: brand,
      url: `${origin}${base || "/"}`,
      ...(shop?.branding?.logo
        ? { logo: absoluteUrl(origin, shop.branding.logo) }
        : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: brand,
      url: `${origin}${base || "/"}`,
    },
  ];
}

export function buildBreadcrumbJsonLd(origin, items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${origin}${item.path}`,
    })),
  };
}

// Average of the actual customer reviews (the product's stored `rating` field
// defaults to 0 and isn't reliable). Google requires a real review count, so
// return null when there are none instead of emitting an empty rating.
function reviewSummary(product) {
  const rated = (product.reviews || []).filter((r) => Number(r?.rating) > 0);
  if (rated.length === 0) return null;
  const sum = rated.reduce((s, r) => s + Number(r.rating), 0);
  return {
    ratingValue: Math.round((sum / rated.length) * 10) / 10,
    reviewCount: rated.length,
  };
}

export function buildProductJsonLd({ origin, base, product, brand, description }) {
  const inStock =
    !product.isSoldOut &&
    (Number(product.stock) > 0 ||
      (product.colors || []).some((c) => Number(c?.stock) > 0));

  const images = [
    ...new Set(
      [product.image, ...(product.images || [])].filter(
        // "/no-image.png" হলো UI placeholder, Google-কে দেওয়ার মতো ছবি নয়
        (src) => src && src !== "/no-image.png",
      ),
    ),
  ]
    .slice(0, 6)
    .map((src) => absoluteUrl(origin, src))
    .filter(Boolean);

  const summary = reviewSummary(product);
  const url = `${origin}${base}/products/${product._id}`;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    ...(description ? { description } : {}),
    ...(images.length ? { image: images } : {}),
    sku: String(product._id),
    brand: { "@type": "Brand", name: brand },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "BDT",
      price: Number(product.price) || 0,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    ...(summary
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: summary.ratingValue,
            reviewCount: summary.reviewCount,
          },
        }
      : {}),
  };
}

export function buildCategoryJsonLd({ origin, base, category, products }) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    url: `${origin}${base}/categories/${category._id}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.slice(0, 30).map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${origin}${base}/products/${p._id}`,
        name: p.name,
      })),
    },
  };
}
