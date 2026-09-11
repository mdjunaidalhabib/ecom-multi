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
    // ✅ PWA ("Add to Home Screen") আইকন — favicon (64×64) install prompt এর
    // জন্য অনেক ছোট (Chrome কমপক্ষে 144px চায়), আর আসল logo সাধারণত চওড়া/WEBP
    // হওয়ায় square আইকন হিসেবে কাজ করে না। তাই logo আপলোডের সময়ই safe-zone
    // padding সহ square 192/512 PNG ভ্যারিয়েন্ট বানিয়ে রাখা হয় — দেখুন
    // routes/admin/navbar.admin.routes.js ও frontend/lib/manifest.js।
    pwaIcon192: { type: String, default: "" },
    pwaIcon192PublicId: { type: String, default: "" },
    pwaIcon512: { type: String, default: "" },
    pwaIcon512PublicId: { type: String, default: "" },
  },
  updatedAt: { type: Date, default: Date.now },
});

NavbarSchema.plugin(tenantPlugin);

const Navbar = mongoose.models.Navbar || mongoose.model("Navbar", NavbarSchema);

export default Navbar;
