import mongoose from "mongoose";
import Product from "../../src/models/Product.js";
import Category from "../../src/models/Category.js";

export const getProductsPublic = async (req, res) => {
  try {
    const activeCats = await Category.find({ isActive: true })
      .select("_id")
      .lean();
    const products = await Product.find({
      categories: { $in: activeCats.map((c) => c._id) },
      isActive: true,
    })
      .select("-reviews")
      .populate("categories", "name")
      .sort({ createdAt: -1 })
      .lean();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err?.message || "Server error" });
  }
};

export const getProductByIdPublic = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("categories")
      .lean();
    const hasActiveCategory =
      Array.isArray(product?.categories) &&
      product.categories.some((c) => c && c.isActive);
    if (!product || !product.isActive || !hasActiveCategory) {
      return res.status(403).json({ error: "Product is hidden or inactive" });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err?.message || "Server error" });
  }
};

// ✅ Per-product micro-cache for live stock, separate from the
// cacheResponse middleware (which keys by full URL and wouldn't help
// here since different pages request different id combinations). A
// short 3s TTL absorbs traffic bursts on this uncached-by-design
// endpoint while staying close enough to "instant" for shoppers.
const STOCK_CACHE_TTL_MS = 3_000;
const stockCache = new Map(); // productId -> { data, expiresAt }

const buildStockPayload = (p) => ({
  _id: String(p._id),
  stock: Number(p.stock || 0),
  sold: Number(p.sold || 0),
  isSoldOut: !!p.isSoldOut,
  colors: Array.isArray(p.colors)
    ? p.colors.map((c) => ({
        name: c.name,
        stock: Number(c.stock || 0),
        sold: Number(c.sold || 0),
      }))
    : [],
});

/**
 * ✅ Live stock/sold — NOT behind the response cache (cacheResponse
 * middleware) unlike the routes above, so the customer-facing product
 * detail/listing pages can show an instantly up-to-date stock count on
 * every reload while the rest of the product data (name, images, price,
 * description, etc.) still benefits from the 30s micro-cache.
 * GET /products/stock?ids=a,b,c
 */
export const getProductsStockPublic = async (req, res) => {
  try {
    const idsParam = String(req.query.ids || "").trim();
    if (!idsParam) return res.json([]);

    const ids = [
      ...new Set(
        idsParam
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s && mongoose.Types.ObjectId.isValid(s)),
      ),
    ].slice(0, 200);

    if (!ids.length) return res.json([]);

    const now = Date.now();
    const result = [];
    const idsToFetch = [];

    for (const id of ids) {
      const cached = stockCache.get(id);
      if (cached && cached.expiresAt > now) {
        result.push(cached.data);
      } else {
        idsToFetch.push(id);
      }
    }

    if (idsToFetch.length) {
      const products = await Product.find({ _id: { $in: idsToFetch } })
        .select("stock sold isSoldOut colors.name colors.stock colors.sold")
        .lean();

      for (const p of products) {
        const data = buildStockPayload(p);
        stockCache.set(String(p._id), {
          data,
          expiresAt: now + STOCK_CACHE_TTL_MS,
        });
        result.push(data);
      }
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err?.message || "Server error" });
  }
};

export const getProductsByCategoryPublic = async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId).lean();
    if (!category || !category.isActive) {
      return res.status(403).json({ error: "Category hidden or inactive" });
    }

    const products = await Product.find({
      categories: category._id,
      isActive: true,
    })
      .select("-reviews")
      .populate("categories", "name")
      .sort({ createdAt: -1 })
      .lean();

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err?.message || "Server error" });
  }
};
