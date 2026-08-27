import express from "express";

import authRoutes from "./auth.routes.js";
import productRoutes from "./product.routes.js";
import categoryRoutes from "./category.routes.js";
import orderRoutes from "./order.routes.js";
import navbarRoutes from "./navbar.routes.js";
import footerRoutes from "./footer.routes.js";
import sliderRoutes from "./slider.routes.js";
import invoiceRoute from "./invoice.js";
import deliveryCharge from "./deliveryCharge.js";
import profileUploadRoutes from "./profileUpload.routes.js";
import userRoutes from "./user.routes.js";
import visitRoutes from "./analytics.js";
import FloatingActionButton from "./FloatingActionButton.route.js";
import homeBadgeRoutes from "./homeBadge.js";
import facebookGroupRoutes from "./facebookGroup.routes.js";
import aboutRoutes from "./about.routes.js";
import paymentMethodRoutes from "./paymentMethod.routes.js";
import promoRoutes from "./promo.routes.js";
import homepagePopupRoutes from "./homepagePopup.route.js";
import privacyPolicyRoutes from "./privacyPolicy.routes.js";
import supportRoutes from "./support.routes.js";
import refundPolicyRoutes from "./refundPolicy.routes.js";
import faqRoutes from "./faq.routes.js";
import shopInfoRoutes from "./shopInfo.routes.js";
import landingPageRoutes from "./landingPage.routes.js";
import invoiceExportRoutes from "./invoiceExport.routes.js";
import { resolveShopByDomain } from "../../tenancy/publicShopResolver.js";

const router = express.Router();

// ✅ /auth নিজে থেকেই শপ resolve করে (Google OAuth state এর মধ্যে দিয়ে,
// কারণ OAuth callback backend-এর নিজের ডোমেইনে আসে, কাস্টমারের শপ
// ডোমেইনে না) — তাই এটা global domain-resolver এর আগে বসানো, বাইপাস করার জন্য
router.use("/auth", authRoutes);

// ✅ headless Chromium (invoiceExportService.js) সরাসরি backend-কে হিট করে,
// কোনো শপ ডোমেইন/স্লাগ হেডার ছাড়াই — তাই /print/invoice ও /invoices দুটোই
// domain-resolver এর আগে বসানো (একই invoiceRoute রি-ইউজ করা হচ্ছে, কারণ
// সেটা req.shop/req.shopId এর উপর নির্ভর করে না, order.shopId দিয়ে নিজে থেকেই
// শপ resolve করে)। export-pdf রুট দুটোও একই কারণে ইচ্ছাকৃতভাবে unauthenticated —
// অর্ডার-আইডি/ডাউনলোড-আইডি নিজেই unguessable secret হিসেবে কাজ করে।
router.use("/print/invoice", invoiceRoute);
router.use("/invoices", invoiceExportRoutes);

// ✅ এর নিচের সব রুট কাস্টমার যে ডোমেইন থেকে হিট করছে সেটা দিয়ে শপ resolve করবে
router.use(resolveShopByDomain);

router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/orders", orderRoutes);
router.use("/navbar", navbarRoutes);
router.use("/footer", footerRoutes);
router.use("/slider-images", sliderRoutes);
router.use("/invoice", invoiceRoute);
router.use("/deliveryCharge", deliveryCharge);
router.use("/profile", profileUploadRoutes);
router.use("/users", userRoutes); 
router.use("/visit", visitRoutes); 
router.use("/contact-button", FloatingActionButton);
router.use("/homeBadges", homeBadgeRoutes);
router.use("/facebook-group", facebookGroupRoutes);
router.use("/about", aboutRoutes);
router.use("/payment-methods", paymentMethodRoutes);
router.use("/promos", promoRoutes);
router.use("/homepage-popup", homepagePopupRoutes);
router.use("/privacy-policy", privacyPolicyRoutes);
router.use("/support", supportRoutes);
router.use("/refund-policy", refundPolicyRoutes);
router.use("/faq", faqRoutes);
router.use("/shop-info", shopInfoRoutes);
router.use("/landing-pages", landingPageRoutes);

export default router;
