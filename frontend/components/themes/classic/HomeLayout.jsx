import ImageSlider from "../../home/ImageSlider";
import HomeAllProduct from "../../home/HomeAllProduct";
import CategorySidebar from "../../home/CategorySidebar";

// The original (pre-theme-system) home page composition, with one addition:
// on desktop (lg+) the "All Categories" list sits beside the slider instead
// of only appearing as the horizontal scroll row further down (still there,
// unchanged, for mobile). Below lg the sidebar is hidden and this collapses
// back to exactly the original single-column layout.
export default function ClassicHomeLayout({ products, categories, badges, slides }) {
  return (
    <section className="bg-[var(--theme-bg)]">
      <div className="mx-auto w-full max-w-full md:max-w-[1024px] xl:max-w-[1536px] md:px-8 md:mt-2">
        {/*
          ✅ lg:aspect-[4/1] + overflow-hidden — এই row-এর height সবসময়
          slider-এর নিজের aspect-[3/1] অনুযায়ীই fix থাকবে (sidebar-এর
          category লিস্ট যতই বড় হোক, row-কে বড় করে দেবে না)। ক্যাটাগরি
          কম বা বেশি — উচ্চতা সবসময় slider-এর সমান, বাকিগুলো
          CategorySidebar-এর নিজের ভেতরের scroll (overflow-y-auto) দিয়ে
          দেখা যাবে।
        */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-4 lg:items-stretch lg:aspect-[4/1] lg:overflow-hidden">
          <div className="lg:col-span-3 lg:h-full lg:min-h-0">
            <CategorySidebar categories={categories} />
          </div>
          <div className="lg:col-span-9 lg:h-full lg:min-h-0">
            <ImageSlider images={slides} bare />
          </div>
        </div>
      </div>
      <HomeAllProduct
        initialProducts={products}
        initialCategories={categories}
        initialBadges={badges}
      />
    </section>
  );
}
