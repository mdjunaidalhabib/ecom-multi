import fs from "fs";
import sharp from "sharp";
import InvoiceTemplate from "../../src/models/InvoiceTemplate.js";
import { normalizeTemplate } from "../../src/constants/invoiceTemplate.js";
import { resolveInvoiceTemplateForShop } from "../../src/services/invoiceTemplateService.js";
import { uploadToR2, deleteByKey } from "../../utils/r2/r2Helpers.js";

const safeUnlink = (filePath) => {
  if (!filePath) return;
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {}
};

const BG_IMAGE_RULE = { maxWidth: 1240, maxHeight: 1754, maxBytes: 300 * 1024 };

/**
 * ✅ GET /invoice-template/resolved — শপের প্ল্যান/কাস্টমাইজেশন যাই থাকুক না
 * কেন, invoice ডাউনলোড করার জন্য যে টেমপ্লেটটা আসলে ব্যবহার হবে সেটা রিটার্ন
 * করে (plan-gate নেই — যেকোনো admin/staff একটা invoice প্রিন্ট করতে পারবে)।
 */
export const getResolvedTemplate = async (req, res) => {
  try {
    const { template, source, shop } = await resolveInvoiceTemplateForShop(req.shopId);
    res.json({ template, source, shop });
  } catch (err) {
    console.error("❌ getResolvedTemplate error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ✅ GET /invoice-template/mine — plan-gated (requirePlanFeature)। শপের
 * নিজস্ব কাস্টম টেমপ্লেট থাকলে সেটা, না থাকলে ডিফল্টকে স্টার্টিং পয়েন্ট
 * হিসেবে দেখায় (isCustomized: false দিয়ে UI বুঝিয়ে দেয় "এটা এখনো তোমার নিজের না")।
 */
export const getMyTemplate = async (req, res) => {
  try {
    const own = await InvoiceTemplate.findOne({ shopId: req.shopId });
    if (own) {
      return res.json({ template: own, isCustomized: true });
    }

    const { template } = await resolveInvoiceTemplateForShop(req.shopId);
    res.json({ template, isCustomized: false });
  } catch (err) {
    console.error("❌ getMyTemplate error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ✅ PUT /invoice-template/mine — plan-gated। শপের নিজস্ব টেমপ্লেট
 * upsert করে — client-side canvas math কে কখনো সরাসরি বিশ্বাস না করে
 * normalizeTemplate() দিয়ে সেফ শেপে ক্ল্যাম্প করে সেভ করা হয়।
 */
export const saveMyTemplate = async (req, res) => {
  try {
    const normalized = normalizeTemplate(req.body);

    const updated = await InvoiceTemplate.findOneAndUpdate(
      { shopId: req.shopId },
      { $set: normalized },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    res.json({ template: updated, isCustomized: true });
  } catch (err) {
    console.error("❌ saveMyTemplate error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ✅ POST /invoice-template/mine/background — plan-gated। ব্যাকগ্রাউন্ড
 * ইমেজ আপলোড করে, পুরনো R2 asset (থাকলে) ডিলিট করে। ক্লায়েন্ট এই
 * রেসপন্সের url/publicId নিজে template.background এ বসিয়ে PUT /mine কল করবে।
 */
export const uploadBackgroundImage = async (req, res) => {
  const file = req.file;
  try {
    if (!file) return res.status(400).json({ message: "কোনো ইমেজ পাওয়া যায়নি" });

    const outputPath = file.path.replace(/\.\w+$/, "") + "__invoicebg.webp";
    let quality = 90;
    let buffer = await sharp(file.path)
      .resize(BG_IMAGE_RULE.maxWidth, BG_IMAGE_RULE.maxHeight, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality })
      .toBuffer();

    while (buffer.length > BG_IMAGE_RULE.maxBytes && quality > 30) {
      quality -= 10;
      buffer = await sharp(file.path)
        .resize(BG_IMAGE_RULE.maxWidth, BG_IMAGE_RULE.maxHeight, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality })
        .toBuffer();
    }

    fs.writeFileSync(outputPath, buffer);
    safeUnlink(file.path);

    const uploaded = await uploadToR2(
      { path: outputPath, mimetype: "image/webp" },
      `shops/${req.shopStorageNumber}/invoice_backgrounds`,
    );

    const existing = await InvoiceTemplate.findOne({ shopId: req.shopId }).select(
      "background.imagePublicId",
    );
    if (existing?.background?.imagePublicId) {
      await deleteByKey(existing.background.imagePublicId);
    }

    res.json({ url: uploaded.url, publicId: uploaded.key });
  } catch (err) {
    console.error("❌ uploadBackgroundImage error:", err);
    safeUnlink(file?.path);
    res.status(500).json({ message: "Server error uploading background image" });
  }
};
