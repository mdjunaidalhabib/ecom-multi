import express from "express";
import { shopOwnerOnly } from "../../middlewares/adminAuthMiddleware.js";
import {
  listStaff,
  inviteStaff,
  updateStaffStatus,
  updateStaffPermissions,
  removeStaff,
} from "../../../controllers/shop/staff.admin.controller.js";

const router = express.Router();

// ⚠️ এই রুটের আগেই global `protect, requireShopContext` বসানো আছে
// (দেখুন routes/admin/index.js), তাই req.admin ও req.shopId এখানে থাকে।
// শুধু শপ owner (role === "admin") স্টাফ ম্যানেজ করতে পারবে, staff নিজে না।
router.use(shopOwnerOnly);

router.get("/", listStaff);
router.post("/", inviteStaff);
router.patch("/:staffId/status", updateStaffStatus);
router.patch("/:staffId/permissions", updateStaffPermissions);
router.delete("/:staffId", removeStaff);

export default router;
