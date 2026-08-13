import express from "express";
import RefundPolicy from "../../models/RefundPolicy.js";

const router = express.Router();

// ✅ GET Refund Policy (Public — /refund-policy পেজের জন্য)
// FINAL path: GET /refund-policy
router.get("/", async (req, res) => {
  try {
    let policy = await RefundPolicy.findOne();
    if (!policy) {
      policy = await RefundPolicy.create({}); // প্রথমবার হলে default content দিয়ে তৈরি হবে
    }
    res.json(policy);
  } catch (err) {
    console.error("❌ Error fetching refund policy:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
