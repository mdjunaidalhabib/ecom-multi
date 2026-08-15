import express from "express";
import Order from "../../models/Order.js";
import { resolveInvoiceTemplateForShop } from "../../services/invoiceTemplateService.js";

const router = express.Router();

/**
 * ✅ GET /invoice/:id — সার্ভার এখানে শুধু ডেটা (order + resolved template)
 * JSON হিসেবে রিটার্ন করে, কোনো PDF জেনারেট/সেভ করে না — PDF ব্রাউজারে
 * (html2canvas + jsPDF দিয়ে) তৈরি হয়। resolveShopByDomain ইতিমধ্যে
 * req.shopId সেট করে দিয়েছে (public/index.js দেখুন), Order.findById
 * tenantPlugin এর কারণে স্বয়ংক্রিয়ভাবে সেই শপে scoped থাকে।
 */
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const { template, shop } = await resolveInvoiceTemplateForShop(order.shopId);
    res.json({ order, template, shop });
  } catch (err) {
    console.error("❌ Invoice data error:", err);
    res.status(500).json({ message: "Error loading invoice data" });
  }
});

export default router;
