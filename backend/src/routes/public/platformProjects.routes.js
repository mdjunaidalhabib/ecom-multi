import express from "express";
import { getPlatformProjects } from "../../../controllers/landingPage/platformProjects.controller.js";

const router = express.Router();
router.get("/", getPlatformProjects);
export default router;
