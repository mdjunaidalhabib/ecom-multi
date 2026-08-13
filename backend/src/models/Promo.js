import mongoose from "mongoose";
import tenantPlugin from "../tenancy/tenantPlugin.js";

const promoSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      index: true,
    },

    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      maxlength: 40,
    },
    title: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
    discountType: {
      type: String,
      enum: ["percentage", "fixed", "free_shipping"],
      required: true,
      index: true,
    },
    discountValue: { type: Number, default: 0, min: 0 },
    maxDiscountAmount: { type: Number, default: null, min: 0 },
    minimumOrderAmount: { type: Number, default: 0, min: 0 },
    minimumQuantity: { type: Number, default: 1, min: 1 },
    appliesTo: {
      type: String,
      enum: ["all", "products", "categories"],
      default: "all",
    },
    applicableProductIds: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    ],
    applicableCategoryIds: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    ],
    excludedProductIds: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    ],
    allowedPaymentMethods: { type: [String], default: [] },
    firstOrderOnly: { type: Boolean, default: false },
    totalUsageLimit: { type: Number, default: null, min: 1 },
    usageLimitPerCustomer: { type: Number, default: 1, min: 1 },
    usedCount: { type: Number, default: 0, min: 0 },
    startDate: { type: Date, default: null, index: true },
    endDate: { type: Date, default: null, index: true },
    isActive: { type: Boolean, default: true, index: true },
    isArchived: { type: Boolean, default: false, index: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  { timestamps: true },
);

promoSchema.pre("validate", function (next) {
  this.code = String(this.code || "").trim().toUpperCase();

  if (this.discountType === "percentage") {
    if (this.discountValue <= 0 || this.discountValue > 100) {
      return next(new Error("Percentage discount must be between 1 and 100"));
    }
  } else if (this.discountType === "fixed") {
    if (this.discountValue <= 0) {
      return next(new Error("Fixed discount must be greater than 0"));
    }
  } else if (this.discountType === "free_shipping") {
    this.discountValue = 0;
    this.maxDiscountAmount = null;
  }

  if (this.appliesTo === "products" && this.applicableProductIds.length === 0) {
    return next(new Error("Select at least one applicable product"));
  }
  if (
    this.appliesTo === "categories" &&
    this.applicableCategoryIds.length === 0
  ) {
    return next(new Error("Select at least one applicable category"));
  }
  if (this.startDate && this.endDate && this.endDate < this.startDate) {
    return next(new Error("End date must be after start date"));
  }

  next();
});

// ✅ কোড শুধু নিজের শপের মধ্যেই unique (দুই শপে একই code দুইটাই থাকতে পারবে)
promoSchema.index({ shopId: 1, code: 1 }, { unique: true });
promoSchema.index({ shopId: 1, isArchived: 1, isActive: 1, createdAt: -1 });

promoSchema.plugin(tenantPlugin);

export default mongoose.models.Promo || mongoose.model("Promo", promoSchema);
