import Shop from "../models/Shop.js";
import { runWithShopId } from "./shopContext.js";
import { cacheGet, cacheSet, cacheDelete } from "../lib/simpleCache.js";

const CACHE_PREFIX = "shop-by-domain:";
const SHOP_CACHE_TTL_MS = 60 * 1000; // 60s — শপের status/domain বদলালে admin controller নিজেই invalidate করবে (নিচে দেখুন), তাই এই TTL মূলত extra safety
const NOT_FOUND_CACHE_TTL_MS = 30 * 1000; // ভুল/অচেনা ডোমেইনে বারবার হিট হলে (bot/scan) সেটাও অল্প সময়ের জন্য cache করে DB বাঁচানো হয়

/**
 * শপের admin panel থেকে domain/status বদলালে (controllers/shop/admin.shop.controller.js)
 * পুরনো cache entry সাথে সাথে বাতিল করার জন্য এই ফাংশন কল করা হয়।
 */
export function invalidateShopDomainCache(domain) {
  if (!domain) return;
  cacheDelete(CACHE_PREFIX + domain.toString().toLowerCase().replace(/^www\./, ""));
}

/**
 * ✅ resolveShopByDomain
 * Customer-facing (public) API-এর প্রতিটা request কোন শপের জন্য সেটা বের
 * করে। Frontend (Next.js middleware) প্রতিটা call-এ `x-shop-domain` হেডারে
 * ব্রাউজারের Host পাঠায়; সরাসরি backend-এ hit হলে (Postman ইত্যাদি)
 * `req.hostname` fallback হিসেবে ব্যবহার হয়।
 *
 * এই middleware বসানোর পর req.shop / req.shopId পাওয়া যাবে, এবং বাকি পুরো
 * request lifecycle-এ AsyncLocalStorage context-এ shopId সেট থাকবে বলে
 * tenantPlugin (models-এ বসানো) সব query automatically scope করে দেবে —
 * তাই বেশিরভাগ controller-এ আলাদা করে shopId filter বসানোর প্রয়োজন নেই।
 *
 * 🔥 FIX (caching): আগে এই query প্রতিটা public request-এ MongoDB-তে যেত —
 * শপ/ট্রাফিক বাড়লে এটাই DB-র সবচেয়ে বড় লোড হতো। এখন ডোমেইন অনুযায়ী শপ
 * ৬০ সেকেন্ডের জন্য in-memory cache হয় (simpleCache.js দেখুন), তাই একই
 * ডোমেইনে বারবার হিট হলে DB-তে যেতে হয় না।
 */
export async function resolveShopByDomain(req, res, next) {
  try {
    const rawHost = req.headers["x-shop-domain"] || req.hostname || "";
    const domain = rawHost
      .toString()
      .toLowerCase()
      .replace(/^www\./, "")
      .split(":")[0] // port বাদ দেওয়া (localhost:3000 জাতীয় ক্ষেত্রে)
      .trim();

    if (!domain) {
      return res
        .status(400)
        .json({ message: "শপ শনাক্ত করা যায়নি (missing host/domain)" });
    }

    const cacheKey = CACHE_PREFIX + domain;
    let shop = cacheGet(cacheKey);

    if (shop === undefined) {
      shop = await Shop.findOne({ domain });
      // null-ও cache করা হয় (negative caching) যাতে অচেনা ডোমেইনে বারবার
      // হিট হলেও (bot/misconfigured DNS) DB-তে বারবার query না যায়
      cacheSet(cacheKey, shop, shop ? SHOP_CACHE_TTL_MS : NOT_FOUND_CACHE_TTL_MS);
    }

    if (!shop) {
      return res
        .status(404)
        .json({ message: "এই ডোমেইনে কোনো শপ খুঁজে পাওয়া যায়নি" });
    }

    if (shop.status === "suspended") {
      return res
        .status(403)
        .json({ message: "এই শপটি বর্তমানে সাসপেন্ড করা আছে" });
    }

    // ✅ Local dev-এ .local ডোমেইন (hosts ফাইলে বানানো) কখনো আসল DNS দিয়ে
    // verify হবে না — তাই প্রোডাকশনের বাইরে এই চেক স্কিপ করা হয়, শুধু তখনই
    // যখন শপ suspended না। প্রোডাকশনে এই skip কখনো হবে না।
    const isDev = process.env.NODE_ENV !== "production";
    if (!isDev && shop.domainStatus !== "verified") {
      return res
        .status(403)
        .json({ message: "এই শপের ডোমেইন এখনো ভেরিফাই হয়নি" });
    }

    req.shop = shop;
    req.shopId = shop._id;

    return runWithShopId(shop._id, next);
  } catch (err) {
    console.error("❌ resolveShopByDomain error:", err);
    return res.status(500).json({ message: "Server error resolving shop" });
  }
}

export default resolveShopByDomain;
