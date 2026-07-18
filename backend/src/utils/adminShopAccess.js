import Shop from "../models/Shop.js";

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
    .select("_id name status")
    .setOptions({ skipTenantScope: true })
    .lean();

  // Keep the same order as Admin.shops so the existing default-shop behavior
  // remains predictable when an account is assigned to multiple shops.
  const shopById = new Map(shops.map((shop) => [String(shop._id), shop]));
  const assignedShops = assignedShopIds
    .map((shopId) => shopById.get(shopId))
    .filter(Boolean);

  const usableShops = assignedShops.filter((shop) =>
    USABLE_SHOP_STATUSES.has(shop.status),
  );
  const suspendedShops = assignedShops.filter(
    (shop) => shop.status === "suspended",
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
  return {
    success: false,
    errorType: "SHOP_SUSPENDED",
    message: "এই শপটি বর্তমানে সাসপেন্ড করা হয়েছে।",
    contactMessage:
      "অনুগ্রহ করে সমস্যাটি সমাধানের জন্য অতি দ্রুত Developer-এর সাথে যোগাযোগ করুন।",
    suspension: {
      shopName: shop?.name || "আপনার শপ",
    },
  };
}
