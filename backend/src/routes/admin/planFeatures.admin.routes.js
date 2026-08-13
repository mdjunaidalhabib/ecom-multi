import express from "express";
import {
  protect,
  superAdminOnly,
} from "../../middlewares/adminAuthMiddleware.js";
import {
  getPlanFeatureSettings,
  updatePlanFeatureSettings,
} from "../../../controllers/shop/planFeatures.admin.controller.js";

const router = express.Router();

// ⚠️ theme-settings/shop.admin.routes.js এর মতোই — platform-wide settings,
// কোনো "active shop" select করার দরকার নেই, তাই শুধু superadmin হলেই যথেষ্ট।
router.use(protect, superAdminOnly);

router.get("/", getPlanFeatureSettings);
router.put("/", updatePlanFeatureSettings);

export default router;
