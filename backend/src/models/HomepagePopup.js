import mongoose from "mongoose";
import tenantPlugin from "../tenancy/tenantPlugin.js";

const HomepagePopupSchema = new mongoose.Schema({
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: true,
    unique: true, // ✅ প্রতি শপের একটাই Homepage Popup document
    index: true,
  },

  image: { type: String, default: "" },
  imagePublicId: { type: String, default: "" },
  link: { type: String, default: "" },
  openInNewTab: { type: Boolean, default: true },
  enabled: { type: Boolean, default: false },
  updatedAt: { type: Date, default: Date.now },
});

HomepagePopupSchema.plugin(tenantPlugin);

const HomepagePopup =
  mongoose.models.HomepagePopup ||
  mongoose.model("HomepagePopup", HomepagePopupSchema);

export default HomepagePopup;
