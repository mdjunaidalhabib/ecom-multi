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
      enum: [
        "logo",
        "shopName",
        "shopPhone",
        "shopEmail",
        "customerInfo",
        "orderInfo",
        "itemsTable",
        "orderNote",
        "totals",
        "footerText",
      ],
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

// ✅ শুধু InvoiceTemplateDefault.js ব্যবহার করে — invoice ডিজাইনারের প্রিভিউতে
// দেখানো নমুনা/ডেমো অর্ডার, super-admin এডিট করতে পারে (দেখুন
// invoiceTemplateDefault.superadmin.controller.js)। শপের নিজস্ব InvoiceTemplate.js
// এর অংশ না — প্রতিটা শপের নিজের অর্ডার নেই এমন প্রিভিউয়ের জন্যই শুধু।
const sampleOrderItemSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    price: { type: Number, default: 0 },
    qty: { type: Number, default: 1 },
  },
  { _id: false },
);

export const invoiceSampleOrderSchema = new mongoose.Schema(
  {
    saleChannel: { type: String, enum: ["online", "offline"], default: "online" },
    paymentMethod: { type: String, default: "cod" },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    billing: {
      name: { type: String, default: "" },
      phone: { type: String, default: "" },
      address: { type: String, default: "" },
      note: { type: String, default: "" },
    },
    items: { type: [sampleOrderItemSchema], default: undefined },
    deliveryCharge: { type: Number, default: 120 },
    discount: { type: Number, default: 0 },
  },
  { _id: false },
);

// ✅ শুধু InvoiceTemplateDefault.js ব্যবহার করে — invoice ডিজাইনারের প্রিভিউতে
// দেখানো নমুনা/ডেমো শপ তথ্য (name/phone/email), super-admin এডিট করতে পারে।
// শুধু প্রিভিউয়ের জন্য — এটা কোনো real shop না (real shop-এর জন্য দেখুন
// invoiceTemplateService.js এর resolveInvoiceTemplateForShop)।
export const invoiceSampleShopSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    contactPhone: { type: String, default: "" },
    contactEmail: { type: String, default: "" },
  },
  { _id: false },
);

export { buildDefaultItemsTableColumns };
