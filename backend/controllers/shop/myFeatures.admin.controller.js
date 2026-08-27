import Shop from "../../src/models/Shop.js";
import Plan from "../../src/models/Plan.js";
import Theme from "../../src/models/Theme.js";
import { getPlanFeatures } from "../../src/services/planFeatureService.js";

/* -------------------------------------------------------
   GET /admin/my-features — লগইন করা admin/staff-এর assigned শপের
   প্ল্যানে কোন কোন ফিচার (analytics, promo, customDomain...) চালু আছে
   সেটা রিটার্ন করে। অ্যাডমিন প্যানেলের সাইডবার এটা দিয়ে মেনু আইটেম
   হাইড/শো করে — দেখুন admin/components/Sidebar.jsx
------------------------------------------------------- */
export const getMyFeatures = async (req, res) => {
  try {
    const shop =
      req.shop ||
      (await Shop.findById(req.shopId).setOptions({ skipTenantScope: true }));
    if (!shop) return res.status(404).json({ message: "Shop not found" });

    const features = await getPlanFeatures(shop.plan);
    const planDoc = await Plan.findOne({ key: shop.plan });
    const planDefaultTheme = planDoc?.theme || "classic";
    const themeOverride = shop.branding?.theme || "";
    const effectiveThemeKey = themeOverride || planDefaultTheme;
    const themeDoc = await Theme.findOne({ key: effectiveThemeKey });

    res.json({
      plan: shop.plan,
      features,
      status: shop.status,
      subscriptionStartDate: shop.subscriptionStartDate || null,
      subscriptionDays: shop.subscriptionDays || null,
      planExpiresAt: shop.planExpiresAt || null,
      suspendedReason: shop.suspendedReason || "",
      // ✅ Theme শুধু super-admin থেকে নিয়ন্ত্রিত (প্ল্যান ডিফল্ট বা প্রতি-শপ
      // override — দেখুন super-admin/components/Shops.jsx) — এখানে শুধু
      // read-only তথ্য হিসেবে পাঠানো হচ্ছে, শপ-admin এখান থেকে বদলাতে পারে না
      theme: {
        effective: effectiveThemeKey,
        name: themeDoc?.name || effectiveThemeKey,
        primaryColor: themeDoc?.colors?.primary || "",
        planDefault: planDefaultTheme,
        isOverridden: !!themeOverride,
      },
    });
  } catch (err) {
    console.error("❌ getMyFeatures error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
