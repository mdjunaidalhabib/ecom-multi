import express from "express";
import RefundPolicy from "../../models/RefundPolicy.js";

const router = express.Router();

// ✅ GET Refund Policy (Admin — editing form এর জন্য)
// FINAL path: GET /admin/refund-policy
router.get("/", async (req, res) => {
  try {
    let policy = await RefundPolicy.findOne();
    if (!policy) {
      policy = await RefundPolicy.create({}); // schema default গুলো দিয়ে তৈরি হবে
    }
    res.json(policy);
  } catch (err) {
    console.error("❌ Error fetching refund policy (admin):", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ CREATE/UPDATE Refund Policy (Admin only)
// FINAL path: POST /admin/refund-policy
router.post("/", async (req, res) => {
  try {
    const data = { ...req.body };
    delete data._id;
    delete data.__v;

    data.updatedAt = new Date();

    const policy = await RefundPolicy.findOneAndUpdate(
      {},
      { $set: data },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    );

    res.json({
      message: "✅ Refund Policy page updated successfully",
      policy,
    });
  } catch (err) {
    console.error("❌ Error updating refund policy:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// ✅ RESET Refund Policy to default (Admin only)
// FINAL path: DELETE /admin/refund-policy
router.delete("/", async (req, res) => {
  try {
    await RefundPolicy.deleteMany({});
    const policy = await RefundPolicy.create({}); // নতুন default document
    res.json({ message: "🔄 Refund Policy page reset to default", policy });
  } catch (err) {
    console.error("❌ Error resetting refund policy:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
