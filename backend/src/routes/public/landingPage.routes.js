import express from "express";
import { getPublishedLandingPageBySlug } from "../../../controllers/landingPage/public.landingPage.controller.js";

const router = express.Router();

// FINAL path: GET /landing-pages/by-slug/:slug
router.get("/by-slug/:slug", getPublishedLandingPageBySlug);

export default router;
