import express from "express";
import CourierSetting from "../../models/CourierSetting.js";
import { requirePermission } from "../../middlewares/adminAuthMiddleware.js";

const router = express.Router();

// ⚠️ এই ফাইলটা index.js এ "/" এ mount করা (পুরো admin router-এর প্রতিটা
// path-এর prefix হিসেবে ম্যাচ করে), তাই এখানে blanket `router.use(...)`
// দিয়ে permission gate বসানো যাবে না — সেটা পরের সব route (categories,
// payments, ...) কেও ভুলভাবে আটকে দিত। তাই প্রতিটা route-এ আলাদাভাবে
// requirePermission("settings") বসানো হয়েছে।

// ✅ Save or Update Courier Settings
// FINAL path: POST /api/v1/admin/courier-settings
router.post("/courier-settings", requirePermission("settings"), async (req, res) => {
  try {
    const { courier, merchantName, apiKey, secretKey, isActive } = req.body;

    if (!courier || !merchantName || !apiKey || !secretKey) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    // ✅ courier + merchantName একসাথে unique ধরা হচ্ছে
    const filter = { courier, merchantName };

    // যদি courier-merchant জোড়া আগেই থাকে → update, না থাকলে create
    const setting = await CourierSetting.findOneAndUpdate(
      filter,
      { courier, merchantName, apiKey, secretKey, isActive },
      { upsert: true, new: true }
    );

    // ✅ যদি এটিকে active করা হয় → অন্য সবগুলো inactive করে দিন (global)
    if (isActive) {
      await CourierSetting.updateMany(
        { _id: { $ne: setting._id } },
        { isActive: false }
      );
    }

    res.json({ success: true, data: setting });
  } catch (err) {
    console.error("Error saving courier:", err);
    res.status(500).json({
      success: false,
      message: "Server error saving courier settings",
      error: err.message,
    });
  }
});

// ✅ Get All Couriers
// FINAL path: GET /api/v1/admin/courier-settings
router.get("/courier-settings", requirePermission("settings"), async (req, res) => {
  try {
    const settings = await CourierSetting.find();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Get Active Courier (Only one active allowed)
// FINAL path: GET /api/v1/admin/active-courier
router.get("/active-courier", requirePermission("settings"), async (req, res) => {
  try {
    const active = await CourierSetting.findOne({ isActive: true });
    res.json(active || null);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Set Active Courier (Only one global active)
// FINAL path: POST /api/v1/admin/set-active-courier
router.post("/set-active-courier", requirePermission("settings"), async (req, res) => {
  try {
    const { courier, merchantName } = req.body;

    if (!courier || !merchantName) {
      return res.status(400).json({
        success: false,
        message: "Courier and merchant name are required!",
      });
    }

    // 🔹 সব courier একসাথে inactive করো (global reset)
    await CourierSetting.updateMany({}, { isActive: false });

    // 🔹 নির্দিষ্ট courier + merchant কে active করো
    const updated = await CourierSetting.findOneAndUpdate(
      { courier, merchantName },
      { isActive: true },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Courier setting not found!",
      });
    }

    res.json({
      success: true,
      message: `✅ ${courier} (${merchantName}) set as active courier successfully!`,
      data: updated,
    });
  } catch (err) {
    console.error("Error setting active courier:", err);
    res.status(500).json({
      success: false,
      message: "❌ Failed to set active courier",
      error: err.message,
    });
  }
});

// ✅ Delete Courier
// FINAL path: DELETE /api/v1/admin/courier-settings/:id
router.delete("/courier-settings/:id", requirePermission("settings"), async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await CourierSetting.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "❌ Courier not found or already deleted!",
      });
    }

    // 🔹 যদি ডিলিট করা courier active ছিল → অন্য active reset করে দাও
    const anyActive = await CourierSetting.findOne({ isActive: true });
    if (!anyActive) {
      await CourierSetting.updateOne({}, { isActive: false });
    }

    res.json({
      success: true,
      message: `🗑️ Courier (${deleted.courier} - ${deleted.merchantName}) deleted successfully!`,
    });
  } catch (err) {
    console.error("Error deleting courier:", err);
    res.status(500).json({
      success: false,
      message: "Server error while deleting courier",
      error: err.message,
    });
  }
});

export default router;
