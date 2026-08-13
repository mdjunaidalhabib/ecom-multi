import { getPlatformSettings } from "../../src/models/PlatformSettings.js";

/* -------------------------------------------------------
   GET /shop-info — Public: storefront (frontend)-এর জন্য শপের নাম,
   branding এবং effective storefront theme
------------------------------------------------------- */
export const getShopInfo = async (req, res) => {
  try {
    const shop = req.shop; // resolveShopByDomain middleware আগেই সেট করেছে
    if (!shop) return res.status(404).json({ message: "Shop not found" });

    const settings = await getPlatformSettings();
    const planDefault = settings.planThemeMap?.[shop.plan] || "classic";
    const effectiveTheme = shop.branding?.theme || planDefault;

    return res.json({
      name: shop.name,
      slug: shop.slug,
      plan: shop.plan,
      branding: {
        logo: shop.branding?.logo || "",
        themeColor: shop.branding?.themeColor || "#0ea5e9",
      },
      effectiveTheme,
    });
  } catch (err) {
    console.error("❌ getShopInfo error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
