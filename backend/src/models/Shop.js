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

    // ✅ Clean, short, sequential (1, 2, 3, ...) — creation-এ একবার Counter
    // দিয়ে বসানো হয়, কখনো বদলায় না (slug rename-এর মতো না)। R2 storage
    // key-তে ব্যবহার হয় (shops/{storageNumber}/...) যাতে shop delete করলে
    // এক prefix delete করেই তার সব image মুছে যায়, স্লাগ রিনেমে ভেঙে না যায়।
    storageNumber: {
      type: Number,
      unique: true,
      sparse: true,
      immutable: true,
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

    // ✅ DNS verified হওয়ার পরের ধাপ — ডোমেইনটা আসলেই সাইট সার্ভ করছে কিনা
    // (অর্থাৎ hosting panel/reverse proxy-তে domain attach করা হয়েছে কিনা)।
    // "unknown" = এখনো live check হয়নি বা DNS verified না।
    domainLiveStatus: {
      type: String,
      enum: ["unknown", "live", "unreachable"],
      default: "unknown",
    },
    domainLiveCheckedAt: { type: Date, default: null },

    status: {
      type: String,
      enum: ["active", "suspended", "trial"],
      default: "trial",
    },
    suspendedReason: { type: String, default: "" },

    // ✅ Subscription মেয়াদ — Super Admin শপের জন্য একটা শুরুর তারিখ +
    // মেয়াদকাল (দিনে) সেট করে, planExpiresAt এই দুটো থেকে derive/store হয়
    // (দেখুন utils/planExpiry.js এর computePlanExpiresAt)।
    //
    // subscriptionStartDate — শপ তৈরির সময় auto (আজকের তারিখ) বসে, কিন্তু
    // super-admin পরে হাতে বদলাতে পারে — যেসব শপের সাবস্ক্রিপশন এই ফিচার
    // চালু হওয়ার আগে থেকেই চলছিল, তাদের আসল শুরুর তারিখ বসানোর জন্য এটা জরুরি।
    subscriptionStartDate: { type: Date, default: Date.now },
    // মেয়াদকাল দিনে (৩০/৯০/১৮০/৩৬৫ প্রিসেট, বা যেকোনো custom সংখ্যা দিনে)।
    // null মানে কোনো সাবস্ক্রিপশন সাইকেল নেই — মেয়াদ নেই, auto-suspend কখনো প্রযোজ্য হবে না।
    subscriptionDays: { type: Number, default: null },
    // ✅ derived/cached expiry — subscriptionStartDate + subscriptionDays।
    // সরাসরি এডিট হয় না, কিন্তু query performance-এর জন্য (auto-suspend
    // sweep, lazy access check) আলাদা ফিল্ড হিসেবে store করা থাকে। null মানে
    // মেয়াদ নেই (auto-suspend প্রযোজ্য না, আগের সব শপের ডিফল্ট আচরণ)।
    // মেয়াদ পার হয়ে গেলে backend lazily (isPlanExpired) সাথে সাথে অ্যাক্সেস
    // ব্লক করে, আর একটা background sweep (autoSuspendExpiredShops) status/
    // suspendedReason ডাটাবেসে আপডেট করে (দেখুন utils/shop/shopAutoSuspend.helpers.js)
    planExpiresAt: { type: Date, default: null },

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
shopSchema.index({ storageNumber: 1 }, { unique: true, sparse: true });

export default mongoose.models.Shop || mongoose.model("Shop", shopSchema);
