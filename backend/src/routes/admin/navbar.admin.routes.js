import express from "express";
import Navbar from "../../models/Navbar.js";
import upload from "../../../utils/r2/upload.js"; // multer
import { deleteByKey, uploadToR2 } from "../../../utils/r2/r2Helpers.js";
import sharp from "sharp";

/**
 * ✅ FAVICON_SIZE — browser tab icon হিসেবে ব্যবহারের জন্য ছোট PNG সাইজ।
 * আগে navbar.brand.logo (আসল branding logo, বড়/WEBP) সরাসরি favicon হিসেবে
 * পাঠানো হতো, যেটা ব্রাউজার ট্যাবে pixelated/blurry দেখাতো। এখন upload এর
 * সময়ই একটা আলাদা ছোট favicon variant বানিয়ে R2-তে আলাদাভাবে সেভ করা হয়।
 */
const FAVICON_SIZE = 64;

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

      data.brand = data.brand || {};
      data.brand.logo = "";
      data.brand.logoPublicId = "";
      data.brand.favicon = "";
      data.brand.faviconPublicId = "";
      delete data.removeLogo;
    }

    // Handle logo upload
    if (req.file) {
      // delete old logo + old favicon by key
      if (navbar?.brand?.logoPublicId) {
        await deleteByKey(navbar.brand.logoPublicId);
      }
      if (navbar?.brand?.faviconPublicId) {
        await deleteByKey(navbar.brand.faviconPublicId);
      }

      // ✅ ছোট favicon variant বানাও (ব্রাউজার আসল logo file delete হওয়ার আগেই,
      // কারণ diskStorage হলে uploadToR2 upload শেষে local temp file unlink করে দেয়)
      const faviconBuffer = await sharp(req.file.path)
        .resize(FAVICON_SIZE, FAVICON_SIZE, { fit: "cover" })
        .png()
        .toBuffer();

      // upload new logo to NAVBAR folder
      const uploaded = await uploadToR2(
        req.file,
        `shops/${req.shopStorageNumber}/navbar_logos`,
      );

      // upload favicon variant to its own folder
      const faviconUploaded = await uploadToR2(
        {
          buffer: faviconBuffer,
          mimetype: "image/png",
          originalname: "favicon.png",
        },
        `shops/${req.shopStorageNumber}/navbar_favicons`,
      );

      data.brand = data.brand || {};
      data.brand.logo = uploaded.url;
      data.brand.logoPublicId = uploaded.key;
      data.brand.favicon = faviconUploaded.url;
      data.brand.faviconPublicId = faviconUploaded.key;
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
