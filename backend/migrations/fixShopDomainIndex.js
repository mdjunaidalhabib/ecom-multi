/**
 * ✅ Migration: `domain` ফিল্ডকে sparse unique index বানানো
 *
 * কেন দরকার: Shop.js-এ আগে domain ছিল required+unique। এখন domain ঐচ্ছিক
 * করা হয়েছে (sparse unique) যাতে কাস্টম ডোমেইন ছাড়াও শপ শুধু slug-based
 * path (/shop/<slug>/...) দিয়ে চলতে পারে। কিন্তু DB-তে পুরনো non-sparse
 * unique index (`domain_1`) আগে থেকেই থাকলে mongoose সেটাকে অটো-আপডেট
 * করতে পারে না (index options conflict) — এই স্ক্রিপ্ট পুরনো index ড্রপ
 * করে দেয়, তারপর পরের বার সার্ভার চালু হলে mongoose নতুন sparse index
 * বানিয়ে নেবে।
 *
 * চালানোর নিয়ম (backend/ ফোল্ডার থেকে):
 *   node migrations/fixShopDomainIndex.js
 *
 * ⚠️ নিরাপদে বারবার চালানো যায় — index না থাকলে শুধু জানিয়ে দেবে, কোনো
 * ডেটা মুছবে না।
 */

import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../src/lib/db.js";

dotenv.config();

async function run() {
  await connectDB();

  const collection = mongoose.connection.collection("shops");
  const indexes = await collection.indexes();
  const domainIndex = indexes.find(
    (idx) => idx.key && Object.keys(idx.key).join(",") === "domain",
  );

  if (!domainIndex) {
    console.log("🟡 `domain` index পাওয়া যায়নি — কিছু করার দরকার নেই।");
  } else if (domainIndex.sparse) {
    console.log("🟢 `domain` index ইতিমধ্যে sparse — কিছু করার দরকার নেই।");
  } else {
    await collection.dropIndex(domainIndex.name);
    console.log(`✅ পুরনো "${domainIndex.name}" index ড্রপ করা হলো। পরের বার সার্ভার চালু হলে sparse index অটো তৈরি হবে।`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(async (err) => {
  console.error("❌ Migration ব্যর্থ হয়েছে:", err);
  await mongoose.disconnect();
  process.exit(1);
});
