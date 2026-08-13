import mongoose from "mongoose";
import tenantPlugin from "../tenancy/tenantPlugin.js";

/**
 * ✅ শপ অ্যাডমিন প্ল্যান আপগ্রেড/ডাউনগ্রেড চাইলে এখানে রিকোয়েস্ট জমা হয়।
 * সুপার-অ্যাডমিন approve করলে Shop.plan + Shop.limits আপডেট হয়
 * (দেখুন planRequest.superadmin.controller.js)।
 */
const planChangeRequestSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      index: true,
    },
    currentPlan: {
      type: String,
      enum: ["free", "starter", "pro"],
      required: true,
    },
    requestedPlan: {
      type: String,
      enum: ["free", "starter", "pro"],
      required: true,
    },
    note: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    reviewNote: { type: String, trim: true, default: "" },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

planChangeRequestSchema.pre("validate", function (next) {
  if (this.requestedPlan === this.currentPlan) {
    return next(new Error("বর্তমান প্ল্যান আর অনুরোধ করা প্ল্যান একই হতে পারবে না"));
  }
  next();
});

planChangeRequestSchema.index({ shopId: 1, status: 1, createdAt: -1 });

planChangeRequestSchema.plugin(tenantPlugin);

export default mongoose.models.PlanChangeRequest ||
  mongoose.model("PlanChangeRequest", planChangeRequestSchema);
