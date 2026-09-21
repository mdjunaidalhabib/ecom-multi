/**
 * ✅ Migration: ইমেইল+পাসওয়ার্ড sign-up চালুর জন্য User-এর unique index বদলানো
 *
 * আগে { shopId, googleId } unique index non-partial ছিল, তাই googleId ছাড়া
 * (ম্যানুয়াল sign-up) দ্বিতীয় ইউজার তৈরি করতে গেলেই E11000 আসত। এখন এটা
 * partial index (শুধু যাদের googleId string আছে) — models/User.js দেখুন।
 *
 * MongoDB একই নামে ভিন্ন options-এর index নিজে থেকে বদলায় না, তাই পুরনোটা
 * drop করে নতুনটা বানানো হচ্ছে। কোনো ডেটা মোছে না/বদলায় না।
 *
 * চালানোর নিয়ম (backend/ ফোল্ডার থেকে):
 *   node migrations/allowManualUsers.js
 *
 * প্রোডাকশন DB এর বিপরীতে (repo root থেকে):
 *   npm run with-tunnel -- node migrations/allowManualUsers.js
 *
 * ⚠️ নতুন কোড deploy করার আগে/সাথে একবার চালান। নিরাপদে বারবার চালানো যায় (idempotent)।
 */

import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../src/lib/db.js";
import User from "../src/models/User.js";

dotenv.config();

const INDEX_NAME = "shopId_1_googleId_1";

async function run() {
  await connectDB();

  console.log("========== USER INDEX → PARTIAL googleId ==========");

  const indexes = await User.collection.indexes();
  const current = indexes.find((i) => i.name === INDEX_NAME);

  if (current?.partialFilterExpression) {
    console.log("🟡 index আগে থেকেই partial — স্কিপ।");
  } else {
    if (current) {
      await User.collection.dropIndex(INDEX_NAME);
      console.log(`✅ পুরনো "${INDEX_NAME}" index drop করা হলো।`);
    }
    await User.collection.createIndex(
      { shopId: 1, googleId: 1 },
      {
        name: INDEX_NAME,
        unique: true,
        partialFilterExpression: { googleId: { $type: "string" } },
      },
    );
    console.log(`✅ নতুন partial "${INDEX_NAME}" index তৈরি হলো।`);
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
