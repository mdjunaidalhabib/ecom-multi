import express from "express";
import { protect, superAdminOnly } from "../../middlewares/adminAuthMiddleware.js";
import {
  listThemes,
  createTheme,
  updateTheme,
  deleteTheme,
} from "../../../controllers/shop/themes.admin.controller.js";

const router = express.Router();

// ✅ GET শুধু লগইন করা যেকোনো admin/staff-এর জন্য (shop-admin-এর "My Plan"
// পেজে প্ল্যান তুলনার সময় থিমের নাম দেখাতে লাগে) — create/update/delete
// শুধু super-admin-এর (Plans/Shops পেজের থিম dropdown ম্যানেজ করে)
router.get("/", protect, listThemes);
router.post("/", protect, superAdminOnly, createTheme);
router.patch("/:id", protect, superAdminOnly, updateTheme);
router.delete("/:id", protect, superAdminOnly, deleteTheme);

export default router;
