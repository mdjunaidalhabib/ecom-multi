/**
 * ✅ Migration: বাদ দেওয়া "Aurora" থিম (key: "aurora") DB থেকে সরায়
 *
 * Aurora-র storefront কম্পোনেন্ট code থেকে মুছে ফেলা হয়েছে, কিন্তু Theme
 * কালেকশনে ডকুমেন্টটা রয়ে গেছে — তাই super-admin-এ এখনো দেখায়, আর
 * isSystem হওয়ায় UI থেকে ডিলিটও করা যায় না।
 *
 * এই স্ক্রিপ্ট:
 *   1. যেসব প্ল্যানের theme "aurora" → "classic" করে
 *   2. যেসব শপের branding.theme "aurora" → override মুছে দেয় (প্ল্যানের থিম পাবে)
 *   3. baseLayout "aurora" থাকা কাস্টম থিমগুলোর baseLayout → "classic"
 *   4. key: "aurora" থিম ডকুমেন্ট ডিলিট করে
 *
 * চালানোর নিয়ম (backend/ ফোল্ডার থেকে):
 *   node migrations/removeAuroraTheme.js
 *
 * প্রোডাকশন DB এর বিপরীতে (repo root থেকে):
 *   npm run with-tunnel -- node migrations/removeAuroraTheme.js
 *
 * ⚠️ নিরাপদে বারবার চালানো যায় (idempotent)।
 */

import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../src/lib/db.js";
import Theme from "../src/models/Theme.js";
import Plan from "../src/models/Plan.js";
import Shop from "../src/models/Shop.js";

dotenv.config();

const OLD_KEY = "aurora";
const FALLBACK_KEY = "classic";

async function run() {
  await connectDB();

  console.log("========== REMOVE AURORA THEME ==========");

  const plans = await Plan.updateMany(
    { theme: OLD_KEY },
    { $set: { theme: FALLBACK_KEY } },
  );
  console.log(`✅ ${plans.modifiedCount}টি প্ল্যান → "${FALLBACK_KEY}"`);

  const shops = await Shop.updateMany(
    { "branding.theme": OLD_KEY },
    { $unset: { "branding.theme": "" } },
  );
  console.log(`✅ ${shops.modifiedCount}টি শপের থিম override মুছে দেওয়া হলো`);

  const derived = await Theme.updateMany(
    { baseLayout: OLD_KEY, key: { $ne: OLD_KEY } },
    { $set: { baseLayout: FALLBACK_KEY } },
  );
  console.log(`✅ ${derived.modifiedCount}টি কাস্টম থিমের baseLayout → "${FALLBACK_KEY}"`);

  const removed = await Theme.deleteOne({ key: OLD_KEY });
  if (removed.deletedCount) {
    console.log('✅ key: "aurora" থিম ডিলিট হয়েছে।');
  } else {
    console.log('🟡 key: "aurora" থিম পাওয়া যায়নি — স্কিপ।');
  }

  console.log("========== DONE ✅ ==========");
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(async (err) => {
  console.error("❌ Migration ব্যর্থ হয়েছে:", err);
  await mongoose.disconnect();
  process.exit(1);
});
