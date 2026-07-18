import { runWithShopId } from "./shopContext.js";

/**
 * ✅ requireShopContext
 * Admin panel একটাই shared ডোমেইনে থাকে। প্রতিটা admin/staff অ্যাকাউন্ট
 * নির্দিষ্ট এক বা একাধিক শপে assigned থাকে (Admin.shops) — লগইন করলে
 * সেই শপের ডেটাই দেখবে।
 *
 * ⚠️ ডিজাইন সিদ্ধান্ত: superadmin-এর একমাত্র কাজ নতুন শপ তৈরি করা এবং
 * প্রতিটা শপে একটা আলাদা admin অ্যাকাউন্ট assign করা (দেখুন
 * `/admin/shops/*` রুট)। superadmin নিজে কোনো শপের Products/Orders/Users
 * ইত্যাদি shop-scoped ডেটাতে সরাসরি ঢুকবে না — প্রতিটা শপ তার নিজের
 * admin/staff অ্যাকাউন্ট দিয়ে আলাদাভাবে লগইন করে ম্যানেজ হবে।
 *
 * তাই এই middleware-এ superadmin-কে resource-scoped route এ (products,
 * orders, ...) ঢুকতে দেওয়া হয় না — শুধু admin/staff-রা ঢুকতে পারবে, তাদের
 * নিজের assigned শপে (একাধিক শপ assigned থাকলে `X-Active-Shop-Id` হেডার
 * দিয়ে কোনটা active সেটা বেছে নেওয়া যায়, না দিলে প্রথম assigned শপে
 * ফলব্যাক করে)।
 *
 * ⚠️ এই middleware অবশ্যই `protect` (adminAuthMiddleware.js) এর পরে বসাতে
 * হবে, কারণ req.admin দরকার।
 */
export function requireShopContext(req, res, next) {
  if (!req.admin) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.admin.role === "superadmin") {
    return res.status(403).json({
      message:
        "Superadmin কোনো শপের Products/Orders/Users সরাসরি ম্যানেজ করতে পারে না। এই শপের জন্য assigned admin অ্যাকাউন্ট দিয়ে লগইন করুন (Shops > Admins থেকে assign/invite করা যায়)।",
    });
  }

  // admin / staff
  const requestedShopId = req.headers["x-active-shop-id"];
  const allowedShopIds = (req.admin.shops || []).map(String);

  if (allowedShopIds.length === 0) {
    return res.status(403).json({
      message: "আপনার কোনো শপ assign করা নেই। সুপারএডমিনের সাথে যোগাযোগ করুন।",
    });
  }

  const activeShopId =
    requestedShopId && allowedShopIds.includes(String(requestedShopId))
      ? requestedShopId
      : allowedShopIds[0];

  req.shopId = activeShopId;
  return runWithShopId(activeShopId, next);
}

/**
 * ✅ superadminShopOptional
 * Shop-management endpoint গুলোর জন্য (Shops list তৈরি/দেখা) — এখানে কোনো
 * "active shop"-এর দরকার নেই, শুধু superadmin হলেই চলবে। requireShopContext
 * এর বদলে এটা ব্যবহার হবে সেইসব রুটে।
 */
export function superadminOnlyNoShopScope(req, res, next) {
  if (!req.admin) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (req.admin.role !== "superadmin") {
    return res.status(403).json({ message: "Super admin only" });
  }
  // কোনো shopId scope ছাড়াই এগিয়ে যাওয়া (cross-shop data, e.g. Shop list নিজেই)
  return runWithShopId(null, next);
}

export default requireShopContext;
