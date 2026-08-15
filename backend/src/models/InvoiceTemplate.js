import mongoose from "mongoose";
import tenantPlugin from "../tenancy/tenantPlugin.js";
import { buildSeedTemplateElements } from "../constants/invoiceTemplate.js";
import {
  invoiceElementSchema,
  invoiceBackgroundSchema,
  invoicePageSizeSchema,
} from "./invoiceTemplateSchema.js";

/**
 * ✅ InvoiceTemplate — শপের নিজস্ব কাস্টমাইজড ইনভয়েস ডিজাইন। শুধু তখনই এই
 * ডকুমেন্ট তৈরি হয় যখন শপ admin প্রথমবার সেভ করে (Pro প্ল্যান থাকা সাপেক্ষে,
 * দেখুন invoiceTemplateService.js এর resolveInvoiceTemplateForShop) — কোনো
 * ডকুমেন্ট না থাকলে প্ল্যাটফর্ম ডিফল্ট (InvoiceTemplateDefault.js) ব্যবহার হয়।
 */
const invoiceTemplateSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      unique: true,
      index: true,
    },
    pageSize: { type: invoicePageSizeSchema, default: () => ({}) },
    background: { type: invoiceBackgroundSchema, default: () => ({}) },
    elements: { type: [invoiceElementSchema], default: buildSeedTemplateElements },
  },
  { timestamps: true },
);

invoiceTemplateSchema.plugin(tenantPlugin);

export default mongoose.models.InvoiceTemplate ||
  mongoose.model("InvoiceTemplate", invoiceTemplateSchema);
