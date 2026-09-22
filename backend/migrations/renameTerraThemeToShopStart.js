/**
 * ✅ Migration: "Terra Prestige" থিমের নাম → "ShopStart"
 *
 * শুধু `name` বদলায়। `key: "terra"` (immutable — Plan.theme/Shop.branding.theme
 * এই key-কেই পয়েন্ট করে) এবং কালার/ফন্ট অপরিবর্তিত থাকে।
 *
 * চালানোর নিয়ম (backend/ ফোল্ডার থেকে):
 *   node migrations/renameTerraThemeToShopStart.js
 *
 * প্রোডাকশন DB এর বিপরীতে (repo root থেকে):
 *   npm run with-tunnel -- node migrations/renameTerraThemeToShopStart.js
 *
 * ⚠️ নিরাপদে বারবার চালানো যায় (idempotent)। আগে "Shop Start" (স্পেস সহ)
 * নামে চলে থাকলে, এই স্ক্রিপ্ট আবার চালালে "ShopStart" (এক শব্দ) এ আপডেট হবে।
 */

import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../src/lib/db.js";
import Theme from "../src/models/Theme.js";

dotenv.config();

const NEW_NAME = "ShopStart";

async function run() {
  await connectDB();

  console.log("========== RENAME TERRA THEME → SHOP START ==========");

  const theme = await Theme.findOne({ key: "terra" });

  if (!theme) {
    console.log('🟡 key: "terra" থিম পাওয়া যায়নি — কিছুই করার নেই।');
  } else if (theme.name === NEW_NAME) {
    console.log(`🟡 নাম আগে থেকেই "${NEW_NAME}" — স্কিপ।`);
  } else {
    const oldName = theme.name;
    theme.name = NEW_NAME;
    await theme.save();
    console.log(`✅ নাম "${oldName}" → "${NEW_NAME}" এ বদলানো হলো।`);
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
