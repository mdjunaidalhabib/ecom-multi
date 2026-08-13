import mongoose from "mongoose";
import tenantPlugin from "../tenancy/tenantPlugin.js";

const mailReportSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      index: true,
    },

    to: { type: String, required: true, index: true },
    purpose: { type: String, required: true, index: true },
    subject: { type: String, default: "" },
    status: {
      type: String,
      enum: ["sent", "failed"],
      default: "sent",
      index: true,
    },
    error: { type: String, default: null },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

mailReportSchema.index({ shopId: 1, createdAt: -1 });

mailReportSchema.plugin(tenantPlugin);

const MailReport =
  mongoose.models.MailReport || mongoose.model("MailReport", mailReportSchema);
export default MailReport;
