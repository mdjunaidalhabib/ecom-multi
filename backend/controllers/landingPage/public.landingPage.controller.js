import LandingPage from "../../src/models/LandingPage.js";

/* -------------------------------------------------------
   GET /api/landing-pages/by-slug/:slug — Public: প্রকাশিত ল্যান্ডিং পেজ,
   লাইভ প্রোডাক্ট ডেটাসহ (দাম/স্টক/ভ্যারিয়ান্ট সবসময় Product থেকেই আসে)
------------------------------------------------------- */
export const getPublishedLandingPageBySlug = async (req, res) => {
  try {
    const page = await LandingPage.findOne({
      slug: req.params.slug,
      isPublished: true,
    }).populate(
      "productId",
      "name image images price oldPrice colors stock isSoldOut isActive",
    );

    if (!page || !page.productId) {
      return res.status(404).json({ message: "Landing page not found" });
    }

    res.json(page);
  } catch (err) {
    console.error("❌ getPublishedLandingPageBySlug error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
