import mongoose from "mongoose";

// ✅ Plan — platform-wide subscription plan catalog। কোনো নির্দিষ্ট শপের ডেটা
// না, তাই PlatformSettings-এর মতোই tenantPlugin ব্যবহার হয়নি ইচ্ছাকৃতভাবে।
// Super admin এখান থেকেই plan তৈরি/এডিট/ডিলিট করে (দেখুন
// controllers/shop/plans.admin.controller.js)। Shop.plan এই মডেলের `key`
// ফিল্ডকে reference করে (foreign key না, প্লেইন স্ট্রিং — কারণ plan মুছে
// ফেলা যায়, তাই কোনো shop সেই plan-এ থাকলে ডিলিট ব্লক করা হয়, দেখুন
// deletePlan কন্ট্রোলার)।
const planSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      trim: true,
      lowercase: true,
    },
    name: { type: String, required: true, trim: true },
    tagline: { type: String, trim: true, default: "" },
    order: { type: Number, default: 0 },
    isDefault: { type: Boolean, default: false },

    // ✅ false হলে এই plan শপ-admin/staff-এর "সব প্ল্যান তুলনা করুন" লিস্ট বা
    // upgrade/downgrade dropdown-এ দেখা যাবে না (এখনো পুরোপুরি রেডি না এমন
    // draft plan লুকিয়ে রাখতে) — তবে যেসব শপ ইতিমধ্যে এই plan-এ আছে তারা
    // নিজেদের বর্তমান প্ল্যান হিসেবে ঠিকই দেখবে (দেখুন plans.admin.controller.js#listPlans)।
    // super-admin নিজে সবসময় সব plan দেখে, visible/hidden নির্বিশেষে।
    isVisible: { type: Boolean, default: true },

    // ✅ theme এখন Theme কালেকশন থেকে dynamically তৈরি/ডিলিট হয় (দেখুন
    // models/Theme.js), তাই এখানে স্ট্যাটিক enum রাখা যায় না। বৈধতা যাচাই হয়
    // themes.admin.controller.js-এ (create/update plan) live Theme লিস্টের
    // বিপরীতে — plan.js-এর মতোই প্লেইন স্ট্রিং FK।
    theme: {
      type: String,
      default: "classic",
    },

    // ✅ Public pricing (ল্যান্ডিং পেজ ও Hikmah IT সাইটে দেখানোর জন্য)।
    // price = 0 মানে বিনামূল্যে। billingDays = কত দিনের জন্য এই দাম (৩০/৯০/৩৬৫)।
    // ctaType: "buy" = কিনুন বাটন, "contact" = যোগাযোগ করুন (Custom/Reseller-এর জন্য)।
    price: { type: Number, default: 0, min: 0 },
    originalPrice: { type: Number, default: 0, min: 0 },
    billingDays: { type: Number, default: 30, min: 0 },
    isPopular: { type: Boolean, default: false },
    ctaType: { type: String, enum: ["buy", "contact"], default: "buy" },

    features: {
      customDomain: { type: Boolean, default: false },
      analytics: { type: Boolean, default: false },
      promo: { type: Boolean, default: false },
      payment: { type: Boolean, default: false },
      landingPages: { type: Boolean, default: false },
      fullStorefront: { type: Boolean, default: true },
      invoiceCustomization: { type: Boolean, default: false },
    },

    limits: {
      // ✅ 0 = আনলিমিটেড প্রোডাক্ট (সব প্ল্যানেই এখন আনলিমিটেড)
      maxProducts: { type: Number, default: 0, min: 0 },
      maxAdmins: { type: Number, default: 1 },
    },
  },
  { timestamps: true },
);

planSchema.index({ order: 1 });

const Plan = mongoose.models.Plan || mongoose.model("Plan", planSchema);
export default Plan;

// ✅ প্রথমবার কল হওয়ার সময় collection খালি থাকলে এই ডিফল্ট প্ল্যানগুলো দিয়ে seed করে।
// Free প্ল্যান আর নেই। সব প্ল্যানে প্রোডাক্ট আনলিমিটেড (maxProducts: 0 = আনলিমিটেড)
// এবং অর্ডারের কোনো লিমিট নেই।
const ALL_FEATURES_ON = {
  customDomain: true,
  analytics: true,
  promo: true,
  payment: true,
  landingPages: true,
  fullStorefront: true,
  invoiceCustomization: true,
};

const SEED_PLANS = [
  {
    key: "starter",
    name: "Starter",
    tagline: "বাড়ন্ত ব্যবসার জন্য",
    order: 0,
    isDefault: true,
    theme: "classic",
    features: {
      customDomain: false,
      analytics: true,
      promo: true,
      payment: true,
      landingPages: false,
      fullStorefront: true,
      invoiceCustomization: false,
    },
    limits: { maxProducts: 0, maxAdmins: 2 },
  },
  {
    key: "business",
    name: "Business",
    tagline: "পূর্ণাঙ্গ প্রফেশনাল ফিচারের জন্য",
    order: 1,
    theme: "classic",
    features: { ...ALL_FEATURES_ON },
    limits: { maxProducts: 0, maxAdmins: 5 },
  },
  {
    key: "custom",
    name: "Custom",
    tagline: "আপনার ব্যবসার চাহিদা অনুযায়ী সম্পূর্ণ কাস্টমাইজড সমাধান",
    order: 2,
    theme: "classic",
    features: { ...ALL_FEATURES_ON },
    limits: { maxProducts: 0, maxAdmins: 10 },
  },
  {
    key: "reseller",
    name: "Reseller",
    tagline: "একাধিক ক্লায়েন্ট/শপ পরিচালনা ও রিসেল করার জন্য",
    order: 3,
    theme: "classic",
    features: { ...ALL_FEATURES_ON },
    limits: { maxProducts: 0, maxAdmins: 20 },
  },
  {
    key: "reseller-pro",
    name: "Reseller Pro",
    tagline: "বড় রিসেলার ও এজেন্সির জন্য — বেশি স্টাফসহ",
    order: 4,
    theme: "classic",
    ctaType: "contact",
    features: { ...ALL_FEATURES_ON },
    limits: { maxProducts: 0, maxAdmins: 50 },
  },
];

export async function ensurePlansSeeded() {
  const count = await Plan.estimatedDocumentCount();
  if (count > 0) return;
  await Plan.insertMany(SEED_PLANS, { ordered: true });
}

export async function listActivePlans() {
  await ensurePlansSeeded();
  return Plan.find({}).sort({ order: 1, createdAt: 1 });
}
