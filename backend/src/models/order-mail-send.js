import mongoose from "mongoose";
import tenantPlugin from "../tenancy/tenantPlugin.js";

const OrderMailSendSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      unique: true,
      index: true,
    },

    enabled: { type: Boolean, default: true },
    emails: [
      {
        email: { type: String, required: true },
        active: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true },
);

OrderMailSendSchema.plugin(tenantPlugin);

export default mongoose.models.OrderMailSend ||
  mongoose.model("OrderMailSend", OrderMailSendSchema);
