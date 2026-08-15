import Product from "../../src/models/Product.js";

export const getProductsAdmin = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 50, 2000); // cap max page size (raised so tools like the admin order picker can fetch the full catalog)
    const skip = (page - 1) * limit;

    const { status, badge, search } = req.query; // status: active|hidden ; badge: freeDelivery|bestDiscount|cartvanBox

    const filter = {};
    if (status === "active") filter.isActive = true;
    if (status === "hidden") filter.isActive = false;
    if (badge === "freeDelivery") filter.freeDelivery = true;
    if (badge === "bestDiscount") filter.bestDiscount = true;
    if (badge === "cartvanBox") filter.cartvanBox = true;

    // ✅ product name diye quick search (case-insensitive, partial match)
    const q = typeof search === "string" ? search.trim() : "";
    if (q) {
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.name = { $regex: escaped, $options: "i" };
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
    ] = await Promise.all([
      Product.find(filter)
        .populate("categories")
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter),
      Product.countDocuments({}),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: false }),
      Product.countDocuments({ freeDelivery: true }),
      Product.countDocuments({ bestDiscount: true }),
      Product.countDocuments({ cartvanBox: true }),
    ]);

    res.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      // ✅ always reflects the FULL catalog, not just the current page/filter,
      // so the tab counts on the admin page stay accurate
      counts: { all, active, hidden, freeDelivery, bestDiscount, cartvanBox },
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
