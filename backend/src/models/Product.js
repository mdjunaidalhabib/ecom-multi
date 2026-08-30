import mongoose from "mongoose";
import tenantPlugin from "../tenancy/tenantPlugin.js";

// --- Variant/Color Schema ---
const colorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    // ✅ Variant price (per color)
    price: { type: Number, default: 0, min: 0 },

    // ✅ Optional oldPrice (per color)
    oldPrice: { type: Number, default: null, min: 0 },

    // ✅ Admin-only ক্রয় মূল্য (Cost/Purchase Price) — per variant. কাস্টমারকে
    // কখনোই দেখানো হয় না; public.product.controller.js এর সব query তে
    // .select("-colors.costPrice") দিয়ে বাদ দেওয়া আছে।
    costPrice: { type: Number, default: null, min: 0 },

    images: { type: [String], default: [] },

    stock: { type: Number, default: 0, min: 0 },
    sold: { type: Number, default: 0, min: 0 },
  },
  { _id: true },
);

// --- Review Schema ---
const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    }, // ✅ FIX
    user: { type: String, default: "" },
    avatar: { type: String, default: "" },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    comment: { type: String, default: "" },
  },
  { timestamps: true },
);

const productSchema = new mongoose.Schema(
  {
    // ✅ Multi-tenant: এই product কোন শপের
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      index: true,
    },

    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },

    // ✅ default null
    oldPrice: { type: Number, default: null, min: 0 },

    // ✅ Admin-only ক্রয় মূল্য (Cost/Purchase Price) — কাস্টমারকে কখনোই দেখানো
    // হয় না, শুধুমাত্র admin panel এ profit margin হিসাব করার জন্য ব্যবহৃত হয়।
    // সব public.product.controller.js এর query তে এই ফিল্ড explicit ভাবে
    // .select("-costPrice") দিয়ে বাদ দেওয়া আছে — কোনোভাবেই storefront এ যাবে না।
    costPrice: { type: Number, default: null, min: 0 },

    image: { type: String, default: "" }, // Main Image
    images: { type: [String], default: [] }, // Gallery Images

    // ✅ variants
    colors: { type: [colorSchema], default: [] },

    rating: { type: Number, default: 0, min: 0, max: 5 },
    description: { type: String, default: "" },
    additionalInfo: { type: String, default: "" },
    reviews: [reviewSchema],

    stock: { type: Number, default: 0, min: 0 },
    sold: { type: Number, default: 0, min: 0 },

    isSoldOut: { type: Boolean, default: false },

    categories: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "Product must belong to at least one category",
      },
    },

    order: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },

    // ✅ OfferBadge fields
    freeDelivery: { type: Boolean, default: false },
    bestDiscount: { type: Boolean, default: false },
    cartvanBox: { type: Boolean, default: false },

    // ✅ Review Video Link — অন্য প্লাটফর্মে (YouTube/Facebook/TikTok ইত্যাদি)
    // থাকা এই প্রোডাক্টের রিভিউ ভিডিওর লিংক। সিঙ্গেল প্রোডাক্ট পেজে
    // Facebook Group লিংকের উপরে দেখানো হয়। link খালি থাকলে পুরো সেকশন
    // hide থাকবে (FacebookGroupLink এর মতোই আচরণ)।
    reviewVideo: {
      link: { type: String, default: "", trim: true },
      text: { type: String, default: "", trim: true },
    },
  },
  { timestamps: true },
);

productSchema.index({ name: "text" });
productSchema.index({ shopId: 1, categories: 1 });
productSchema.index({ shopId: 1, isActive: 1, createdAt: -1 });
productSchema.index({ shopId: 1, order: 1 });

productSchema.plugin(tenantPlugin);

export default mongoose.models.Product ||
  mongoose.model("Product", productSchema);
