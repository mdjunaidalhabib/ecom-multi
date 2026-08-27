import mongoose from "mongoose";
import Admin from "../../src/models/Admin.js";
import About from "../../src/models/About.js";
import Analytics from "../../src/models/Analytics.js";
import Category from "../../src/models/Category.js";
import CourierSetting from "../../src/models/CourierSetting.js";
import DeliveryCharge from "../../src/models/DeliveryCharge.js";
import FacebookGroup from "../../src/models/FacebookGroup.js";
import FloatingActionButton from "../../src/models/FloatingActionButton.js";
import Footer from "../../src/models/Footer.js";
import HomeBadge from "../../src/models/HomeBadge.js";
import Navbar from "../../src/models/Navbar.js";
import Order from "../../src/models/Order.js";
import OrderMailSend from "../../src/models/order-mail-send.js";
import PaymentMethod from "../../src/models/PaymentMethod.js";
import Product from "../../src/models/Product.js";
import Slider from "../../src/models/Slider.js";
import Trash from "../../src/models/Trash.js";
import User from "../../src/models/User.js";
import { deleteFromR2, deleteByKey } from "../r2/r2Helpers.js";

async function cleanupAssetGroup(collectionName, data) {
  try {
    if (collectionName === "Product") {
      if (data.image) await deleteFromR2(data.image);
      for (const url of data.images || []) await deleteFromR2(url);
      for (const color of data.colors || []) {
        for (const url of color.images || []) await deleteFromR2(url);
      }
    } else if (collectionName === "Category") {
      if (data.imagePublicId) await deleteByKey(data.imagePublicId);
      else if (data.image) await deleteFromR2(data.image);
    } else if (collectionName === "Slider") {
      if (data.srcPublicId) await deleteByKey(data.srcPublicId);
    }
  } catch (err) {
    console.error("⚠️ Shop permanent-delete asset cleanup failed:", err);
  }
}

const TENANT_MODELS = [
  About,
  Analytics,
  Category,
  CourierSetting,
  DeliveryCharge,
  FacebookGroup,
  FloatingActionButton,
  Footer,
  HomeBadge,
  Navbar,
  Order,
  OrderMailSend,
  PaymentMethod,
  Product,
  Slider,
  User,
];

/**
 * Permanently removes every record and external asset that belongs to a shop.
 * This is only called when a Shop trash entry is manually deleted forever or
 * reaches its 3-day expiry time.
 *
 * All DB writes run inside one transaction so a mid-way failure never leaves
 * orphaned data behind (some models wiped, others not). R2 asset deletion
 * happens only *after* the transaction commits, since external storage
 * deletes can't be rolled back — doing it first risks losing files whose DB
 * records survive a failed/rolled-back transaction.
 */
export async function permanentlyDeleteShopData(shopId) {
  const id = String(shopId);

  // Reads only — figure out which assets need R2 cleanup once the DB side
  // of the delete has actually committed.
  const [products, categories, sliders] = await Promise.all([
    Product.find({ shopId: id }).setOptions({ skipTenantScope: true }).lean(),
    Category.find({ shopId: id }).setOptions({ skipTenantScope: true }).lean(),
    Slider.find({ shopId: id }).setOptions({ skipTenantScope: true }).lean(),
  ]);

  // Items already inside this shop's recycle bin may also own assets.
  const tenantTrashEntries = await Trash.find({
    shopId: id,
    collectionName: { $ne: "Shop" },
  }).setOptions({ skipTenantScope: true });

  const assetCleanupTargets = [
    ...products.map((data) => ["Product", data]),
    ...categories.map((data) => ["Category", data]),
    ...sliders.map((data) => ["Slider", data]),
    ...tenantTrashEntries.map((entry) => [entry.collectionName, entry.data]),
  ];

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await Promise.all(
        TENANT_MODELS.map((Model) =>
          Model.deleteMany({ shopId: id }).setOptions({
            skipTenantScope: true,
            session,
          }),
        ),
      );

      await Trash.deleteMany({
        shopId: id,
        collectionName: { $ne: "Shop" },
      }).setOptions({ skipTenantScope: true, session });

      // Remove stale shop assignments from every non-platform account.
      await Admin.updateMany(
        { shops: id },
        { $pull: { shops: id } },
      ).session(session);
    });
  } catch (err) {
    console.error("❌ permanentlyDeleteShopData transaction failed:", err);
    throw new Error(
      "Shop delete ব্যর্থ হয়েছে, কোনো ডেটা পরিবর্তন হয়নি, আবার চেষ্টা করুন",
    );
  } finally {
    await session.endSession();
  }

  // DB transaction committed — now safe to remove the now-orphaned R2 files.
  for (const [collectionName, data] of assetCleanupTargets) {
    await cleanupAssetGroup(collectionName, data);
  }
}
