/**
 * ✅ Migration: Multi-tenant বানানোর প্রথম ধাপ
 *
 * এই স্ক্রিপ্ট কী করে:
 *  1. একটা "default" Shop তৈরি করে (তোমার এখনকার একমাত্র শপ)
 *  2. সব existing document-এ ওই default shop-এর shopId বসিয়ে দেয়
 *  3. সব existing Admin-কে role: "superadmin" বানায়
 *
 * চালানোর নিয়ম (backend/ ফোল্ডার থেকে):
 *   node migrations/backfillShopId.js --domain=yourshop.com --name="Your Shop Name"
 *
 * উদাহরণ:
 *   node migrations/backfillShopId.js --domain=cartvan.com --name="Cartvan"
 *
 * ⚠️ এই স্ক্রিপ্ট নিরাপদে বারবার চালানো যায় (idempotent) — যেসব ডকুমেন্টে
 * shopId ইতিমধ্যে আছে সেগুলো আর ছোঁয়া হবে না।
 */

import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../src/lib/db.js";
import Shop from "../src/models/Shop.js";
import Admin from "../src/models/Admin.js";
import Product from "../src/models/Product.js";
import Category from "../src/models/Category.js";
import Order from "../src/models/Order.js";
import User from "../src/models/User.js";
import Slider from "../src/models/Slider.js";
import Navbar from "../src/models/Navbar.js";
import Footer from "../src/models/Footer.js";
import About from "../src/models/About.js";
import HomeBadge from "../src/models/HomeBadge.js";
import FacebookGroup from "../src/models/FacebookGroup.js";
import FloatingActionButton from "../src/models/FloatingActionButton.js";
import PaymentMethod from "../src/models/PaymentMethod.js";
import DeliveryCharge from "../src/models/DeliveryCharge.js";
import CourierSetting from "../src/models/CourierSetting.js";
import Trash from "../src/models/Trash.js";
import Analytics from "../src/models/Analytics.js";
import OrderMailSend from "../src/models/order-mail-send.js";

dotenv.config();

// --- CLI args parse (--domain=xxx --name="xxx") ---
const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [key, ...rest] = arg.replace(/^--/, "").split("=");
    return [key, rest.join("=")];
  }),
);

const DEFAULT_DOMAIN = args.domain || process.env.DEFAULT_SHOP_DOMAIN;
const DEFAULT_NAME = args.name || process.env.DEFAULT_SHOP_NAME || "Default Shop";

// প্রতিটা tenant-scoped model backfill করার জন্য: query তে shopId
// skipTenantScope option ছাড়া চালালে tenantPlugin নিজেই shopId ঢুকিয়ে
// দেবে যদি context থাকে — কিন্তু migration script-এ কোনো request context
// নেই, তাই safe, শুধু `updateMany` raw ব্যবহার করছি {skipTenantScope:true}।
const MODELS_TO_BACKFILL = [
  Product,
  Category,
  Order,
  User,
  Slider,
  Navbar,
  Footer,
  About,
  HomeBadge,
  FacebookGroup,
  FloatingActionButton,
  PaymentMethod,
  DeliveryCharge,
  CourierSetting,
  Trash,
  Analytics,
  OrderMailSend,
];

async function run() {
  if (!DEFAULT_DOMAIN) {
    console.error(
      "❌ --domain=yourshop.com দিতে হবে (অথবা .env এ DEFAULT_SHOP_DOMAIN সেট করুন)।\n" +
        '   উদাহরণ: node migrations/backfillShopId.js --domain=cartvan.com --name="Cartvan"',
    );
    process.exit(1);
  }

  await connectDB(process.env.MONGO_URI);

  console.log("========== MULTI-TENANT MIGRATION START ==========");

  // 1️⃣ Default shop তৈরি (অথবা আগে থেকে থাকলে সেটাই ব্যবহার)
  let shop = await Shop.findOne({ domain: DEFAULT_DOMAIN.toLowerCase() });
  if (!shop) {
    shop = await Shop.create({
      name: DEFAULT_NAME,
      slug: DEFAULT_NAME.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "default-shop",
      domain: DEFAULT_DOMAIN.toLowerCase(),
      domainStatus: "verified", // ধরে নিচ্ছি এটা ইতিমধ্যে লাইভ ডোমেইন
      domainVerifiedAt: new Date(),
      status: "active",
      plan: "pro",
    });
    console.log(`🟢 Default Shop তৈরি হলো: ${shop.name} (${shop.domain}) — id: ${shop._id}`);
  } else {
    console.log(`🟡 Default Shop আগে থেকেই আছে: ${shop.name} (${shop.domain}) — id: ${shop._id}`);
  }

  // 2️⃣ সব model-এ shopId backfill (যেখানে shopId নেই বা null)
  for (const Model of MODELS_TO_BACKFILL) {
    const modelName = Model.modelName;
    try {
      const result = await Model.updateMany(
        { $or: [{ shopId: { $exists: false } }, { shopId: null }] },
        { $set: { shopId: shop._id } },
        { skipTenantScope: true },
      );
      const modified = result.modifiedCount ?? result.nModified ?? 0;
      console.log(`   ✅ ${modelName}: ${modified} ডকুমেন্ট আপডেট হলো`);
    } catch (err) {
      console.error(`   ❌ ${modelName} backfill করতে সমস্যা হয়েছে:`, err.message);
    }
  }

  // 3️⃣ Admin -> superadmin + এই শপ owner
  const adminResult = await Admin.updateMany(
    { role: { $ne: "superadmin" } },
    { $set: { role: "superadmin" } },
  );
  console.log(
    `   ✅ Admin: ${adminResult.modifiedCount ?? adminResult.nModified ?? 0} জনকে superadmin বানানো হলো`,
  );

  if (!shop.ownerAdminId) {
    const anyAdmin = await Admin.findOne({ role: "superadmin" });
    if (anyAdmin) {
      shop.ownerAdminId = anyAdmin._id;
      await shop.save();
      console.log(`   ✅ Shop owner সেট করা হলো: ${anyAdmin.email}`);
    }
  }

  console.log("========== MULTI-TENANT MIGRATION DONE ✅ ==========");
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(async (err) => {
  console.error("❌ Migration ব্যর্থ হয়েছে:", err);
  await mongoose.disconnect();
  process.exit(1);
});
