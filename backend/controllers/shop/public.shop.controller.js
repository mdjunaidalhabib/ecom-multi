import Plan from "../../src/models/Plan.js";
import Theme from "../../src/models/Theme.js";
import { shopHasFeature } from "../../src/services/planFeatureService.js";
import LandingPage from "../../src/models/LandingPage.js";
import Navbar, {
  NAVBAR_BRAND_NAME_PLACEHOLDER,
} from "../../src/models/Navbar.js";
import { DEFAULT_PLATFORM_BRAND_NAME } from "../../src/constants/branding.constants.js";

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

    // ✅ ব্রাউজার ট্যাব শিরোনাম + ফেভিকন — আলাদা কোনো admin/super-admin
    // "branding" সেটিংস নেই (ইচ্ছাকৃতভাবে বাদ দেওয়া হয়েছে)। এর বদলে শপের
    // নিজস্ব Navbar (admin নিজে "Navbar" পেজ থেকে brand name/logo সেট করে,
    // দেখুন models/Navbar.js) থেকে সরাসরি রিজলভ হয় — admin কিছু সেট না
    // করলে হার্ডকোডেড platform ডিফল্টে ফলব্যাক করে
    // (constants/branding.constants.js)।
    const navbar = await Navbar.findOne({ shopId: shop._id });
    const navbarBrandName = navbar?.brand?.name?.trim();
    const effectiveTitle =
      navbarBrandName && navbarBrandName !== NAVBAR_BRAND_NAME_PLACEHOLDER
        ? navbarBrandName
        : DEFAULT_PLATFORM_BRAND_NAME;
    // ✅ পুরনো বড় logo আর ব্যবহার হয় না — pixelated/blurry favicon সমস্যা এড়াতে
    // এখন ছোট, sharp দিয়ে বানানো 64×64 PNG favicon variant রিটার্ন হয়
    // (দেখুন navbar.admin.routes.js এর POST handler)।
    const effectiveFavicon = navbar?.brand?.favicon || "";

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
