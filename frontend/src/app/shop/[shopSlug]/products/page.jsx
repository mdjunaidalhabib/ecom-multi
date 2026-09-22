import Link from "next/link";
import { serverFetch, getShopInfo } from "../../../../../lib/serverApi";
import { shopBasePath } from "../../../../../lib/shopMode";
import { pagePath } from "../../../../../lib/seo";
import { getTheme } from "../../../../../lib/themeRegistry";

async function getAllProducts() {
  try {
    const data = await serverFetch("/products");
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("❌ Product fetch error:", err);
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { shopSlug } = await params;
  return {
    title: "All Products",
    description: "সব প্রোডাক্ট এক জায়গায় — সাশ্রয়ী দামে অনলাইনে অর্ডার করুন।",
    alternates: { canonical: pagePath(shopSlug, "/products") },
  };
}

export default async function AllProductsPage({ params }) {
  const { shopSlug } = await params;
  const base = shopBasePath(shopSlug);
  const products = await getAllProducts();

  // ✅ getShopInfo() Next-এর per-request fetch cache-এ dedupe হয় (layout.js
  // ইতিমধ্যেই একবার কল করে থাকে), তাই এখানে আলাদা কোনো বাড়তি backend call
  // হয় না। শপের থিম অনুযায়ী সঠিক ProductCard বেছে নেওয়া হয়, যাতে হোম পেজের
  // মতোই একই card style এখানেও দেখায়।
  let baseLayout;
  try {
    const shop = await getShopInfo();
    baseLayout = shop?.theme?.baseLayout;
  } catch {
    baseLayout = undefined;
  }
  const { ProductCard } = getTheme(baseLayout);

  return (
    <main className="bg-[var(--theme-bg)] min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-4">
          <Link href={base || "/"} className="hover:underline">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">All Products</span>
        </nav>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-semibold mb-6">
          All Products
        </h1>

        {/* Products Section */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <p>No products available.</p>
          </div>
        )}
      </div>
    </main>
  );
}
