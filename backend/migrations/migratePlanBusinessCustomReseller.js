/**
 * ✅ Migration: Plan catalog আপডেট — Pro → Business, নতুন Custom ও Reseller
 *
 * এই স্ক্রিপ্ট কী করে:
 *  1. DB-তে থাকা পুরনো "pro" প্ল্যানকে "business" এ রিনেম করে (key, name,
 *     tagline, features, limits — সব আপডেট হয়, key immutable বলে মডেলের
 *     মাধ্যমে না গিয়ে raw collection.updateOne ব্যবহার করা হয়েছে)
 *  2. plan: "pro" থাকা সব Shop-কে plan: "business" এ সরিয়ে নেয়
 *  3. "custom" ও "reseller" — এই দুটো নতুন প্ল্যান insert করে (আগে থেকে
 *     থাকলে স্কিপ করে)
 *
 * চালানোর নিয়ম (backend/ ফোল্ডার থেকে):
 *   node migrations/migratePlanBusinessCustomReseller.js
 *
 * ⚠️ নিরাপদে বারবার চালানো যায় (idempotent) — "pro" আর না পেলে ধাপ ১-২
 * স্কিপ হয়ে যাবে, আর custom/reseller আগে থেকে থাকলে insert হবে না।
 */

import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../src/lib/db.js";
import Plan from "../src/models/Plan.js";
import Shop from "../src/models/Shop.js";

dotenv.config();

const BUSINESS_UPDATE = {
  key: "business",
  name: "Business",
  tagline: "পূর্ণাঙ্গ প্রফেশনাল ফিচারের জন্য",
  features: {
    customDomain: true,
    analytics: true,
    promo: true,
    payment: true,
    landingPages: true,
    fullStorefront: true,
    invoiceCustomization: true,
  },
  limits: { maxProducts: 1000, maxAdmins: 5 },
};

const NEW_PLANS = [
  {
    key: "custom",
    name: "Custom",
    tagline: "আপনার ব্যবসার চাহিদা অনুযায়ী সম্পূর্ণ কাস্টমাইজড সমাধান",
    order: 3,
    theme: "classic",
    features: {
      customDomain: true,
      analytics: true,
      promo: true,
      payment: true,
      landingPages: true,
      fullStorefront: true,
      invoiceCustomization: true,
    },
    limits: { maxProducts: 5000, maxAdmins: 10 },
  },
  {
    key: "reseller",
    name: "Reseller",
    tagline: "একাধিক ক্লায়েন্ট/শপ পরিচালনা ও রিসেল করার জন্য",
    order: 4,
    theme: "classic",
    features: {
      customDomain: true,
      analytics: true,
      promo: true,
      payment: true,
      landingPages: true,
      fullStorefront: true,
      invoiceCustomization: true,
    },
    limits: { maxProducts: 10000, maxAdmins: 20 },
  },
];

async function run() {
  await connectDB();

  console.log("========== PLAN MIGRATION START ==========");

  // 1️⃣ + 2️⃣ pro → business
  const existingBusiness = await Plan.findOne({ key: "business" });
  const existingPro = await Plan.findOne({ key: "pro" });

  if (existingBusiness) {
    console.log('🟡 "business" প্ল্যান আগে থেকেই আছে — রিনেম ধাপ স্কিপ করা হলো।');
  } else if (!existingPro) {
    console.log('🟡 "pro" প্ল্যান পাওয়া যায়নি — রিনেম ধাপ স্কিপ করা হলো।');
  } else {
    await Plan.collection.updateOne(
      { key: "pro" },
      { $set: { ...BUSINESS_UPDATE, updatedAt: new Date() } },
    );
    console.log('✅ "pro" প্ল্যানকে "business" এ রিনেম করা হলো।');

    const shopResult = await Shop.updateMany(
      { plan: "pro" },
      { $set: { plan: "business" } },
    );
    const modified = shopResult.modifiedCount ?? shopResult.nModified ?? 0;
    console.log(`✅ ${modified}টি শপকে plan: "business" এ আপডেট করা হলো।`);
  }

  // 3️⃣ custom + reseller insert (না থাকলে)
  for (const planData of NEW_PLANS) {
    const exists = await Plan.findOne({ key: planData.key });
    if (exists) {
      console.log(`🟡 "${planData.key}" প্ল্যান আগে থেকেই আছে — স্কিপ করা হলো।`);
      continue;
    }
    await Plan.create(planData);
    console.log(`✅ "${planData.key}" প্ল্যান তৈরি হলো।`);
  }

  console.log("========== PLAN MIGRATION DONE ✅ ==========");
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(async (err) => {
  console.error("❌ Migration ব্যর্থ হয়েছে:", err);
  await mongoose.disconnect();
  process.exit(1);
});
