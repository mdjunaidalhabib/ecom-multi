import express from "express";
import { landingHeroUpload } from "../../../utils/r2/upload.js";
import { requirePlanFeature } from "../../middlewares/requirePlanFeature.js";
import {
  listLandingPages,
  getLandingPageById,
  createLandingPage,
  updateLandingPage,
  deleteLandingPage,
  uploadHeroImages,
} from "../../../controllers/landingPage/admin.landingPage.controller.js";

const router = express.Router();

// ✅ Landing Pages plan-gated — শুধু landingPages ফিচার চালু থাকা প্ল্যানেই
// (দেখুন PlatformSettings.planFeatures, super admin Settings > Plan Features থেকে ম্যানেজ করে)
router.use(
  requirePlanFeature(
    "landingPages",
    "আপনার বর্তমান প্ল্যানে Landing Page ফিচারটি নেই। প্ল্যান আপগ্রেড করতে সুপারএডমিনের সাথে যোগাযোগ করুন।",
  ),
);

router.get("/", listLandingPages);
router.post("/", createLandingPage);
router.get("/:id", getLandingPageById);
router.put("/:id", updateLandingPage);
router.delete("/:id", deleteLandingPage);
router.post("/:id/hero-images", landingHeroUpload.array("images", 5), uploadHeroImages);

export default router;
