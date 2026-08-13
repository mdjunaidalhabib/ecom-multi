import mongoose from "mongoose";

// ✅ PlatformSettings — শপ-নির্দিষ্ট নয়, পুরো platform-এর জন্য একটাই document
// (tenantPlugin ব্যবহার করা হয়নি ইচ্ছাকৃতভাবে, কারণ এটা কোনো নির্দিষ্ট শপের ডেটা না)
const platformSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "global",
      unique: true,
      immutable: true,
    },

    // Plan → storefront theme default mapping। কোনো শপের branding.theme
    // খালি থাকলে এখান থেকে তার plan অনুযায়ী theme resolve হয়
    // (দেখুন controllers/shop/public.shop.controller.js -> getShopInfo)
    //
    // ⚠️ ইচ্ছাকৃতভাবে সবগুলো plan-এর default "classic" — নতুন theme deploy
    // হওয়ার সাথে সাথে কোনো লাইভ শপের ডিজাইন যেন হুট করে বদলে না যায়।
    // Super admin নিজে Settings → Themes থেকে যাচাই করে যখন রেডি মনে করবে,
    // তখনই কোনো plan-কে aurora/terra-তে opt-in করাবে।
    planThemeMap: {
      free: { type: String, enum: ["classic", "aurora", "terra"], default: "classic" },
      starter: { type: String, enum: ["classic", "aurora", "terra"], default: "classic" },
      pro: { type: String, enum: ["classic", "aurora", "terra"], default: "classic" },
    },

    // Plan → feature access mapping। কোন plan-এ custom domain/analytics/promo
    // চালু থাকবে, আর নতুন শপ তৈরির সময় maxProducts/maxAdmins-এর default কত
    // হবে — সবই এখান থেকে super admin নিয়ন্ত্রণ করে (দেখুন
    // services/planFeatureService.js এবং middlewares/requirePlanFeature.js)।
    // ⚠️ maxProducts/maxAdmins শুধু *নতুন* শপ তৈরির সময় ডিফল্ট হিসেবে বসে —
    // আগে থেকে থাকা শপের limits এখান থেকে বদলালে বদলায় না, সেটা প্রতিটা
    // শপের নিজের এডিট ফর্ম থেকে (Shops পেজ) আলাদাভাবে override করা লাগে।
    planFeatures: {
      free: {
        customDomain: { type: Boolean, default: false },
        analytics: { type: Boolean, default: false },
        promo: { type: Boolean, default: false },
        maxProducts: { type: Number, default: 50 },
        maxAdmins: { type: Number, default: 1 },
      },
      starter: {
        customDomain: { type: Boolean, default: false },
        analytics: { type: Boolean, default: true },
        promo: { type: Boolean, default: true },
        maxProducts: { type: Number, default: 200 },
        maxAdmins: { type: Number, default: 2 },
      },
      pro: {
        customDomain: { type: Boolean, default: true },
        analytics: { type: Boolean, default: true },
        promo: { type: Boolean, default: true },
        maxProducts: { type: Number, default: 1000 },
        maxAdmins: { type: Number, default: 5 },
      },
    },
  },
  { timestamps: true },
);

export const PLATFORM_SETTINGS_KEY = "global";

export async function getPlatformSettings() {
  const PlatformSettings =
    mongoose.models.PlatformSettings ||
    mongoose.model("PlatformSettings", platformSettingsSchema);

  let settings = await PlatformSettings.findOne({ key: PLATFORM_SETTINGS_KEY });
  if (!settings) {
    settings = await PlatformSettings.create({ key: PLATFORM_SETTINGS_KEY });
  }
  return settings;
}

export default mongoose.models.PlatformSettings ||
  mongoose.model("PlatformSettings", platformSettingsSchema);
