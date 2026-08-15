import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import {
  buildSuspendedShopResponse,
  getAdminShopAccess,
} from "../utils/adminShopAccess.js";
import { METHOD_TO_ACTION } from "../constants/staffPermissions.js";

// Protect API route
export const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.admin_token;

    if (!token) {
      return res.status(401).json({ message: "No token" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      const message =
        err.name === "TokenExpiredError" ? "Token expired" : "Invalid token";
      return res.status(401).json({ message });
    }

    const admin = await Admin.findById(decoded.id).select("-password");
    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    if (admin.status !== "active") {
      res.clearCookie("admin_token", { path: "/" });
      return res.status(403).json({ message: "Admin account is not active" });
    }

    // Re-check shop access on every protected request so an old token cannot
    // keep working after the assigned shop is deleted or suspended.
    if (admin.role !== "superadmin") {
      const shopAccess = await getAdminShopAccess(admin);

      if (shopAccess.usableShopIds.length === 0) {
        res.clearCookie("admin_token", { path: "/" });

        if (shopAccess.primarySuspendedShop) {
          return res
            .status(403)
            .json(buildSuspendedShopResponse(shopAccess.primarySuspendedShop));
        }

        return res.status(403).json({
          success: false,
          message: "No active shop is assigned to this account",
          errorType: "NO_ACTIVE_SHOP",
        });
      }

      // requireShopContext uses this list so a suspended shop can never be
      // selected as the default when another assigned shop is still active.
      req.usableShopIds = shopAccess.usableShopIds;
    }

    req.admin = admin;
    next();
  } catch (err) {
    console.error("Protect middleware error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Super admin role check
export const superAdminOnly = (req, res, next) => {
  if (req.admin?.role === "superadmin") return next();
  return res.status(403).json({ message: "Super admin only" });
};

// ✅ Shop owner (role "admin") only — staff নিজে অন্য staff ম্যানেজ করতে পারবে না
export const shopOwnerOnly = (req, res, next) => {
  if (req.admin?.role === "admin") return next();
  return res
    .status(403)
    .json({ message: "শুধু শপ Admin (owner) স্টাফ ম্যানেজ করতে পারবে" });
};

// ✅ নির্দিষ্ট section (orders, products, ...) এ staff-এর নির্দিষ্ট action
// (view/add/edit/delete) এর অ্যাক্সেস আছে কিনা চেক করে। HTTP method থেকে
// action স্বয়ংক্রিয়ভাবে বের করা হয় (GET→view, POST→add, PUT/PATCH→edit,
// DELETE→delete) — তাই প্রতিটা route আলাদাভাবে না ছুঁয়েই একটাই
// requirePermission(moduleKey) পুরো sub-router mount এ বসানো যায়।
// শপ owner (role: "admin") ও superadmin সবসময় পাস — শুধু role: "staff"
// হলে Admin.permissions[moduleKey][action] true থাকতে হবে। শপ owner
// admin panel থেকে প্রতিটা staff-এর জন্য এই permissions সেট করে দেয়
// (দেখুন staff.admin.controller.js)।
export const requirePermission = (moduleKey) => (req, res, next) => {
  if (!req.admin) return res.status(401).json({ message: "Unauthorized" });

  if (req.admin.role !== "staff") return next();

  const action = METHOD_TO_ACTION[req.method] || "view";
  const allowed = req.admin.permissions?.[moduleKey]?.[action];

  if (allowed) return next();

  return res.status(403).json({
    success: false,
    message: "এই কাজের অনুমতি নেই। শপ Admin-এর সাথে যোগাযোগ করুন।",
    errorType: "PERMISSION_DENIED",
  });
};
