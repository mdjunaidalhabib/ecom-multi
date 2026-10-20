// ✅ শপের পাবলিক (frontend) URL বানায়।
// কাস্টম ডোমেইন থাকলে সরাসরি সেই ডোমেইন, নাহলে platform-এর slug-based
// path (/shop/<slug>)। landing-pages ও super-admin/components/Shops.jsx এর
// getShopPublicUrl-এর মতো একই প্যাটার্ন।
const RAW_SHOP_BASE_URL = (process.env.NEXT_PUBLIC_SHOP_BASE_URL || "").trim();
// env এ https:// ছাড়া শুধু "ecms.hikmahit.com" দিলেও যেন relative link না হয়
const SHOP_BASE_URL = RAW_SHOP_BASE_URL
  ? (/^https?:\/\//i.test(RAW_SHOP_BASE_URL) ? RAW_SHOP_BASE_URL : `https://${RAW_SHOP_BASE_URL}`).replace(/\/+$/, "")
  : "";

export function getShopPublicUrl(shop) {
  if (!shop?.slug && !shop?.domain) return "";
  if (shop.domain) return `https://${String(shop.domain).replace(/^https?:\/\//i, "")}`;
  if (!SHOP_BASE_URL) return "";
  return `${SHOP_BASE_URL}/shop/${shop.slug}`;
}

export default getShopPublicUrl;
