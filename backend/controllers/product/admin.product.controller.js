import Product from "../../src/models/Product.js";

export const getProductsAdmin = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 50, 2000); // cap max page size (raised so tools like the admin order picker can fetch the full catalog)
    const skip = (page - 1) * limit;

    const { status, badge, search, category } = req.query; // status: active|hidden ; badge: freeDelivery|bestDiscount|cartvanBox|hasVariant

    const filter = {};
    if (status === "active") filter.isActive = true;
    if (status === "hidden") filter.isActive = false;
    if (badge === "freeDelivery") filter.freeDelivery = true;
    if (badge === "bestDiscount") filter.bestDiscount = true;
    if (badge === "cartvanBox") filter.cartvanBox = true;
    // ✅ variant থাকা প্রোডাক্ট — colors array-তে অন্তত ১টা item থাকলেই ম্যাচ
    if (badge === "hasVariant") filter["colors.0"] = { $exists: true };

    // ✅ category diye filter (admin order picker-এর মতো UI-তে ব্যবহৃত)
    if (typeof category === "string" && category.trim()) {
      filter.categories = category.trim();
    }

    // ✅ product name diye quick search (case-insensitive, partial match);
    // পুরো একটা ObjectId পেস্ট করলে সেটাকে _id দিয়েও ম্যাচ করা হয়
    const q = typeof search === "string" ? search.trim() : "";
    if (q) {
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const or = [{ name: { $regex: escaped, $options: "i" } }];
      if (/^[0-9a-fA-F]{24}$/.test(q)) or.push({ _id: q });
      filter.$or = or;
    }

    const [
      products,
      total,
      all,
      active,
      hidden,
      freeDelivery,
      bestDiscount,
      cartvanBox,
      hasVariant,
    ] = await Promise.all([
      Product.find(filter)
        .populate("categories")
        // ✅ নতুন প্রোডাক্ট (সর্বোচ্চ order/serial) সবার আগে দেখানোর জন্য descending sort
        .sort({ order: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter),
      Product.countDocuments({}),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: false }),
      Product.countDocuments({ freeDelivery: true }),
      Product.countDocuments({ bestDiscount: true }),
      Product.countDocuments({ cartvanBox: true }),
      Product.countDocuments({ "colors.0": { $exists: true } }),
    ]);

    res.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      // ✅ always reflects the FULL catalog, not just the current page/filter,
      // so the tab counts on the admin page stay accurate
      counts: {
        all,
        active,
        hidden,
        freeDelivery,
        bestDiscount,
        cartvanBox,
        hasVariant,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Server error" });
  }
};

export const getProductByIdAdmin = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "categories"
    );
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err?.message || "Server error" });
  }
};

// ✅ "Hide All / Show All" — must flip every product regardless of which
// page/filter is currently shown in the admin grid, so it's done server-side
// against the full collection instead of one page at a time from the client.
export const bulkSetProductVisibility = async (req, res) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== "boolean") {
      return res.status(400).json({ error: "isActive (boolean) is required" });
    }

    const result = await Product.updateMany({}, { $set: { isActive } });
    res.json({
      message: isActive
        ? "✅ All products activated!"
        : "👁 All products hidden!",
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Server error" });
  }
};
