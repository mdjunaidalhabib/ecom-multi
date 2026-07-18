import Shop from "../models/Shop.js";
import { runWithShopId } from "./shopContext.js";

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

    const shop = await Shop.findOne({ domain });

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

    if (shop.domainStatus !== "verified") {
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
