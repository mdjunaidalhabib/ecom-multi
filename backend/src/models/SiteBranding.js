import mongoose from "mongoose";
import tenantPlugin from "../tenancy/tenantPlugin.js";

/**
 * ✅ SiteBranding — প্রতি শপের নিজস্ব ব্রাউজার ট্যাব শিরোনাম + ফেভিকন override
 * (Navbar/Footer এর মতোই প্রতি শপে একটাই singleton document, tenantPlugin
 * দিয়ে auto shopId-scoped)।
 *
 * browserTitle খালি ("") বা favicon খালি ("") মানে শপ নিজে কিছু সেট করেনি —
 * সেক্ষেত্রে PlatformSettings.branding (super-admin এর সেট করা platform-wide
 * ডিফল্ট) দেখানো হবে। দেখুন controllers/shop/public.shop.controller.js
 * (getShopInfo) — সেখানে effective title/favicon resolve হয়।
 */
const siteBrandingSchema = new mongoose.Schema({
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: true,
    unique: true,
    index: true,
  },
  browserTitle: { type: String, trim: true, maxlength: 60, default: "" },
  favicon: { type: String, default: "" }, // R2 URL
  faviconPublicId: { type: String, default: "" }, // R2 object key
  updatedAt: { type: Date, default: Date.now },
});

siteBrandingSchema.plugin(tenantPlugin);

const SiteBranding =
  mongoose.models.SiteBranding || mongoose.model("SiteBranding", siteBrandingSchema);

export default SiteBranding;
