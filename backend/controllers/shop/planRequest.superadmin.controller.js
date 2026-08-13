import Shop from "../../src/models/Shop.js";
import PlanChangeRequest from "../../src/models/PlanChangeRequest.js";
import { getPlanFeatures } from "../../src/services/planFeatureService.js";

const VALID_STATUSES = ["pending", "approved", "rejected"];

/* -------------------------------------------------------
   GET /admin/shops/plan-requests — সব শপের প্ল্যান রিকোয়েস্ট
   (super-admin, cross-shop) — ?status=pending দিয়ে ফিল্টার করা যায়
------------------------------------------------------- */
export const listPlanRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && VALID_STATUSES.includes(status)) filter.status = status;

    const requests = await PlanChangeRequest.find(filter)
      .setOptions({ skipTenantScope: true })
      .populate("shopId", "name slug plan")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    console.error("❌ listPlanRequests error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* -------------------------------------------------------
   PATCH /admin/shops/plan-requests/:id/review — approve/reject
   approve হলে শপের plan + limits সাথে সাথে আপডেট হয়ে যায়
------------------------------------------------------- */
export const reviewPlanRequest = async (req, res) => {
  try {
    const { action, reviewNote } = req.body;
    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    const request = await PlanChangeRequest.findById(
      req.params.id,
    ).setOptions({ skipTenantScope: true });
    if (!request) return res.status(404).json({ message: "Request not found" });
    if (request.status !== "pending") {
      return res
        .status(400)
        .json({ message: "এই রিকোয়েস্ট ইতিমধ্যে পর্যালোচনা করা হয়েছে" });
    }

    if (action === "approve") {
      const shop = await Shop.findById(request.shopId).setOptions({
        skipTenantScope: true,
      });
      if (!shop) return res.status(404).json({ message: "Shop not found" });

      const planFeatures = await getPlanFeatures(request.requestedPlan);
      shop.plan = request.requestedPlan;
      shop.limits = {
        maxProducts: planFeatures.maxProducts,
        maxAdmins: planFeatures.maxAdmins,
      };
      await shop.save();

      request.status = "approved";
    } else {
      request.status = "rejected";
    }

    request.reviewedBy = req.admin?._id || null;
    request.reviewedAt = new Date();
    request.reviewNote = reviewNote ? String(reviewNote).trim().slice(0, 500) : "";
    await request.save();

    res.json(request);
  } catch (err) {
    console.error("❌ reviewPlanRequest error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};
