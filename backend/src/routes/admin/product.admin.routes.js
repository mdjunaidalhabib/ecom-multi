import express from "express";
import { productUpload } from "../../../utils/r2/upload.js";
import {
  createProduct,
  getProductsAdmin,
  getProductByIdAdmin,
  updateProduct,
  deleteProduct,
  bulkSetProductVisibility,
} from "../../../controllers/product/index.js";
import StockMovement from "../../models/StockMovement.js";

const router = express.Router();

router.post("/", productUpload.any(), createProduct);
router.get("/", getProductsAdmin);
router.patch("/bulk-visibility", bulkSetProductVisibility);
router.get("/:id", getProductByIdAdmin);

// ✅ Product-এর stock ledger — কোন অর্ডার/এডিটের কারণে stock কত বেড়েছে/কমেছে
// (নতুন থেকে পুরনো, সর্বোচ্চ ২০০টা এন্ট্রি)
router.get("/:id/stock-movements", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 100, 200);
    const movements = await StockMovement.find({ productId: String(req.params.id) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    res.json({ movements });
  } catch (err) {
    console.error("❌ Failed to fetch stock movements:", err);
    res.status(500).json({ error: "Stock history লোড করা যায়নি" });
  }
});
router.put("/:id", productUpload.any(), updateProduct);
router.delete("/:id", deleteProduct);

export default router;
