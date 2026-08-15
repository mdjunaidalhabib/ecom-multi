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

    // ⚠️ Plan → theme/feature mapping আগে এখানে ছিল, এখন সেটা dynamic
    // `Plan` কালেকশনে সরানো হয়েছে (দেখুন models/Plan.js) যাতে super-admin
    // প্ল্যান যোগ/এডিট/ডিলিট করতে পারে — এই doc এখন ভবিষ্যতের অন্য
    // platform-wide সেটিংসের জন্য reserved।

    // ✅ "শীঘ্রই আসছে" ঘোষণা — super-admin এখান থেকে একটা ছোট মেসেজ সেট করে
    // দিতে পারে (যেমন কোন নতুন প্ল্যান/ফিচার আসছে) যেটা প্রতিটা শপ-admin এর
    // "My Plan" পেজে ব্যানার হিসেবে দেখা যাবে। খালি text মানে কোনো ব্যানার
    // দেখানো হবে না (দেখুন controllers/shop/announcement.admin.controller.js)।
    announcement: {
      text: { type: String, trim: true, maxlength: 300, default: "" },
      updatedAt: { type: Date, default: null },
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
