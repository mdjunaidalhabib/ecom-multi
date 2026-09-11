import { buildManifest, MANIFEST_HEADERS } from "../../../../../lib/manifest";
import { getShopInfo } from "../../../../../lib/serverApi";

// ✅ path-based ভিজিটরের manifest — "/shop/<slug>/manifest.json"
//
// frontend/src/middleware.js এই path-এ /shop/<slug> prefix দেখে x-shop-slug
// হেডার বসায় (এক্সটেনশন চেকের আগেই), তাই getShopInfo() স্লাগ দিয়েই সঠিক শপ
// resolve করে। manifest-এর scope/start_url/id সবই "/shop/<slug>/" হয় —
// দেখুন lib/manifest.js, একই প্ল্যাটফর্ম ডোমেইনে থাকা দুটো শপ যাতে ব্রাউজারের
// কাছে একই ইনস্টল্ড অ্যাপ না হয়ে যায়।
export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  const { shopSlug } = await params;

  let shop = null;
  try {
    shop = await getShopInfo();
  } catch {
    // অচেনা স্লাগ / suspended শপ — প্ল্যাটফর্ম ডিফল্টে ফলব্যাক, তবে scope
    // এই স্লাগেই সীমিত থাকে।
  }

  return Response.json(buildManifest(shop, shopSlug), {
    headers: MANIFEST_HEADERS,
  });
}
