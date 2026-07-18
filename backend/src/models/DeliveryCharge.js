import mongoose from "mongoose";
import tenantPlugin from "../tenancy/tenantPlugin.js";

const deliveryChargeSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      unique: true,
      index: true,
    },

    fee: { type: Number, required: true, default: 0 },
    // ✅ Checkout পেজে যে টেক্সট দেখানো হয় (যেমন: "🚚 ডেলিভারি চার্জ"),
    // সেটা এখন admin panel থেকে কাস্টমাইজ করা যাবে।
    label: { type: String, default: "🚚 ডেলিভারি চার্জ", trim: true },
  },
  { timestamps: true }
);

deliveryChargeSchema.plugin(tenantPlugin);

export default mongoose.models.DeliveryCharge ||
  mongoose.model("DeliveryCharge", deliveryChargeSchema);
