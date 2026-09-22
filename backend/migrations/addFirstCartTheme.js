/**
 * ✅ Migration: নতুন "FirstCart" থিম (key: "firstcart") যোগ করে
 *
 * ensureThemesSeeded() শুধু খালি collection-এ seed করে, তাই আগে থেকে
 * চালু DB-তে এই স্ক্রিপ্ট চালাতে হবে।
 *
 * চালানোর নিয়ম (backend/ ফোল্ডার থেকে):
 *   node migrations/addFirstCartTheme.js
 *
 * প্রোডাকশন DB এর বিপরীতে (repo root থেকে):
 *   npm run with-tunnel -- node migrations/addFirstCartTheme.js
 *
 * ⚠️ নিরাপদে বারবার চালানো যায় (idempotent)।
 */

import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../src/lib/db.js";
import Theme from "../src/models/Theme.js";

dotenv.config();

async function run() {
  await connectDB();

  console.log("========== ADD FIRSTCART THEME ==========");

  const existing = await Theme.findOne({ key: "firstcart" });

  if (existing) {
    console.log('🟡 key: "firstcart" থিম আগে থেকেই আছে — স্কিপ।');
  } else {
    await Theme.create({
      key: "firstcart",
      name: "FirstCart",
      baseLayout: "firstcart",
      isSystem: true,
      colors: {
        primary: "#f97316",
        primaryDark: "#c2410c",
        secondary: "#0f172a",
        background: "#f8fafc",
        surface: "#ffffff",
        text: "#0f172a",
        accent: "#fb923c",
      },
      fonts: { heading: "rounded", body: "default" },
    });
    console.log("✅ FirstCart থিম তৈরি হয়েছে।");
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
