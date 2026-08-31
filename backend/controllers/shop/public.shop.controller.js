import Plan from "../../src/models/Plan.js";
import Theme from "../../src/models/Theme.js";
import { shopHasFeature } from "../../src/services/planFeatureService.js";
import LandingPage from "../../src/models/LandingPage.js";
import SiteBranding from "../../src/models/SiteBranding.js";
import { getPlatformSettings } from "../../src/models/PlatformSettings.js";

const FALLBACK_THEME = {
  baseLayout: "classic",
  colors: {
    primary: "#db2777",
    primaryDark: "#be185d",
    secondary: "#111827",
    background: "#fdf2f8",
    surface: "#ffffff",
    text: "#1f2937",
    accent: "#ec4899",
  },
  fonts: { heading: "default", body: "default" },
};

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
    const effectiveThemeKey = shop.branding?.theme || planDefault;
    const themeDoc = await Theme.findOne({ key: effectiveThemeKey });
    const themeConfig = themeDoc
      ? {
          baseLayout: themeDoc.baseLayout,
          colors: themeDoc.colors.toObject(),
          fonts: themeDoc.fonts.toObject(),
        }
      : FALLBACK_THEME;
    const fullStorefront = await shopHasFeature(shop, "fullStorefront");

    // ✅ ব্রাউজার ট্যাব শিরোনাম + ফেভিকন — শপ নিজে সেট করে থাকলে সেটা,
    // নাহলে super-admin এর platform-wide ডিফল্ট (দেখুন models/SiteBranding.js
    // ও routes/admin/siteBranding.admin.routes.js / platformBranding.superadmin.routes.js)
    const [siteBranding, platformSettings] = await Promise.all([
      SiteBranding.findOne({ shopId: shop._id }),
      getPlatformSettings(),
    ]);
    const effectiveTitle =
      siteBranding?.browserTitle || platformSettings.branding?.title || "Hikmah IT";
    const effectiveFavicon = siteBranding?.favicon || platformSettings.branding?.favicon || "";

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
      domain: shop.domain || null,
      domainStatus: shop.domainStatus,
      branding: {
        logo: shop.branding?.logo || "",
        themeColor: shop.branding?.themeColor || "#0ea5e9",
        title: effectiveTitle,
        favicon: effectiveFavicon,
      },
      effectiveTheme: effectiveThemeKey,
      theme: themeConfig,
      fullStorefront,
      primaryLandingPageSlug,
    });
  } catch (err) {
    console.error("❌ getShopInfo error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
