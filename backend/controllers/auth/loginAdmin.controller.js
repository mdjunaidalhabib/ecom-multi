import generateToken from "../../utils/auth/generateToken.js";
import Admin from "../../src/models/Admin.js";
import { UAParser } from "ua-parser-js";
import geoip from "geoip-lite";

async function trackLogin(admin, req) {
  try {
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      req.ip ||
      "";

    const uaString = req.headers["user-agent"] || "";
    const parser = new UAParser(uaString);
    const ua = parser.getResult();

    const deviceType =
      ua.device.type === "mobile"
        ? "Mobile"
        : ua.device.type === "tablet"
          ? "Tablet"
          : "PC";

    const geo = ip ? geoip.lookup(ip) : null;

    admin.lastLoginAt = new Date();
    admin.lastLoginIp = ip;
    admin.lastLoginDevice = deviceType;
    admin.lastLoginOS = `${ua.os.name || ""} ${ua.os.version || ""}`.trim();
    admin.lastLoginBrowser =
      `${ua.browser.name || ""} ${ua.browser.version || ""}`.trim();
    admin.lastLoginUA = uaString;

    if (geo) {
      admin.lastLoginLocation = {
        country: geo.country,
        city: geo.city,
        region: geo.region,
        lat: geo.ll?.[0],
        lon: geo.ll?.[1],
      };
    }

    await admin.save();
  } catch (trackingError) {
    console.error("Admin login tracking error:", trackingError);
  }
}

async function loginByPortal(req, res, { allowedRoles, wrongPortalMessage, errorType }) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "ইমেইল এবং পাসওয়ার্ড দুটোই দিতে হবে।",
        errorType: "MISSING_CREDENTIALS",
      });
    }

    const admin = await Admin.findOne({
      email: email.toLowerCase().trim(),
    });

    // একই generic response রাখলে account enumeration ঝুঁকি কমে।
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।",
        errorType: "INVALID_CREDENTIALS",
      });
    }

    const isMatch = await admin.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।",
        errorType: "INVALID_CREDENTIALS",
      });
    }

    if (!allowedRoles.includes(admin.role)) {
      return res.status(403).json({
        success: false,
        message: wrongPortalMessage,
        errorType,
      });
    }

    const token = generateToken(admin);

    res.cookie("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await trackLogin(admin, req);

    return res.status(200).json({
      success: true,
      message: "লগইন সফল হয়েছে।",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error("Admin login error:", err);

    return res.status(500).json({
      success: false,
      message: "সার্ভারে অপ্রত্যাশিত সমস্যা হয়েছে।",
      errorType: "SERVER_ERROR",
      details: process.env.NODE_ENV === "production" ? undefined : err.message,
    });
  }
}

// Shop admin/staff portal login: /login
export const loginAdmin = (req, res) =>
  loginByPortal(req, res, {
    allowedRoles: ["admin", "staff"],
    wrongPortalMessage:
      "Super Admin অ্যাকাউন্ট দিয়ে এখানে লগইন করা যাবে না। Super Admin Login ব্যবহার করুন।",
    errorType: "SUPER_ADMIN_PORTAL_REQUIRED",
  });

// Super admin portal login: /super-admin/login
export const loginSuperAdmin = (req, res) =>
  loginByPortal(req, res, {
    allowedRoles: ["superadmin"],
    wrongPortalMessage:
      "এই লগইনটি শুধু Super Admin-এর জন্য। Shop Admin Login ব্যবহার করুন।",
    errorType: "ADMIN_PORTAL_REQUIRED",
  });
