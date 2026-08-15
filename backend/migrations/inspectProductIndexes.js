/**
 * ✅ Diagnostic: "products" collection এর সব index লিস্ট করে দেখায়, এবং
 * schema-তে (Product.js) আর নেই এমন কোনো stale unique index থাকলে সেটা
 * আলাদা করে হাইলাইট করে।
 *
 * কেন দরকার: Product creation এ E11000 duplicate key error আসছে, কিন্তু
 * বর্তমান Product.js schema তে কোনো `unique: true` ফিল্ড নেই। এর মানে
 * MongoDB-তে একটা leftover unique index (যেমন slug_1 বা sku_1) রয়ে গেছে
 * যেটা আগে schema-তে ছিল কিন্তু এখন সরিয়ে ফেলা হয়েছে। যেহেতু নতুন
 * document গুলোতে ওই ফিল্ড আর সেট করা হয় না (মান `null`/`undefined`),
 * MongoDB প্রতিটা null value কে duplicate ধরে ফেলে (unique index-এ একাধিক
 * null থাকতে পারে না, যদি sparse না হয়)।
 *
 * চালানোর নিয়ম (backend/ ফোল্ডার থেকে, শুধু READ-ONLY — কিছু ড্রপ করে না):
 *   node migrations/inspectProductIndexes.js
 *
 * নিচে যে index(গুলো) স্টেল/leftover মনে হচ্ছে সেগুলোর নাম কনসোলে প্রিন্ট
 * হবে। কনফার্ম করার পর নিচের কমেন্ট করা dropIndex ব্লকে সেই নাম বসিয়ে
 * uncomment করে আবার চালান।
 */

import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../src/lib/db.js";

dotenv.config();

// ✅ Product.js schema-তে আসলে যে ফিল্ডগুলোতে index আছে (এগুলো স্বাভাবিক,
// drop করার দরকার নেই): _id, shopId, name(text), categories, isActive,
// createdAt, order — এবং কোনোটাই unique না।
const EXPECTED_NON_UNIQUE_KEY_PREFIXES = [
  "_id",
  "shopId",
  "name",
  "categories",
  "isActive",
  "createdAt",
  "order",
];

async function run() {
  await connectDB();

  const collection = mongoose.connection.collection("products");
  const indexes = await collection.indexes();

  console.log(`\n📋 "products" collection এ মোট ${indexes.length}টি index পাওয়া গেছে:\n`);

  const suspiciousUniqueIndexes = [];

  for (const idx of indexes) {
    const keyStr = JSON.stringify(idx.key);
    console.log(
      `  • name: ${idx.name}\n    key: ${keyStr}\n    unique: ${!!idx.unique}\n    sparse: ${!!idx.sparse}\n`,
    );

    if (idx.unique && idx.name !== "_id_") {
      suspiciousUniqueIndexes.push(idx);
    }
  }

  if (suspiciousUniqueIndexes.length === 0) {
    console.log("🟢 _id_ ছাড়া অন্য কোনো unique index পাওয়া যায়নি — E11000 এর কারণ অন্য কিছু হতে পারে।");
  } else {
    console.log("🔴 নিচের unique index(গুলো) সন্দেহজনক — বর্তমান Product.js schema-তে এদের সংশ্লিষ্ট কোনো `unique: true` ফিল্ড নেই:\n");
    for (const idx of suspiciousUniqueIndexes) {
      console.log(`   - "${idx.name}"  (key: ${JSON.stringify(idx.key)})`);
    }
    console.log(
      "\n👉 উপরের নাম(গুলো) কনফার্ম করে নিচের কমেন্ট করা কোড uncomment করে আবার চালান।",
    );
  }

  // ⚠️ কনফার্ম করার পর, নিচের লাইন uncomment করে নির্দিষ্ট index name বসান
  // এবং আবার `node migrations/inspectProductIndexes.js` চালান:
  //
  // const indexNameToDrop = "slug_1"; // ← এখানে সন্দেহজনক index-এর আসল নাম বসান
  // await collection.dropIndex(indexNameToDrop);
  // console.log(`✅ "${indexNameToDrop}" index ড্রপ করা হলো।`);

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(async (err) => {
  console.error("❌ Index inspection ব্যর্থ হয়েছে:", err);
  await mongoose.disconnect();
  process.exit(1);
});
