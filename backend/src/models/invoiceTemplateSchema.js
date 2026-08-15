import mongoose from "mongoose";
import { DEFAULT_PAGE_SIZE, buildDefaultItemsTableColumns } from "../constants/invoiceTemplate.js";

// ✅ Invoice টেমপ্লেটের element/background/pageSize sub-schema — শপ-নির্দিষ্ট
// InvoiceTemplate.js এবং প্ল্যাটফর্ম-ওয়াইড InvoiceTemplateDefault.js দুটোই
// এই একই shape শেয়ার করে (দুটো আলাদা মডেল, কিন্তু একই কাঠামো)।

const columnSchema = new mongoose.Schema(
  {
    key: { type: String, enum: ["sl", "item", "price", "qty", "total"], required: true },
    label: { type: String, default: "" },
    visible: { type: Boolean, default: true },
    width: { type: Number, default: 80 },
    order: { type: Number, default: 0 },
  },
  { _id: false },
);

export const invoiceElementSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      enum: ["logo", "shopInfo", "customerInfo", "orderInfo", "itemsTable", "totals", "footerText"],
      required: true,
    },
    visible: { type: Boolean, default: true },
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    width: { type: Number, default: 100 },
    height: { type: Number, default: 60 },
    zIndex: { type: Number, default: 1 },
    fontSize: { type: Number, default: 14 },
    color: { type: String, default: "#111827" },
    fontWeight: { type: String, enum: ["normal", "bold"], default: "normal" },
    textAlign: { type: String, enum: ["left", "center", "right"], default: "left" },
    content: { type: String, default: "" },
    columns: { type: [columnSchema], default: undefined },
  },
  { _id: false },
);

export const invoiceBackgroundSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["color", "image"], default: "color" },
    color: { type: String, default: "#ffffff" },
    imageUrl: { type: String, default: "" },
    imagePublicId: { type: String, default: "" },
  },
  { _id: false },
);

export const invoicePageSizeSchema = new mongoose.Schema(
  {
    width: { type: Number, default: DEFAULT_PAGE_SIZE.width },
    height: { type: Number, default: DEFAULT_PAGE_SIZE.height },
  },
  { _id: false },
);

export { buildDefaultItemsTableColumns };
