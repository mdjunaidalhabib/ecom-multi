import express from "express";
import multer from "multer";
import { uploadToR2 } from "../../../utils/r2/r2Helpers.js";

const router = express.Router();

// ✅ memory storage for R2 upload (best)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// ✅ POST /profile/avatar
router.post("/avatar", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const uploaded = await uploadToR2(req.file, `shops/${req.shopStorageNumber}/avatars`);
    return res.status(200).json({ url: uploaded.url });
  } catch (error) {
    console.error("❌ Avatar upload route error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
