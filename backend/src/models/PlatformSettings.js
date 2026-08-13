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
