import express from "express";
import { protect, superAdminOnly } from "../../middlewares/adminAuthMiddleware.js";
import { getPlatformProjects, updatePlatformProjects } from "../../../controllers/landingPage/platformProjects.controller.js";

const router = express.Router();
router.use(protect, superAdminOnly);
router.get("/", getPlatformProjects);
router.put("/", updatePlatformProjects);
export default router;
