import Shop from "../models/Shop.js";
import Navbar from "../models/Navbar.js";
import Footer from "../models/Footer.js";
import InvoiceTemplate from "../models/InvoiceTemplate.js";
import { getOrCreateDefaultInvoiceTemplate } from "../models/InvoiceTemplateDefault.js";
import { shopHasFeature } from "./planFeatureService.js";

const LOGO_MAX_BYTES = 2 * 1024 * 1024; // 2MB সেফটি ক্যাপ
const LOGO_FETCH_TIMEOUT_MS = 5000;

/**
 * ✅ লোগো URL-কে base64 data URI-তে বদলে দেয় (সার্ভার থেকে fetch করে) —
 * ব্রাউজার থেকে সরাসরি R2-এর URL লোড করলে (cross-origin) html2canvas সেই
 * ইমেজ ক্যানভাসে আঁকতে পারে না যদি না R2 bucket-এ CORS হেডার কনফিগার করা
 * থাকে (এই bucket-এ নেই)। সার্ভার-টু-সার্ভার fetch-এ কোনো CORS প্রযোজ্য না,
 * তাই এখানেই ছবিটা টেনে data URI বানিয়ে পাঠিয়ে দিলে ব্রাউজারে আর কোনো
 * cross-origin ফেচ লাগে না — লাইভ প্রিভিউ আর ডাউনলোড করা PDF দুটোতেই
 * নির্ভরযোগ্যভাবে দেখা যায়।
 */
async function fetchAsDataUri(url) {
  if (!url) return "";
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), LOGO_FETCH_TIMEOUT_MS);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return url;
    const contentType = res.headers.get("content-type") || "image/png";
    if (!contentType.startsWith("image/")) return url;

    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length > LOGO_MAX_BYTES) return url;

    return `data:${contentType};base64,${buffer.toString("base64")}`;
  } catch (err) {
    console.error("⚠️ fetchAsDataUri (logo) failed, falling back to raw URL:", err.message);
    return url;
  }
}

/**
 * ✅ resolveInvoiceTemplateForShop — "শপের নিজস্ব কাস্টম টেমপ্লেট, নাকি
 * প্ল্যাটফর্ম ডিফল্ট" এই সিদ্ধান্তটা নেওয়ার একমাত্র জায়গা। প্রতিটা consumer
 * route (order-data endpoint, admin resolved-template endpoint) এই একই
 * ফাংশন কল করে — কোথাও এই rule আলাদাভাবে re-implement করা হয় না।
 *
 * ✅ Shop info এখানে shop.name/branding/contactEmail/contactPhone থেকে না —
 * বরং admin নিজে যা এডিট করে সেই Navbar (brand name/logo) আর Footer
 * (contact email/phone) থেকে নেওয়া হয়, কারণ shop.contactEmail/contactPhone/
 * branding.logo শুধু super-admin এডিট করতে পারে (shop.admin.routes.js
 * superAdminOnly), কিন্তু Navbar/Footer শপের নিজস্ব admin panel থেকেই
 * এডিট করা যায়।
 */
export async function resolveInvoiceTemplateForShop(shopId) {
  const shop = await Shop.findById(shopId).setOptions({ skipTenantScope: true });
  const allowed = shop ? await shopHasFeature(shop, "invoiceCustomization") : false;

  const [navbar, footer] = await Promise.all([
    Navbar.findOne({ shopId }).setOptions({ skipTenantScope: true }),
    Footer.findOne({ shopId }).setOptions({ skipTenantScope: true }),
  ]);

  const logo = await fetchAsDataUri(navbar?.brand?.logo);

  const shopInfo = shop
    ? {
        name: navbar?.brand?.name || "",
        logo,
        contactEmail: footer?.contact?.email || "",
        contactPhone: footer?.contact?.phone || "",
      }
    : null;

  if (allowed) {
    const shopTemplate = await InvoiceTemplate.findOne({ shopId }).setOptions({
      skipTenantScope: true,
    });
    if (shopTemplate) {
      return { template: shopTemplate, source: "shop", shop: shopInfo };
    }
  }

  const defaultTemplate = await getOrCreateDefaultInvoiceTemplate();
  return { template: defaultTemplate, source: "default", shop: shopInfo };
}

export default { resolveInvoiceTemplateForShop };
