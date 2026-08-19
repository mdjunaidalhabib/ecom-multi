import fs from "fs";
import sharp from "sharp";
import LandingPage from "../../src/models/LandingPage.js";
import Product from "../../src/models/Product.js";
import { uploadToR2, deleteFromR2 } from "../../utils/r2/r2Helpers.js";

const MAX_HERO_IMAGES = 5;

const safeUnlink = (filePath) => {
  if (!filePath) return;
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {}
};

const cleanupReqFiles = (req) => {
  const files = req.files || (req.file ? [req.file] : []);
  for (const f of files) safeUnlink(f.path);
};

/**
 * ✅ ad hero image — product গ্যালারির মতো strict 1:1 crop না, aspect ratio
 * অক্ষত রেখে শুধু 1600×1600 বক্সের মধ্যে fit করানো হয় (কখনো বড় করা হয় না)।
 */
const HERO_IMAGE_RULE = {
  maxDimension: 1600,
  maxBytes: 250 * 1024,
  allowedInputTypes: ["image/webp", "image/jpeg", "image/png"],
};

const convertHeroImage = async (file) => {
  const outputPath = file.path.replace(/\.\w+$/, "") + "__hero.webp";

  let quality = 90;
  let buffer = await sharp(file.path)
    .resize(HERO_IMAGE_RULE.maxDimension, HERO_IMAGE_RULE.maxDimension, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality })
    .toBuffer();

  while (buffer.length > HERO_IMAGE_RULE.maxBytes && quality > 30) {
    quality -= 10;
    buffer = await sharp(file.path)
      .resize(HERO_IMAGE_RULE.maxDimension, HERO_IMAGE_RULE.maxDimension, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality })
      .toBuffer();
  }

  fs.writeFileSync(outputPath, buffer);
  safeUnlink(file.path);
  file.path = outputPath;
  return file;
};

const sanitizeSections = (sections) => {
  if (!Array.isArray(sections)) return [];
  return sections.slice(0, 50).map((s) => ({
    type: ["feature", "testimonial", "faq", "richtext"].includes(s?.type)
      ? s.type
      : "feature",
    heading: String(s?.heading || "").trim(),
    content: String(s?.content || ""),
    image: String(s?.image || ""),
    authorName: String(s?.authorName || "").trim(),
    authorAvatar: String(s?.authorAvatar || ""),
    rating:
      Number.isFinite(Number(s?.rating)) &&
      Number(s?.rating) >= 0 &&
      Number(s?.rating) <= 5
        ? Number(s.rating)
        : 5,
  }));
};

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

/* -------------------------------------------------------
   GET /admin/landing-pages
------------------------------------------------------- */
export const listLandingPages = async (req, res) => {
  try {
    const pages = await LandingPage.find()
      .populate("productId", "name image price isActive")
      .sort({ createdAt: -1 });
    res.json(pages);
  } catch (err) {
    console.error("❌ listLandingPages error:", err);
    res.status(500).json({ error: "Server error fetching landing pages" });
  }
};

/* -------------------------------------------------------
   GET /admin/landing-pages/:id
------------------------------------------------------- */
export const getLandingPageById = async (req, res) => {
  try {
    const page = await LandingPage.findById(req.params.id).populate(
      "productId",
      "name image images price oldPrice colors stock isActive",
    );
    if (!page) return res.status(404).json({ error: "Landing page not found" });
    res.json(page);
  } catch (err) {
    console.error("❌ getLandingPageById error:", err);
    res.status(500).json({ error: "Server error fetching landing page" });
  }
};

