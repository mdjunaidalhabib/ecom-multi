import Shop from "../../src/models/Shop.js";
import PlanChangeRequest from "../../src/models/PlanChangeRequest.js";

const VALID_PLANS = ["free", "starter", "pro"];

/* -------------------------------------------------------
   POST /admin/plan-requests — লগইন করা admin/staff-এর শপের জন্য
   প্ল্যান আপগ্রেড/ডাউনগ্রেড রিকোয়েস্ট তৈরি করে। একই শপের একাধিক
   pending রিকোয়েস্ট থাকতে দেওয়া হয় না।
------------------------------------------------------- */
export const createPlanRequest = async (req, res) => {
  try {
    const shop =
      req.shop ||
      (await Shop.findById(req.shopId).setOptions({ skipTenantScope: true }));
    if (!shop) return res.status(404).json({ message: "Shop not found" });

    const { requestedPlan, note } = req.body;

    if (!VALID_PLANS.includes(requestedPlan)) {
      return res.status(400).json({ message: "Invalid requested plan" });
    }
    if (requestedPlan === shop.plan) {
      return res
        .status(400)
        .json({ message: "আপনার শপ ইতিমধ্যে এই প্ল্যানে আছে" });
    }

    const existingPending = await PlanChangeRequest.findOne({
      shopId: shop._id,
      status: "pending",
    });
    if (existingPending) {
      return res.status(400).json({
        message: "আপনার একটি প্ল্যান পরিবর্তনের অনুরোধ ইতিমধ্যে পর্যালোচনাধীন আছে",
      });
    }

    const request = await PlanChangeRequest.create({
      shopId: shop._id,
      currentPlan: shop.plan,
      requestedPlan,
      note: note ? String(note).trim().slice(0, 500) : "",
      requestedBy: req.admin?._id || null,
    });

    res.status(201).json(request);
  } catch (err) {
    console.error("❌ createPlanRequest error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

/* -------------------------------------------------------
   GET /admin/plan-requests — এই শপের নিজের প্ল্যান রিকোয়েস্ট হিস্টোরি
------------------------------------------------------- */
export const listMyPlanRequests = async (req, res) => {
  try {
    const requests = await PlanChangeRequest.find({ shopId: req.shopId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(requests);
  } catch (err) {
    console.error("❌ listMyPlanRequests error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
