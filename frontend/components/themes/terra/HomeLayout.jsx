"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import cloudinaryLoader from "../../../lib/cloudinaryLoader";
import ImageSlider from "../../home/ImageSlider";
import TerraProductCard from "./ProductCard";
import useShopPath from "../../../hooks/useShopPath";
import { ArrowRight } from "lucide-react";

// Terra Prestige: editorial home — hero banner, a "Collections" rail of
// portrait category tiles with refined overlay captions, then category-grouped
// product grids under serif section headings with a gold rule. Same data as
// other themes.
export default function TerraHomeLayout({ products = [], categories = [], slides = [] }) {
  const router = useRouter();
  const { base } = useShopPath();

  const activeCategories = [...categories]
    .filter((c) => c.isActive !== false)
    .sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0));

  const goToCategoryPage = (cat) => router.push(`${base}/categories/${cat._id}`);

  return (
    <div className="bg-[var(--theme-bg)]">
      <ImageSlider images={slides} />

      {activeCategories.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 pb-4 pt-12 sm:px-6">
          <div className="mb-8 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--theme-accent)]">
              Curated for you
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--theme-text)] sm:text-3xl">
              Shop by Collection
            </h2>
            <span className="mx-auto mt-4 block h-px w-14 bg-[var(--theme-accent)]" />
          </div>

          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 md:grid-cols-6">
            {activeCategories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => goToCategoryPage(cat)}
                className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-stone-100 ring-1 ring-[var(--theme-text)]/10"
              >
                <Image
                  loader={cloudinaryLoader}
                  src={cat.image || "/no-image.png"}
                  alt={cat.name}
                  fill
                  sizes="200px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--theme-secondary)]/85 via-[var(--theme-secondary)]/10 to-transparent" />
                <span className="absolute inset-x-0 bottom-3 truncate px-2 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
                  {cat.name}
                </span>
                <span className="absolute inset-x-6 bottom-1.5 h-px scale-x-0 bg-[var(--theme-accent)] transition-transform duration-500 group-hover:scale-x-100" />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl space-y-16 px-4 pb-20 pt-10 sm:px-6">
        {activeCategories.map((cat) => {
          const catProducts = products.filter(
            (p) =>
              Array.isArray(p.categories) &&
              p.categories.some((c) => String(c?._id ?? c) === String(cat._id)),
          );
          if (!catProducts.length) return null;

          return (
            <section key={cat._id}>
              <div className="mb-6 flex items-end justify-between border-b border-[var(--theme-text)]/10 pb-3">
                <div>
                  <span className="mb-2 block h-0.5 w-10 bg-[var(--theme-accent)]" />
                  <h2 className="text-xl font-semibold tracking-tight text-[var(--theme-text)] sm:text-2xl">
                    {cat.name}
                  </h2>
                </div>
                <button
                  onClick={() => goToCategoryPage(cat)}
                  className="group flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--theme-primary)] transition-colors hover:text-[var(--theme-accent)]"
                >
                  View all
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
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
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((prod, i) => (
              <TerraProductCard key={prod._id} product={prod} priority={i < 4} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
