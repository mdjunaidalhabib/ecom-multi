import express from "express";
import SiteBranding from "../../models/SiteBranding.js";
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
   GET /admin/site-branding — এই শপের browserTitle/favicon override
   (blank থাকলে সুপার-অ্যাডমিনের প্ল্যাটফর্ম ডিফল্ট দেখানো হয়, যাতে admin
   বুঝতে পারে কিছু সেট না করলে কী দেখাবে)
------------------------------------------------------- */
router.get("/", async (req, res) => {
  try {
    let branding = await SiteBranding.findOne();
    if (!branding) {
      branding = await SiteBranding.create({});
    }
    const platformSettings = await getPlatformSettings();

    res.json({
      browserTitle: branding.browserTitle || "",
      favicon: branding.favicon || "",
      // ✅ শুধু তথ্যের জন্য — override না দিলে এটাই কার্যকর হবে
      platformDefault: {
        title: platformSettings.branding?.title || "Hikmah IT",
        favicon: platformSettings.branding?.favicon || "",
      },
    });
  } catch (err) {
    console.error("❌ Error fetching site branding (admin):", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -------------------------------------------------------
   POST /admin/site-branding — browserTitle সেট/ক্লিয়ার + favicon
   upload/replace (multipart form: browserTitle, favicon file, removeFavicon)
------------------------------------------------------- */
router.post("/", faviconUpload.single("favicon"), async (req, res) => {
  try {
    let branding = await SiteBranding.findOne();
    if (!branding) branding = new SiteBranding({});

    // ✅ খালি স্ট্রিং পাঠালে override মুছে প্ল্যাটফর্ম ডিফল্টে ফিরে যাবে
    if (req.body.browserTitle !== undefined) {
      branding.browserTitle = String(req.body.browserTitle).trim().slice(0, 60);
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
        `shops/${req.shopStorageNumber}/branding`,
      );
      safeUnlink(req.file.path);
      safeUnlink(convertedPath);

      if (branding.faviconPublicId) {
        await deleteByKey(branding.faviconPublicId);
      }
      branding.favicon = uploaded.url;
      branding.faviconPublicId = uploaded.key;
    } else if (req.body.removeFavicon === "true" || req.body.removeFavicon === true) {
      if (branding.faviconPublicId) {
        await deleteByKey(branding.faviconPublicId);
      }
      branding.favicon = "";
      branding.faviconPublicId = "";
    }

    branding.updatedAt = new Date();
    await branding.save();

    const platformSettings = await getPlatformSettings();
    res.json({
      message: "✅ Branding আপডেট হয়েছে",
      browserTitle: branding.browserTitle || "",
      favicon: branding.favicon || "",
      platformDefault: {
        title: platformSettings.branding?.title || "Hikmah IT",
        favicon: platformSettings.branding?.favicon || "",
      },
    });
  } catch (err) {
    console.error("❌ Error updating site branding:", err);
    safeUnlink(req.file?.path);
    res.status(500).json({ message: err.message || "Server error" });
  }
});

export default router;
