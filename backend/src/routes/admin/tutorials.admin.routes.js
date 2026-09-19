import express from "express";
import { protect, superAdminOnly } from "../../middlewares/adminAuthMiddleware.js";
import {
  listTutorials,
  createTutorial,
  updateTutorial,
  deleteTutorial,
} from "../../../controllers/shop/tutorials.admin.controller.js";

const router = express.Router();

// ✅ GET যেকোনো লগইন করা admin/staff-এর জন্য (শপ-admin-এর Tutorials পেজ) —
// create/update/delete শুধু super-admin-এর। কোনো "active shop" লাগে না।
router.get("/", protect, listTutorials);
router.post("/", protect, superAdminOnly, createTutorial);
router.patch("/:id", protect, superAdminOnly, updateTutorial);
router.delete("/:id", protect, superAdminOnly, deleteTutorial);

export default router;
