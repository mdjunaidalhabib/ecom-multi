import mongoose from "mongoose";

/**
 * ✅ Shop (Tenant)
 * প্রতিটা "Shop" একটা independent store — নিজস্ব custom domain,
 * নিজস্ব products/orders/settings। Super Admin এখান থেকে সব শপ
 * তৈরি, সাসপেন্ড, বা আপডেট করবে।
 */
const shopSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    // Internal reference (used in URLs inside admin panel, logs, etc.)
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // ✅ Customer-facing custom domain, e.g. "shop1.com" (no protocol, no www)
    // ঐচ্ছিক — কাস্টম ডোমেইন ছাড়াও শপ platform-এর নিজস্ব slug-based path
    // (/shop/<slug>/...) দিয়ে সম্পূর্ণভাবে চলতে পারে (দেখুন publicShopResolver.js)
    domain: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      default: undefined,
    },

    // DNS/SSL এখনো ঠিকমতো point করা হয়েছে কিনা
    domainStatus: {
      type: String,
      enum: ["pending_dns", "verified", "failed"],
      default: "pending_dns",
    },
    domainVerifiedAt: { type: Date, default: null },
    domainLastCheckedAt: { type: Date, default: null },

    status: {
      type: String,
      enum: ["active", "suspended", "trial"],
      default: "trial",
    },
    suspendedReason: { type: String, default: "" },

    // Branding
    branding: {
      logo: { type: String, default: "" },
      logoPublicId: { type: String, default: "" },
      themeColor: { type: String, default: "#0ea5e9" },
      // Storefront theme override — খালি থাকলে plan অনুযায়ী default theme
      // ব্যবহার হয় (দেখুন PlatformSettings.planThemeMap)
      theme: {
        type: String,
        enum: ["", "classic", "aurora", "terra"],
        default: "",
      },
    },

    // যে Admin এই শপের মালিক/প্রথম তৈরি করেছে
    ownerAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    // Plan / limits — plan এখন Plan কালেকশন থেকে dynamically তৈরি/ডিলিট হয়
    // (দেখুন models/Plan.js), তাই এখানে স্ট্যাটিক enum রাখা যায় না। বৈধতা
    // যাচাই হয় admin.shop.controller.js-এ (create/update shop) live Plan
    // লিস্টের বিপরীতে।
    plan: {
      type: String,
      default: "free",
    },
    limits: {
      maxProducts: { type: Number, default: 200 },
      maxAdmins: { type: Number, default: 2 },
    },

    contactEmail: { type: String, default: "" },
    contactPhone: { type: String, default: "" },
  },
  { timestamps: true },
);

shopSchema.index({ domain: 1 }, { unique: true, sparse: true });
shopSchema.index({ slug: 1 }, { unique: true });

export default mongoose.models.Shop || mongoose.model("Shop", shopSchema);
