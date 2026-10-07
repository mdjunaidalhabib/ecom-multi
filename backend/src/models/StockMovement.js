import mongoose from "mongoose";
import tenantPlugin from "../tenancy/tenantPlugin.js";

/**
 * ✅ STOCK LEDGER — প্রতিটা stock পরিবর্তনের একটা করে স্থায়ী এন্ট্রি।
 *
 * Product.stock শুধু "এখন কত আছে" বলে, কিন্তু "কেন এত আছে" বলে না। এই
 * ledger থেকে যেকোনো product/অর্ডারের stock কোন কারণে কতটা কমেছে/বেড়েছে
 * দেখা যায় — হিসাব গরমিল হলে উৎস খুঁজে বের করার জন্য।
 *
 * qty signed: নেগেটিভ = stock থেকে বের হয়েছে, পজিটিভ = stock-এ ফেরত এসেছে।
 * এন্ট্রি কখনো edit/delete হয় না; ভুল ঠিক করতে উল্টো এন্ট্রি পড়ে।
 * লেখা হয় services/inventoryService.js থেকে।
 */
export const STOCK_MOVEMENT_REASONS = [
  "order", // অর্ডার তৈরি → stock কাটা
  "cancel", // অর্ডার cancel → stock ফেরত
  "return", // delivered অর্ডার ফেরত → stock ফেরত
  "reopen", // cancelled/returned অর্ডার আবার চালু → stock আবার কাটা
  "qty_edit", // অর্ডারের item quantity বদল
  "initial", // নতুন product তৈরির সময় শুরুর stock
  "manual_adjust", // Admin product এডিট করে হাতে stock বদলেছে
];

const stockMovementSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      index: true,
    },

    productId: { type: String, required: true, index: true },
    productName: { type: String, default: "" },
    color: { type: String, default: null },
    qty: { type: Number, required: true },

    reason: { type: String, enum: STOCK_MOVEMENT_REASONS, required: true },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
      index: true,
    },
    orderNumber: { type: Number, default: null },

    byType: { type: String, default: "system" },
    byId: { type: String, default: null },
    byName: { type: String, default: null },
    note: { type: String, default: "" },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

stockMovementSchema.index({ shopId: 1, productId: 1, createdAt: -1 });

stockMovementSchema.plugin(tenantPlugin);

export default mongoose.models.StockMovement ||
  mongoose.model("StockMovement", stockMovementSchema);
