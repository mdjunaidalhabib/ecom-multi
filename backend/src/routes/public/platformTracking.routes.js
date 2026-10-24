import express from "express";
import { getPublicPlatformTracking } from "../../../controllers/shop/tracking.admin.controller.js";

const router = express.Router();

// FINAL path: GET /platform-tracking
router.get("/", getPublicPlatformTracking);

export default router;
