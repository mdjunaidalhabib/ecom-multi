/**
 * ✅ Migration: "FirstCart" (key: "firstcart") থিমের রঙ → Orange
 *
 * আগের seed ডিফল্ট (teal) রঙ যদি অপরিবর্তিত থাকে তবেই বদলায়।
 * super-admin আগেই কাস্টম primary রঙ সেট করে থাকলে ওভাররাইট হবে না।
 * `background` / `surface` অপরিবর্তিত থাকে।
 *
 * চালানোর নিয়ম (backend/ ফোল্ডার থেকে):
 *   node migrations/setFirstCartOrangeColors.js
 *
 * প্রোডাকশন DB এর বিপরীতে (repo root থেকে):
 *   npm run with-tunnel -- node migrations/setFirstCartOrangeColors.js
 *
 * ⚠️ নিরাপদে বারবার চালানো যায় (idempotent)।
 */

import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../src/lib/db.js";
import Theme from "../src/models/Theme.js";

dotenv.config();

const OLD_PRIMARY = "#0d9488";
const NEW_COLORS = {
  primary: "#f97316",
  primaryDark: "#c2410c",
  secondary: "#0f172a",
  text: "#0f172a",
  accent: "#fb923c",
};

async function run() {
  await connectDB();

  console.log("========== FIRSTCART COLORS → ORANGE ==========");

  const theme = await Theme.findOne({ key: "firstcart" });

  if (!theme) {
    console.log('🟡 key: "firstcart" থিম পাওয়া যায়নি — কিছুই করার নেই।');
  } else {
    const current = String(theme.colors?.primary || "").toLowerCase();
    if (current === NEW_COLORS.primary) {
      console.log("🟡 রঙ আগে থেকেই orange — স্কিপ।");
    } else if (current === OLD_PRIMARY) {
      Object.assign(theme.colors, NEW_COLORS);
      await theme.save();
      console.log("✅ FirstCart রঙ orange এ বদলানো হলো।");
    } else {
      console.log(`🟡 primary কাস্টমাইজ করা ("${current}") — ওভাররাইট করা হয়নি।`);
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
