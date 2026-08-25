import Product from "../models/Product.js";

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
 * ✅ Apply inventory updates for a list of order items, one at a time.
 * Sequential (not Promise.all) keeps per-item error messages deterministic
 * when an order has 2+ items pointing at the same product — correctness
 * under concurrency itself is guaranteed by the atomic $inc above, not by
 * this ordering.
 */
export const updateInventoryForItems = async (items, mode = "decrease") => {
  const results = [];
  for (const item of items) {
    results.push(await updateInventoryForItem(item, mode));
  }
  return results;
};
