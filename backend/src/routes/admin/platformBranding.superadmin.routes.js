import express from "express";
import { protect, superAdminOnly } from "../../middlewares/adminAuthMiddleware.js";
import { getPlatformSettings } from "../../models/PlatformSettings.js";
import { faviconUpload } from "../../../utils/r2/upload.js";
import { deleteByKey, uploadToR2 } from "../../../utils/r2/r2Helpers.js";
import {
  validateFaviconInputFile,
  convertToFaviconWebp,
  safeUnlink,
} from "../../../utils/branding/favicon.helpers.js";

const router = express.Router();

/* -------------------------------------------------------
   GET /admin/platform-branding — যেকোনো লগইন করা admin/staff পড়তে পারে
   (নিজের শপ-admin panel এ "সেট না করলে এটা দেখাবে" বোঝানোর জন্য লাগে)
------------------------------------------------------- */
router.get("/", protect, async (req, res) => {
  try {
    const settings = await getPlatformSettings();
    res.json({
      title: settings.branding?.title || "Hikmah IT",
      favicon: settings.branding?.favicon || "",
    });
  } catch (err) {
    console.error("❌ Error fetching platform branding:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -------------------------------------------------------
   POST /admin/platform-branding — শুধু super-admin এডিট করতে পারে
   (multipart form: title, favicon file, removeFavicon)
------------------------------------------------------- */
router.post("/", protect, superAdminOnly, faviconUpload.single("favicon"), async (req, res) => {
  try {
    const settings = await getPlatformSettings();
    if (!settings.branding) settings.branding = {};

    if (req.body.title !== undefined) {
      const title = String(req.body.title).trim().slice(0, 60);
      // ✅ platform ডিফল্ট কখনো পুরোপুরি খালি রাখা যাবে না (এটাই সবার শেষ
      // ফলব্যাক) — খালি পাঠালে "Hikmah IT" এ ফিরে যায়
      settings.branding.title = title || "Hikmah IT";
    }

    if (req.file) {
      const err = validateFaviconInputFile(req.file);
      if (err) {
        safeUnlink(req.file.path);
        return res.status(400).json({ message: err, code: "INVALID_FAVICON" });
      }

      const convertedPath = await convertToFaviconWebp(req.file.path);
      const uploaded = await uploadToR2(
        { path: convertedPath, mimetype: "image/webp" },
        "platform/branding",
      );
      safeUnlink(req.file.path);
      safeUnlink(convertedPath);

      if (settings.branding.faviconPublicId) {
        await deleteByKey(settings.branding.faviconPublicId);
      }
      settings.branding.favicon = uploaded.url;
      settings.branding.faviconPublicId = uploaded.key;
    } else if (req.body.removeFavicon === "true" || req.body.removeFavicon === true) {
      if (settings.branding.faviconPublicId) {
        await deleteByKey(settings.branding.faviconPublicId);
      }
      settings.branding.favicon = "";
      settings.branding.faviconPublicId = "";
    }

    settings.markModified("branding");
    await settings.save();

    res.json({
      message: "✅ Platform branding আপডেট হয়েছে",
      title: settings.branding.title || "Hikmah IT",
      favicon: settings.branding.favicon || "",
    });
  } catch (err) {
    console.error("❌ Error updating platform branding:", err);
    safeUnlink(req.file?.path);
    res.status(500).json({ message: err.message || "Server error" });
  }
});

export default router;
