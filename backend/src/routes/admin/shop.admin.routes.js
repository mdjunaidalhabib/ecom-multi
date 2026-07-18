import express from "express";
import {
  protect,
  superAdminOnly,
} from "../../middlewares/adminAuthMiddleware.js";
import {
  listShops,
  getShopById,
  createShop,
  updateShop,
  updateShopStatus,
  verifyShopDomain,
} from "../../../controllers/shop/admin.shop.controller.js";
import {
  listShopAdmins,
  inviteShopAdmin,
  removeShopAdmin,
} from "../../../controllers/shop/admin.shopAdmins.controller.js";

const router = express.Router();

// ⚠️ ইচ্ছাকৃতভাবে `requireShopContext` middleware এখানে নেই — কারণ এই
// রুটগুলো নিজেই শপ তৈরি/ম্যানেজ করে, কোনো "active shop" select করার আগেই
// এগুলো কাজ করতে হবে। শুধু superadmin হলেই যথেষ্ট।
router.use(protect, superAdminOnly);

router.get("/", listShops);
router.post("/", createShop);
router.get("/:id", getShopById);
router.patch("/:id", updateShop);
router.patch("/:id/status", updateShopStatus);
router.post("/:id/verify-domain", verifyShopDomain);

// ✅ Shop-এ Admin/Staff assign করা
router.get("/:id/admins", listShopAdmins);
router.post("/:id/admins", inviteShopAdmin);
router.delete("/:id/admins/:adminId", removeShopAdmin);

export default router;
