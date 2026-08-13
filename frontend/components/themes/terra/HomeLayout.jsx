"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import cloudinaryLoader from "../../../lib/cloudinaryLoader";
import ImageSlider from "../../home/ImageSlider";
import TerraProductCard from "./ProductCard";
import useShopPath from "../../../hooks/useShopPath";
import { ArrowRight } from "lucide-react";

// Terra: warm/organic home — hero banner, then a grid of rounded category
// tiles (image + name overlay, distinct from Aurora's circular avatar rail),
// followed by category-grouped product grids. Same data as other themes.
export default function TerraHomeLayout({ products = [], categories = [], slides = [] }) {
  const router = useRouter();
  const { base } = useShopPath();

  const activeCategories = [...categories]
    .filter((c) => c.isActive !== false)
    .sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0));

  const goToCategoryPage = (cat) => router.push(`${base}/categories/${cat._id}`);

  return (
    <div className="bg-amber-50/40">
      <ImageSlider images={slides} />

      {activeCategories.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {activeCategories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => goToCategoryPage(cat)}
                className="group relative aspect-square overflow-hidden rounded-2xl bg-stone-100"
              >
                <Image
                  loader={cloudinaryLoader}
                  src={cat.image || "/no-image.png"}
                  alt={cat.name}
                  fill
                  sizes="200px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/70 via-emerald-950/0 to-transparent" />
                <span className="absolute inset-x-0 bottom-2 truncate px-2 text-center text-xs font-semibold text-white">
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
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
                <h2 className="text-lg font-bold text-emerald-900 sm:text-xl">
                  {cat.name}
                </h2>
                <button
                  onClick={() => goToCategoryPage(cat)}
                  className="flex items-center gap-1 text-xs font-semibold text-amber-800 hover:text-amber-900"
                >
                  See all <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {catProducts.slice(0, 10).map((prod, i) => (
                  <TerraProductCard key={prod._id} product={prod} priority={i < 4} />
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
              <TerraProductCard key={prod._id} product={prod} priority={i < 4} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
