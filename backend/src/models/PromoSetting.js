import mongoose from "mongoose";
import tenantPlugin from "../tenancy/tenantPlugin.js";

const promoSettingSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      unique: true, // ✅ প্রতি শপের একটাই PromoSetting document
      index: true,
    },

    key: {
      type: String,
      default: "frontend-promo",
      immutable: true,
    },
    showPromoField: { type: Boolean, default: true },
    showAvailabilityMessage: { type: Boolean, default: true },
    availableMessage: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "Promo code থাকলে এখানে ব্যবহার করে discount নিন।",
    },
    unavailableMessage: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "এই মুহূর্তে কোনো promo code available নেই।",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  { timestamps: true },
);

promoSettingSchema.plugin(tenantPlugin);

export const PROMO_SETTING_KEY = "frontend-promo";

export default mongoose.models.PromoSetting ||
  mongoose.model("PromoSetting", promoSettingSchema);
