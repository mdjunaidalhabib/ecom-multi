"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import cloudinaryLoader from "../../../lib/cloudinaryLoader";
import ImageSlider from "../../home/ImageSlider";
import TerraProductCard from "./ProductCard";
import useShopPath from "../../../hooks/useShopPath";
import { ArrowRight } from "lucide-react";

// প্রোডাক্ট গ্রিডের কলাম সংখ্যা: মোবাইল ২, sm ৩, lg ৪, xl ৫
const GRID_CLASS =
  "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5";

// ✅ এক লাইনের horizontal রেল — শেষ card-টা আধা কাটা অবস্থায় ডান পাশে উঁকি দেয়,
// তাই বোঝা যায় আরও product আছে (স্ক্রল/swipe করলে দেখা যায়)।
// প্রতিটা item-এর width এমন যে মোবাইলে ২.৪, sm ৩.৩, lg ৪.৩, xl ৫.৪টা card দেখা যায়।
// (Tailwind literal ক্লাস লাগে, তাই সরাসরি লেখা)
// ✅ মাউস দিয়ে click-and-drag করেও স্ক্রল হয় (touch/trackpad আগের মতোই native)।
// drag চলার সময় snap/smooth বন্ধ থাকে, ছাড়লে কিনারায় snap করে বসে।
// ছোট movement (<5px) drag ধরা হয় না, তাই সাধারণ ক্লিক (card খোলা, বাটন) ঠিকঠাক কাজ করে।
function ProductRail({ products }) {
  const ref = useRef(null);
  const drag = useRef({ isDown: false, startX: 0, startScroll: 0, moved: false });

  const endDrag = useCallback(() => {
    const el = ref.current;
    if (!el || !drag.current.isDown) return;
    drag.current.isDown = false;
    el.style.scrollSnapType = "";
    el.style.scrollBehavior = "";
    el.style.cursor = "";
  }, []);

  useEffect(() => {
    window.addEventListener("mouseup", endDrag);
    return () => window.removeEventListener("mouseup", endDrag);
  }, [endDrag]);

  const onMouseDown = (e) => {
    const el = ref.current;
    if (!el || e.button !== 0) return;
    drag.current = { isDown: true, startX: e.pageX, startScroll: el.scrollLeft, moved: false };
  };

  const onMouseMove = (e) => {
    const el = ref.current;
    if (!el || !drag.current.isDown) return;
    const walk = e.pageX - drag.current.startX;
    if (!drag.current.moved) {
      if (Math.abs(walk) < 5) return;
      drag.current.moved = true;
      el.style.scrollSnapType = "none";
      el.style.scrollBehavior = "auto";
      el.style.cursor = "grabbing";
    }
    e.preventDefault();
    el.scrollLeft = drag.current.startScroll - walk;
  };

  // drag করার পর ছাড়লে যেন ভুলে card/বাটনে ক্লিক না লেগে যায়
  const onClickCapture = (e) => {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  };

  return (
    <div
      ref={ref}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseLeave={endDrag}
      onClickCapture={onClickCapture}
      onDragStart={(e) => e.preventDefault()}
      className="flex cursor-grab select-none snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-3 pt-1 sm:gap-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {products.map((prod, i) => (
        <div
          key={prod._id}
          className="w-[42%] flex-none snap-start sm:w-[30%] lg:w-[23%] xl:w-[18.2%]"
        >
          <TerraProductCard product={prod} priority={i < 4} />
        </div>
      ))}
    </div>
  );
}

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
      <div className="max-container overflow-hidden pt-4">
        <ImageSlider images={slides} bare />
      </div>

      {activeCategories.length > 0 && (
        <div className="max-container pb-4 pt-12">
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

      <div className="max-container space-y-16 pb-20 pt-10">
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

              {/* ✅ ১ লাইন, ডান পাশে আধা-কাটা card উঁকি দেয় — swipe/স্ক্রল করলে আরও দেখা যায়;
                  সবগুলো দেখতে "View all" */}
              <ProductRail products={catProducts.slice(0, 10)} />
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
