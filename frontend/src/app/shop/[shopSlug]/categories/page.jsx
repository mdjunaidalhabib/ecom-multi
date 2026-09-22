import { serverFetch, getShopInfo } from "../../../../../lib/serverApi";
import { requireFullStorefront } from "../../../../../lib/requireFullStorefront";
import { pagePath } from "../../../../../lib/seo";
import { getTheme } from "../../../../../lib/themeRegistry";

export async function generateMetadata({ params }) {
  const { shopSlug } = await params;
  return {
    title: "Categories",
    description: "ক্যাটাগরি অনুযায়ী প্রোডাক্ট ব্রাউজ করুন।",
    alternates: { canonical: pagePath(shopSlug, "/categories") },
  };
}

async function getCategoriesData() {
  let categories = [];
  try {
    const data = await serverFetch("/categories");
    categories = Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("❌ Categories fetch error:", err);
    return { categories: [], selectedCategoryId: null, products: [] };
  }

  categories = categories.filter((c) => c.isActive !== false);
  categories.sort((a, b) => (a.order || 0) - (b.order || 0));

  if (categories.length === 0) {
    return { categories, selectedCategoryId: null, products: [] };
  }

  const firstCategoryId = categories[0]._id;
  let products = [];
  try {
    const data = await serverFetch(`/products/category/${firstCategoryId}`);
    products = Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("❌ Category products fetch error:", err);
  }

  return { categories, selectedCategoryId: firstCategoryId, products };
}

export default async function CategoryPage({ params }) {
  const { shopSlug } = await params;
  await requireFullStorefront(shopSlug);

  const { categories, selectedCategoryId, products } =
    await getCategoriesData();

  // ✅ getShopInfo() Next-এর per-request fetch cache-এ dedupe হয় (layout.js
  // ইতিমধ্যেই একবার কল করে থাকে) — শপের থিম অনুযায়ী সম্পূর্ণ আলাদা
  // CategoryBrowser layout বেছে নেওয়া হয় (FirstCart-এর horizontal chip
  // layout বনাম classic/terra-র sidebar layout), দেখুন lib/themeRegistry.js।
  let baseLayout;
  try {
    const shop = await getShopInfo();
    baseLayout = shop?.theme?.baseLayout;
  } catch {
    baseLayout = undefined;
  }
  const { CategoryBrowser, ProductCard } = getTheme(baseLayout);

  return (
    <CategoryBrowser
      initialCategories={categories}
      initialSelectedCategoryId={selectedCategoryId}
      initialProducts={products}
      ProductCard={ProductCard}
    />
  );
}
