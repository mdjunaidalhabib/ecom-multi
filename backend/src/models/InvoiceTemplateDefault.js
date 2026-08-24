import mongoose from "mongoose";
import {
  buildSeedTemplateElements,
  buildDefaultSampleOrder,
  buildDefaultSampleShop,
} from "../constants/invoiceTemplate.js";
import {
  invoiceElementSchema,
  invoiceBackgroundSchema,
  invoicePageSizeSchema,
  invoiceSampleOrderSchema,
  invoiceSampleShopSchema,
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
    // ✅ ডিজাইনার প্রিভিউতে দেখানো ডেমো অর্ডার — শুধু super-admin এডিট করতে
    // পারে, admin এর নিজের ডিজাইনারও এই একই ডেটা fetch করে দেখায়
    sampleOrder: { type: invoiceSampleOrderSchema, default: buildDefaultSampleOrder },
    // ✅ super-admin-এর নিজের প্রিভিউয়ে দেখানো ডেমো শপ (name/phone/email) —
    // admin panel এটা ব্যবহার করে না, ওখানে সবসময় real shop দেখায়
    sampleShop: { type: invoiceSampleShopSchema, default: buildDefaultSampleShop },
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
