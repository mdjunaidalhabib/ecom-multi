import fs from "fs";
import sharp from "sharp";
import InvoiceTemplateDefault, {
  getOrCreateDefaultInvoiceTemplate,
} from "../../src/models/InvoiceTemplateDefault.js";
import { normalizeTemplate } from "../../src/constants/invoiceTemplate.js";
import { uploadToCloudinary } from "../../utils/product/index.js";
import { deleteByPublicId } from "../../utils/cloudinary/cloudinaryHelpers.js";

const safeUnlink = (filePath) => {
  if (!filePath) return;
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {}
};

const BG_IMAGE_RULE = { maxWidth: 1240, maxHeight: 1754, maxBytes: 300 * 1024 };

// ✅ GET /invoice-template-default — যেকোনো লগইন করা admin/staff পড়তে
// পারবে (তাদের own template না থাকলে এটাই তাদের প্রিভিউ/ফলব্যাক), শুধু
// সেভ করাটা super-admin-only (দেখুন রাউট ফাইল)।
export const getDefaultTemplate = async (req, res) => {
  try {
    const template = await getOrCreateDefaultInvoiceTemplate();
    res.json({ template });
  } catch (err) {
    console.error("❌ getDefaultTemplate error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const saveDefaultTemplate = async (req, res) => {
  try {
    const normalized = normalizeTemplate(req.body);
    const updated = await InvoiceTemplateDefault.findOneAndUpdate(
      { key: "global" },
      { $set: normalized },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    res.json({ template: updated });
  } catch (err) {
    console.error("❌ saveDefaultTemplate error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const uploadDefaultBackgroundImage = async (req, res) => {
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

    const uploaded = await uploadToCloudinary({ path: outputPath }, "invoice_backgrounds/platform-default");

    const existing = await InvoiceTemplateDefault.findOne({ key: "global" }).select(
      "background.imagePublicId",
    );
    if (existing?.background?.imagePublicId) {
      await deleteByPublicId(existing.background.imagePublicId);
    }

    res.json({ url: uploaded.optimizedUrl, publicId: uploaded.public_id });
  } catch (err) {
    console.error("❌ uploadDefaultBackgroundImage error:", err);
    safeUnlink(file?.path);
    res.status(500).json({ message: "Server error uploading background image" });
  }
};
