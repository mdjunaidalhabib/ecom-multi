import mongoose from "mongoose";

// ✅ Theme — super-admin এখান থেকে "থিম প্রিসেট" তৈরি/এডিট/ডিলিট করে
// (দেখুন controllers/shop/themes.admin.controller.js)। প্রতিটা প্রিসেট
// একটা `baseLayout` (এখনো কোডে লেখা ৩টা structural component সেট —
// classic/aurora/terra, দেখুন frontend/lib/themeRegistry.js) বেছে নিয়ে
// তার উপর নিজস্ব color/font বসায়। Plan.theme এবং Shop.branding.theme
// দুটোই এই মডেলের `key` ফিল্ডকে reference করে (foreign key না, প্লেইন
// স্ট্রিং — Plan.js-এর মতোই কারণে, দেখুন সেই ফাইলের কমেন্ট)।
const HEX_COLOR_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

// ✅ ফন্ট শুধু এই নির্দিষ্ট প্রিসেট থেকে বেছে নেওয়া যায় (free-text না) —
// এতে (ক) frontend-এ raw CSS ভ্যালু হিসেবে সরাসরি bosano যায় নিরাপদে,
// (খ) অস্তিত্বহীন/ভাঙা font-family বসে যাওয়ার ঝুঁকি থাকে না।
export const FONT_PRESETS = ["default", "serif", "rounded", "mono"];

function hexValidator(value) {
  return HEX_COLOR_RE.test(value);
}

const colorSchema = {
  primary: { type: String, default: "#db2777", validate: hexValidator },
  primaryDark: { type: String, default: "#be185d", validate: hexValidator },
  secondary: { type: String, default: "#111827", validate: hexValidator },
  background: { type: String, default: "#fdf2f8", validate: hexValidator },
  surface: { type: String, default: "#ffffff", validate: hexValidator },
  text: { type: String, default: "#1f2937", validate: hexValidator },
  accent: { type: String, default: "#ec4899", validate: hexValidator },
};

const themeSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      trim: true,
      lowercase: true,
    },
    name: { type: String, required: true, trim: true },

    // কোন structural component সেট (Navbar/Footer/HomeLayout) রেন্ডার হবে
    baseLayout: {
      type: String,
      enum: ["classic", "aurora", "terra"],
      required: true,
    },

    colors: { type: colorSchema, default: () => ({}) },
    fonts: {
      heading: { type: String, enum: FONT_PRESETS, default: "default" },
      body: { type: String, enum: FONT_PRESETS, default: "default" },
    },

    // ✅ true হলে এটা seed করা বেস থিম (classic/aurora/terra) — ডিলিট করা
    // যাবে না (রং/ফন্ট এডিট করা যাবে), যাতে অন্তত একটা fallback থিম প্রতি
    // baseLayout-এর জন্য সবসময় থাকে
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const Theme = mongoose.models.Theme || mongoose.model("Theme", themeSchema);
export default Theme;

// ✅ প্রথমবার কল হওয়ার সময় collection খালি থাকলে classic/aurora/terra —
// আজকের হার্ডকোডেড কালার থেকে reconstruct করা ৩টা system থিম দিয়ে seed করে।
// key গুলো ইচ্ছাকৃতভাবে পুরনো Plan.theme/Shop.branding.theme এনাম ভ্যালুর
// (classic/aurora/terra) সাথে হুবহু মিলিয়ে রাখা হয়েছে, তাই কোনো ডেটা
// মাইগ্রেশন ছাড়াই আগের সব শপ/প্ল্যান এই নতুন কালেকশনের মধ্য দিয়ে resolve হয়।
const SEED_THEMES = [
  {
    key: "classic",
    name: "OpenCart",
    baseLayout: "classic",
    isSystem: true,
    colors: {
      primary: "#db2777",
      primaryDark: "#be185d",
      secondary: "#111827",
      background: "#fdf2f8",
      surface: "#ffffff",
      text: "#1f2937",
      accent: "#ec4899",
    },
    fonts: { heading: "default", body: "default" },
  },
  {
    key: "aurora",
    name: "Aurora",
    baseLayout: "aurora",
    isSystem: true,
    colors: {
      primary: "#f59e0b",
      primaryDark: "#d97706",
      secondary: "#0a0a0a",
      background: "#ffffff",
      surface: "#ffffff",
      text: "#171717",
      accent: "#f59e0b",
    },
    fonts: { heading: "serif", body: "default" },
  },
  {
    key: "terra",
    name: "Terra",
    baseLayout: "terra",
    isSystem: true,
    colors: {
      primary: "#047857",
      primaryDark: "#065f46",
      secondary: "#022c22",
      background: "#fffbeb",
      surface: "#ffffff",
      text: "#064e3b",
      accent: "#d97706",
    },
    fonts: { heading: "default", body: "default" },
  },
];

export async function ensureThemesSeeded() {
  const count = await Theme.estimatedDocumentCount();
  if (count > 0) return;
  await Theme.insertMany(SEED_THEMES, { ordered: true });
}

export async function listActiveThemes() {
  await ensureThemesSeeded();
  return Theme.find({}).sort({ createdAt: 1 });
}
