import express from "express";
import {
  createPlanRequest,
  listMyPlanRequests,
} from "../../../controllers/shop/planRequest.admin.controller.js";

const router = express.Router();

router.get("/", listMyPlanRequests);
router.post("/", createPlanRequest);

export default router;
