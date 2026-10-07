import Product from "../models/Product.js";
import StockMovement from "../models/StockMovement.js";

const toNumber = (val, fallback = 0) => {
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
};

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const hasVariants = (product) =>
  Array.isArray(product?.colors) && product.colors.length > 0;

const computeVariantTotalStock = (colors) => {
  const list = Array.isArray(colors) ? colors : [];
  return list.reduce((sum, c) => sum + toNumber(c?.stock, 0), 0);
};

const computeSoldOut = (product) => {
  if (!hasVariants(product)) return toNumber(product?.stock, 0) <= 0;
  const anyInStock = product.colors.some((c) => toNumber(c?.stock, 0) > 0);
  return !anyInStock;
};

/**
 * ✅ Inventory update (stock & sold) for a single item — shared by every
 * order-creation / cancellation path (customer checkout, admin order
 * create, admin cancel) so stock/sold stays consistent everywhere.
 *
 * Uses atomic `findOneAndUpdate`/`$inc` with a stock-guard filter instead
 * of findById -> mutate -> save. Two concurrent requests touching the
 * same product/variant (double-submit, two admins, checkout racing an
 * admin order) can no longer lose an update or throw a VersionError —
 * MongoDB applies each $inc atomically regardless of request ordering.
 *
 * item: { productId, qty, color }
 * mode: "decrease" | "increase"
 */
export const updateInventoryForItem = async (item, mode = "decrease") => {
  const productId = item?.productId;
  const qty = toNumber(item?.qty, 0);
  const color = item?.color ? String(item.color) : null;

  if (!productId || qty <= 0) {
    throw new Error(
      `Invalid order item! productId=${productId}, qty=${item?.qty}`
    );
  }

  const existing = await Product.findById(productId).lean();
  if (!existing) {
    throw new Error(`Product not found: ${productId}`);
  }

  const delta = mode === "decrease" ? -qty : qty;
  const soldDelta = mode === "decrease" ? qty : -qty;

  // ✅ Variant Mode
  if (hasVariants(existing) && color) {
    const colorRegex = new RegExp(`^${escapeRegex(color)}$`, "i");
    const targetColor = existing.colors.find((c) =>
      colorRegex.test(String(c?.name || ""))
    );

    if (!targetColor) {
      throw new Error(
        `Variant not found: "${color}" for product: ${existing.name}`
      );
    }

    const filter = {
      _id: productId,
      colors: {
        $elemMatch:
          mode === "decrease"
            ? { name: colorRegex, stock: { $gte: qty } }
            : { name: colorRegex },
      },
    };

    const updated = await Product.findOneAndUpdate(
      filter,
      {
        $inc: {
          "colors.$.stock": delta,
          "colors.$.sold": soldDelta,
          sold: soldDelta,
        },
      },
      { new: true }
    );

    if (!updated) {
      const fresh = await Product.findById(productId).lean();
      const freshColor = fresh?.colors?.find((c) =>
        colorRegex.test(String(c?.name || ""))
      );
      throw new Error(
        `${existing.name} (${color}) stock not enough. Available: ${toNumber(
          freshColor?.stock,
          0
        )}`
      );
    }

    // ✅ Clamp theoretical negatives (e.g. "increase" past what was ever sold)
    await Product.updateOne(
      { _id: productId, "colors.name": targetColor.name },
      { $max: { "colors.$.sold": 0, sold: 0 } }
    );

    const totalStock = computeVariantTotalStock(updated.colors);
    const soldOut = computeSoldOut(updated);
    await Product.updateOne(
      { _id: productId },
      { $set: { stock: totalStock, isSoldOut: soldOut } }
    );

    return updated;
  }

  // ✅ Normal Product (No variant)
  const filter = {
    _id: productId,
    ...(mode === "decrease" ? { stock: { $gte: qty } } : {}),
  };

  const updated = await Product.findOneAndUpdate(
    filter,
    { $inc: { stock: delta, sold: soldDelta } },
    { new: true }
  );

  if (!updated) {
    const fresh = await Product.findById(productId).lean();
    throw new Error(
      `${existing.name} stock not enough. Available: ${toNumber(
        fresh?.stock,
        0
      )}`
    );
  }

  const clampedStock = Math.max(0, toNumber(updated.stock, 0));
  const clampedSold = Math.max(0, toNumber(updated.sold, 0));
  const soldOut = clampedStock <= 0;

  if (
    clampedStock !== updated.stock ||
    clampedSold !== updated.sold ||
    updated.isSoldOut !== soldOut
  ) {
    await Product.updateOne(
      { _id: productId },
      { $set: { stock: clampedStock, sold: clampedSold, isSoldOut: soldOut } }
    );
  }

  return updated;
};

/**
 * ✅ Stock ledger-এ এন্ট্রি লেখা। Ledger লিখতে ব্যর্থ হলেও আসল stock
 * পরিবর্তন আটকানো হয় না (শুধু log হয়) — ledger হলো audit, source of truth না।
 *
 * ledger: { reason, order?, actor?: { type, id, name }, note? }
 */
