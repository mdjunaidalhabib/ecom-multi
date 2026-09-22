/**
 * ✅ Migration: "Shop Start" (key: "terra") থিমের background → সাদা (#ffffff)
 *
 * শুধু `colors.background` বদলায়। যদি super-admin আগেই কাস্টম background
 * সেট করে থাকেন (আগের seed ডিফল্ট #faf7f0 ছাড়া অন্য কিছু), সেটা ওভাররাইট হবে না।
 *
 * চালানোর নিয়ম (backend/ ফোল্ডার থেকে):
 *   node migrations/setShopStartBackgroundWhite.js
 *
 * প্রোডাকশন DB এর বিপরীতে (repo root থেকে):
 *   npm run with-tunnel -- node migrations/setShopStartBackgroundWhite.js
 *
 * ⚠️ নিরাপদে বারবার চালানো যায় (idempotent)।
 */

import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../src/lib/db.js";
import Theme from "../src/models/Theme.js";

dotenv.config();

const OLD_BG = "#faf7f0";
const NEW_BG = "#ffffff";

async function run() {
  await connectDB();

  console.log("========== SHOP START BACKGROUND → WHITE ==========");

  const theme = await Theme.findOne({ key: "terra" });

  if (!theme) {
    console.log('🟡 key: "terra" থিম পাওয়া যায়নি — কিছুই করার নেই।');
  } else {
    const current = String(theme.colors?.background || "").toLowerCase();
    if (current === NEW_BG) {
      console.log("🟡 background আগে থেকেই সাদা — স্কিপ।");
    } else if (current === OLD_BG) {
      theme.colors.background = NEW_BG;
      await theme.save();
      console.log(`✅ background "${OLD_BG}" → "${NEW_BG}" এ বদলানো হলো।`);
    } else {
      console.log(`🟡 background কাস্টমাইজ করা ("${current}") — ওভাররাইট করা হয়নি।`);
    }
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
