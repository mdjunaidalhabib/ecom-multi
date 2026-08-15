import mongoose from "mongoose";
import { buildSeedTemplateElements } from "../constants/invoiceTemplate.js";
import {
  invoiceElementSchema,
  invoiceBackgroundSchema,
  invoicePageSizeSchema,
} from "./invoiceTemplateSchema.js";

/**
 * ✅ InvoiceTemplateDefault — শপ-নির্দিষ্ট নয়, পুরো platform-এর জন্য একটাই
 * document (PlatformSettings.js এর singleton প্যাটার্ন কপি করা) — শুধু
 * super-admin এটা এডিট করতে পারে। যেসব শপের নিজস্ব InvoiceTemplate নেই
 * (বা প্ল্যানে invoiceCustomization ফিচার নেই), তাদের ইনভয়েস এই ডিফল্ট
 * ডিজাইন দিয়েই তৈরি হয়।
 */
const invoiceTemplateDefaultSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "global",
      unique: true,
      immutable: true,
    },
    pageSize: { type: invoicePageSizeSchema, default: () => ({}) },
    background: { type: invoiceBackgroundSchema, default: () => ({}) },
    elements: { type: [invoiceElementSchema], default: buildSeedTemplateElements },
  },
  { timestamps: true },
);

export const INVOICE_TEMPLATE_DEFAULT_KEY = "global";

const InvoiceTemplateDefault =
  mongoose.models.InvoiceTemplateDefault ||
  mongoose.model("InvoiceTemplateDefault", invoiceTemplateDefaultSchema);

export async function getOrCreateDefaultInvoiceTemplate() {
  let doc = await InvoiceTemplateDefault.findOne({ key: INVOICE_TEMPLATE_DEFAULT_KEY });
  if (!doc) {
    doc = await InvoiceTemplateDefault.create({
      key: INVOICE_TEMPLATE_DEFAULT_KEY,
      elements: buildSeedTemplateElements(),
    });
  }
  return doc;
}

export default InvoiceTemplateDefault;
