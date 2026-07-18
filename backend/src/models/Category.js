import mongoose from "mongoose";
import tenantPlugin from "../tenancy/tenantPlugin.js";

const categorySchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      index: true,
    },

    name: { type: String, required: true },
    image: { type: String, default: "" },
    imagePublicId: { type: String, default: "" },
    order: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ✅ একই শপে একই নামের category দুইবার না হোক, কিন্তু দুই শপে একই নাম চলবে
categorySchema.index({ shopId: 1, name: 1 }, { unique: true });

categorySchema.plugin(tenantPlugin);

export default mongoose.models.Category ||
  mongoose.model("Category", categorySchema);