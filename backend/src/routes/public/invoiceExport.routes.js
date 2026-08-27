import express from "express";
import crypto from "node:crypto";
import Order from "../../models/Order.js";
import invoiceExportService from "../../services/invoiceExportService.js";

const router = express.Router();

const DOWNLOAD_TTL_MS = 2 * 60 * 1000; // ২ মিনিট
const CLEANUP_INTERVAL_MS = 30 * 1000;

// downloadId -> { buffer, filename, expiresAt }
const downloads = new Map();

const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [id, entry] of downloads) {
    if (entry.expiresAt <= now) downloads.delete(id);
  }
}, CLEANUP_INTERVAL_MS);
cleanupTimer.unref?.();

function buildFilename(order) {
  const ref = order.orderNumber ?? String(order._id).slice(-6).toUpperCase();
  return `invoice-${ref}.pdf`;
}

/**
 * ✅ POST /invoices/:id/export-pdf — headless Chromium (invoiceExportService.js)
 * দিয়ে PDF জেনারেট করে buffer-টা কিছুক্ষণের জন্য মেমোরিতে রাখে, PDF bytes এখানে
 * সরাসরি রিটার্ন করে না — শুধু একটা downloadId ফেরত দেয়। আসল ফাইল নিচের GET
 * রুট থেকে নামানো হয় (two-step flow), কারণ blob/XHR দিয়ে ডাউনলোড ট্রিগার করলে
 * Internet Download Manager-এর মতো ব্রাউজার-ইন্টিগ্রেটেড ডাউনলোড ম্যানেজার
 * blob: URL রিফেচ করতে না পেরে সাইলেন্টলি ফেইল করে।
 */
router.post("/:id/export-pdf", async (req, res) => {
  // ✅ ক্লায়েন্ট "বাতিল" বাটনে ক্লিক করলে fetch(...).signal.abort() কল হয়,
  // যেটা এই কানেকশনটাই বন্ধ করে দেয় — সেই সিগন্যাল এখানে ধরে
  // invoiceExportService-কে জানানো হচ্ছে যাতে চলমান Chromium ট্যাবটাও সাথে
  // সাথে বন্ধ হয়ে যায়, নাহলে কেউ ব্যবহারই করবে না এমন একটা PDF-এর জন্য
  // সার্ভার রিসোর্স ব্যয় হতেই থাকত।
  const controller = new AbortController();
  req.on("close", () => {
    if (!res.writableEnded) controller.abort();
  });

  try {
    const order = await Order.findById(req.params.id).select("_id orderNumber");
    if (!order) return res.status(404).json({ message: "অর্ডার খুঁজে পাওয়া যায়নি" });

    const buffer = await invoiceExportService.generatePdf(order._id.toString(), {
      signal: controller.signal,
    });

    const downloadId = crypto.randomBytes(24).toString("hex");
    downloads.set(downloadId, {
      buffer,
      filename: buildFilename(order),
      expiresAt: Date.now() + DOWNLOAD_TTL_MS,
    });

    res.json({ downloadId });
  } catch (err) {
    if (err.name === "AbortError") return; // ক্লায়েন্ট নিজেই কানেকশন বন্ধ করেছে, রেসপন্স দেওয়ার কিছু নেই

    if (err.name !== "ServerBusyError") console.error("❌ Invoice PDF export error:", err);
    const status = err.statusCode || 500;
    res.status(status).json({
      message: err.statusCode ? err.message : "ইনভয়েস PDF তৈরি করতে সমস্যা হয়েছে",
    });
  }
});

/**
 * ✅ GET /invoices/export-pdf/:downloadId — প্লেইন ফাইল ডাউনলোড, কোনো auth
 * হেডার ছাড়াই ইচ্ছাকৃতভাবে (একটা প্লেইন ব্রাউজার ডাউনলোডে Authorization
 * হেডার অ্যাটাচ করা যায় না) — downloadId নিজেই unguessable (crypto-random)
 * + অল্প সময়ের TTL-ই একমাত্র সুরক্ষা। প্রথমবার GET হলেই এন্ট্রি ডিলিট করা হয়
 * না — ডাউনলোড ম্যানেজার (IDM ইত্যাদি) সাধারণত আগে একটা HEAD/probe রিকোয়েস্ট
 * পাঠায় (এই একই হ্যান্ডলারেই রুট হয়), সেখানে ডিলিট করলে আসল ডাউনলোডটাই
 * 404 হয়ে যাবে। শুধু TTL এক্সপায়ারিতেই ডিলিট হয়।
 */
router.get("/export-pdf/:downloadId", (req, res) => {
  const entry = downloads.get(req.params.downloadId);
  if (!entry || entry.expiresAt <= Date.now()) {
    return res.status(404).json({ message: "ডাউনলোড লিংকের মেয়াদ শেষ হয়ে গেছে" });
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${entry.filename}"`);
  res.send(entry.buffer);
});

export default router;