export const recordStockMovements = async (items, mode, ledger) => {
  if (!ledger?.reason) return;
  try {
    const sign = mode === "decrease" ? -1 : 1;
    const docs = (Array.isArray(items) ? items : [])
      .filter((it) => it?.productId && toNumber(it?.qty, 0) > 0)
      .map((it) => ({
        productId: String(it.productId),
        productName: it.name || "",
        color: it.color || null,
        qty: sign * toNumber(it.qty, 0),
        reason: ledger.reason,
        orderId: ledger.order?._id || null,
        orderNumber: ledger.order?.orderNumber ?? null,
        byType: ledger.actor?.type || "system",
        byId: ledger.actor?.id ? String(ledger.actor.id) : null,
        byName: ledger.actor?.name || null,
        note: ledger.note || "",
        ...(ledger.shopId || ledger.order?.shopId
          ? { shopId: ledger.shopId || ledger.order.shopId }
          : {}),
      }));
    if (docs.length) await StockMovement.insertMany(docs);
  } catch (err) {
    console.error("❌ Stock ledger write failed:", err);
  }
};

/**
 * ✅ Product-এর বর্তমান stock এর snapshot — variant থাকলে প্রতিটা color
 * আলাদা, না থাকলে একটাই (color: null)।
 */
export const stockSnapshot = (product) => {
  const map = new Map();
  if (hasVariants(product)) {
    for (const c of product.colors) {
      map.set(String(c?.name || ""), toNumber(c?.stock, 0));
    }
  } else {
    map.set("", toNumber(product?.stock, 0));
  }
  return map;
};

/**
 * ✅ Admin product এডিট করে হাতে stock বদলালে আগের/পরের snapshot মিলিয়ে
 * পার্থক্যটুকু ledger-এ লেখা হয় — নাহলে "stock কেন বাড়ল/কমল" এর উত্তর
 * ledger-এ পাওয়া যেত না। before না দিলে (নতুন product) পুরো stock
 * "initial" হিসেবে লেখা হয়।
 */
export const recordManualStockChange = async ({ before = null, product, actor }) => {
  if (!product?._id) return;
  const after = stockSnapshot(product);
  const keys = new Set([...(before ? before.keys() : []), ...after.keys()]);

  const increases = [];
  const decreases = [];
  for (const key of keys) {
    const delta = toNumber(after.get(key), 0) - toNumber(before?.get(key), 0);
    if (!delta) continue;
    const item = {
      productId: String(product._id),
      name: product.name || "",
      color: key || null,
      qty: Math.abs(delta),
    };
    (delta > 0 ? increases : decreases).push(item);
  }

  const ledger = {
    reason: before ? "manual_adjust" : "initial",
    actor,
    shopId: product.shopId,
    note: before ? "Product এডিট থেকে stock পরিবর্তন" : "Opening stock",
  };
  await recordStockMovements(increases, "increase", ledger);
  await recordStockMovements(decreases, "decrease", ledger);
};

/**
 * ✅ Apply inventory updates for a list of order items, one at a time.
 * Sequential (not Promise.all) keeps per-item error messages deterministic
 * when an order has 2+ items pointing at the same product — correctness
 * under concurrency itself is guaranteed by the atomic $inc above, not by
 * this ordering.
 *
 * "decrease" (stock কাটা) all-or-nothing: কোনো একটা item ব্যর্থ হলে আগে
 * যেগুলো কাটা হয়েছে সেগুলো ফেরত দেওয়া হয়, তারপর error throw হয় — নাহলে
 * ৩ item-এর অর্ডারে ৩য়টার stock না থাকলে প্রথম ২টার stock কাটা অবস্থায়
 * আটকে থাকত (অর্ডার rollback হলেও), আর হিসাব গরমিল হতো।
 *
 * "increase" (restock) best-effort: একটা item ব্যর্থ হলেও (যেমন product
 * delete হয়ে গেছে) বাকিগুলো ফেরত যায়, শেষে প্রথম error throw হয়।
 *
 * `ledger` দিলে যেগুলো সফল হয়েছে সেগুলোর stock ledger এন্ট্রি লেখা হয়।
 */
export const updateInventoryForItems = async (
  items,
  mode = "decrease",
  ledger = null,
) => {
  const list = Array.isArray(items) ? items : [];
  const results = [];
  const applied = [];
  let firstError = null;

  for (const item of list) {
    try {
      results.push(await updateInventoryForItem(item, mode));
      applied.push(item);
    } catch (err) {
      if (mode !== "decrease") {
        console.error("❌ Restock failed for item:", item, err);
        firstError = firstError || err;
        continue;
      }
      for (const done of applied) {
        try {
          await updateInventoryForItem(done, "increase");
        } catch (revertErr) {
          console.error("❌ Inventory rollback failed for item:", done, revertErr);
        }
      }
      throw err;
    }
  }

  await recordStockMovements(applied, mode, ledger);
  if (firstError) throw firstError;
  return results;
};
