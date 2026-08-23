/**
 * ✅ migrateCartvanShopImages — cartvan → ecom-multi ইমেজ migration runner
 *
 * cartvan (single-tenant, Cloudinary) থেকে ecom-multi (multi-tenant, R2)-এ
 * ডেটা migrate করার ইমেজ পার্ট। migrations/utils/migrateImageUrl.js ব্যবহার
 * করে প্রতিটা model-এর Cloudinary image URL field গুলো নতুন শপের R2
 * object-এ রূপান্তর করে — **শুধু নির্দিষ্ট shopId-এর ডকুমেন্টে**, অন্য কোনো
 * শপ কখনো ছোঁয় না।
 *
 * চালানোর নিয়ম (backend/ ফোল্ডার থেকে):
 *   node migrations/migrateCartvanShopImages.js
 *
 * নিয়ম:
 *  - ধরে নেয় DB-copy migration (cartvan এর ডেটা ecom-multi এ নতুন Shop
 *    হিসেবে কপি করা, একটা প্যারালাল কাজ) আগেই শেষ হয়ে গেছে —
 *    Shop.findOne({ slug: "cartvan" }) দিয়ে চেক করে; শপ এখনো তৈরি না হলে
 *    কোনো shopId বানিয়ে না নিয়ে শুধু থেমে যায়।
 *  - Idempotent: R2 URL এ থাকা field গুলো migrateImageUrl নিজেই skip করে
 *    দেয়, তাই বারবার চালালেও ইতিমধ্যে migrate হওয়া ছবি আবার আপলোড হয় না।
 *  - পুরনো Cloudinary `*PublicId` field গুলো ($unset) — R2-তে ওগুলো অর্থহীন
 *    (R2 delete হয় URL/key দিয়ে — deleteFromR2/deleteByKey — publicId দিয়ে
 *    না)।
 *  - raw driver updateOne ব্যবহার করা হয় (Mongoose validation বাইপাস করে),
 *    যাতে schema-তে থাকা অসম্পর্কিত required field গুলো migration আটকাতে
 *    না পারে।
 */

import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../src/lib/db.js";
import Shop from "../src/models/Shop.js";
import Product from "../src/models/Product.js";
import Category from "../src/models/Category.js";
import Navbar from "../src/models/Navbar.js";
import Footer from "../src/models/Footer.js";
import HomepagePopup from "../src/models/HomepagePopup.js";
import Support from "../src/models/Support.js";
import PaymentMethod from "../src/models/PaymentMethod.js";
import Slider from "../src/models/Slider.js";
import Admin from "../src/models/Admin.js";
import Order from "../src/models/Order.js";

import { migrateImageUrl } from "./utils/migrateImageUrl.js";

dotenv.config();

// CLI: node migrations/migrateCartvanShopImages.js --slug=openup (defaults to "cartvan")
const cliArgs = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [key, ...rest] = arg.replace(/^--/, "").split("=");
    return [key, rest.join("=")];
  }),
);
const CARTVAN_SHOP_SLUG = (cliArgs.slug || "cartvan").toLowerCase();

const makeStats = () => ({ found: 0, migrated: 0, skipped: 0, failed: 0, errors: [] });

/**
 * একটা একক URL migrate করে stats bucket আপডেট করে। failure নিজে থেকে log
 * হয়ে যায় (with context: exact doc/field) কিন্তু পুরো রান থামায় না —
 * বাকি documents/fields প্রসেসিং চালিয়ে যায়, ব্যর্থ হওয়া URL অপরিবর্তিত
 * থেকে যায়।
 */
async function processUrl(url, folder, context, stats) {
  stats.found += 1;
  try {
    const result = await migrateImageUrl(url, folder, { context });
    if (result.skipped) {
      stats.skipped += 1;
      return { url: result.url, changed: false };
    }
    stats.migrated += 1;
    return { url: result.url, changed: true };
  } catch (err) {
    stats.failed += 1;
    stats.errors.push({ context, url, error: err.message });
    console.error(`   ❌ ${context}: ${err.message}`);
    return { url, changed: false };
  }
}

function printStats(modelName, stats) {
  console.log(
    `   📊 ${modelName}: found=${stats.found} migrated=${stats.migrated} skipped=${stats.skipped} failed=${stats.failed}`,
  );
  if (stats.errors.length) {
    console.log(`      ⚠️ ${stats.errors.length} failure(s):`);
    stats.errors.forEach((e) => console.log(`         - ${e.context}: ${e.error}`));
  }
}

