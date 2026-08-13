import express from "express";
import {
  protect,
  superAdminOnly,
} from "../../middlewares/adminAuthMiddleware.js";
import {
  getThemeSettings,
  updateThemeSettings,
} from "../../../controllers/shop/themeSettings.admin.controller.js";

const router = express.Router();

// ⚠️ shop.admin.routes.js এর মতোই — platform-wide settings, কোনো "active
// shop" select করার দরকার নেই, তাই শুধু superadmin হলেই যথেষ্ট।
router.use(protect, superAdminOnly);

router.get("/", getThemeSettings);
router.put("/", updateThemeSettings);

export default router;
