import express from "express";
import { protect, superAdminOnly } from "../../middlewares/adminAuthMiddleware.js";
import {
  getShopTracking,
  updateShopTracking,
  getPlatformTracking,
  updatePlatformTracking,
} from "../../../controllers/shop/tracking.admin.controller.js";

// ✅ শপ-মালিকের GTM — index.js এ protect + requireShopContext + requirePermission("settings")
// এর পরে mount করা (FINAL path: /admin/tracking)
export const shopTrackingRoutes = express.Router();
shopTrackingRoutes.get("/", getShopTracking);
shopTrackingRoutes.put("/", updateShopTracking);

// ✅ ECMS প্ল্যাটফর্ম ল্যান্ডিং GTM — শুধু super-admin (FINAL path: /admin/platform-tracking)
export const platformTrackingRoutes = express.Router();
platformTrackingRoutes.get("/", protect, superAdminOnly, getPlatformTracking);
platformTrackingRoutes.put("/", protect, superAdminOnly, updatePlatformTracking);