// ---------------------------------------------------------------------------
// Per-model migrators — সবগুলো একই shopId স্কোপ + raw updateOne প্যাটার্ন
// অনুসরণ করে।
// ---------------------------------------------------------------------------

async function migrateProducts(shopId, storageNumber) {
  const stats = makeStats();
  const mainFolder = `shops/${storageNumber}/products/main`;
  const galleryFolder = `shops/${storageNumber}/products/gallery`;

  const products = await Product.find({ shopId }).select("_id image images colors").lean();

  for (const p of products) {
    const update = {};
    let changed = false;

    if (p.image) {
      // eslint-disable-next-line no-await-in-loop
      const r = await processUrl(p.image, mainFolder, `Product ${p._id}.image`, stats);
      if (r.changed) {
        update.image = r.url;
        changed = true;
      }
    }

    if (Array.isArray(p.images) && p.images.length) {
      let arrChanged = false;
      const newImages = [];
      for (let i = 0; i < p.images.length; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        const r = await processUrl(p.images[i], galleryFolder, `Product ${p._id}.images[${i}]`, stats);
        newImages.push(r.url);
        if (r.changed) arrChanged = true;
      }
      if (arrChanged) {
        update.images = newImages;
        changed = true;
      }
    }

    if (Array.isArray(p.colors) && p.colors.length) {
      let colorsChanged = false;
      for (let ci = 0; ci < p.colors.length; ci += 1) {
        const colorImages = p.colors[ci].images;
        if (Array.isArray(colorImages) && colorImages.length) {
          for (let ii = 0; ii < colorImages.length; ii += 1) {
            // eslint-disable-next-line no-await-in-loop
            const r = await processUrl(
              colorImages[ii],
              galleryFolder,
              `Product ${p._id}.colors[${ci}].images[${ii}]`,
              stats,
            );
            if (r.changed) {
              colorImages[ii] = r.url;
              colorsChanged = true;
            }
          }
        }
      }
      if (colorsChanged) {
        update.colors = p.colors;
        changed = true;
      }
    }

    if (changed) {
      // eslint-disable-next-line no-await-in-loop
      await Product.updateOne({ _id: p._id }, { $set: update });
    }
  }

  printStats("Product", stats);
  return stats;
}

async function migrateCategories(shopId, storageNumber) {
  const stats = makeStats();
  const folder = `shops/${storageNumber}/categories`;
  const categories = await Category.find({ shopId }).select("_id image imagePublicId").lean();

  for (const c of categories) {
    const ops = {};
    let changed = false;

    // eslint-disable-next-line no-await-in-loop
    const r = await processUrl(c.image, folder, `Category ${c._id}.image`, stats);
    if (r.changed) {
      ops.$set = { image: r.url };
      changed = true;
    }
    if (c.imagePublicId) {
      ops.$unset = { imagePublicId: "" };
      changed = true;
    }
    if (changed) {
      // eslint-disable-next-line no-await-in-loop
      await Category.updateOne({ _id: c._id }, ops);
    }
  }

  printStats("Category", stats);
  return stats;
}

async function migrateNavbar(shopId, storageNumber) {
  const stats = makeStats();
  const folder = `shops/${storageNumber}/navbar`;
  const navbar = await Navbar.findOne({ shopId }).select("_id brand").lean();

  if (navbar) {
    const ops = {};
    let changed = false;

    const r = await processUrl(navbar.brand?.logo, folder, `Navbar ${navbar._id}.brand.logo`, stats);
    if (r.changed) {
      ops.$set = { "brand.logo": r.url };
      changed = true;
    }
    if (navbar.brand?.logoPublicId) {
      ops.$unset = { "brand.logoPublicId": "" };
      changed = true;
    }
    if (changed) {
      await Navbar.updateOne({ _id: navbar._id }, ops);
    }
  }

  printStats("Navbar", stats);
  return stats;
}

async function migrateFooter(shopId, storageNumber) {
  const stats = makeStats();
  const folder = `shops/${storageNumber}/footer`;
  const footer = await Footer.findOne({ shopId }).select("_id brand").lean();

  if (footer) {
    const ops = {};
    let changed = false;

    const r = await processUrl(footer.brand?.logo, folder, `Footer ${footer._id}.brand.logo`, stats);
    if (r.changed) {
      ops.$set = { "brand.logo": r.url };
      changed = true;
    }
    if (footer.brand?.logoPublicId) {
      ops.$unset = { "brand.logoPublicId": "" };
      changed = true;
    }
    if (changed) {
      await Footer.updateOne({ _id: footer._id }, ops);
    }
  }

  printStats("Footer", stats);
  return stats;
}

