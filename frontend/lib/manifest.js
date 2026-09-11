import { DOMAIN_MODE_MARKER, shopBasePath } from "./shopMode";

/**
 * ✅ Per-shop PWA manifest builder
 *
 * আগে সব শপ একটাই স্ট্যাটিক frontend/public/manifest.json শেয়ার করতো, তাই
 * মোবাইলে "Add to Home Screen"/install করলে যেকোনো শপের ক্ষেত্রেই প্ল্যাটফর্মের
 * হার্ডকোডেড নাম ও আইকন ("Hikmah IT") দেখাতো। এখন manifest দুটো route handler
 * থেকে ডায়নামিকভাবে সার্ভ হয় —
 *   • src/app/manifest.json/route.js                   → custom-domain ভিজিটর
 *   • src/app/shop/[shopSlug]/manifest.json/route.js   → path-based (/shop/<slug>)
 * দুটোই এই ফাইলের builder ব্যবহার করে, যাতে দুই মোডে আলাদা আচরণ না হয়।
 */

// প্ল্যাটফর্মের নিজের (কোনো শপের সাথে যুক্ত নয় এমন ডোমেইন) ডিফল্ট।
const PLATFORM_NAME = "ECMS — Hikmah IT";
const PLATFORM_DESCRIPTION =
  "ECMS হলো Hikmah IT এর একটি ই-কমার্স সার্ভিস — সহজেই নিজের অনলাইন শপ তৈরি করে প্রোডাক্ট, অর্ডার ও পেমেন্ট নিয়ন্ত্রণ করুন।";
const PLATFORM_THEME_COLOR = "#f472b6";

// শপ এখনো logo আপলোড করেনি (বা পুরনো শপ, যার জন্য
// backend/migrations/backfillBrandPwaIcons.js এখনো চালানো হয়নি) — তখন
// অন্তত install করার যোগ্য একটা আইকন সেট থাকা দরকার, নাহলে Chrome
// install prompt-ই দেখাবে না।
const FALLBACK_ICONS = [
  { src: "/logo-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
  { src: "/logo-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
];

/**
 * হোম স্ক্রিনে আইকনের নিচে অল্প জায়গা থাকে, তাই short_name ছোট রাখা হয় —
 * মাঝপথে শব্দ কেটে ("Sabera Fashi") বিশ্রী দেখানোর বদলে শব্দের সীমানায় কাটা হয়।
 */
const SHORT_NAME_MAX = 12;

export function toShortName(name) {
  const clean = (name || "").trim().replace(/\s+/g, " ");
  if (clean.length <= SHORT_NAME_MAX) return clean;

  const cut = clean.slice(0, SHORT_NAME_MAX + 1);
  const lastSpace = cut.lastIndexOf(" ");

  // প্রথম শব্দটাই যদি সীমার চেয়ে বড় হয়, তখন হার্ড কাট ছাড়া উপায় নেই।
  return lastSpace > 0 ? clean.slice(0, lastSpace) : clean.slice(0, SHORT_NAME_MAX);
}

function buildIcons(branding) {
  const { pwaIcon192, pwaIcon512, favicon } = branding || {};

  // ✅ দুটো সাইজই থাকলে তবেই শপের নিজস্ব আইকন ব্যবহার — একটা থাকলে
  // অন্যটার জায়গায় প্ল্যাটফর্মের আইকন মিশে গিয়ে install prompt-এ ভুল
  // ব্র্যান্ডিং দেখাতে পারতো।
  if (!pwaIcon192 || !pwaIcon512) return FALLBACK_ICONS;

  return [
    // 64×64 favicon — install prompt এর জন্য যথেষ্ট নয়, কিন্তু ব্রাউজারের
    // ছোট surface গুলোতে (tab strip, shortcut list) এটাই সবচেয়ে sharp।
    ...(favicon ? [{ src: favicon, sizes: "64x64", type: "image/png", purpose: "any" }] : []),
    { src: pwaIcon192, sizes: "192x192", type: "image/png", purpose: "any" },
    { src: pwaIcon512, sizes: "512x512", type: "image/png", purpose: "any" },
    // ✅ backend আইকনগুলো ~10% safe-zone padding সহ বানায়
    // (backend/src/services/brandIconService.js), তাই Android আইকন গোল করে
    // কাটলেও logo কাটা পড়ে না — একই ফাইল maskable হিসেবেও দেওয়া যায়।
    { src: pwaIcon512, sizes: "512x512", type: "image/png", purpose: "maskable" },
  ];
}

/**
 * @param {object|null} shop - /shop-info রেসপন্স (না পেলে null → প্ল্যাটফর্ম ডিফল্ট)
 * @param {string} shopSlug - route param; DOMAIN_MODE_MARKER হলে custom-domain মোড
 */
export function buildManifest(shop, shopSlug = DOMAIN_MODE_MARKER) {
  // path-based শপ প্ল্যাটফর্ম ডোমেইনে "/shop/<slug>/" এর ভেতরে থাকে — scope,
  // start_url ও id সেই prefix সহ না দিলে একই ডোমেইনের সব শপ ব্রাউজারের কাছে
  // একটাই ইনস্টল্ড অ্যাপ হিসেবে গণ্য হতো, আর ইনস্টল করা অ্যাপ খুললে শপের
  // হোম নয়, প্ল্যাটফর্মের রুট খুলতো।
  const base = shopBasePath(shopSlug);
  const scope = `${base}/`;

  if (!shop) {
    return {
      name: PLATFORM_NAME,
      short_name: "ECMS",
      description: PLATFORM_DESCRIPTION,
      id: scope,
      start_url: scope,
      scope,
      display: "standalone",
      orientation: "portrait",
      lang: "bn",
      dir: "ltr",
      background_color: "#ffffff",
      theme_color: PLATFORM_THEME_COLOR,
      icons: FALLBACK_ICONS,
    };
  }

  const branding = shop.branding || {};
  const name = (branding.title || shop.name || PLATFORM_NAME).trim();
  const colors = shop.theme?.colors || {};

  return {
    name,
    short_name: toShortName(name),
    description: `${name} — অনলাইন শপ। সহজে প্রোডাক্ট দেখুন ও অর্ডার করুন।`,
    id: scope,
    start_url: scope,
    scope,
    display: "standalone",
    orientation: "portrait",
    lang: "bn",
    dir: "ltr",
    background_color: colors.surface || "#ffffff",
    // splash screen ও Android task-switcher bar এই রঙে আঁকা হয় — শপের
    // storefront theme (buildThemeVars) যে primary রঙ ব্যবহার করে সেটাই ঠিক।
    theme_color: colors.primary || branding.themeColor || PLATFORM_THEME_COLOR,
    icons: buildIcons(branding),
  };
}

/**
 * manifest রেসপন্সের সাধারণ হেডার। ব্রাউজার manifest খুব একটা ঘন ঘন রি-ফেচ
 * করে না, তাই ছোট max-age + must-revalidate দিলে অ্যাডমিন brand name/logo
 * বদলালে সেটা দ্রুতই ইনস্টল্ড আইকনে পৌঁছায়। `Vary` দরকার কারণ custom-domain
 * মোডে একই path ("/manifest.json") প্রতি শপে আলাদা কনটেন্ট দেয় — কোনো
 * reverse proxy যেন এক শপের manifest অন্য শপকে না দেয়।
 */
export const MANIFEST_HEADERS = {
  "Content-Type": "application/manifest+json; charset=utf-8",
  "Cache-Control": "public, max-age=0, must-revalidate",
  Vary: "Host, X-Forwarded-Host",
};
