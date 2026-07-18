import mongoose from "mongoose";
import tenantPlugin from "../tenancy/tenantPlugin.js";

const analyticsSchema = new mongoose.Schema({
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: true,
    unique: true,
    index: true,
  },
  totalVisitors: { type: Number, default: 0 },
  todayVisitors: { type: Number, default: 0 },
  mobile: { type: Number, default: 0 },
  desktop: { type: Number, default: 0 },
  lastReset: { type: Date, default: Date.now },
});

analyticsSchema.plugin(tenantPlugin);

export default mongoose.models.Analytics ||
  mongoose.model("Analytics", analyticsSchema);
