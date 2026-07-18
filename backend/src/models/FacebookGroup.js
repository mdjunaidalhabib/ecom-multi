import mongoose from "mongoose";
import tenantPlugin from "../tenancy/tenantPlugin.js";

/**
 * ✅ FacebookGroup
 * প্রোডাক্ট পেজে (Single Product Page) নিচে যে "Visit our Facebook group"
 * লিংকটা দেখা যায়, সেটার নাম এবং লিংক এখন সম্পূর্ণ Admin panel
 * থেকে control হবে। কোনো hardcoded নাম/লিংক থাকবে না।
 */
const facebookGroupSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      unique: true,
      index: true,
    },

    name: { type: String, default: "Cartvan Family", trim: true },
    link: {
      type: String,
      default: "https://www.facebook.com/share/g/18mbUSQjdp/?mibextid=wwXIfr",
      trim: true,
    },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true },
);

facebookGroupSchema.plugin(tenantPlugin);

export default mongoose.models.FacebookGroup ||
  mongoose.model("FacebookGroup", facebookGroupSchema);
