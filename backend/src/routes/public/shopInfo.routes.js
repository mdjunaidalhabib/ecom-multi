import express from "express";
import { getShopInfo } from "../../../controllers/shop/public.shop.controller.js";

const router = express.Router();

// ✅ GET Shop info (Public) — storefront frontend-এর জন্য effectiveTheme সহ
// FINAL path: GET /shop-info
router.get("/", getShopInfo);

export default router;
