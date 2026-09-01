import express from "express";

import adminAuthRoutes from "./admin.routes.js";
import productAdminRoutes from "./product.admin.routes.js";
import orderAdminRoutes from "./order.admin.routes.js";
import usersAdminRoutes from "./users.admin.routes.js";
import staffAdminRoutes from "./staff.admin.routes.js";
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
import orderCounterAdmin from "./orderCounter.admin.js";
import promoAdminRoutes from "./promo.admin.routes.js";
import planRequestAdminRoutes from "./planRequest.admin.routes.js";
import analyticsAdminRoutes from "./analytics.admin.routes.js";
import myFeaturesAdminRoutes from "./myFeatures.admin.routes.js";
import plansAdminRoutes from "./plans.admin.routes.js";
import themesAdminRoutes from "./themes.admin.routes.js";
import announcementAdminRoutes from "./announcement.admin.routes.js";
import homepagePopupAdminRoutes from "./homepagePopup.admin.routes.js";
import privacyPolicyAdminRoutes from "./privacyPolicy.admin.routes.js";
import supportAdminRoutes from "./support.admin.routes.js";
import refundPolicyAdminRoutes from "./refundPolicy.admin.routes.js";
import faqAdminRoutes from "./faq.admin.routes.js";
import mailReportAdminRoutes from "./mailReport.admin.routes.js";
import landingPageAdminRoutes from "./landingPage.admin.routes.js";
import invoiceTemplateAdminRoutes from "./invoiceTemplate.admin.routes.js";
import invoiceTemplateDefaultRoutes from "./invoiceTemplateDefault.superadmin.routes.js";

import { protect, requirePermission } from "../../middlewares/adminAuthMiddleware.js";
import { requireShopContext } from "../../tenancy/adminShopContext.js";

const router = express.Router();

// ✅ /login, /logout, /verify, /me ইত্যাদি — নিজস্ব protect ব্যবহার করে,
// শপ-কনটেক্সট লাগবে না, তাই global middleware এর আগেই বসানো
router.use("/", adminAuthRoutes);

// ✅ Shop management (create/list/suspend shop) — superadmin-only, কিন্তু
// কোনো "active shop" select করা ছাড়াই কাজ করতে হবে, তাই এটাও
// global requireShopContext এর আগেই বসানো (নিজস্ব protect+superAdminOnly আছে)
router.use("/shops", shopAdminRoutes);

// ✅ Plan catalog (name/theme/features/limits, super-admin add/edit/delete
// করে) — platform-wide, কোনো "active shop" ছাড়া কাজ করতে হয়, তাই global
// requireShopContext এর আগে বসানো। GET শপ-admin-ও পড়তে পারে (নিজের plan
// upgrade dropdown-এর জন্য), routes ফাইলেই handle করা আছে।
router.use("/plans", plansAdminRoutes);

// ✅ Theme preset catalog (name/baseLayout/colors/fonts, super-admin
// add/edit/delete করে) — /plans-এর মতোই platform-wide, super-admin-only
router.use("/themes", themesAdminRoutes);

// ✅ "শীঘ্রই আসছে" ব্যানার টেক্সট — /plans এর মতোই platform-wide, কোনো
// "active shop" ছাড়াই কাজ করতে হয়, নিজস্ব protect+superAdminOnly(শুধু PUT-এ) আছে
router.use("/announcement", announcementAdminRoutes);

// ✅ প্ল্যাটফর্ম-ওয়াইড ডিফল্ট ইনভয়েস টেমপ্লেট — /shops, /plans এর মতোই কোনো
// "active shop" ছাড়াই কাজ করতে হয় (super-admin কোনো শপ সিলেক্ট না করেই এটা
// এডিট করে), নিজস্ব protect+superAdminOnly আছে routes ফাইলে।
router.use("/invoice-template-default", invoiceTemplateDefaultRoutes);

// ✅ এখান থেকে নিচের সব admin route এর জন্য valid admin session +
// active shop context বাধ্যতামূলক (আগে অনেক রুটে কোনো auth check-ই ছিল না —
// এটা সেটাও ফিক্স করে দিচ্ছে)
router.use(protect, requireShopContext);

router.use("/products", requirePermission("products"), productAdminRoutes);
router.use("/orders", requirePermission("orders"), orderAdminRoutes);
router.use("/users", requirePermission("users"), usersAdminRoutes);
router.use("/staff", staffAdminRoutes);
router.use("/navbar", requirePermission("settings"), navbarAdminRoutes);
router.use("/footer", requirePermission("settings"), footerAdminRoutes);
router.use("/sliders", requirePermission("sliders"), slidersAdminRoutes);
// ⚠️ "/" এ mount করা — সব রিকোয়েস্টের prefix হিসেবে ম্যাচ করে, তাই এখানে
// blanket permission gate বসানো হয়নি (এটা পরের সব route কেও ভুলভাবে
// আটকে দিত)। এর বদলে courierSettings.admin.routes.js এর প্রতিটা route-এ
// আলাদাভাবে requirePermission("settings") বসানো আছে।
router.use("/", courierSettingsAdminRoutes);
router.use("/categories", requirePermission("categories"), categoryAdminRoutes);
router.use("/api", requirePermission("settings"), steadfastRoutes);
router.use("/DeliveryCharge", requirePermission("settings"), deliveryChargeAdmin);
router.use("/order-mail-send", requirePermission("settings"), orderMailSend);
router.use("/api/courier", requirePermission("settings"), courierStatusRouter);
router.use("/api/courier", requirePermission("settings"), courierLiveRouter);
router.use("/contact-button", requirePermission("settings"), FloatingActionButton);
router.use("/homeBadges", requirePermission("settings"), homeBadgeAdminRoutes);
router.use("/facebook-group", requirePermission("settings"), facebookGroupAdminRoutes);
router.use("/trash", requirePermission("trash"), trashAdminRoutes);
router.use("/about", requirePermission("settings"), aboutAdminRoutes);
router.use("/payments", requirePermission("payments"), paymentsAdminRoutes);
router.use("/orderCounter", requirePermission("settings"), orderCounterAdmin);
router.use("/promos", requirePermission("promos"), promoAdminRoutes);
router.use("/plan-requests", requirePermission("plan"), planRequestAdminRoutes);
router.use("/analytics", requirePermission("analytics"), analyticsAdminRoutes);
router.use("/my-features", myFeaturesAdminRoutes);
router.use("/homepage-popup", requirePermission("settings"), homepagePopupAdminRoutes);
router.use("/privacy-policy", requirePermission("settings"), privacyPolicyAdminRoutes);
router.use("/support", requirePermission("settings"), supportAdminRoutes);
router.use("/refund-policy", requirePermission("settings"), refundPolicyAdminRoutes);
router.use("/faq", requirePermission("settings"), faqAdminRoutes);
router.use("/mail-report", requirePermission("settings"), mailReportAdminRoutes);
router.use("/landing-pages", requirePermission("landingPages"), landingPageAdminRoutes);
// ✅ নিজস্ব requirePermission("invoiceDesign") আছে ফাইলের ভেতরে, কিন্তু শুধু
// /mine* রুটে (এডিট) — /resolved (ডাউনলোড) যেকোনো লগইন করা admin/staff-এর
// জন্য উন্মুক্ত থাকতে হবে, তাই এখানে blanket permission gate বসানো হয়নি
// (courierSettingsAdminRoutes-এর মতোই একই কারণে)।
router.use("/invoice-template", invoiceTemplateAdminRoutes);

export default router;
