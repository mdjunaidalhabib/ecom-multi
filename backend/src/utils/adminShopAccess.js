import Shop from "../models/Shop.js";
import { isPlanExpired } from "./planExpiry.js";

const USABLE_SHOP_STATUSES = new Set(["active", "trial"]);

/**
 * Resolve the current, database-backed shop access for an admin account.
 * JWT payloads and Admin.shops can outlive a shop status change, so callers
 * should use this result for every login/session validation.
 */
export async function getAdminShopAccess(admin) {
  const assignedShopIds = (admin?.shops || []).map(String);

  if (assignedShopIds.length === 0) {
    return {
      assignedShops: [],
      usableShops: [],
      usableShopIds: [],
      suspendedShops: [],
      primarySuspendedShop: null,
    };
  }

  const shops = await Shop.find({
    _id: { $in: assignedShopIds },
  })
    .select("_id name status storageNumber planExpiresAt")
    .setOptions({ skipTenantScope: true })
    .lean();

  // Keep the same order as Admin.shops so the existing default-shop behavior
  // remains predictable when an account is assigned to multiple shops.
  const shopById = new Map(shops.map((shop) => [String(shop._id), shop]));
  const assignedShops = assignedShopIds
    .map((shopId) => shopById.get(shopId))
    .filter(Boolean);

  // ⚠️ মেয়াদ শেষ হওয়া শপ status="suspended"-এ ততক্ষণ যায় না যতক্ষণ না
  // background sweep (autoSuspendExpiredShops) চলে — কিন্তু access সাথে
  // সাথেই বন্ধ হওয়া উচিত, তাই এখানেই lazily ধরা হচ্ছে।
  const usableShops = assignedShops.filter(
    (shop) => USABLE_SHOP_STATUSES.has(shop.status) && !isPlanExpired(shop),
  );
  const suspendedShops = assignedShops.filter(
    (shop) => shop.status === "suspended" || isPlanExpired(shop),
  );

  return {
    assignedShops,
    usableShops,
    usableShopIds: usableShops.map((shop) => String(shop._id)),
    suspendedShops,
    primarySuspendedShop: suspendedShops[0] || null,
  };
}

export function buildSuspendedShopResponse(shop) {
  const expired = shop?.status !== "suspended" && isPlanExpired(shop);
  return {
    success: false,
    errorType: expired ? "SHOP_PLAN_EXPIRED" : "SHOP_SUSPENDED",
    message: expired
      ? "এই শপের প্ল্যানের মেয়াদ শেষ হয়ে গেছে।"
      : "এই শপটি বর্তমানে সাসপেন্ড করা হয়েছে।",
    contactMessage:
      "অনুগ্রহ করে সমস্যাটি সমাধানের জন্য অতি দ্রুত Developer-এর সাথে যোগাযোগ করুন।",
    suspension: {
      shopName: shop?.name || "আপনার শপ",
    },
  };
}
