/**
 * ✅ Migration: Free প্ল্যান বাদ + সব প্ল্যানে আনলিমিটেড প্রোডাক্ট + নতুন "Reseller Pro" প্ল্যান
 *
 * এই স্ক্রিপ্ট কী করে:
 *  1. "free" প্ল্যানে থাকা সব শপকে TARGET_PLAN-এ (ডিফল্ট: "starter") সরিয়ে নেয়
 *     এবং সেই শপের limits নতুন প্ল্যানের মান অনুযায়ী আপডেট করে
 *  2. "free" প্ল্যান ডিলিট করে (কোনো শপ বাকি না থাকলেই)
 *  3. সব প্ল্যানের limits.maxProducts = 0 (= আনলিমিটেড) করে
 *  4. সব শপের limits.maxProducts = 0 করে (আগে সেভ হওয়া 50/200/১০০০... মুছে যায়)
 *  5. "reseller-pro" প্ল্যান তৈরি করে (না থাকলে)
 *  6. isDefault = TARGET_PLAN, আর প্ল্যানের order আবার সাজায়
 *
 * চালানোর নিয়ম (backend/ ফোল্ডার থেকে):
 *   node migrations/removeFreePlanAndUnlimited.js
 *   TARGET_PLAN=business node migrations/removeFreePlanAndUnlimited.js   # অন্য প্ল্যানে সরাতে চাইলে
 *
 * ⚠️ নিরাপদে বারবার চালানো যায় (idempotent)।
 * ⚠️ চালানোর আগে ডাটাবেসের ব্যাকআপ নিয়ে নিন।
 * ℹ️ অর্ডারের কোনো লিমিট কোডে ছিলই না, তাই অর্ডারের জন্য ডেটা বদলানো লাগে না।
 */

import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../src/lib/db.js";
import Plan from "../src/models/Plan.js";
import Shop from "../src/models/Shop.js";

dotenv.config();

const TARGET_PLAN = (process.env.TARGET_PLAN || "starter").trim().toLowerCase();

const ALL_FEATURES_ON = {
  customDomain: true,
  analytics: true,
  promo: true,
  payment: true,
  landingPages: true,
  fullStorefront: true,
  invoiceCustomization: true,
};

const RESELLER_PRO = {
  key: "reseller-pro",
  name: "Reseller Pro",
  tagline: "বড় রিসেলার ও এজেন্সির জন্য — বেশি স্টাফসহ",
  theme: "classic",
  ctaType: "contact",
  features: { ...ALL_FEATURES_ON },
  limits: { maxProducts: 0, maxAdmins: 50 },
};

// নতুন ক্রম — যে key এখানে নেই (সুপার-অ্যাডমিনে নিজে বানানো প্ল্যান) সেগুলো শেষে থাকবে
const ORDER = ["starter", "business", "custom", "reseller", "reseller-pro"];

async function run() {
  await connectDB();
  console.log("========== FREE-PLAN REMOVAL MIGRATION START ==========");

  const target = await Plan.findOne({ key: TARGET_PLAN });
  if (!target) {
    throw new Error(
      `"${TARGET_PLAN}" প্ল্যান ডাটাবেসে নেই — আগে সেটা তৈরি করুন বা TARGET_PLAN সেট করুন।`,
    );
  }

  // 1️⃣ + 2️⃣ free → TARGET_PLAN, তারপর free ডিলিট
  const freePlan = await Plan.findOne({ key: "free" });
  const freeShopCount = await Shop.countDocuments({ plan: "free" });

  if (freeShopCount > 0) {
    const result = await Shop.updateMany(
      { plan: "free" },
      {
        $set: {
          plan: TARGET_PLAN,
          "limits.maxProducts": 0,
          "limits.maxAdmins": target.limits?.maxAdmins ?? 2,
        },
      },
    );
    const modified = result.modifiedCount ?? result.nModified ?? 0;
    console.log(`✅ ${modified}টি শপ "free" থেকে "${TARGET_PLAN}" প্ল্যানে সরানো হলো।`);
  } else {
    console.log('🟡 "free" প্ল্যানে কোনো শপ নেই।');
  }

  const stillOnFree = await Shop.countDocuments({ plan: "free" });
  if (freePlan && stillOnFree === 0) {
    await Plan.collection.deleteOne({ key: "free" });
    console.log('✅ "free" প্ল্যান ডিলিট করা হলো।');
  } else if (freePlan) {
    console.log(`⚠️ এখনো ${stillOnFree}টি শপ "free"-তে আছে — প্ল্যান ডিলিট করা হয়নি।`);
  } else {
    console.log('🟡 "free" প্ল্যান আগেই নেই — স্কিপ।');
  }

  // 3️⃣ সব প্ল্যানে আনলিমিটেড প্রোডাক্ট
  const planRes = await Plan.updateMany({}, { $set: { "limits.maxProducts": 0 } });
  console.log(
    `✅ ${planRes.modifiedCount ?? planRes.nModified ?? 0}টি প্ল্যানে maxProducts = 0 (আনলিমিটেড) সেট হলো।`,
  );

  // 4️⃣ সব শপে আনলিমিটেড প্রোডাক্ট
  const shopRes = await Shop.updateMany({}, { $set: { "limits.maxProducts": 0 } });
  console.log(
    `✅ ${shopRes.modifiedCount ?? shopRes.nModified ?? 0}টি শপে maxProducts = 0 (আনলিমিটেড) সেট হলো।`,
  );

  // 5️⃣ reseller-pro
  if (await Plan.findOne({ key: RESELLER_PRO.key })) {
    console.log('🟡 "reseller-pro" আগে থেকেই আছে — স্কিপ।');
  } else {
    await Plan.create({ ...RESELLER_PRO, order: ORDER.indexOf(RESELLER_PRO.key) });
    console.log('✅ "reseller-pro" প্ল্যান তৈরি হলো।');
  }

  // 6️⃣ ডিফল্ট প্ল্যান ও ক্রম
  await Plan.updateMany({}, { $set: { isDefault: false } });
  await Plan.updateOne({ key: TARGET_PLAN }, { $set: { isDefault: true } });
  console.log(`✅ ডিফল্ট প্ল্যান: "${TARGET_PLAN}"`);

  const all = await Plan.find({}).sort({ order: 1, createdAt: 1 });
  let extra = ORDER.length;
  for (const p of all) {
    const idx = ORDER.indexOf(p.key);
    await Plan.updateOne({ _id: p._id }, { $set: { order: idx >= 0 ? idx : extra++ } });
  }
  console.log("✅ প্ল্যানের ক্রম আপডেট হলো।");

  console.log("========== MIGRATION DONE ✅ ==========");
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(async (err) => {
  console.error("❌ Migration ব্যর্থ হয়েছে:", err);
  await mongoose.disconnect();
  process.exit(1);
});
