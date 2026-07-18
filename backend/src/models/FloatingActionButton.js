import mongoose from "mongoose";
import tenantPlugin from "../tenancy/tenantPlugin.js";

const FloatingActionButtonSchema = new mongoose.Schema({
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: true,
    unique: true,
    index: true,
  },
  phone: { type: String, default: "" },
  whatsapp: { type: String, default: "" },
  messenger: { type: String, default: "" }, 
  enabled: { type: Boolean, default: true }, 
  updatedAt: { type: Date, default: Date.now },
});

FloatingActionButtonSchema.plugin(tenantPlugin);

const FloatingActionButton =
  mongoose.models.FloatingActionButton ||
  mongoose.model("FloatingActionButton", FloatingActionButtonSchema);

export default FloatingActionButton;
