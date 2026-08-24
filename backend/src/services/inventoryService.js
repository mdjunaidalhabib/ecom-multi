import Product from "../models/Product.js";

const toNumber = (val, fallback = 0) => {
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
};

const normalizeString = (s) =>
  String(s || "")
    .trim()
    .toLowerCase();

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

  const product = await Product.findById(productId);
  if (!product) {
    throw new Error(`Product not found: ${productId}`);
  }

  const productHasVariants = hasVariants(product);

  // ✅ Variant Mode
  if (productHasVariants && color) {
    const targetColor = normalizeString(color);

    const idx = product.colors.findIndex(
      (c) => normalizeString(c?.name) === targetColor
    );

    if (idx === -1) {
      throw new Error(
        `Variant not found: "${color}" for product: ${product.name}`
      );
    }

    const currentVariantStock = toNumber(product.colors[idx]?.stock, 0);

    if (mode === "decrease") {
      if (currentVariantStock < qty) {
        throw new Error(
          `${product.name} (${product.colors[idx]?.name}) stock not enough. Available: ${currentVariantStock}`
        );
      }

      product.colors[idx].stock = currentVariantStock - qty;
      product.colors[idx].sold = toNumber(product.colors[idx]?.sold, 0) + qty;

      product.sold = toNumber(product.sold, 0) + qty;
    } else {
      product.colors[idx].stock = currentVariantStock + qty;
      product.colors[idx].sold = toNumber(product.colors[idx]?.sold, 0) - qty;
      if (product.colors[idx].sold < 0) product.colors[idx].sold = 0;

      product.sold = toNumber(product.sold, 0) - qty;
      if (product.sold < 0) product.sold = 0;
    }

    product.stock = computeVariantTotalStock(product.colors);
    product.isSoldOut = computeSoldOut(product);

    await product.save();
    return product;
  }

  // ✅ Normal Product (No variant)
  const baseStock = toNumber(product.stock, 0);

  if (mode === "decrease") {
    if (baseStock < qty) {
      throw new Error(
        `${product.name} stock not enough. Available: ${baseStock}`
      );
    }

    product.stock = baseStock - qty;
    product.sold = toNumber(product.sold, 0) + qty;

    if (product.stock <= 0) product.stock = 0;
  } else {
    product.stock = baseStock + qty;
    product.sold = toNumber(product.sold, 0) - qty;
    if (product.sold < 0) product.sold = 0;
  }

  product.isSoldOut = computeSoldOut(product);
  await product.save();
  return product;
};

/**
 * ✅ Apply inventory updates for a list of order items ONE AT A TIME.
 *
 * Why not Promise.all: when an order has 2+ items pointing at the same
 * product (e.g. two different colors of one product), running
 * updateInventoryForItem() concurrently makes every one of them
 * `findById` the SAME starting document before any of them `save()`.
 * Mongoose then either throws a VersionError (subdocument arrays like
 * `colors` are version-checked on save) or silently loses one of the
 * updates — both surface as random/intermittent "failed to create
 * order" behavior depending on which items happen to share a product.
 * Awaiting sequentially makes each read-modify-write see the previous
 * item's committed change.
 */
export const updateInventoryForItems = async (items, mode = "decrease") => {
  const results = [];
  for (const item of items) {
    results.push(await updateInventoryForItem(item, mode));
  }
  return results;
};
