import { getPlatformSettings } from "../../src/models/PlatformSettings.js";

const PLANS = ["free", "starter", "pro"];
const BOOLEAN_KEYS = ["customDomain", "analytics", "promo"];
const NUMBER_KEYS = ["maxProducts", "maxAdmins"];

/* -------------------------------------------------------
   GET /admin/plan-features — plan → feature access mapping পড়া
------------------------------------------------------- */
export const getPlanFeatureSettings = async (req, res) => {
  try {
    const settings = await getPlatformSettings();
    return res.json({ planFeatures: settings.planFeatures });
  } catch (err) {
    console.error("getPlanFeatureSettings error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* -------------------------------------------------------
   PUT /admin/plan-features — plan → feature access mapping আপডেট
------------------------------------------------------- */
export const updatePlanFeatureSettings = async (req, res) => {
  try {
    const { planFeatures } = req.body || {};
    if (!planFeatures || typeof planFeatures !== "object") {
      return res.status(400).json({ message: "planFeatures প্রয়োজন" });
    }

    const settings = await getPlatformSettings();

    for (const plan of PLANS) {
      const incoming = planFeatures[plan];
      if (!incoming || typeof incoming !== "object") continue;

      for (const key of BOOLEAN_KEYS) {
        if (incoming[key] !== undefined) {
          settings.planFeatures[plan][key] = !!incoming[key];
        }
      }

      for (const key of NUMBER_KEYS) {
        if (incoming[key] !== undefined) {
          const num = Number(incoming[key]);
          if (!Number.isFinite(num) || num < 0) {
            return res.status(400).json({
              message: `${plan} প্ল্যানের ${key}-এর জন্য অবৈধ মান`,
            });
          }
          settings.planFeatures[plan][key] = Math.floor(num);
        }
      }
    }

    await settings.save();
    return res.json({ planFeatures: settings.planFeatures });
  } catch (err) {
    console.error("updatePlanFeatureSettings error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
