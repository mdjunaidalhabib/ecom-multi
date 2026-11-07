import express from "express";
import { formToken, leadSubmissionLimit, submitLead } from "../../../controllers/lead.controller.js";
const router = express.Router();
router.get("/form-token", formToken);
router.post("/", leadSubmissionLimit, submitLead);
export default router;
