import Shop from "../models/Shop.js";
import { runWithShopId } from "./shopContext.js";
import { cacheGet, cacheSet, cacheDelete } from "../lib/simpleCache.js";
import { isPlanExpired } from "../utils/planExpiry.js";

const DOMAIN_CACHE_PREFIX = "shop-by-domain:";
const SLUG_CACHE_PREFIX = "shop-by-slug:";
const SHOP_CACHE_TTL_MS = 60 * 1000; // 60s — শপের status/domain বদলালে admin controller নিজেই invalidate করবে (নিচে দেখুন), তাই এই TTL মূলত extra safety
const NOT_FOUND_CACHE_TTL_MS = 30 * 1000; // ভুল/অচেনা ডোমেইনে বারবার হিট হলে (bot/scan) সেটাও অল্প সময়ের জন্য cache করে DB বাঁচানো হয়

/**
 * শপের admin panel থেকে domain/status/slug বদলালে (controllers/shop/admin.shop.controller.js)
 * পুরনো cache entry (domain-key এবং slug-key দুটোই) সাথে সাথে বাতিল করার জন্য
 * এই ফাংশন কল করা হয়।
 */
export function invalidateShopCache({ domain, slug } = {}) {
  if (domain) {
    cacheDelete(
      DOMAIN_CACHE_PREFIX + domain.toString().toLowerCase().replace(/^www\./, ""),
    );
  }
  if (slug) {
    cacheDelete(SLUG_CACHE_PREFIX + slug.toString().toLowerCase());
  }
}

/**
 * ✅ resolveShopByDomain
 * Customer-facing (public) API-এর প্রতিটা request কোন শপের জন্য সেটা বের
 * করে। দুইভাবে শপ resolve হতে পারে:
 *
 *  1. Path-based (`/shop/<slug>/...`): frontend middleware `x-shop-slug`
 *     হেডারে শপের slug পাঠায় — এটা থাকলে সেটাকেই অগ্রাধিকার দেওয়া হয়।
 *     Slug-based access-এ domain ownership প্রমাণের প্রশ্ন নেই (এটা
 *     platform-এর নিজস্ব domain), তাই domainStatus verified কিনা সেটা
 *     চেক করা হয় না — শুধু শপ suspended কিনা সেটাই matter করে।
 *  2. Domain-based (custom domain): `x-shop-domain` হেডারে ব্রাউজারের Host
 *     পাঠানো হয়; সরাসরি backend-এ hit হলে (Postman ইত্যাদি) `req.hostname`
 *     fallback হিসেবে ব্যবহার হয়। এখানে production-এ domainStatus
 *     verified থাকা বাধ্যতামূলক (DNS ownership প্রমাণ)।
 *
 * এই middleware বসানোর পর req.shop / req.shopId পাওয়া যাবে, এবং বাকি পুরো
 * request lifecycle-এ AsyncLocalStorage context-এ shopId সেট থাকবে বলে
 * tenantPlugin (models-এ বসানো) সব query automatically scope করে দেবে —
 * তাই বেশিরভাগ controller-এ আলাদা করে shopId filter বসানোর প্রয়োজন নেই।
 *
 * 🔥 FIX (caching): আগে এই query প্রতিটা public request-এ MongoDB-তে যেত —
 * শপ/ট্রাফিক বাড়লে এটাই DB-র সবচেয়ে বড় লোড হতো। এখন domain/slug অনুযায়ী
 * শপ ৬০ সেকেন্ডের জন্য in-memory cache হয় (simpleCache.js দেখুন), তাই একই
 * domain/slug-এ বারবার হিট হলে DB-তে যেতে হয় না।
 */
export async function resolveShopByDomain(req, res, next) {
  try {
    const rawSlug = req.headers["x-shop-slug"];
    const slug = rawSlug ? rawSlug.toString().toLowerCase().trim() : "";

    let shop;

    if (slug) {
      const cacheKey = SLUG_CACHE_PREFIX + slug;
      shop = cacheGet(cacheKey);

      if (shop === undefined) {
        shop = await Shop.findOne({ slug });
        cacheSet(cacheKey, shop, shop ? SHOP_CACHE_TTL_MS : NOT_FOUND_CACHE_TTL_MS);
      }

      if (!shop) {
        return res
          .status(404)
          .json({ message: "এই লিংকে কোনো শপ খুঁজে পাওয়া যায়নি" });
      }
    } else {
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

      const cacheKey = DOMAIN_CACHE_PREFIX + domain;
      shop = cacheGet(cacheKey);

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

      // ✅ Local dev-এ .local ডোমেইন (hosts ফাইলে বানানো) কখনো আসল DNS দিয়ে
      // verify হবে না — তাই প্রোডাকশনের বাইরে এই চেক স্কিপ করা হয়, শুধু তখনই
      // যখন শপ suspended না। প্রোডাকশনে এই skip কখনো হবে না। এই চেক শুধু
      // domain-based access-এ প্রযোজ্য — slug-based access platform-এর
      // নিজস্ব domain থেকে আসে বলে DNS verification-এর প্রশ্নই নেই।
      const isDev = process.env.NODE_ENV !== "production";
      if (!isDev && shop.domainStatus !== "verified") {
        return res
          .status(403)
          .json({ message: "এই শপের ডোমেইন এখনো ভেরিফাই হয়নি" });
      }
    }

    if (shop.status === "suspended") {
      return res.status(403).json({
        message: "এই শপটি বর্তমানে সাসপেন্ড করা আছে",
        errorType: "SHOP_SUSPENDED",
      });
    }

    if (isPlanExpired(shop)) {
      return res.status(403).json({
        message: "এই শপের প্ল্যানের মেয়াদ শেষ হয়ে গেছে",
        errorType: "SHOP_PLAN_EXPIRED",
      });
    }

    req.shop = shop;
    req.shopId = shop._id;
    // ✅ R2 storage key — পুরনো (migration-এর আগে তৈরি) শপে না থাকলে shopId fallback
    req.shopStorageNumber = shop.storageNumber ?? shop._id;

    return runWithShopId(shop._id, next);
  } catch (err) {
    console.error("❌ resolveShopByDomain error:", err);
    return res.status(500).json({ message: "Server error resolving shop" });
  }
}

export default resolveShopByDomain;
