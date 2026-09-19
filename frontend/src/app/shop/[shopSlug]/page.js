import { redirect } from "next/navigation";
import HomeSEO from "../../../../components/seo/HomeSEO";
import VisitorTracker from "../../../../components/VisitorTracker";
import HomepagePopup from "../../../../components/home/HomepagePopup";
import { serverFetch, getShopInfo } from "../../../../lib/serverApi";
import { getTheme } from "../../../../lib/themeRegistry";
import { shopBasePath } from "../../../../lib/shopMode";
import JsonLd from "../../../../components/seo/JsonLd";
import {
  getSiteOrigin,
  pagePath,
  shopBrand,
  defaultShopDescription,
  buildOrganizationJsonLd,
} from "../../../../lib/seo";

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

export async function generateMetadata({ params }) {
  const { shopSlug } = await params;
  const shop = await getShopInfo().catch(() => null);
  if (!shop) return {};

  const brand = shopBrand(shop);
  const title = `${brand} – অনলাইন শপ`;
  const description = defaultShopDescription(brand);

  return {
    // absolute: layout-এর "%s | Brand" template এখানে প্রযোজ্য নয়
    title: { absolute: title },
    description,
    alternates: { canonical: pagePath(shopSlug) },
    openGraph: { title, description, url: pagePath(shopSlug) },
    twitter: { title, description },
  };
}

export default async function HomePage({ params }) {
  // Same call layout.js already makes for this request — Next's fetch
  // cache dedupes it, so this doesn't add a second backend round trip.
  const shop = await getShopInfo().catch(() => null);

  // landing-page-only plan (fullStorefront: false) — this shop has no
  // multi-product catalog/home to show, so its root always shows its
  // primary landing page instead (see backend getShopInfo/LandingPage.isPrimary)
  if (shop && !shop.fullStorefront) {
    const { shopSlug } = await params;
    const base = shopBasePath(shopSlug);
    if (shop.primaryLandingPageSlug) {
      redirect(`${base}/lp/${shop.primaryLandingPageSlug}`);
    }
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-xl font-bold text-gray-700">এই শপের কোনো পেজ এখনো প্রকাশিত হয়নি</h1>
        <p className="mt-2 text-sm text-gray-400">শীঘ্রই আসছে — একটু পরে আবার চেষ্টা করুন।</p>
      </div>
    );
  }

  const { products, categories, badges, slides } = await getHomeData();
  const { HomeLayout } = getTheme(shop?.effectiveTheme);

  const { shopSlug } = await params;
  const origin = await getSiteOrigin();

  return (
    <>
      <HomeSEO brand={shopBrand(shop)} />
      {origin && shop && (
        <JsonLd
          data={buildOrganizationJsonLd({
            origin,
            base: shopBasePath(shopSlug),
            shop,
          })}
        />
      )}
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
 