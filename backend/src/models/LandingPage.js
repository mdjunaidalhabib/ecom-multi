import mongoose from "mongoose";
import tenantPlugin from "../tenancy/tenantPlugin.js";

/**
 * ✅ LandingPage — single-product ad funnel পেজ (FB-ads/COD সেলারদের জন্য)।
 * Faq.js এর sections[] প্যাটার্নের মতোই free-form ordered content blocks,
 * কিন্তু per-shop singleton না — প্রতিটা Product-এর জন্য (চাইলে) একটা
 * LandingPage থাকতে পারে (productId unique — এক প্রোডাক্টে একটাই ল্যান্ডিং পেজ)।
 *
 * ⚠️ price/stock/colors কখনো এখানে duplicate করা হয় না — রেন্ডার ও অর্ডার
 * করার সময় সবসময় লাইভ Product ডকুমেন্ট থেকে পড়া হয় (single source of
 * pricing truth, orderPricingService.js যেভাবে সবসময় DB থেকে দাম রিবিল্ড করে)।
 */

const SectionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["feature", "testimonial", "faq", "richtext"],
      default: "feature",
    },
    heading: { type: String, default: "", trim: true },
    content: { type: String, default: "" }, // RichTextEditor HTML
    image: { type: String, default: "" },

    // শুধু type: "testimonial" এর জন্য প্রযোজ্য
    authorName: { type: String, default: "" },
    authorAvatar: { type: String, default: "" },
    rating: { type: Number, min: 0, max: 5, default: 5 },
  },
  { _id: true },
);

const landingPageSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      unique: true,
      index: true,
    },

    // /shop/<slug>/lp/<slug> বা custom domain-এ /lp/<slug> — readable ad-link
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: /^[a-z0-9-]+$/,
    },

    headline: { type: String, required: true, trim: true },
    subheadline: { type: String, default: "" },
    heroImages: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 5,
        message: "সর্বোচ্চ ৫টি hero image রাখা যাবে",
      },
    },

    sections: { type: [SectionSchema], default: [] },

    orderForm: {
      showNote: { type: Boolean, default: false },
      ctaText: { type: String, default: "অর্ডার করুন" },
      showQuantitySelector: { type: Boolean, default: true },
    },

    // draft/live — Product.isActive থেকে independent
    isPublished: { type: Boolean, default: false },

    // fullStorefront:false শপের root domain-এ কোন ল্যান্ডিং পেজ দেখাবে —
    // শপ-প্রতি সর্বোচ্চ একটা primary (controller লেভেলে enforce করা হয়)
    isPrimary: { type: Boolean, default: false },

    seo: {
      metaTitle: { type: String, default: "" },
      metaDescription: { type: String, default: "" },
    },
  },
  { timestamps: true },
);

landingPageSchema.index({ shopId: 1, slug: 1 }, { unique: true });
landingPageSchema.index({ shopId: 1, isPublished: 1 });
landingPageSchema.index({ shopId: 1, isPrimary: 1 });

landingPageSchema.plugin(tenantPlugin);

export default mongoose.models.LandingPage ||
  mongoose.model("LandingPage", landingPageSchema);
