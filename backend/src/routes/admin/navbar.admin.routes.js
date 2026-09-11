import express from "express";
import Navbar from "../../models/Navbar.js";
import upload from "../../../utils/r2/upload.js"; // multer
import { deleteByKey, uploadToR2 } from "../../../utils/r2/r2Helpers.js";
import { buildBrandIconBuffers } from "../../services/brandIconService.js";

/**
 * ✅ brand logo আপলোড হলে সেখান থেকেই তিনটা derived আইকন বানানো হয় —
 *   • 64×64 favicon  → ব্রাউজার ট্যাব (আসল বড়/WEBP logo ট্যাবে blurry দেখাতো)
 *   • 192 ও 512 PNG  → PWA "Add to Home Screen" install আইকন
 *
 * লজিকটা services/brandIconService.js-এ রাখা, কারণ
 * migrations/backfillBrandPwaIcons.js পুরনো শপগুলোর জন্য হুবহু একই ভ্যারিয়েন্ট
 * বানাতে ওই একই ফাংশনই ব্যবহার করে।
 */

const router = express.Router();

// ✅ GET Navbar (Admin — editing form এর জন্য, active shop অনুযায়ী)
// FINAL path: GET /api/v1/admin/navbar
router.get("/", async (req, res) => {
  try {
    let navbar = await Navbar.findOne();
    if (!navbar) {
      navbar = await Navbar.create({});
    }
    res.json({ navbar });
  } catch (err) {
    console.error("❌ Error fetching navbar (admin):", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ POST Navbar + optional logo upload (Admin only)
// FINAL path: POST /api/v1/admin/navbar
router.post("/", upload.single("logo"), async (req, res) => {
  try {
    let data = { ...req.body };

    // Parse brand JSON string
    if (data.brand && typeof data.brand === "string") {
      try {
        data.brand = JSON.parse(data.brand);
      } catch {
        data.brand = {};
      }
    }

    let navbar = await Navbar.findOne();

    // removeLogo request
    const removeLogo = data.removeLogo === "true";
    if (removeLogo && navbar?.brand?.logoPublicId) {
      await deleteByKey(navbar.brand.logoPublicId);
      if (navbar?.brand?.faviconPublicId) {
        await deleteByKey(navbar.brand.faviconPublicId);
      }

      if (navbar?.brand?.pwaIcon192PublicId) {
        await deleteByKey(navbar.brand.pwaIcon192PublicId);
      }
      if (navbar?.brand?.pwaIcon512PublicId) {
        await deleteByKey(navbar.brand.pwaIcon512PublicId);
      }

      data.brand = data.brand || {};
      data.brand.logo = "";
      data.brand.logoPublicId = "";
      data.brand.favicon = "";
      data.brand.faviconPublicId = "";
      data.brand.pwaIcon192 = "";
      data.brand.pwaIcon192PublicId = "";
      data.brand.pwaIcon512 = "";
      data.brand.pwaIcon512PublicId = "";
      delete data.removeLogo;
    }

    // Handle logo upload
    if (req.file) {
      // delete old logo + old derived icons by key
      if (navbar?.brand?.logoPublicId) {
        await deleteByKey(navbar.brand.logoPublicId);
      }
      if (navbar?.brand?.faviconPublicId) {
        await deleteByKey(navbar.brand.faviconPublicId);
      }
      if (navbar?.brand?.pwaIcon192PublicId) {
        await deleteByKey(navbar.brand.pwaIcon192PublicId);
      }
      if (navbar?.brand?.pwaIcon512PublicId) {
        await deleteByKey(navbar.brand.pwaIcon512PublicId);
      }

      // ✅ সব derived আইকন (favicon + PWA 192/512) আসল logo আপলোড করার
      // *আগেই* বানিয়ে নিতে হয় — diskStorage হলে uploadToR2 আপলোড শেষে
      // local temp file unlink করে দেয়, তখন sharp আর সেটা পড়তে পারবে না।
      const icons = await buildBrandIconBuffers(req.file.path);

      // upload new logo to NAVBAR folder
      const uploaded = await uploadToR2(
        req.file,
        `shops/${req.shopStorageNumber}/navbar_logos`,
      );

      // upload favicon variant to its own folder
      const faviconUploaded = await uploadToR2(
        {
          buffer: icons.favicon,
          mimetype: "image/png",
          originalname: "favicon.png",
        },
        `shops/${req.shopStorageNumber}/navbar_favicons`,
      );

      // ✅ PWA install আইকন (192 + 512) — এগুলোই per-shop manifest-এ যায়,
      // দেখুন frontend/lib/manifest.js
      const [pwa192Uploaded, pwa512Uploaded] = await Promise.all([
        uploadToR2(
          {
            buffer: icons.pwa192,
            mimetype: "image/png",
            originalname: "pwa-icon-192.png",
          },
          `shops/${req.shopStorageNumber}/pwa_icons`,
        ),
        uploadToR2(
          {
            buffer: icons.pwa512,
            mimetype: "image/png",
            originalname: "pwa-icon-512.png",
          },
          `shops/${req.shopStorageNumber}/pwa_icons`,
        ),
      ]);

      data.brand = data.brand || {};
      data.brand.logo = uploaded.url;
      data.brand.logoPublicId = uploaded.key;
      data.brand.favicon = faviconUploaded.url;
      data.brand.faviconPublicId = faviconUploaded.key;
      data.brand.pwaIcon192 = pwa192Uploaded.url;
      data.brand.pwaIcon192PublicId = pwa192Uploaded.key;
      data.brand.pwaIcon512 = pwa512Uploaded.url;
      data.brand.pwaIcon512PublicId = pwa512Uploaded.key;
    } else if (navbar?.brand) {
      // file না এলে আগের logo/publicId রেখে দাও
      data.brand = {
        ...navbar.brand,
        ...(data.brand || {}),
      };
    }

    // Update or create
    if (!navbar) {
      navbar = await Navbar.create(data);
    } else {
      Object.assign(navbar, data);
      navbar.updatedAt = new Date();
      await navbar.save();
    }

    res.json({ message: "✅ Navbar updated successfully", navbar });
  } catch (err) {
    console.error("❌ Error updating navbar:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
