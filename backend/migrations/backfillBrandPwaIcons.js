/**
 * ✅ Migration: প্রতিটা শপের brand logo থেকে PWA install আইকন (192/512 PNG) বানানো
 *
 * কেন দরকার: আগে মোবাইলে "Add to Home Screen" করলে প্রতিটা শপেই প্ল্যাটফর্মের
 * হার্ডকোডেড নাম ও আইকন ("Hikmah IT", frontend/public/manifest.json) দেখাতো।
 * এখন manifest per-shop ডায়নামিক (frontend/src/app/shop/[shopSlug]/manifest.json/route.js),
 * কিন্তু আইকনের জন্য square 192/512 PNG দরকার — যেটা logo আপলোডের সময় বানানো হয়
 * (src/routes/admin/navbar.admin.routes.js)। এই স্ক্রিপ্টটা সেই ভ্যারিয়েন্টগুলো
 * পুরনো (আগে থেকেই logo আপলোড করা) শপগুলোর জন্য একবার বানিয়ে দেয়, যাতে
 * অ্যাডমিনকে আবার logo আপলোড করতে না হয়।
 *
 * চালানোর নিয়ম (backend/ ফোল্ডার থেকে):
 *   node migrations/backfillBrandPwaIcons.js
 *
 * শুধু দেখতে চাইলে (কিছু লিখবে না):
 *   node migrations/backfillBrandPwaIcons.js --dry-run
 *
 * সব শপের আইকন নতুন করে বানাতে চাইলে (আগেরগুলো ওভাররাইট):
 *   node migrations/backfillBrandPwaIcons.js --force
 *
 * ⚠️ নিরাপদে বারবার চালানো যায় (idempotent) — --force ছাড়া যেসব শপে
 * pwaIcon192 ও pwaIcon512 ইতিমধ্যে আছে সেগুলো স্কিপ করা হয়।
 */

import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../src/lib/db.js";
import Shop from "../src/models/Shop.js";
import Navbar from "../src/models/Navbar.js";
import { buildBrandIconBuffers } from "../src/services/brandIconService.js";
import { deleteByKey, uploadToR2 } from "../utils/r2/r2Helpers.js";

dotenv.config();

const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has("--dry-run");
const FORCE = args.has("--force");

async function downloadLogo(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`logo download failed: HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function run() {
  await connectDB();

  // skipTenantScope — migration কোনো request context-এর বাইরে চলে, তাই
  // tenantPlugin এর shopId ফিল্টার এখানে প্রযোজ্য নয় (দেখুন src/tenancy/tenantPlugin.js)।
  const navbars = await Navbar.find({ "brand.logo": { $nin: ["", null] } })
    .setOptions({ skipTenantScope: true })
    .lean();

  console.log(`🔎 logo আছে এমন navbar পাওয়া গেছে: ${navbars.length}টি`);

  let done = 0;
  let skipped = 0;
  let failed = 0;

  for (const navbar of navbars) {
    const brand = navbar.brand || {};
    const alreadyHasIcons = Boolean(brand.pwaIcon192 && brand.pwaIcon512);

    if (alreadyHasIcons && !FORCE) {
      skipped++;
      continue;
    }

    const shop = await Shop.findById(navbar.shopId).select("name slug storageNumber").lean();
    if (!shop) {
      console.warn(`⚠️  navbar ${navbar._id} এর shop পাওয়া যায়নি — স্কিপ`);
      skipped++;
      continue;
    }

    const label = `${shop.name || shop.slug || shop._id}`;
    const storageNumber = shop.storageNumber ?? shop._id;

    if (DRY_RUN) {
      console.log(`🔸 [dry-run] আইকন বানানো হতো: ${label}`);
      done++;
      continue;
    }

    try {
      const logoBuffer = await downloadLogo(brand.logo);
      const icons = await buildBrandIconBuffers(logoBuffer);

      const [pwa192Uploaded, pwa512Uploaded] = await Promise.all([
        uploadToR2(
          { buffer: icons.pwa192, mimetype: "image/png", originalname: "pwa-icon-192.png" },
          `shops/${storageNumber}/pwa_icons`,
        ),
        uploadToR2(
          { buffer: icons.pwa512, mimetype: "image/png", originalname: "pwa-icon-512.png" },
          `shops/${storageNumber}/pwa_icons`,
        ),
      ]);

      // --force এ পুরনো ভ্যারিয়েন্ট orphan হয়ে R2-তে পড়ে থাকবে, তাই মুছে দেওয়া হয়।
      if (FORCE && brand.pwaIcon192PublicId) await deleteByKey(brand.pwaIcon192PublicId);
      if (FORCE && brand.pwaIcon512PublicId) await deleteByKey(brand.pwaIcon512PublicId);

      await Navbar.updateOne(
        { _id: navbar._id },
        {
          $set: {
            "brand.pwaIcon192": pwa192Uploaded.url,
            "brand.pwaIcon192PublicId": pwa192Uploaded.key,
            "brand.pwaIcon512": pwa512Uploaded.url,
            "brand.pwaIcon512PublicId": pwa512Uploaded.key,
          },
        },
      ).setOptions({ skipTenantScope: true });

      console.log(`✅ ${label}`);
      done++;
    } catch (err) {
      console.error(`❌ ${label}: ${err.message}`);
      failed++;
    }
  }

  console.log(
    `\n🎉 শেষ — বানানো: ${done}, স্কিপ: ${skipped}, ব্যর্থ: ${failed}${DRY_RUN ? " (dry-run)" : ""}`,
  );

  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error("🔥 Migration failed:", err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
