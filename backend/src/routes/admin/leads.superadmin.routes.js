import express from "express";
import { protect, superAdminOnly } from "../../middlewares/adminAuthMiddleware.js";
import { listLeads, updateLead, summarizeLeads } from "../../../controllers/lead.controller.js";
const router = express.Router();
router.use(protect, superAdminOnly);
router.get("/summary", summarizeLeads);
router.get("/", listLeads);
router.patch("/:id", updateLead);
export default router;