/* -------------------------------------------------------
   POST /admin/landing-pages — নতুন ল্যান্ডিং পেজ (productId আবশ্যক,
   একটা প্রোডাক্টের জন্য একটাই ল্যান্ডিং পেজ থাকতে পারে)
------------------------------------------------------- */
export const createLandingPage = async (req, res) => {
  try {
    const { productId, headline, subheadline, slug } = req.body || {};

    if (!productId || !headline?.trim()) {
      return res.status(400).json({ error: "Product এবং Headline আবশ্যক" });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const existing = await LandingPage.findOne({ productId });
    if (existing) {
      return res.status(409).json({
        error: "এই প্রোডাক্টের জন্য ইতিমধ্যে একটা ল্যান্ডিং পেজ আছে",
      });
    }

    const baseSlug = slugify(slug || headline || product.name) || "landing";
    let finalSlug = baseSlug;
    let suffix = 1;
    while (await LandingPage.findOne({ shopId: req.shopId, slug: finalSlug })) {
      suffix += 1;
      finalSlug = `${baseSlug}-${suffix}`;
    }

    const page = await LandingPage.create({
      shopId: req.shopId,
      productId,
      slug: finalSlug,
      headline: headline.trim(),
      subheadline: subheadline?.trim() || "",
      sections: sanitizeSections(req.body.sections),
    });

    res.status(201).json({ message: "✅ ল্যান্ডিং পেজ তৈরি হয়েছে", page });
  } catch (err) {
    console.error("❌ createLandingPage error:", err);
    if (err?.code === 11000) {
      return res.status(409).json({ error: "এই slug ইতিমধ্যে ব্যবহৃত হচ্ছে" });
    }
    res.status(500).json({ error: "Server error creating landing page" });
  }
};

/* -------------------------------------------------------
   PUT /admin/landing-pages/:id
------------------------------------------------------- */
export const updateLandingPage = async (req, res) => {
  try {
    const page = await LandingPage.findById(req.params.id);
    if (!page) return res.status(404).json({ error: "Landing page not found" });

    const {
      headline,
      subheadline,
      slug,
      sections,
      orderForm,
      isPublished,
      isPrimary,
      seo,
      heroImages,
    } = req.body || {};

    if (headline !== undefined) {
      if (!String(headline).trim()) {
        return res.status(400).json({ error: "Headline আবশ্যক" });
      }
      page.headline = headline.trim();
    }
    if (subheadline !== undefined) page.subheadline = String(subheadline).trim();
    if (sections !== undefined) page.sections = sanitizeSections(sections);
    if (orderForm !== undefined) {
      page.orderForm = {
        showNote: !!orderForm.showNote,
        ctaText: String(orderForm.ctaText || "অর্ডার করুন").trim(),
        showQuantitySelector: orderForm.showQuantitySelector !== false,
      };
    }
    if (seo !== undefined) {
      page.seo = {
        metaTitle: String(seo.metaTitle || "").trim(),
        metaDescription: String(seo.metaDescription || "").trim(),
      };
    }
    if (isPublished !== undefined) page.isPublished = !!isPublished;

    // ✅ heroImages এখান থেকেই reorder/remove করা যায় (নতুন আপলোড আলাদা
    // এন্ডপয়েন্টে হয়) — যেসব url বাদ পড়েছে সেগুলো R2 থেকেও মুছে দেওয়া হয়
    if (Array.isArray(heroImages)) {
      const removed = (page.heroImages || []).filter(
        (url) => !heroImages.includes(url),
      );
      await Promise.all(removed.map((url) => deleteFromR2(url)));
      page.heroImages = heroImages.slice(0, MAX_HERO_IMAGES);
    }

    if (slug !== undefined) {
      const nextSlug = slugify(slug);
      if (!nextSlug) {
        return res.status(400).json({ error: "অকার্যকর slug" });
      }
      const clash = await LandingPage.findOne({
        shopId: page.shopId,
        slug: nextSlug,
        _id: { $ne: page._id },
      });
      if (clash) {
        return res.status(409).json({ error: "এই slug ইতিমধ্যে ব্যবহৃত হচ্ছে" });
      }
      page.slug = nextSlug;
    }

    await page.save();

    // ✅ primary সেট করা হলে — একই শপের বাকি সব ল্যান্ডিং পেজ থেকে primary সরিয়ে দেওয়া
    if (isPrimary === true && !page.isPrimary) {
      page.isPrimary = true;
      await page.save();
      await LandingPage.updateMany(
        { shopId: page.shopId, _id: { $ne: page._id } },
        { $set: { isPrimary: false } },
      );
    } else if (isPrimary === false && page.isPrimary) {
      page.isPrimary = false;
      await page.save();
    }

    res.json({ message: "✅ ল্যান্ডিং পেজ আপডেট হয়েছে", page });
  } catch (err) {
    console.error("❌ updateLandingPage error:", err);
    res.status(500).json({ error: "Server error updating landing page" });
  }
};

/* -------------------------------------------------------
   DELETE /admin/landing-pages/:id
------------------------------------------------------- */
export const deleteLandingPage = async (req, res) => {
  try {
    const page = await LandingPage.findById(req.params.id);
    if (!page) return res.status(404).json({ error: "Landing page not found" });

    await Promise.all((page.heroImages || []).map((url) => deleteFromR2(url)));
    await LandingPage.findByIdAndDelete(page._id);

    res.json({ message: "✅ ল্যান্ডিং পেজ ডিলিট হয়েছে" });
  } catch (err) {
    console.error("❌ deleteLandingPage error:", err);
    res.status(500).json({ error: "Server error deleting landing page" });
  }
};

/* -------------------------------------------------------
   POST /admin/landing-pages/:id/hero-images
------------------------------------------------------- */
export const uploadHeroImages = async (req, res) => {
  try {
    const page = await LandingPage.findById(req.params.id);
    if (!page) {
      cleanupReqFiles(req);
      return res.status(404).json({ error: "Landing page not found" });
    }

    const files = req.files || [];
    const existingCount = page.heroImages?.length || 0;
    const room = MAX_HERO_IMAGES - existingCount;

    if (room <= 0) {
      cleanupReqFiles(req);
      return res.status(400).json({
        error: `সর্বোচ্চ ${MAX_HERO_IMAGES}টি hero image রাখা যাবে`,
      });
    }

    const usable = files.slice(0, room);
    for (const f of files.slice(room)) safeUnlink(f.path);

    const uploadedUrls = [];
    for (const file of usable) {
      await convertHeroImage(file);
      const uploaded = await uploadToR2(file, `shops/${req.shopStorageNumber}/landing-pages/hero`);
      uploadedUrls.push(uploaded.url);
    }

    page.heroImages = [...(page.heroImages || []), ...uploadedUrls];
    await page.save();

    res.json({ message: "✅ Hero image আপলোড হয়েছে", page });
  } catch (err) {
    console.error("❌ uploadHeroImages error:", err);
    cleanupReqFiles(req);
    res.status(500).json({ error: "Server error uploading hero images" });
  }
};
