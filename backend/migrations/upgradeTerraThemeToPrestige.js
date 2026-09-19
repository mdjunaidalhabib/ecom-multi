/**
 * ✅ Migration: "Terra" থিম → "Terra Prestige" (নাম + প্রিমিয়াম কালার/ফন্ট)
 *
 * এই স্ক্রিপ্ট কী করে:
 *  - Theme collection-এ key: "terra" ডকুমেন্টের `name` "Terra" থেকে
 *    "Terra Prestige" এ বদলায়। `key` (immutable — Plan.theme/Shop.branding.theme
 *    এই key-কেই পয়েন্ট করে) অপরিবর্তিত থাকে।
 *  - কালার/ফন্ট শুধু তখনই নতুন প্রিমিয়াম প্যালেটে আপডেট হয় যদি সেগুলো এখনো
 *    আগের seed ডিফল্টের (emerald + amber) সাথে হুবহু মেলে — অর্থাৎ super-admin
 *    নিজে এডিট করে থাকলে সেই কাস্টম কালার ওভাররাইট হবে না।
 *
 * চালানোর নিয়ম (backend/ ফোল্ডার থেকে):
 *   node migrations/upgradeTerraThemeToPrestige.js
 *
 * প্রোডাকশন DB এর বিপরীতে (repo root থেকে):
 *   npm run with-tunnel -- node migrations/upgradeTerraThemeToPrestige.js
 *
 * ⚠️ নিরাপদে বারবার চালানো যায় (idempotent)।
 */

import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../src/lib/db.js";
import Theme from "../src/models/Theme.js";

dotenv.config();

const NEW_NAME = "Terra Prestige";

const LEGACY_COLORS = {
  primary: "#047857",
  primaryDark: "#065f46",
  secondary: "#022c22",
  background: "#fffbeb",
  surface: "#ffffff",
  text: "#064e3b",
  accent: "#d97706",
};

const NEW_COLORS = {
  primary: "#0b5d45",
  primaryDark: "#073f2f",
  secondary: "#04261d",
  background: "#faf7f0",
  surface: "#ffffff",
  text: "#12352b",
  accent: "#b8893b",
};

async function run() {
  await connectDB();

  console.log("========== UPGRADE TERRA THEME → TERRA PRESTIGE ==========");

  const theme = await Theme.findOne({ key: "terra" });

  if (!theme) {
    console.log('🟡 key: "terra" থিম পাওয়া যায়নি — কিছুই করার নেই।');
  } else {
    if (theme.name !== NEW_NAME) {
      const oldName = theme.name;
      theme.name = NEW_NAME;
      console.log(`✅ নাম "${oldName}" → "${NEW_NAME}" এ বদলানো হলো।`);
    } else {
      console.log(`🟡 নাম আগে থেকেই "${NEW_NAME}" — স্কিপ।`);
    }

    const colorsUntouched = Object.entries(LEGACY_COLORS).every(
      ([k, v]) => String(theme.colors?.[k] || "").toLowerCase() === v,
    );
    if (colorsUntouched) {
      theme.colors = NEW_COLORS;
      if (theme.fonts?.heading === "default") theme.fonts.heading = "serif";
      console.log("✅ কালার/ফন্ট প্রিমিয়াম প্যালেটে আপডেট হলো।");
    } else {
      console.log("🟡 কালার আগে থেকেই কাস্টমাইজ করা — ওভাররাইট করা হয়নি।");
    }

    await theme.save();
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
