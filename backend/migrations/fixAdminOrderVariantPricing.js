/**
 * ✅ Migration: Admin-created অর্ডারের ভুল variant price ফিক্স
 *
 * ব্যাকগ্রাউন্ড: backend/src/routes/admin/order.admin.routes.js এ (POST /
 * — admin panel থেকে "New Order" তৈরি করার route) color variant সিলেক্ট
 * করা সত্ত্বেও সবসময় product এর base price ব্যবহার হতো, variant এর নিজস্ব
 * price না। এই স্ক্রিপ্ট সেই বাগে আক্রান্ত পুরনো অর্ডারগুলো খুঁজে বের করে
 * আজকের প্রোডাক্ট ক্যাটালগ অনুযায়ী সঠিক দাম বসিয়ে দেয়।
 *
 * ⚠️ সীমাবদ্ধতা: variant এর দাম অর্ডার করার সময়ের পর বদলে থাকতে পারে —
 * তখন আজকের variant price দিয়ে ফিক্স করাটাই সবচেয়ে কাছের approximation,
 * ১০০% ঐতিহাসিকভাবে নির্ভুল না-ও হতে পারে।
 *
 * কীভাবে detect করে (bug এর exact fingerprint মেলানো হয়, যাতে ভুলভাবে
 * অন্য কোনো বৈধ item এর দাম বদলে না যায়):
 *   - order.createdBy === "admin" (এই বাগ শুধু admin route এই ছিল)
 *   - item এ color সেট করা আছে
 *   - item.price === আজকের product.price (base price বসানো হয়েছিল, প্রমাণ)
 *   - variant পাওয়া গেছে আর variant.price !== product.price (আসল সঠিক দাম আলাদা)
 * এর বাইরে অন্য কিছু (item.price base/variant কোনোটার সাথেই মেলে না —
 * সম্ভবত পরে product price বদলেছে) — সেগুলো স্কিপ করে "REVIEW" হিসেবে
 * লগ করা হয়, ধরেই নিয়ে ভুল ফিক্স না করাটাই নিরাপদ।
 *
 * চালানোর নিয়ম (backend/ ফোল্ডার থেকে):
 *   node migrations/fixAdminOrderVariantPricing.js                 → DRY RUN (কিছুই লিখবে না, শুধু কী বদলাত দেখাবে)
 *   node migrations/fixAdminOrderVariantPricing.js --apply         → আসলে DB তে লিখবে
 *   node migrations/fixAdminOrderVariantPricing.js --apply --include-locked
 *                                                                   → delivered/cancelled অর্ডারও ছোঁবে (default এ এগুলো স্কিপ হয়,
 *                                                                     কারণ delivery/cancel হয়ে যাওয়া অর্ডারের total বদলালে
 *                                                                     ইতিমধ্যে নেওয়া টাকার সাথে গরমিল হতে পারে)
 *
 * প্রোডাকশন DB এর বিপরীতে চালাতে (repo root থেকে):
 *   npm run with-tunnel -- node migrations/fixAdminOrderVariantPricing.js
 *   npm run with-tunnel -- node migrations/fixAdminOrderVariantPricing.js --apply
 *
 * ✅ নিরাপদে বারবার চালানো যায় (idempotent) — একবার ফিক্স হয়ে গেলে
 * item.price === variant.price হয়ে যায়, তাই পরের রানে আর ম্যাচ করবে না।
 */

import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../src/lib/db.js";
import Order from "../src/models/Order.js";
import Product from "../src/models/Product.js";

dotenv.config();

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const INCLUDE_LOCKED = args.includes("--include-locked");
const LOCKED_STATUSES = ["delivered", "cancelled"];

const normalize = (v) => String(v || "").trim().toLowerCase();
const money = (n) => `৳${Number(n || 0)}`;

