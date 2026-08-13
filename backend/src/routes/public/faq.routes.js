import express from "express";
import Faq from "../../models/Faq.js";

const router = express.Router();

// ✅ GET FAQ (Public — /faq পেজের জন্য)
// FINAL path: GET /faq
router.get("/", async (req, res) => {
  try {
    let faq = await Faq.findOne();
    if (!faq) {
      faq = await Faq.create({}); // প্রথমবার হলে default content দিয়ে তৈরি হবে
    }
    res.json(faq);
  } catch (err) {
    console.error("❌ Error fetching FAQ:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
