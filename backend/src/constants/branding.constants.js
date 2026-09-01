/**
 * ✅ Hardcoded platform default branding — এই সিস্টেমটা ইচ্ছাকৃতভাবে DB/admin
 * থেকে এডিটযোগ্য না (আগে admin + super-admin দুই জায়গা থেকেই সেট করা
 * যেত, যেটা রাখা হবে না বলে ঠিক হয়েছে)। কোনো শপ যদি তার Navbar থেকে
 * নিজস্ব brand name/logo সেট না করে, তাহলে সব শপের storefront-এ এই
 * হার্ডকোডেড নামটাই ব্রাউজার ট্যাব টাইটেল হিসেবে দেখাবে।
 *
 * ফেভিকনের জন্য আলাদা কোনো constant নেই — খালি ("") রাখলেই যথেষ্ট, কারণ
 * frontend/src/app/shop/[shopSlug]/layout.js এর generateMetadata() favicon
 * খালি পেলে নিজে থেকেই frontend/public/favicon.ico (স্ট্যাটিক, কোডেই
 * হার্ডকোড করা) ব্যবহার করে।
 *
 * দেখুন controllers/shop/public.shop.controller.js (getShopInfo) — এখানেই
 * এই ডিফল্ট এবং শপের Navbar.brand থেকে effective title/favicon resolve হয়।
 */
export const DEFAULT_PLATFORM_BRAND_NAME = "Hikmah IT";
