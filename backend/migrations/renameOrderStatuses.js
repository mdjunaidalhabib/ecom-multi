/**
 * ✅ Migration: Order status নাম প্রফেশনাল করা
 *
 * পুরনো enum: pending, ready_to_delivery, send_to_courier, delivered, cancelled
 * নতুন enum:  pending, confirmed,          shipped,          delivered, cancelled
 *
 * এই স্ক্রিপ্ট existing অর্ডারগুলোর status ফিল্ড রিনেম করে দেয়, যাতে
 * পুরনো ডাটা নতুন enum ("confirmed"/"shipped") এর সাথে মিলে যায়।
 *
 * চালানোর নিয়ম (backend/ ফোল্ডার থেকে):
 *   node migrations/renameOrderStatuses.js
 *
 * ⚠️ নিরাপদে বারবার চালানো যায় (idempotent) — যে অর্ডারগুলোর status
 * ইতিমধ্যে নতুন নামে আছে সেগুলো আর ছোঁয়া হবে না (কোনো match পাবে না)।
 */

import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../src/lib/db.js";
import Order from "../src/models/Order.js";

dotenv.config();

const RENAME_MAP = {
  ready_to_delivery: "confirmed",
  send_to_courier: "shipped",
};

async function run() {
  await connectDB(process.env.MONGO_URI);

  console.log("========== ORDER STATUS RENAME MIGRATION START ==========");

  for (const [oldStatus, newStatus] of Object.entries(RENAME_MAP)) {
    const result = await Order.updateMany(
      { status: oldStatus },
      { $set: { status: newStatus } },
      { skipTenantScope: true },
    );
    const modified = result.modifiedCount ?? result.nModified ?? 0;
    console.log(`   ✅ "${oldStatus}" → "${newStatus}": ${modified} অর্ডার আপডেট হলো`);
  }

  console.log("========== ORDER STATUS RENAME MIGRATION DONE ✅ ==========");
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(async (err) => {
  console.error("❌ Migration ব্যর্থ হয়েছে:", err);
  await mongoose.disconnect();
  process.exit(1);
});
