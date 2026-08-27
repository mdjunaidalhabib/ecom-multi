import mongoose from "mongoose";
import Trash from "../../src/models/Trash.js";
import Product from "../../src/models/Product.js";
import Category from "../../src/models/Category.js";
import Slider from "../../src/models/Slider.js";
import Order from "../../src/models/Order.js";
import PaymentMethod from "../../src/models/PaymentMethod.js";
import Shop from "../../src/models/Shop.js";
import { permanentlyDeleteShopData } from "../shop/shopTrash.helpers.js";
import { deleteFromR2, deleteByKey } from "../r2/r2Helpers.js";

// ✅ যতদিন Trash এ রাখা হবে, তারপর auto-delete (permanent)
export const TRASH_TTL_DAYS = 3;

// ✅ প্রতিটা collection এর জন্য মডেল ম্যাপ (restore এর সময় দরকার)
const MODEL_MAP = {
  Product,
  Category,
  Slider,
  Order,
  PaymentMethod,
  Shop,
};

// ✅ Trash list এ দেখানোর জন্য একটা readable label বানানো
const getLabel = (collectionName, data) => {
  switch (collectionName) {
    case "Product":
      return data?.name || "Unnamed product";
    case "Category":
      return data?.name || "Unnamed category";
    case "Slider":
      return data?.title || "Untitled slide";
    case "Order":
      return data?.billing?.name
        ? `Order - ${data.billing.name}`
        : `Order #${String(data?._id || "").slice(-6)}`;
    case "PaymentMethod":
      return data?.name ? `Payment Method - ${data.name}` : "Unnamed payment method";
    case "Shop":
      return data?.name ? `${data.name} (${data.domain || "no domain"})` : "Unnamed shop";
    default:
      return data?.name || data?.title || String(data?._id || "Item");
  }
};

/**
 * ✅ Hard-delete এর বদলে item টা Trash এ move করে।
 * NOTE: এখানে কোনো R2 image ডিলিট করা হয় না — restore করলে
 * যাতে ছবি সহ পুরোপুরি ফিরে আসে। Image/asset শুধু permanent delete
 * (manual অথবা auto-purge) এর সময় cleanup হবে।
 *
 * @param {string} collectionName - "Product" | "Category" | "Slider" | "Order"
 * @param {import("mongoose").Document} doc - already-fetched mongoose document
 */
export const moveToTrash = async (
  collectionName,
  doc,
  { shopId, metadata = {} } = {},
) => {
  const data = doc.toObject({ depopulate: true });

  // Creating the Trash entry and deleting the original document must be
  // atomic — otherwise a mid-way failure can create a Trash entry whose
  // original document never actually gets deleted (or vice versa).
  const session = await mongoose.startSession();
  let trashEntry;
  try {
    await session.withTransaction(async () => {
      const [created] = await Trash.create(
        [
          {
            shopId: shopId || data.shopId,
            collectionName,
            originalId: doc._id,
            label: getLabel(collectionName, data),
            data,
            deletedAt: new Date(),
            expiresAt: new Date(Date.now() + TRASH_TTL_DAYS * 24 * 60 * 60 * 1000),
            metadata,
          },
        ],
        { session },
      );
      trashEntry = created;

      await doc.deleteOne({ session });
    });
  } catch (err) {
    console.error("❌ moveToTrash transaction failed:", err);
    throw new Error(
      "আইটেম Trash-এ পাঠানো ব্যর্থ হয়েছে, কোনো ডেটা পরিবর্তন হয়নি, আবার চেষ্টা করুন",
    );
  } finally {
    await session.endSession();
  }

  return trashEntry;
};

/**
 * ✅ Trash এ থাকা কোনো item এর সাথে জড়িত R2 image/asset ডিলিট করে।
 * শুধু permanent delete (manual "Delete forever" অথবা 3 দিন পর auto-purge)
 * এর সময় call হবে — soft delete/restore এ না।
 */
export const cleanupTrashAssets = async (collectionName, data) => {
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
    } else if (collectionName === "Shop") {
      if (data?.branding?.logoPublicId) {
        await deleteByKey(data.branding.logoPublicId);
      } else if (data?.branding?.logo) {
        await deleteFromR2(data.branding.logo);
      }
    }
    // Order ইত্যাদির কোনো external asset নেই
  } catch (err) {
    console.error("⚠️ Trash asset cleanup failed:", err);
  }
};

/**
 * ✅ Trash থেকে original collection এ ফিরিয়ে আনে (একই _id সহ)।
 */
export const restoreFromTrashEntry = async (trashEntry) => {
  const Model = MODEL_MAP[trashEntry.collectionName];
  if (!Model) {
    throw new Error(`Unknown collection: ${trashEntry.collectionName}`);
  }

  const data = { ...trashEntry.data };

  // Restoring the document and removing the Trash entry must be atomic —
  // otherwise a mid-way failure can restore the document but leave the
  // Trash entry behind (or vice versa). Duplicate-key (11000) errors from
  // restored.save() are intentionally left unwrapped so callers can still
  // detect them (see admin.shop.controller.js's restoreDeletedShop).
  const session = await mongoose.startSession();
  let restored;
  try {
    await session.withTransaction(async () => {
      restored = new Model(data);
      restored.isNew = true;
      await restored.save({ session });

      await trashEntry.deleteOne({ session });
    });
  } finally {
    await session.endSession();
  }

  return restored;
};

/**
 * ✅ যেসব trash entry এর expiresAt পার হয়ে গেছে, সেগুলোর asset cleanup করে
 * permanently ডিলিট করে দেয়। server.js থেকে boot এ একবার + প্রতি ঘন্টায় call হয়।
 */
export const purgeExpiredTrash = async () => {
  try {
    const expired = await Trash.find({ expiresAt: { $lte: new Date() } });

    for (const entry of expired) {
      if (entry.collectionName === "Shop") {
        await permanentlyDeleteShopData(entry.originalId);
      }
      await cleanupTrashAssets(entry.collectionName, entry.data);
      await entry.deleteOne();
    }

    if (expired.length) {
      console.log(
        `🗑️ Trash auto-purge: removed ${expired.length} expired item(s)`,
      );
    }
  } catch (err) {
    console.error("❌ Trash auto-purge failed:", err);
  }
};