async function migrateHomepagePopup(shopId, storageNumber) {
  const stats = makeStats();
  const folder = `shops/${storageNumber}/popup`;
  const popup = await HomepagePopup.findOne({ shopId }).select("_id image imagePublicId").lean();

  if (popup) {
    const ops = {};
    let changed = false;

    const r = await processUrl(popup.image, folder, `HomepagePopup ${popup._id}.image`, stats);
    if (r.changed) {
      ops.$set = { image: r.url };
      changed = true;
    }
    if (popup.imagePublicId) {
      ops.$unset = { imagePublicId: "" };
      changed = true;
    }
    if (changed) {
      await HomepagePopup.updateOne({ _id: popup._id }, ops);
    }
  }

  printStats("HomepagePopup", stats);
  return stats;
}

async function migrateSupport(shopId, storageNumber) {
  const stats = makeStats();
  const folder = `shops/${storageNumber}/support`;
  const support = await Support.findOne({ shopId }).select("_id team").lean();

  if (support && Array.isArray(support.team) && support.team.length) {
    let changed = false;
    for (let i = 0; i < support.team.length; i += 1) {
      const member = support.team[i];
      // eslint-disable-next-line no-await-in-loop
      const r = await processUrl(member.photo, folder, `Support ${support._id}.team[${i}].photo`, stats);
      if (r.changed) {
        member.photo = r.url;
        changed = true;
      }
      if (member.photoPublicId) {
        member.photoPublicId = "";
        changed = true;
      }
    }
    if (changed) {
      await Support.updateOne({ _id: support._id }, { $set: { team: support.team } });
    }
  }

  printStats("Support", stats);
  return stats;
}

async function migratePaymentMethods(shopId, storageNumber) {
  const stats = makeStats();
  const folder = `shops/${storageNumber}/payment-methods`;
  const methods = await PaymentMethod.find({ shopId }).select("_id logo").lean();

  for (const m of methods) {
    // eslint-disable-next-line no-await-in-loop
    const r = await processUrl(m.logo, folder, `PaymentMethod ${m._id}.logo`, stats);
    if (r.changed) {
      // eslint-disable-next-line no-await-in-loop
      await PaymentMethod.updateOne({ _id: m._id }, { $set: { logo: r.url } });
    }
  }

  printStats("PaymentMethod", stats);
  return stats;
}

async function migrateSliders(shopId, storageNumber) {
  const stats = makeStats();
  const folder = `shops/${storageNumber}/sliders`;
  const sliders = await Slider.find({ shopId }).select("_id src srcPublicId").lean();

  for (const s of sliders) {
    const ops = {};
    let changed = false;

    // eslint-disable-next-line no-await-in-loop
    const r = await processUrl(s.src, folder, `Slider ${s._id}.src`, stats);
    if (r.changed) {
      ops.$set = { src: r.url };
      changed = true;
    }
    if (s.srcPublicId) {
      ops.$unset = { srcPublicId: "" };
      changed = true;
    }
    if (changed) {
      // eslint-disable-next-line no-await-in-loop
      await Slider.updateOne({ _id: s._id }, ops);
    }
  }

  printStats("Slider", stats);
  return stats;
}

async function migrateAdmins(shopId, storageNumber) {
  const stats = makeStats();
  const folder = `shops/${storageNumber}/admins`;
  // ⚠️ শুধু ওই admin গুলো, যাদের shops array-তে এই নির্দিষ্ট শপের id
  // আছে — superadmin বা অন্য শপে assigned admin কখনো ছোঁয়া হয় না।
  const admins = await Admin.find({ shops: shopId }).select("_id avatar avatarPublicId").lean();

  for (const a of admins) {
    const ops = {};
    let changed = false;

    // eslint-disable-next-line no-await-in-loop
    const r = await processUrl(a.avatar, folder, `Admin ${a._id}.avatar`, stats);
    if (r.changed) {
      ops.$set = { avatar: r.url };
      changed = true;
    }
    if (a.avatarPublicId) {
      ops.$unset = { avatarPublicId: "" };
      changed = true;
    }
    if (changed) {
      // eslint-disable-next-line no-await-in-loop
      await Admin.updateOne({ _id: a._id }, ops);
    }
  }

  printStats("Admin", stats);
  return stats;
}

