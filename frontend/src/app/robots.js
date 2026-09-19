import { getSiteOrigin } from "../../lib/seo";

// /robots.txt — প্রতিটা ডোমেইনের জন্য নিজের sitemap লিংকসহ ডায়নামিক।
// কাস্টমারের ব্যক্তিগত/লেনদেনের পেজ (cart, checkout, orders, profile...)
// সার্চ ইঞ্জিনের কাজে আসে না — crawl budget প্রোডাক্ট/ক্যাটাগরি পেজে রাখতে
// এগুলো বাদ। path-based (/shop/<slug>/...) রূপও কভার করা হয়েছে।
const PRIVATE_PATHS = [
  "cart",
  "checkout",
  "orders",
  "order-summary",
  "profile",
  "wishlist",
];

export default async function robots() {
  const origin = await getSiteOrigin();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/auth/",
          "/print/",
          ...PRIVATE_PATHS.map((p) => `/${p}`),
          ...PRIVATE_PATHS.map((p) => `/shop/*/${p}`),
        ],
      },
    ],
    ...(origin ? { sitemap: `${origin}/sitemap.xml` } : {}),
  };
}
