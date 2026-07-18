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

    googleId: { type: String, required: true, index: true },

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
// একই googleId দিয়ে আলাদা account তৈরি হতে পারবে
userSchema.index({ shopId: 1, googleId: 1 }, { unique: true });
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
