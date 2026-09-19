import { serverFetch, getShopInfo } from "../../../../../../lib/serverApi";
import { shopBasePath } from "../../../../../../lib/shopMode";
import ProductDetailsClient from "../../../../../../components/product-details/ProductDetailsClient";
import JsonLd from "../../../../../../components/seo/JsonLd";
import {
  getSiteOrigin,
  pagePath,
  shopBrand,
  toSeoDescription,
  buildProductJsonLd,
  buildBreadcrumbJsonLd,
} from "../../../../../../lib/seo";

async function getProductData(id) {
  let product;
  try {
    product = await serverFetch(`/products/${id}`);
  } catch {
    return { product: null, categories: [], related: [] };
  }

  if (!product?._id) {
    return { product: null, categories: [], related: [] };
  }

  // ইমেজ ফলব্যাক লজিক
  if (!product.image && product.images?.length > 0) {
    product.image = product.images[0];
  }
  if (!product.image) {
    product.image = "/no-image.png";
  }

  const categories = Array.isArray(product.categories)
    ? product.categories
    : [];
  const categoryIds = categories
    .map((c) => (typeof c === "object" ? c?._id : c))
    .filter(Boolean);

  let related = [];
  if (categoryIds.length > 0) {
    try {
      const relLists = await Promise.all(
        categoryIds.map((catId) =>
          serverFetch(`/products/category/${catId}`).catch(() => []),
        ),
      );
      const merged = new Map();
      relLists.flat().forEach((p) => {
        if (p?._id && p._id !== id) merged.set(p._id, p);
      });
      related = Array.from(merged.values());
    } catch {
      related = [];
    }
  }

  return { product, categories, related };
}

// generateMetadata ও পেজ দুটোই একই `/products/:id` fetch করে — Next-এর
// request memoization/data cache-এ এটা একটাই backend hit।
export async function generateMetadata({ params }) {
  const { id, shopSlug } = await params;

  let product = null;
  try {
    product = await serverFetch(`/products/${id}`);
  } catch {
    product = null;
  }

  // hidden/মুছে ফেলা প্রোডাক্ট — Google যেন এই URL index না করে
  if (!product?._id) {
    return { title: "Product Not Found", robots: { index: false, follow: false } };
  }

  const shop = await getShopInfo().catch(() => null);
  const brand = shopBrand(shop);
  const description =
    toSeoDescription(product.description) ||
    `${product.name} — মূল্য ৳${product.price}। ${brand} থেকে অর্ডার করুন, সারা বাংলাদেশে ডেলিভারি।`;
  const image = product.image || product.images?.[0];
  const path = pagePath(shopSlug, `/products/${product._id}`);

  return {
    title: product.name,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      title: product.name,
      description,
      url: path,
      ...(image ? { images: [image] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: product.name,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function ProductDetailsPage({ params }) {
  const { id, shopSlug } = await params;
  const { product, categories, related } = await getProductData(id);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm inline-block">
          <h2 className="text-2xl font-bold text-gray-800">
            Oops! Product Not Found
          </h2>
          <p className="text-gray-500 mt-2">
            The product might have been removed or the link is incorrect.
          </p>
        </div>
      </div>
    );
  }

  const shop = await getShopInfo().catch(() => null);
  const origin = await getSiteOrigin();
  const base = shopBasePath(shopSlug);
  const brand = shopBrand(shop);

  // ✅ Google rich result (দাম/স্টক/রেটিং সহ) + breadcrumb — populate করা
  // category object থেকে প্রথম category-টাই breadcrumb-এর মাঝখানে বসে
  const firstCategory = categories.find((c) => c && typeof c === "object" && c.name);
  const jsonLd = origin
    ? [
        buildProductJsonLd({
          origin,
          base,
          product,
          brand,
          description: toSeoDescription(product.description, 300),
        }),
        buildBreadcrumbJsonLd(origin, [
          { name: "হোম", path: base || "/" },
          ...(firstCategory
            ? [{ name: firstCategory.name, path: `${base}/categories/${firstCategory._id}` }]
            : []),
          { name: product.name, path: `${base}/products/${product._id}` },
        ]),
      ]
    : null;

  return (
    <>
      <JsonLd data={jsonLd} />
      <ProductDetailsClient
        product={product}
        categories={categories}
        related={related}
        loading={false}
      />
    </>
  );
}
