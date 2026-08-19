/**
 * ✅ Migration: existing শপগুলোর জন্য storageNumber (1, 2, 3, ...) backfill
 *
 * এই স্ক্রিপ্ট কী করে:
 *  1. যেসব Shop-এ storageNumber এখনো নেই, তাদের createdAt অনুযায়ী
 *     ক্রমানুসারে 1, 2, 3... বসিয়ে দেয়
 *  2. shopStorageNumber Counter-কে সবচেয়ে বড় ব্যবহৃত নাম্বারে সেট করে দেয়,
 *     যাতে পরের নতুন শপ তৈরির সময় নাম্বার ক্ল্যাশ না করে
 *
 * চালানোর নিয়ম (backend/ ফোল্ডার থেকে):
 *   node migrations/backfillShopStorageNumber.js
 *
 * ⚠️ নিরাপদে বারবার চালানো যায় (idempotent) — যেসব শপে storageNumber
 * ইতিমধ্যে আছে সেগুলো আর ছোঁয়া হয় না।
 */

import dotenv from "dotenv";
import mongoose from "mongoose";

import Shop from "../src/models/Shop.js";
import Counter from "../src/models/Counter.js";

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ DB connected");

    const existingMax = await Shop.findOne({ storageNumber: { $ne: null } })
      .sort({ storageNumber: -1 })
      .select("storageNumber")
      .lean();

    let nextSeq = existingMax?.storageNumber || 0;

    const pending = await Shop.find({
      $or: [{ storageNumber: null }, { storageNumber: { $exists: false } }],
    })
      .sort({ createdAt: 1 })
      .select("_id name");

    console.log(`ℹ️ ${pending.length}টা শপে storageNumber বসানো হবে`);

    for (const shop of pending) {
      nextSeq += 1;
      // ⚠️ storageNumber schema-তে immutable: true — doc.save() ব্যবহার করলে
      // Mongoose বিদ্যমান (isNew: false) ডকুমেন্টে সেটা silently ignore করে
      // দেয়, তাই এখানে সরাসরি query-level updateOne দিয়ে বসানো হচ্ছে
      // eslint-disable-next-line no-await-in-loop
      await Shop.updateOne({ _id: shop._id }, { $set: { storageNumber: nextSeq } });
      console.log(`  ✅ ${shop.name} → storageNumber ${nextSeq}`);
    }

    await Counter.findOneAndUpdate(
      { name: "shopStorageNumber" },
      { $set: { seq: nextSeq } },
      { upsert: true },
    );

    console.log(`✅ Done. shopStorageNumber counter এখন ${nextSeq}-এ সেট আছে।`);
  } catch (err) {
    console.error("❌ Migration failed:", err);
  } finally {
    await mongoose.disconnect();
  }
};

run();
