import express from "express";
import { invoiceBgUpload } from "../../../utils/cloudinary/upload.js";
import { protect, superAdminOnly } from "../../middlewares/adminAuthMiddleware.js";
import {
  getDefaultTemplate,
  saveDefaultTemplate,
  uploadDefaultBackgroundImage,
} from "../../../controllers/invoice/invoiceTemplateDefault.superadmin.controller.js";

const router = express.Router();

// ✅ প্ল্যাটফর্ম-ওয়াইড ডিফল্ট ইনভয়েস টেমপ্লেট — কোনো "active shop" ছাড়াই
// কাজ করতে হয়, তাই এই রুট backend/src/routes/admin/index.js এ global
// requireShopContext এর আগে বসানো (/shops, /plans এর মতোই)।
router.get("/", protect, getDefaultTemplate);
router.put("/", protect, superAdminOnly, saveDefaultTemplate);
router.post(
  "/background",
  protect,
  superAdminOnly,
  invoiceBgUpload.single("image"),
  uploadDefaultBackgroundImage,
);

export default router;
