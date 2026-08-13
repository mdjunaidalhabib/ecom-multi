import express from "express";
import Faq from "../../models/Faq.js";

const router = express.Router();

// ✅ GET FAQ (Admin — editing form এর জন্য)
// FINAL path: GET /admin/faq
router.get("/", async (req, res) => {
  try {
    let faq = await Faq.findOne();
    if (!faq) {
      faq = await Faq.create({}); // schema default গুলো দিয়ে তৈরি হবে
    }
    res.json(faq);
  } catch (err) {
    console.error("❌ Error fetching FAQ (admin):", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ CREATE/UPDATE FAQ (Admin only)
// FINAL path: POST /admin/faq
router.post("/", async (req, res) => {
  try {
    const data = { ...req.body };
    delete data._id;
    delete data.__v;

    data.updatedAt = new Date();

    const faq = await Faq.findOneAndUpdate(
      {},
      { $set: data },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    );

    res.json({
      message: "✅ FAQ page updated successfully",
      faq,
    });
  } catch (err) {
    console.error("❌ Error updating FAQ:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// ✅ RESET FAQ to default (Admin only)
// FINAL path: DELETE /admin/faq
router.delete("/", async (req, res) => {
  try {
    await Faq.deleteMany({});
    const faq = await Faq.create({}); // নতুন default document
    res.json({ message: "🔄 FAQ page reset to default", faq });
  } catch (err) {
    console.error("❌ Error resetting FAQ:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
