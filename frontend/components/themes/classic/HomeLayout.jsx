import ImageSlider from "../../home/ImageSlider";
import HomeAllProduct from "../../home/HomeAllProduct";

// The original (pre-theme-system) home page composition — kept verbatim so
// shops on the "classic" theme (default: Pro plan) see zero visual change.
export default function ClassicHomeLayout({ products, categories, badges, slides }) {
  return (
    <section className="bg-pink-50">
      <ImageSlider images={slides} />
      <HomeAllProduct
        initialProducts={products}
        initialCategories={categories}
        initialBadges={badges}
      />
    </section>
  );
}
