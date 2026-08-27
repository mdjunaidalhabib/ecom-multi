"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import cloudinaryLoader from "../../../lib/cloudinaryLoader";
import ImageSlider from "../../home/ImageSlider";
import AuroraProductCard from "./ProductCard";
import useShopPath from "../../../hooks/useShopPath";
import { ArrowRight } from "lucide-react";

// Aurora: clean/minimal home — a layered hero banner followed by a
// horizontal category rail and category-grouped product grids. Simpler
// than the classic theme's drag-scroll/badge-filter composition by design
// (see plan: Phase D scope), same underlying products/categories data.
export default function AuroraHomeLayout({ products = [], categories = [], slides = [] }) {
  const router = useRouter();
  const { base } = useShopPath();
  const railRef = useRef(null);

  const activeCategories = [...categories]
    .filter((c) => c.isActive !== false)
    .sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0));

  const goToCategoryPage = (cat) => {
    router.push(`${base}/categories/${cat._id}`);
  };

  return (
    <div className="bg-[var(--theme-bg)]">
      <ImageSlider images={slides} />

      {activeCategories.length > 0 && (
        <div
          ref={railRef}
          className="mx-auto flex max-w-7xl gap-3 overflow-x-auto px-4 py-6 [&::-webkit-scrollbar]:hidden sm:px-6"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {activeCategories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => goToCategoryPage(cat)}
              className="flex shrink-0 flex-col items-center gap-2"
            >
              <div className="relative h-16 w-16 overflow-hidden rounded-full border border-neutral-200 bg-neutral-50 sm:h-20 sm:w-20">
                <Image
                  loader={cloudinaryLoader}
                  src={cat.image || "/no-image.png"}
                  alt={cat.name}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
              <span className="max-w-[80px] truncate text-xs font-medium text-neutral-700">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="mx-auto max-w-7xl space-y-12 px-4 pb-16 sm:px-6">
        {activeCategories.map((cat) => {
          const catProducts = products.filter(
            (p) =>
              Array.isArray(p.categories) &&
              p.categories.some((c) => String(c?._id ?? c) === String(cat._id)),
          );
          if (!catProducts.length) return null;

          return (
            <section key={cat._id}>
              <div className="mb-4 flex items-end justify-between">
                <h2 className="text-lg font-semibold tracking-tight text-neutral-900 sm:text-xl">
                  {cat.name}
                </h2>
                <button
                  onClick={() => goToCategoryPage(cat)}
                  className="flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-[var(--theme-accent)]"
                >
                  View all <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {catProducts.slice(0, 10).map((prod, i) => (
                  <AuroraProductCard key={prod._id} product={prod} priority={i < 4} />
                ))}
              </div>
            </section>
          );
        })}

        {activeCategories.every(
          (cat) =>
            !products.some(
              (p) =>
                Array.isArray(p.categories) &&
                p.categories.some((c) => String(c?._id ?? c) === String(cat._id)),
            ),
        ) && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((prod, i) => (
              <AuroraProductCard key={prod._id} product={prod} priority={i < 4} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
