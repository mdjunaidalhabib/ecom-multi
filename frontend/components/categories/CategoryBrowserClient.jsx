"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import Image from "next/image";
import cloudinaryLoader from "../../lib/cloudinaryLoader";
import DefaultProductCard from "../home/ProductCard";
import CategorySkeleton from "../skeletons/CategorySkeleton";
import ProductDetailsSkeleton from "../skeletons/ProductDetailsSkeleton";

const API_URL = "/api";

// ✅ ProductCard prop হিসেবে আসে (frontend/lib/themeRegistry.js থেকে, দেখুন
// এই ফাইলের caller) যাতে থিম অনুযায়ী সঠিক card দেখায়, না দিলে classic কার্ডে
// fallback করে। এই ফাইল নিজে themeRegistry.js import করে না — সেটা import
// করলে circular import হয়ে যেত (themeRegistry.js নিজেই এই কম্পোনেন্ট import করে)।
export default function CategoryBrowserClient({
  initialCategories,
  initialSelectedCategoryId,
  initialProducts,
  ProductCard = DefaultProductCard,
}) {
  // ✅ /categories page (Server Component) already fetches categories +
  // the first category's products and passes them down — skips the
  // client-side fetch + loading skeleton on first paint. Falls back to
  // client-side fetching only if used without initial data.
  const hasInitialData = initialCategories !== undefined;

  const [categories, setCategories] = useState(initialCategories || []);
  const [selectedCategory, setSelectedCategory] = useState(
    initialSelectedCategoryId ?? null,
  );
  const [products, setProducts] = useState(initialProducts || []);

  const [loading, setLoading] = useState(!hasInitialData);
  const [productLoading, setProductLoading] = useState(false);

  const [catError, setCatError] = useState(false);
  const [prodError, setProdError] = useState(false);

  // 🔹 Products fetch (memoized)
  const fetchProducts = useCallback((categoryId) => {
    if (!categoryId) return;

    setSelectedCategory(categoryId);
    setProductLoading(true);
    setProdError(false);

    axios
      .get(`${API_URL}/products/category/${categoryId}`)
      .then((res) => {
        setProducts(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error(err);

        if (err?.response?.status === 403) {
          setProducts([]);
          setProdError(false);
        } else {
          setProdError(true);
          setProducts([]);
        }
      })
      .finally(() => setProductLoading(false));
  }, []);

  // 🔹 Categories fetch (only when no server-provided initial data)
  useEffect(() => {
    if (hasInitialData) return;

    let cancelled = false;
    let retryTimer = null;

    const loadCategories = async () => {
      try {
        setLoading(true);
        setCatError(false);

        const res = await axios.get(`${API_URL}/categories`);
        if (cancelled) return;

        let data = Array.isArray(res.data) ? res.data : [];

        data = data.filter((c) => c.isActive !== false);
        data.sort((a, b) => (a.order || 0) - (b.order || 0));

        setCategories(data);

        if (data.length > 0) {
          const firstCat = data[0];
          setSelectedCategory(firstCat._id);
          fetchProducts(firstCat._id);
        } else {
          setSelectedCategory(null);
          setProducts([]);
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        if (cancelled) return;

        setCatError(true);
        setLoading(false);

        retryTimer = setTimeout(loadCategories, 3000);
      }
    };

    loadCategories();

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [fetchProducts, hasInitialData]);

  const shouldShowCategorySkeleton = useMemo(() => {
    return loading || catError || categories.length === 0;
  }, [loading, catError, categories.length]);

  const shouldShowProductSkeleton = useMemo(() => {
    if (!selectedCategory) return false;
    return productLoading || prodError;
  }, [selectedCategory, productLoading, prodError]);

  // 🌀 First load / category fail skeleton
  if (shouldShowCategorySkeleton) {
    return (
      <div>
        <CategorySkeleton />
        <p className="text-center text-sm text-gray-500 mt-2">
          {catError
            ? "ক্যাটাগরি লোড হচ্ছে না—আবার চেষ্টা করা হচ্ছে..."
            : "লোড হচ্ছে..."}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--theme-bg)]">
      <div className="container mx-auto flex flex-col md:flex-row gap-6 p-3 md:p-6">
        {/* === Category Sidebar === */}
        <div className="md:w-64 bg-[var(--card-bg,var(--theme-surface))] ring-1 ring-[var(--card-ring,transparent)] shadow-md rounded-xl p-3 md:p-4">
          <h3 className="text-lg font-semibold mb-3 border-b pb-2">
            🗂️ Categories
          </h3>

          <ul className="flex md:flex-col gap-3 overflow-x-auto md:space-y-2 no-scrollbar">
            {categories.map((cat) => (
              <li
                key={cat._id}
                onClick={() => fetchProducts(cat._id)}
                className={`flex items-center gap-3 p-2 rounded-lg border border-[var(--card-border,var(--theme-primary))] cursor-pointer transition min-w-[120px] md:min-w-0 ${
                  selectedCategory === cat._id
                    ? "bg-[var(--card-sel-bg,var(--theme-primary))] text-[var(--card-sel-text,#ffffff)] font-medium border"
                    : "hover:bg-[var(--card-sel-hover,var(--theme-bg))]"
                }`}
              >
                <div className="relative w-8 h-8 md:w-10 md:h-10 flex-shrink-0 rounded-md overflow-hidden border bg-white">
                  <Image loader={cloudinaryLoader}
                    src={cat.image || "/no-image.png"}
                    alt={cat.name}
                    fill
                    sizes="40px"
                    loading="lazy"
                    className="object-cover"
                  />
                </div>

                <span className="truncate">{cat.name}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* === Product List === */}
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-4">
            {selectedCategory
              ? "🛍️ Products"
              : "👉 প্রথমে কোনো Category সিলেক্ট করুন"}
          </h3>

          {shouldShowProductSkeleton ? (
            <div>
              <ProductDetailsSkeleton />
              <p className="text-center text-sm text-gray-500 mt-2">
                {prodError
                  ? "প্রোডাক্ট লোড হচ্ছে না—আবার চেষ্টা করা হচ্ছে..."
                  : "প্রোডাক্ট লোড হচ্ছে..."}
              </p>
            </div>
          ) : products.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {products.map((p, i) => (
                // ✅ first row gets priority (LCP fix if needed)
                <ProductCard key={p._id} product={p} priority={i < 4} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-10">
              কোনো প্রোডাক্ট পাওয়া যায়নি।
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
