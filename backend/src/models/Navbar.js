import mongoose from "mongoose";
import tenantPlugin from "../tenancy/tenantPlugin.js";

// ✅ Navbar.brand.name এর placeholder ডিফল্ট মান — admin এখনো কিছু সেট
// করেনি বোঝাতে ব্যবহার হয় (দেখুন controllers/shop/public.shop.controller.js
// এর getShopInfo, যেখানে এটা "admin সেট করেনি" এর চিহ্ন হিসেবে চেক হয়)।
export const NAVBAR_BRAND_NAME_PLACEHOLDER = "Brand Name";

const NavbarSchema = new mongoose.Schema({
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: true,
    unique: true, // ✅ প্রতি শপের একটাই Navbar document (singleton per shop)
    index: true,
  },
  brand: {
    name: { type: String, default: NAVBAR_BRAND_NAME_PLACEHOLDER },
    logo: { type: String, default: "" }, // R2 URL (বড়, branding সাইজ)
    logoPublicId: { type: String, default: "" }, // ✅ R2 object key
    favicon: { type: String, default: "" }, // ✅ ছোট 64×64 PNG, browser tab icon এর জন্য
    faviconPublicId: { type: String, default: "" }, // ✅ R2 object key
  },
  updatedAt: { type: Date, default: Date.now },
});

NavbarSchema.plugin(tenantPlugin);

const Navbar = mongoose.models.Navbar || mongoose.model("Navbar", NavbarSchema);

export default Navbar;
