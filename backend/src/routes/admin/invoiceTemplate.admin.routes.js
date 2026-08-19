import express from "express";
import { invoiceBgUpload } from "../../../utils/r2/upload.js";
import { requirePlanFeature } from "../../middlewares/requirePlanFeature.js";
import { requirePermission } from "../../middlewares/adminAuthMiddleware.js";
import {
  getResolvedTemplate,
  getMyTemplate,
  saveMyTemplate,
  uploadBackgroundImage,
} from "../../../controllers/invoice/invoiceTemplate.admin.controller.js";

const router = express.Router();

const FEATURE_MESSAGE =
  "আপনার বর্তমান প্ল্যানে Invoice Design ফিচারটি নেই। প্ল্যান আপগ্রেড করতে সুপারএডমিনের সাথে যোগাযোগ করুন।";

// ✅ যেকোনো admin/staff (orders-এ অ্যাক্সেস থাকলেই) একটা invoice ডাউনলোড
// করতে পারবে — তাই এই রুটে plan-gate বা "invoiceDesign" permission-gate
// কোনোটাই নেই (নন-Pro শপ প্ল্যাটফর্ম ডিফল্ট টেমপ্লেট পাবে)। শুধু নিচের
// /mine* রুটগুলো (আসল ডিজাইন এডিট) — plan + staff permission দুটোই লাগে।
router.get("/resolved", getResolvedTemplate);

router.use(requirePermission("invoiceDesign"));

router.get("/mine", requirePlanFeature("invoiceCustomization", FEATURE_MESSAGE), getMyTemplate);
router.put("/mine", requirePlanFeature("invoiceCustomization", FEATURE_MESSAGE), saveMyTemplate);
router.post(
  "/mine/background",
  requirePlanFeature("invoiceCustomization", FEATURE_MESSAGE),
  invoiceBgUpload.single("image"),
  uploadBackgroundImage,
);

export default router;
