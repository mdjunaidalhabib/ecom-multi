import express from "express";
import MailReport from "../../models/MailReport.js";

const router = express.Router();

// ✅ GET Mail Report (paginated)
// FINAL path: GET /admin/mail-report
router.get("/", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      MailReport.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      MailReport.countDocuments(),
    ]);

    res.json({
      logs,
      total,
      page,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    });
  } catch (err) {
    console.error("❌ Error fetching mail report:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ RESET Mail Report (hard delete — permanently clears all logged entries)
// FINAL path: DELETE /admin/mail-report
router.delete("/", async (req, res) => {
  try {
    await MailReport.deleteMany({});
    res.json({ message: "🗑️ Mail report সম্পূর্ণ মুছে ফেলা হয়েছে" });
  } catch (err) {
    console.error("❌ Error resetting mail report:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
