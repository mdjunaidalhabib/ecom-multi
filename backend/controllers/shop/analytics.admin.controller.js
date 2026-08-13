import Analytics from "../../src/models/Analytics.js";

/* -------------------------------------------------------
   GET /admin/analytics/stats — লগইন করা admin/staff-এর assigned শপের
   visitor analytics (tenantPlugin req.shopId দিয়ে automatically scope করে)।
   requirePlanFeature("analytics") দিয়ে gate করা — দেখুন
   routes/admin/analytics.admin.routes.js
------------------------------------------------------- */
export const getAnalyticsStats = async (req, res) => {
  try {
    let stats = await Analytics.findOne();
    if (!stats) stats = await Analytics.create({});
    res.json(stats);
  } catch (err) {
    console.error("❌ getAnalyticsStats error:", err);
    res.status(500).json({ message: "Server error fetching analytics" });
  }
};
