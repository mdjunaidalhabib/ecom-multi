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
  deleteShop,
  listShopTrash,
  restoreDeletedShop,
  permanentDeleteShop,
  emptyShopTrash,
} from "../../../controllers/shop/admin.shop.controller.js";
import {
  listShopAdmins,
  inviteShopAdmin,
  removeShopAdmin,
} from "../../../controllers/shop/admin.shopAdmins.controller.js";
import {
  listPlanRequests,
  reviewPlanRequest,
} from "../../../controllers/shop/planRequest.superadmin.controller.js";

const router = express.Router();

// ⚠️ ইচ্ছাকৃতভাবে `requireShopContext` middleware এখানে নেই — কারণ এই
// রুটগুলো নিজেই শপ তৈরি/ম্যানেজ করে, কোনো "active shop" select করার আগেই
// এগুলো কাজ করতে হবে। শুধু superadmin হলেই যথেষ্ট।
router.use(protect, superAdminOnly);

router.get("/", listShops);
router.post("/", createShop);

// Shop recycle bin routes must be declared before the generic /:id route.
router.get("/trash", listShopTrash);
router.post("/trash/:trashId/restore", restoreDeletedShop);
router.delete("/trash/empty", emptyShopTrash);
router.delete("/trash/:trashId", permanentDeleteShop);

// Plan change requests (cross-shop) — must be declared before the generic
// /:id route, otherwise "/plan-requests" would be swallowed as an :id.
router.get("/plan-requests", listPlanRequests);
router.patch("/plan-requests/:id/review", reviewPlanRequest);

router.get("/:id", getShopById);
router.patch("/:id", updateShop);
router.patch("/:id/status", updateShopStatus);
router.post("/:id/verify-domain", verifyShopDomain);
router.delete("/:id", deleteShop);

// ✅ Shop-এ Admin/Staff assign করা
router.get("/:id/admins", listShopAdmins);
router.post("/:id/admins", inviteShopAdmin);
router.delete("/:id/admins/:adminId", removeShopAdmin);

export default router;
