import { buildManifest, MANIFEST_HEADERS } from "../../../lib/manifest";
import { getShopInfo } from "../../../lib/serverApi";
import { DOMAIN_MODE_MARKER } from "../../../lib/shopMode";

// ✅ custom-domain ভিজিটরের manifest — "/manifest.json"
//
// কেন আলাদা route: frontend/src/middleware.js এক্সটেনশনওয়ালা path
// ("/manifest.json") কে non-page request ধরে /shop/[shopSlug] ট্রি-তে rewrite
// করে না, শুধু x-shop-domain হেডারটা বসিয়ে দেয়। তাই custom domain থেকে আসা
// manifest request এই top-level handler-এ পড়ে, আর getShopInfo() ওই হেডার
// দিয়েই শপ resolve করে (দেখুন lib/serverApi.js)।
//
// ⚠️ এই path আগে frontend/public/manifest.json (স্ট্যাটিক, হার্ডকোডেড
// "Hikmah IT") থেকে সার্ভ হতো — public/ ফাইল route handler-এর আগে জেতে,
// তাই সেই ফাইলটা মুছে ফেলা হয়েছে। পুরনো ইনস্টল করা PWA-ও এই একই URL
// রি-ফেচ করে বলে path ইচ্ছাকৃতভাবে ".json" রাখা হয়েছে, ".webmanifest" নয়।
export const dynamic = "force-dynamic";

export async function GET() {
  let shop = null;
  try {
    shop = await getShopInfo();
  } catch {
    // প্ল্যাটফর্মের নিজের ডোমেইন, অথবা কোনো শপের সাথে যুক্ত নয় এমন ডোমেইন —
    // buildManifest(null) প্ল্যাটফর্মের নিজস্ব ডিফল্ট manifest দেয়।
  }

  return Response.json(buildManifest(shop, DOMAIN_MODE_MARKER), {
    headers: MANIFEST_HEADERS,
  });
}
