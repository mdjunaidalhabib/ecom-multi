import Plan from "../../src/models/Plan.js";
import { shopHasFeature } from "../../src/services/planFeatureService.js";
import LandingPage from "../../src/models/LandingPage.js";

/* -------------------------------------------------------
   GET /shop-info — Public: storefront (frontend)-এর জন্য শপের নাম,
   branding, effective storefront theme, এবং fullStorefront/primary
   landing page তথ্য (landing-only প্ল্যানের root/home redirect-এর জন্য)
------------------------------------------------------- */
export const getShopInfo = async (req, res) => {
  try {
    const shop = req.shop; // resolveShopByDomain middleware আগেই সেট করেছে
    if (!shop) return res.status(404).json({ message: "Shop not found" });

    const planDoc = await Plan.findOne({ key: shop.plan }).select("theme");
    const planDefault = planDoc?.theme || "classic";
    const effectiveTheme = shop.branding?.theme || planDefault;
    const fullStorefront = await shopHasFeature(shop, "fullStorefront");

    let primaryLandingPageSlug = null;
    if (!fullStorefront) {
      const primaryPage = await LandingPage.findOne({
        shopId: shop._id,
        isPrimary: true,
        isPublished: true,
      }).select("slug");
      primaryLandingPageSlug = primaryPage?.slug || null;
    }

    return res.json({
      name: shop.name,
      slug: shop.slug,
      plan: shop.plan,
      branding: {
        logo: shop.branding?.logo || "",
        themeColor: shop.branding?.themeColor || "#0ea5e9",
      },
      effectiveTheme,
      fullStorefront,
      primaryLandingPageSlug,
    });
  } catch (err) {
    console.error("❌ getShopInfo error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
