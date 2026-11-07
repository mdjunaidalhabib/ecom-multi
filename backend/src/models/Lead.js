import mongoose from "mongoose";

export const LEAD_PLANS = ["Starter", "Business", "Custom", "Reseller"];
export const LEAD_STATUSES = ["New", "Contacted", "Interested", "Follow-up", "Converted", "Not Interested"];
const schema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 100 },
  phone: { type: String, required: true, index: true },
  businessStatus: { type: String, enum: ["New Business", "Existing Business"], required: true },
  interestedPlan: { type: String, enum: LEAD_PLANS, required: true },
  message: { type: String, maxlength: 2000, default: "" },
  status: { type: String, enum: LEAD_STATUSES, default: "New" },
  eventId: { type: String, required: true, unique: true },
  attribution: {
    utm_source: String, utm_medium: String, utm_campaign: String,
    utm_term: String, utm_content: String, fbclid: String,
  },
  notes: [{
    text: { type: String, required: true, maxlength: 2000 },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    createdAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });
schema.index({ createdAt: -1, _id: -1 });
schema.index({ status: 1, interestedPlan: 1, createdAt: -1 });
// Platform data: deliberately no tenant plugin / shop scope.
export default mongoose.models.Lead || mongoose.model("Lead", schema);
