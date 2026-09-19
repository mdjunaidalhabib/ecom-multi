import { serverFetch, getShopInfo } from "../../lib/serverApi";
import { getSiteOrigin } from "../../lib/seo";

// /sitemap.xml — Google-কে জানায় এই শপের কোন কোন URL index করতে হবে।
// frontend/src/middleware.js ".xml" path রিরাইট করে না, শুধু x-shop-domain
// হেডার বসিয়ে ছেড়ে দেয় — তাই serverFetch() স্বয়ংক্রিয়ভাবে বর্তমান
// ডোমেইনের শপের product/category-ই আনে (প্রতিটা শপের নিজের আলাদা sitemap)।
export default async function sitemap() {
  const origin = await getSiteOrigin();
  if (!origin) return [];

  const shop = await getShopInfo().catch(() => null);

  // কোনো শপ bound নেই → প্ল্যাটফর্মের নিজের ডোমেইন (marketing পেজ)
  if (!shop) {
    if (new URL(origin).hostname !== process.env.PLATFORM_DOMAIN) return [];
    return ["", "/privacy-policy", "/terms-of-service"].map((path) => ({
      url: `${origin}${path || "/"}`,
      changeFrequency: "monthly",
      priority: path ? 0.3 : 1,
    }));
  }

  // landing-only প্ল্যান: catalog নেই, শুধু primary landing page index হবে
  if (!shop.fullStorefront) {
    return shop.primaryLandingPageSlug
      ? [
          {
            url: `${origin}/lp/${shop.primaryLandingPageSlug}`,
            changeFrequency: "weekly",
            priority: 1,
          },
        ]
      : [];
  }

  const [productsRes, categoriesRes] = await Promise.allSettled([
    serverFetch("/products"),
    serverFetch("/categories"),
  ]);
  const products =
    productsRes.status === "fulfilled" && Array.isArray(productsRes.value)
      ? productsRes.value
      : [];
  const categories =
    categoriesRes.status === "fulfilled" && Array.isArray(categoriesRes.value)
      ? categoriesRes.value
      : [];

  const entries = [
    { url: `${origin}/`, changeFrequency: "daily", priority: 1 },
    { url: `${origin}/products`, changeFrequency: "daily", priority: 0.8 },
    { url: `${origin}/categories`, changeFrequency: "weekly", priority: 0.7 },
  ];

  for (const c of categories) {
    if (!c?._id || c.isActive === false) continue;
    entries.push({
      url: `${origin}/categories/${c._id}`,
      lastModified: c.updatedAt ? new Date(c.updatedAt) : undefined,
      changeFrequency: "daily",
      priority: 0.8,
    });
  }

  for (const p of products) {
    if (!p?._id) continue;
    entries.push({
      url: `${origin}/products/${p._id}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
      changeFrequency: "weekly",
      priority: 0.9,
    });
  }

  return entries;
}