async function migrateOrders(shopId, storageNumber) {
  const stats = makeStats();
  const folder = `shops/${storageNumber}/orders`;
  // ℹ️ নিচু priority / ঐচ্ছিক (historical order snapshot) — শুধু
  // items.image পপুলেটেড থাকা order গুলোই টানা হয়, পুরো collection scan না
  // করার জন্য।
  const orders = await Order.find({ shopId, "items.image": { $exists: true, $ne: "" } })
    .select("_id items")
    .lean();

  for (const o of orders) {
    let changed = false;
    for (let i = 0; i < o.items.length; i += 1) {
      const item = o.items[i];
      if (item.image) {
        // eslint-disable-next-line no-await-in-loop
        const r = await processUrl(item.image, folder, `Order ${o._id}.items[${i}].image`, stats);
        if (r.changed) {
          item.image = r.url;
          changed = true;
        }
      }
    }
    if (changed) {
      // eslint-disable-next-line no-await-in-loop
      await Order.updateOne({ _id: o._id }, { $set: { items: o.items } });
    }
  }

  printStats("Order", stats);
  return stats;
}

// ---------------------------------------------------------------------------

/**
 * নির্দিষ্ট একটা shop-এর সব image field migrate করে (সব model জুড়ে),
 * **শুধু সেই shopId-এর ডকুমেন্টে**। Idempotent — R2-তে থাকা URL গুলো
 * migrateImageUrl নিজেই skip করে, তাই বারবার চালালেও re-upload হয় না।
 *
 * @param {{ shopId: import("mongoose").Types.ObjectId | string, storageNumber: number }} args
 */
export async function migrateShopImages({ shopId, storageNumber }) {
  if (!shopId || !storageNumber) {
    throw new Error("migrateShopImages: shopId এবং storageNumber দুটোই দরকার");
  }

  console.log(
    `\n========== Migrating images for shopId=${shopId} (storageNumber=${storageNumber}) ==========`,
  );

  const allStats = {
    Product: await migrateProducts(shopId, storageNumber),
    Category: await migrateCategories(shopId, storageNumber),
    Navbar: await migrateNavbar(shopId, storageNumber),
    Footer: await migrateFooter(shopId, storageNumber),
    HomepagePopup: await migrateHomepagePopup(shopId, storageNumber),
    Support: await migrateSupport(shopId, storageNumber),
    PaymentMethod: await migratePaymentMethods(shopId, storageNumber),
    Slider: await migrateSliders(shopId, storageNumber),
    Admin: await migrateAdmins(shopId, storageNumber),
    Order: await migrateOrders(shopId, storageNumber),
  };

  const totals = Object.values(allStats).reduce(
    (acc, s) => {
      acc.found += s.found;
      acc.migrated += s.migrated;
      acc.skipped += s.skipped;
      acc.failed += s.failed;
      return acc;
    },
    { found: 0, migrated: 0, skipped: 0, failed: 0 },
  );

  console.log("\n========== TOTAL ==========");
  console.log(
    `found=${totals.found} migrated=${totals.migrated} skipped=${totals.skipped} failed=${totals.failed}`,
  );

  return allStats;
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

async function run() {
  await connectDB();

  const shop = await Shop.findOne({ slug: CARTVAN_SHOP_SLUG }).lean();

  if (!shop) {
    console.log(
      `⏳ Shop with slug "${CARTVAN_SHOP_SLUG}" not found yet — waiting on the DB-copy ` +
        "migration to finish. Not fabricating a shopId; re-run this script once the shop exists.",
    );
    await mongoose.disconnect();
    process.exit(0);
    return;
  }

  if (!shop.storageNumber) {
    console.error(
      `❌ Shop "${shop.name}" (${shop._id}) has no storageNumber yet — cannot build R2 ` +
        "folder paths. Run migrations/backfillShopStorageNumber.js first.",
    );
    await mongoose.disconnect();
    process.exit(1);
    return;
  }

  await migrateShopImages({ shopId: shop._id, storageNumber: shop.storageNumber });

  await mongoose.disconnect();
  process.exit(0);
}

// ✅ শুধু সরাসরি `node migrations/migrateCartvanShopImages.js` দিয়ে চালালে
// run() execute হবে; অন্য স্ক্রিপ্ট থেকে import করলে শুধু migrateShopImages
// reuse করা যাবে, run() চলবে না।
const isMainModule = (() => {
  try {
    return fileURLToPath(import.meta.url) === path.resolve(process.argv[1] || "");
  } catch {
    return false;
  }
})();

if (isMainModule) {
  run().catch(async (err) => {
    console.error("❌ Migration failed:", err);
    await mongoose.disconnect();
    process.exit(1);
  });
}
