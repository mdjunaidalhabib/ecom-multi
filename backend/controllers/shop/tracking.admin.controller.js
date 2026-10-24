import Shop from "../../src/models/Shop.js";
import { getPlatformSettings } from "../../src/models/PlatformSettings.js";

// GTM container ID এর ফরম্যাট: GTM- + ৪–১২টা বড় হাতের অক্ষর/সংখ্যা
const GTM_ID_REGEX = /^GTM-[A-Z0-9]{4,12}$/;

/**
 * ইউজার শুধু ID না দিয়ে পুরো GTM snippet পেস্ট করলেও যেন কাজ করে — ইনপুট
 * থেকে প্রথম GTM-XXXX খুঁজে বের করে। খালি ইনপুট মানে "মুছে ফেলুন" ("" রিটার্ন)।
 * ভুল ফরম্যাট হলে null রিটার্ন করে।
 */
export function parseGtmId(raw) {
  const input = String(raw ?? "").trim();
  if (!input) return "";
  const match = input.toUpperCase().match(/GTM-[A-Z0-9]{4,12}/);
  if (!match || !GTM_ID_REGEX.test(match[0])) return null;
  return match[0];
}

const INVALID_MESSAGE =
  "সঠিক GTM Container ID দিন (যেমন GTM-ABC1234)। GTM ড্যাশবোর্ডের উপরে ডানদিকে এটি পাবেন।";

/* ------------------------- শপ-মালিক (admin/staff) ------------------------- */

// GET /admin/tracking
export const getShopTracking = async (req, res) => {
  try {
    const shop = await Shop.findById(req.shopId).select("tracking updatedAt");
    if (!shop) return res.status(404).json({ message: "Shop not found" });
    res.json({ gtmId: shop.tracking?.gtmId || "" });
  } catch (err) {
    console.error("getShopTracking error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /admin/tracking  { gtmId }
export const updateShopTracking = async (req, res) => {
  try {
    const gtmId = parseGtmId(req.body?.gtmId);
    if (gtmId === null) return res.status(400).json({ message: INVALID_MESSAGE });

    const shop = await Shop.findByIdAndUpdate(
      req.shopId,
      { $set: { "tracking.gtmId": gtmId } },
      { new: true },
    ).select("tracking");
    if (!shop) return res.status(404).json({ message: "Shop not found" });

    res.json({ gtmId: shop.tracking?.gtmId || "" });
  } catch (err) {
    console.error("updateShopTracking error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ------------------- super-admin: ECMS প্ল্যাটফর্ম ল্যান্ডিং ------------------- */

// GET /admin/platform-tracking
export const getPlatformTracking = async (req, res) => {
  try {
    const settings = await getPlatformSettings();
    res.json({ gtmId: settings.tracking?.gtmId || "" });
  } catch (err) {
    console.error("getPlatformTracking error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /admin/platform-tracking  { gtmId }
export const updatePlatformTracking = async (req, res) => {
  try {
    const gtmId = parseGtmId(req.body?.gtmId);
    if (gtmId === null) return res.status(400).json({ message: INVALID_MESSAGE });

    const settings = await getPlatformSettings();
    settings.tracking = { gtmId };
    await settings.save();
    res.json({ gtmId: settings.tracking.gtmId });
  } catch (err) {
    console.error("updatePlatformTracking error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ------------------------------ public (ECMS) ------------------------------ */

// GET /platform-tracking — শুধু GTM ID, আর কিছু না
export const getPublicPlatformTracking = async (req, res) => {
  try {
    const settings = await getPlatformSettings();
    res.json({ gtmId: settings.tracking?.gtmId || "" });
  } catch (err) {
    console.error("getPublicPlatformTracking error:", err);
    res.json({ gtmId: "" });
  }
};
