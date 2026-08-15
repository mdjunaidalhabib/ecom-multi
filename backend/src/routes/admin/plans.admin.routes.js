import express from "express";
import { protect, superAdminOnly } from "../../middlewares/adminAuthMiddleware.js";
import {
  listPlans,
  createPlan,
  updatePlan,
  deletePlan,
} from "../../../controllers/shop/plans.admin.controller.js";

const router = express.Router();

// ✅ GET শুধু লগইন করা যেকোনো admin/staff-এর জন্য (নিজের শপের plan দেখতে/
// upgrade dropdown-এ লাগে) — create/update/delete শুধু super-admin-এর
router.get("/", protect, listPlans);
router.post("/", protect, superAdminOnly, createPlan);
router.patch("/:id", protect, superAdminOnly, updatePlan);
router.delete("/:id", protect, superAdminOnly, deletePlan);

export default router;
