import express from "express";
import { protect, superAdminOnly } from "../../middlewares/adminAuthMiddleware.js";
import {
  getAnnouncement,
  updateAnnouncement,
} from "../../../controllers/shop/announcement.admin.controller.js";

const router = express.Router();

// ✅ GET শুধু লগইন করা যেকোনো admin/staff-এর জন্য (My Plan পেজে ব্যানার
// দেখাতে লাগে) — PUT শুধু super-admin-এর
router.get("/", protect, getAnnouncement);
router.put("/", protect, superAdminOnly, updateAnnouncement);

export default router;
