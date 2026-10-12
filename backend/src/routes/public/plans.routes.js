import express from "express";
import {
  listPublicPlans,
  getPublicPlan,
} from "../../../controllers/shop/public.plans.controller.js";

const router = express.Router();

// GET /plans        → দৃশ্যমান সব প্ল্যান (দাম, লিমিট, ফিচারসহ)
// GET /plans/:key   → একটি প্ল্যান
router.get("/", listPublicPlans);
router.get("/:key", getPublicPlan);

export default router;
