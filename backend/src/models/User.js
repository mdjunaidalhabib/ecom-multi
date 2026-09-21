import mongoose from "mongoose";
import Counter from "./Counter.js";
import tenantPlugin from "../tenancy/tenantPlugin.js";
import { getCurrentShopId } from "../tenancy/shopContext.js";

const userSchema = new mongoose.Schema(
  {
    // ✅ Multi-tenant: এই কাস্টমার কোন শপের।
    // একই মানুষ (একই googleId) আলাদা আলাদা শপে আলাদা account হিসেবে থাকতে পারবে।
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      index: true,
    },

    // ✅ শুধু Google দিয়ে তৈরি account-এ থাকে; ইমেইল+পাসওয়ার্ডে sign-up করা
    // account-এ এই ফিল্ড থাকে না (নিচের partial unique index সেটাই সম্ভব করে)।
    googleId: { type: String, index: true },

    // ✅ ইমেইল+পাসওয়ার্ড login-এর bcrypt hash। select: false — তাই কোনো query
    // (/auth/me, profile, orders ইত্যাদি) এটা ফেরত দেয় না; শুধু login-এ
    // `.select("+password")` করে আনা হয়। Google-only account-এ এটা থাকে না।
    password: { type: String, select: false },

    userId: { type: Number, index: true }, // ✅ auto incremented ID (per shop)

    name: { type: String, default: "" },

    // ✅ optional email (unique + sparse, per shop)
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: "",
    },

    // ✅ Avatar field with default image
    avatar: {
      type: String,
      default: "https://i.pravatar.cc/150?u=default",
    },

    // ✅ NEW: profile details fields
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    country: { type: String, default: "" },
  },
  { timestamps: true }
);

// ✅ একই শপে একজন কাস্টমারের একটাই googleId থাকবে, কিন্তু ভিন্ন শপে
// একই googleId দিয়ে আলাদা account তৈরি হতে পারবে।
// ⚠️ partial: googleId ছাড়া (ম্যানুয়াল sign-up) ডকুমেন্টগুলো index-এর বাইরে থাকে,
// নাহলে একই শপের দ্বিতীয় ম্যানুয়াল ইউজারেই E11000 duplicate-key হতো।
// পুরনো non-partial index বদলাতে migrations/allowManualUsers.js একবার চালাতে হবে।
userSchema.index(
  { shopId: 1, googleId: 1 },
  { unique: true, partialFilterExpression: { googleId: { $type: "string" } } },
);
userSchema.index(
  { shopId: 1, email: 1 },
  { unique: true, partialFilterExpression: { email: { $gt: "" } } },
);
userSchema.index({ shopId: 1, userId: 1 }, { unique: true });

userSchema.plugin(tenantPlugin);

// ✅ Pre-save hook to auto-increment userId safely, PER SHOP
userSchema.pre("save", async function (next) {
  if (this.isNew && (this.userId === undefined || this.userId === null)) {
    const shopId = this.shopId || getCurrentShopId();
    try {
      const counter = await Counter.findOneAndUpdate(
        { name: `userId:${shopId}` },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.userId = counter?.seq ?? 1;
    } catch (e) {
      // fallback if counter fails
      this.userId = Math.floor(Date.now() / 1000);
    }
  }
  next();
});

export default mongoose.models.User || mongoose.model("User", userSchema);
