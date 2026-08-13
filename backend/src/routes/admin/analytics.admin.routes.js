import express from "express";
import { requirePlanFeature } from "../../middlewares/requirePlanFeature.js";
import { getAnalyticsStats } from "../../../controllers/shop/analytics.admin.controller.js";

const router = express.Router();

// ✅ Analytics dashboard plan-gated — free plan থেকে বন্ধ থাকতে পারে
// (দেখুন PlatformSettings.planFeatures, super admin Settings > Plan Features থেকে ম্যানেজ করে)
router.use(
  requirePlanFeature(
    "analytics",
    "আপনার বর্তমান প্ল্যানে Analytics ফিচারটি নেই। প্ল্যান আপগ্রেড করতে সুপারএডমিনের সাথে যোগাযোগ করুন।",
  ),
);

router.get("/stats", getAnalyticsStats);

export default router;
