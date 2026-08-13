import HomeSEO from "../../../../components/seo/HomeSEO";
import VisitorTracker from "../../../../components/VisitorTracker";
import HomepagePopup from "../../../../components/home/HomepagePopup";
import { serverFetch, getShopInfo } from "../../../../lib/serverApi";
import { getTheme } from "../../../../lib/themeRegistry";

async function getHomeData() {
  const [productsRes, categoriesRes, badgesRes, sliderRes] =
    await Promise.allSettled([
      serverFetch("/products"),
      serverFetch("/categories"),
      serverFetch("/homeBadges"),
      serverFetch("/slider-images"),
    ]);

  return {
    products: productsRes.status === "fulfilled" ? productsRes.value : [],
    categories:
      categoriesRes.status === "fulfilled" ? categoriesRes.value : [],
    badges:
      badgesRes.status === "fulfilled" ? badgesRes.value?.badges || [] : [],
    slides:
      sliderRes.status === "fulfilled" ? sliderRes.value?.slides || [] : [],
  };
}

export default async function HomePage() {
  const [{ products, categories, badges, slides }, shop] = await Promise.all([
    getHomeData(),
    // Same call layout.js already makes for this request — Next's fetch
    // cache dedupes it, so this doesn't add a second backend round trip.
    getShopInfo().catch(() => null),
  ]);
  const { HomeLayout } = getTheme(shop?.effectiveTheme);

  return (
    <>
      <HomeSEO />
      <VisitorTracker />
      <HomepagePopup />
      <HomeLayout
        products={products}
        categories={categories}
        badges={badges}
        slides={slides}
      />
    </>
  );
}
 