async function run() {
  await connectDB();

  console.log("========== FIX ADMIN ORDER VARIANT PRICING ==========");
  console.log(APPLY ? "🔴 MODE: APPLY (DB will be modified)" : "🟢 MODE: DRY RUN (no writes)");
  console.log(INCLUDE_LOCKED ? "⚠️  Including delivered/cancelled orders" : "ℹ️  Skipping delivered/cancelled orders (use --include-locked to include)");
  console.log("");

  const candidateOrders = await Order.find({
    createdBy: "admin",
    items: { $elemMatch: { color: { $ne: null } } },
  });

  console.log(`🔍 Found ${candidateOrders.length} admin-created order(s) with at least one color/variant item.\n`);

  const productCache = new Map();
  const getProduct = async (productId) => {
    const key = String(productId);
    if (productCache.has(key)) return productCache.get(key);
    const p = await Product.findById(key).catch(() => null);
    productCache.set(key, p);
    return p;
  };

  let fixedOrders = 0;
  let fixedItems = 0;
  let skippedLocked = 0;
  let reviewNeeded = 0;

  for (const order of candidateOrders) {
    if (!INCLUDE_LOCKED && LOCKED_STATUSES.includes(order.status)) {
      skippedLocked++;
      continue;
    }

    let orderChanged = false;
    const itemChanges = [];

    for (const item of order.items) {
      if (!item.color) continue;

      const product = await getProduct(item.productId);
      if (!product) {
        console.log(`  ⏭️  [REVIEW] Order #${order.orderNumber ?? order._id} — product ${item.productId} not found (deleted?). Item: "${item.name}" (${item.color}) @ ${money(item.price)}`);
        reviewNeeded++;
        continue;
      }

      const basePrice = Number(product.price || 0);
      const variant = Array.isArray(product.colors)
        ? product.colors.find((c) => normalize(c?.name) === normalize(item.color))
        : null;

      if (!variant) {
        console.log(`  ⏭️  [REVIEW] Order #${order.orderNumber ?? order._id} — variant "${item.color}" not found on product "${product.name}" (renamed/removed?). Item price: ${money(item.price)}`);
        reviewNeeded++;
        continue;
      }

      const variantPrice = Number(variant.price ?? 0);
      const storedPrice = Number(item.price || 0);

      if (storedPrice === variantPrice) {
        continue; // already correct
      }

      if (storedPrice !== basePrice) {
        // Doesn't match the bug's fingerprint (base price) — likely the
        // product price changed since this order was placed. Don't guess.
        console.log(`  ⏭️  [REVIEW] Order #${order.orderNumber ?? order._id} — item "${item.name}" (${item.color}) price ${money(storedPrice)} matches neither current base (${money(basePrice)}) nor variant (${money(variantPrice)}) price. Needs manual check.`);
        reviewNeeded++;
        continue;
      }

      // ✅ Exact bug fingerprint: stored price === current base price, but a
      // differently-priced variant was selected.
      itemChanges.push({ item, from: storedPrice, to: variantPrice, name: item.name, color: item.color });
      item.price = variantPrice;
      orderChanged = true;
    }

    if (!orderChanged) continue;

    const newSubtotal = order.items.reduce(
      (sum, it) => sum + Number(it.price || 0) * Number(it.qty || 0),
      0,
    );
    const deliveryCharge = Number(order.deliveryCharge || 0);
    const discount = Number(order.discount || 0);
    const newTotal = Math.max(0, newSubtotal + deliveryCharge - discount);

    console.log(`  ✅ Order #${order.orderNumber ?? order._id} (${order.status}):`);
    for (const c of itemChanges) {
      console.log(`      - "${c.name}" (${c.color}): ${money(c.from)} → ${money(c.to)}`);
    }
    console.log(`      subtotal: ${money(order.subtotal)} → ${money(newSubtotal)}, total: ${money(order.total)} → ${money(newTotal)}`);

    fixedOrders++;
    fixedItems += itemChanges.length;

    if (APPLY) {
      await Order.updateOne(
        { _id: order._id },
        {
          $set: {
            items: order.items,
            subtotal: newSubtotal,
            total: newTotal,
          },
        },
      );
    }
  }

  console.log("");
  console.log("========== SUMMARY ==========");
  console.log(`Orders ${APPLY ? "fixed" : "that would be fixed"}: ${fixedOrders} (${fixedItems} item(s))`);
  console.log(`Orders skipped (locked, use --include-locked): ${skippedLocked}`);
  console.log(`Items needing manual review: ${reviewNeeded}`);
  if (!APPLY && fixedOrders > 0) {
    console.log("\nℹ️  This was a dry run — rerun with --apply to write these changes.");
  }
  console.log("==============================");

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(async (err) => {
  console.error("❌ Migration ব্যর্থ হয়েছে:", err);
  await mongoose.disconnect();
  process.exit(1);
});
