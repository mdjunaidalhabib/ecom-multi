import express from "express";

import adminAuthRoutes from "./admin.routes.js";
import productAdminRoutes from "./product.admin.routes.js";
import orderAdminRoutes from "./order.admin.routes.js";
import usersAdminRoutes from "./users.admin.routes.js";
import navbarAdminRoutes from "./navbar.admin.routes.js";
import footerAdminRoutes from "./footer.admin.routes.js";
import courierSettingsAdminRoutes from "./courierSettings.admin.routes.js";
import categoryAdminRoutes from "./category.admin.routes.js";
import slidersAdminRoutes from "./slider.admin.routes.js";
import steadfastRoutes from "./steadfast.admin.routes.js";
import deliveryChargeAdmin from "./deliveryCharge.admin.js";
import orderMailSend from "./order-mail-send.js";
import courierStatusRouter from "./courierStatus.js";
import courierLiveRouter from "./courierLive.js";
import FloatingActionButton from "./FloatingActionButton.admin.route.js";
import homeBadgeAdminRoutes from "./homeBadge.admin.js";
import facebookGroupAdminRoutes from "./facebookGroup.admin.routes.js";
import trashAdminRoutes from "./trash.admin.routes.js";
import aboutAdminRoutes from "./about.admin.routes.js";
import paymentsAdminRoutes from "./payments.admin.routes.js";
import shopAdminRoutes from "./shop.admin.routes.js";

import { protect } from "../../middlewares/adminAuthMiddleware.js";
import { requireShopContext } from "../../tenancy/adminShopContext.js";

const router = express.Router();

// ✅ /login, /logout, /verify, /me ইত্যাদি — নিজস্ব protect ব্যবহার করে,
// শপ-কনটেক্সট লাগবে না, তাই global middleware এর আগেই বসানো
router.use("/", adminAuthRoutes);

// ✅ Shop management (create/list/suspend shop) — superadmin-only, কিন্তু
// কোনো "active shop" select করা ছাড়াই কাজ করতে হবে, তাই এটাও
// global requireShopContext এর আগেই বসানো (নিজস্ব protect+superAdminOnly আছে)
router.use("/shops", shopAdminRoutes);

// ✅ এখান থেকে নিচের সব admin route এর জন্য valid admin session +
// active shop context বাধ্যতামূলক (আগে অনেক রুটে কোনো auth check-ই ছিল না —
// এটা সেটাও ফিক্স করে দিচ্ছে)
router.use(protect, requireShopContext);

router.use("/products", productAdminRoutes);
router.use("/orders", orderAdminRoutes);
router.use("/users", usersAdminRoutes);
router.use("/navbar", navbarAdminRoutes);
router.use("/footer", footerAdminRoutes);
router.use("/sliders", slidersAdminRoutes);
router.use("/", courierSettingsAdminRoutes);
router.use("/categories", categoryAdminRoutes);
router.use("/api", steadfastRoutes);
router.use("/DeliveryCharge", deliveryChargeAdmin);
router.use("/order-mail-send", orderMailSend);
router.use("/api/courier", courierStatusRouter);
router.use("/api/courier", courierLiveRouter);
router.use("/contact-button", FloatingActionButton);
router.use("/homeBadges", homeBadgeAdminRoutes);
router.use("/facebook-group", facebookGroupAdminRoutes);
router.use("/trash", trashAdminRoutes);
router.use("/about", aboutAdminRoutes);
router.use("/payments", paymentsAdminRoutes);

export default router;
