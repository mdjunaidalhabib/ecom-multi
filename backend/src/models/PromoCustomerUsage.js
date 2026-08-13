import mongoose from "mongoose";
import tenantPlugin from "../tenancy/tenantPlugin.js";

const promoCustomerUsageSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      index: true,
    },

    promo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Promo",
      required: true,
      index: true,
    },
    customerKey: { type: String, required: true, index: true },
    count: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

promoCustomerUsageSchema.index(
  { promo: 1, customerKey: 1 },
  { unique: true },
);

promoCustomerUsageSchema.plugin(tenantPlugin);

export default mongoose.models.PromoCustomerUsage ||
  mongoose.model("PromoCustomerUsage", promoCustomerUsageSchema);
