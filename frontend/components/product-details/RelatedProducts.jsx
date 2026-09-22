import DefaultProductCard from "../home/ProductCard";

// ✅ ProductCard prop হিসেবে আসে (frontend/lib/themeRegistry.js থেকে, দেখুন
// ProductDetailsClient.jsx) যাতে থিম অনুযায়ী সঠিক card দেখায়, না দিলে classic
// কার্ডে fallback করে।
export default function RelatedProducts({ related = [], ProductCard = DefaultProductCard }) {
  if (!related?.length) return null;

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">You May Also Like</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {related.map((p, i) => (
          <ProductCard key={p._id} product={p} priority={i < 4} />
        ))}
      </div>
    </section>
  );
}
