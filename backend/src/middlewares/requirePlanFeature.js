import Shop from "../models/Shop.js";
import { shopHasFeature } from "../services/planFeatureService.js";

/**
 * ✅ requirePlanFeature
 * Admin route-এ বসিয়ে নির্দিষ্ট plan-feature (PlatformSettings.planFeatures
 * দেখুন) চালু আছে কিনা চেক করে — না থাকলে 403। `protect` + `requireShopContext`
 * এর পরে বসাতে হবে, কারণ req.shopId দরকার।
 */
export function requirePlanFeature(featureKey, message) {
  return async (req, res, next) => {
    try {
      const shop =
        req.shop ||
        (await Shop.findById(req.shopId).setOptions({ skipTenantScope: true }));
      if (!shop) return res.status(404).json({ message: "Shop not found" });

      const allowed = await shopHasFeature(shop, featureKey);
      if (!allowed) {
        return res.status(403).json({
          message:
            message ||
            "আপনার বর্তমান প্ল্যানে এই ফিচারটি নেই। প্ল্যান আপগ্রেড করতে সুপারএডমিনের সাথে যোগাযোগ করুন।",
        });
      }

      req.shop = shop;
      next();
    } catch (err) {
      console.error("❌ requirePlanFeature error:", err);
      res.status(500).json({ message: "Server error" });
    }
  };
}

export default requirePlanFeature;
