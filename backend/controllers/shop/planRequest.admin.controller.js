import Shop from "../../src/models/Shop.js";
import PlanChangeRequest from "../../src/models/PlanChangeRequest.js";
import Plan from "../../src/models/Plan.js";
import Product from "../../src/models/Product.js";
import { getPlanFeatures } from "../../src/services/planFeatureService.js";

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

    const planExists = await Plan.exists({ key: requestedPlan });
    if (!planExists) {
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

    // ✅ ডাউনগ্রেড রিকোয়েস্ট করার আগেই যদি বর্তমান প্রোডাক্ট সংখ্যা নতুন
    // প্ল্যানের limit-এর বেশি হয়, শপ-অ্যাডমিনকে সাথে সাথে জানিয়ে দেওয়া হচ্ছে —
    // approve হওয়ার পর নতুন প্রোডাক্ট অ্যাড ব্লক হয়ে যাবে যতক্ষণ না কমানো হয়
    // (অনুরোধ জমা দেওয়া আটকানো হচ্ছে না, শুধু আগে থেকে সতর্ক করা হচ্ছে)
    const requestedFeatures = await getPlanFeatures(requestedPlan);
    const currentProductCount = await Product.countDocuments({ shopId: shop._id });
    const overLimitWarning =
      currentProductCount > requestedFeatures.maxProducts
        ? `⚠️ আপনার শপে বর্তমানে ${currentProductCount}টি প্রোডাক্ট আছে, কিন্তু "${requestedPlan}" প্ল্যানে সর্বোচ্চ ${requestedFeatures.maxProducts}টি অনুমোদিত। অনুমোদনের পর পুরনো প্রোডাক্ট অক্ষত থাকবে, কিন্তু নতুন প্রোডাক্ট যোগ করা যাবে না যতক্ষণ না লিমিটের নিচে আনা হয়।`
        : null;

    res.status(201).json({ ...request.toObject(), overLimitWarning });
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
