/**
 * ✅ Migration: "Classic" থিমের display name → "OpenCart"
 *
 * এই স্ক্রিপ্ট কী করে:
 *  - Theme collection-এ key: "classic" ডকুমেন্টের `name` ফিল্ড "Classic"
 *    থেকে "OpenCart" এ বদলে দেয়। `key` (immutable, structural reference —
 *    Plan.theme/Shop.branding.theme এই key-কেই পয়েন্ট করে) অপরিবর্তিত থাকে,
 *    শুধু super-admin panel-এ দেখানো নামটাই বদলাচ্ছে।
 *
 * চালানোর নিয়ম (backend/ ফোল্ডার থেকে):
 *   node migrations/renameClassicThemeToOpenCart.js
 *
 * প্রোডাকশন DB এর বিপরীতে (repo root থেকে):
 *   npm run with-tunnel -- node migrations/renameClassicThemeToOpenCart.js
 *
 * ⚠️ নিরাপদে বারবার চালানো যায় (idempotent) — name ইতিমধ্যে "OpenCart"
 * হলে স্কিপ হয়ে যাবে।
 */

import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../src/lib/db.js";
import Theme from "../src/models/Theme.js";

dotenv.config();

async function run() {
  await connectDB();

  console.log("========== RENAME CLASSIC THEME → OPENCART ==========");

  const theme = await Theme.findOne({ key: "classic" });

  if (!theme) {
    console.log('🟡 key: "classic" থিম পাওয়া যায়নি — কিছুই করার নেই।');
  } else if (theme.name === "OpenCart") {
    console.log('🟡 নাম আগে থেকেই "OpenCart" — স্কিপ করা হলো।');
  } else {
    const oldName = theme.name;
    theme.name = "OpenCart";
    await theme.save();
    console.log(`✅ থিমের নাম "${oldName}" → "OpenCart" এ বদলানো হলো।`);
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
