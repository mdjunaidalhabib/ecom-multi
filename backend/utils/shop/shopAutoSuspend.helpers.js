import Shop from "../../src/models/Shop.js";
import { invalidateShopCache } from "../../src/tenancy/publicShopResolver.js";
import { PLAN_EXPIRED_SUSPEND_REASON } from "../../src/utils/planExpiry.js";

/* -------------------------------------------------------
   ✅ Plan-expiry auto-suspend sweep
   request-time (adminShopAccess.js / publicShopResolver.js) ইতিমধ্যে
   মেয়াদ-শেষ শপকে lazily ব্লক করে দেয়, কিন্তু status ফিল্ড আসলেই
   "suspended"-এ না গেলে super-admin এর Shops ড্যাশবোর্ডে ভুল status
   (active/trial) দেখাতে থাকবে — এই sweep সেটা ডাটাবেসে সত্যায়িত করে।
   trash.helpers.js-এর purgeExpiredTrash()-এর মতোই boot-এ একবার,
   তারপর প্রতি ঘন্টায় চলে (দেখুন server.js)।
------------------------------------------------------- */
export const autoSuspendExpiredShops = async () => {
  try {
    const expiredShops = await Shop.find({
      status: { $in: ["active", "trial"] },
      planExpiresAt: { $ne: null, $lte: new Date() },
    }).setOptions({ skipTenantScope: true });

    for (const shop of expiredShops) {
      shop.status = "suspended";
      shop.suspendedReason = PLAN_EXPIRED_SUSPEND_REASON;
      // eslint-disable-next-line no-await-in-loop
      await shop.save();
      invalidateShopCache({ domain: shop.domain, slug: shop.slug });
    }

    if (expiredShops.length) {
      console.log(
        `⏳ Plan-expiry auto-suspend: suspended ${expiredShops.length} shop(s)`,
      );
    }
  } catch (err) {
    console.error("❌ autoSuspendExpiredShops error:", err);
  }
};
