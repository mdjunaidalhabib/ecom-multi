/**
 * ✅ Migration: "products" collection থেকে পুরনো compound text index ড্রপ করা
 *
 * কেন দরকার: Product.js-এ আগে `productSchema.index({ name: "text",
 * categories: 1 })` ছিল — categories একটা array (multikey) field, আর
 * MongoDB-তে compound text index-এর non-text key কখনো array হতে পারে না।
 * এই কারণে প্রতিটা product create/update এ MongoServerError (code 201:
 * "Field 'categories' of text index contains an array") হচ্ছিল, যেটা raw
 * ভাবে frontend এ "Server error" হিসেবে দেখা যাচ্ছিল।
 *
 * Product.js এখন শুধু `{ name: "text" }` index define করে (categories
 * আলাদাভাবে `{ shopId: 1, categories: 1 }` index দিয়ে কভার হয়)। কিন্তু
 * DB-তে আগের compound text index আগে থেকেই থাকায় mongoose সেটা অটো-আপডেট
 * করতে পারে না (নতুন নামে আলাদা index তৈরি করবে, পুরনোটা DB তে থেকে যাবে
 * এবং insert block করতেই থাকবে) — তাই এই স্ক্রিপ্ট পুরনো text index
 * খুঁজে বের করে ড্রপ করে দেয়। পরের বার সার্ভার চালু হলে mongoose সঠিক
 * `{ name: "text" }` index অটো তৈরি করে নেবে।
 *
 * চালানোর নিয়ম (backend/ ফোল্ডার থেকে):
 *   node migrations/fixProductTextIndex.js
 */

import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../src/lib/db.js";

dotenv.config();

async function run() {
  await connectDB();

  const collection = mongoose.connection.collection("products");
  const indexes = await collection.indexes();

  // ✅ MongoDB text index-এর key তে সবসময় "_fts"/"_ftsx" থাকে; এর পাশাপাশি
  // আর কোনো key থাকলে সেটাই compound (extra) field — এটাই বাগের কারণ।
  const staleTextIndexes = indexes.filter((idx) => {
    const keys = Object.keys(idx.key || {});
    const isTextIndex = keys.includes("_fts");
    const hasExtraField = keys.some((k) => k !== "_fts" && k !== "_ftsx");
    return isTextIndex && hasExtraField;
  });

  if (staleTextIndexes.length === 0) {
    console.log("🟢 কোনো stale compound text index পাওয়া যায়নি — কিছু করার দরকার নেই।");
  } else {
    for (const idx of staleTextIndexes) {
      await collection.dropIndex(idx.name);
      console.log(`✅ পুরনো "${idx.name}" (key: ${JSON.stringify(idx.key)}) index ড্রপ করা হলো।`);
    }
    console.log("👉 পরের বার backend সার্ভার চালু হলে mongoose সঠিক `{ name: \"text\" }` index অটো তৈরি করে নেবে।");
  }

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(async (err) => {
  console.error("❌ Migration ব্যর্থ হয়েছে:", err);
  await mongoose.disconnect();
  process.exit(1);
});
