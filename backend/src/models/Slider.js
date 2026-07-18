import mongoose from "mongoose";
import tenantPlugin from "../tenancy/tenantPlugin.js";

const sliderSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      index: true,
    },

    title: { type: String, default: "" },
    src: { type: String, required: true }, // cloudinary secure_url
    srcPublicId: { type: String, default: "" }, // cloudinary public_id
    alt: { type: String, default: "" },
    href: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

sliderSchema.plugin(tenantPlugin);

export default mongoose.models.Slider || mongoose.model("Slider", sliderSchema);
