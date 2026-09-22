"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import Image from "next/image";
import cloudinaryLoader from "../../../lib/cloudinaryLoader";
import FirstCartProductCard from "./ProductCard";

const API_URL = "/api";

// FirstCart: marketplace-style category browser — a horizontal, scrollable
// row of category chips (small circular thumbnail + name) pinned above a
// full-width product grid, instead of the classic/terra left sidebar. Same
// /api/categories + /api/products/category/:id data contract as
// CategoryBrowserClient (the shared classic/terra layout).
export default function FirstCartCategoryBrowser({
  initialCategories,
  initialSelectedCategoryId,
  initialProducts,
}) {
  const hasInitialData = initialCategories !== undefined;

  const [categories, setCategories] = useState(initialCategories || []);
  const [selectedCategory, setSelectedCategory] = useState(
    initialSelectedCategoryId ?? null
  );
  const [products, setProducts] = useState(initialProducts || []);

  const [loading, setLoading] = useState(!hasInitialData);
  const [productLoading, setProductLoading] = useState(false);

  const [catError, setCatError] = useState(false);
  const [prodError, setProdError] = useState(false);

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

  const selectedCategoryName =
    categories.find((c) => c._id === selectedCategory)?.name || "";

  if (shouldShowCategorySkeleton) {
    return (
      <div className="bg-[var(--theme-bg)]">
        <div className="mx-auto max-w-[1280px] px-4 py-4 sm:px-6">
          <div className="flex gap-3 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-10 w-28 shrink-0 animate-pulse rounded-full bg-[var(--theme-text)]/10"
              />
            ))}
          </div>
          <p className="mt-4 text-center text-sm text-[var(--theme-text)]/60">
            {catError
              ? "ক্যাটাগরি লোড হচ্ছে না—আবার চেষ্টা করা হচ্ছে..."
              : "লোড হচ্ছে..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--theme-bg)]">
      {/* Category chip row */}
      <div className="sticky top-0 z-10 border-b border-[var(--theme-text)]/10 bg-[var(--theme-surface)]">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
          <div className="flex gap-2.5 overflow-x-auto py-3.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((cat) => {
              const active = selectedCategory === cat._id;
              return (
                <button
                  key={cat._id}
                  onClick={() => fetchProducts(cat._id)}
                  className={`flex shrink-0 items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-[var(--theme-primary)] text-white"
                      : "bg-[var(--theme-bg)] text-[var(--theme-text)] hover:bg-[var(--theme-primary)]/10"
                  }`}
                >
                  <span
                    className={`relative h-7 w-7 shrink-0 overflow-hidden rounded-full ring-2 ${
                      active ? "ring-white/60" : "ring-[var(--theme-text)]/10"
                    }`}
                  >
                    <Image
                      loader={cloudinaryLoader}
                      src={cat.image || "/no-image.png"}
                      alt={cat.name}
                      fill
                      sizes="28px"
                      className="object-cover"
                    />
                  </span>
                  <span className="whitespace-nowrap">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Product grid */}
      <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6">
        <h1
          className="mb-5 text-xl font-bold text-[var(--theme-text)] sm:text-2xl"
          style={{ fontFamily: "var(--theme-font-heading)" }}
        >
          {selectedCategoryName || "Products"}
        </h1>

        {shouldShowProductSkeleton ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] animate-pulse rounded-2xl bg-[var(--theme-text)]/10"
              />
            ))}
          </div>
        ) : products.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((p, i) => (
              <FirstCartProductCard key={p._id} product={p} priority={i < 4} />
            ))}
          </div>
        ) : (
          <p className="py-10 text-center text-[var(--theme-text)]/60">
            কোনো প্রোডাক্ট পাওয়া যায়নি।
          </p>
        )}
      </div>
    </div>
  );
}
