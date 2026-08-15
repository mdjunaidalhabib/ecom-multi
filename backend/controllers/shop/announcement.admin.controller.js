import { getPlatformSettings } from "../../src/models/PlatformSettings.js";

/* -------------------------------------------------------
   GET /admin/announcement — যেকোনো লগইন করা admin/staff পড়তে পারে
   (শপ-admin এর "My Plan" পেজে ব্যানার হিসেবে দেখানোর জন্য)
------------------------------------------------------- */
export const getAnnouncement = async (req, res) => {
  try {
    const settings = await getPlatformSettings();
    res.json({
      text: settings.announcement?.text || "",
      updatedAt: settings.announcement?.updatedAt || null,
    });
  } catch (err) {
    console.error("getAnnouncement error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* -------------------------------------------------------
   PUT /admin/announcement — শুধু super-admin এডিট/ক্লিয়ার করতে পারে
------------------------------------------------------- */
export const updateAnnouncement = async (req, res) => {
  try {
    const text = String(req.body?.text ?? "").trim().slice(0, 300);
    const settings = await getPlatformSettings();
    settings.announcement = {
      text,
      updatedAt: text ? new Date() : null,
    };
    await settings.save();
    res.json({ text: settings.announcement.text, updatedAt: settings.announcement.updatedAt });
  } catch (err) {
    console.error("updateAnnouncement error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
