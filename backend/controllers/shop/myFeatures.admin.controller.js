import Shop from "../../src/models/Shop.js";
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
    res.json({
      plan: shop.plan,
      features,
      status: shop.status,
      subscriptionStartDate: shop.subscriptionStartDate || null,
      subscriptionDays: shop.subscriptionDays || null,
      planExpiresAt: shop.planExpiresAt || null,
      suspendedReason: shop.suspendedReason || "",
    });
  } catch (err) {
    console.error("❌ getMyFeatures error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
