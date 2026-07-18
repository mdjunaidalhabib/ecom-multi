import mongoose from "mongoose";
import tenantPlugin from "../tenancy/tenantPlugin.js";

const courierSettingSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      index: true,
    },

    courier: {
      type: String,
      enum: ["steadfast", "pathao", "redx"],
      default: "steadfast",
    },
    merchantName: String,
    apiKey: String,
    secretKey: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ✅ একটা শপ একই courier টাইপ একাধিকবার সেটআপ করলে ডুপ্লিকেট আটকাবে
courierSettingSchema.index({ shopId: 1, courier: 1 }, { unique: true });
courierSettingSchema.plugin(tenantPlugin);

const CourierSetting =
  mongoose.models.CourierSetting ||
  mongoose.model("CourierSetting", courierSettingSchema);
export default CourierSetting;
