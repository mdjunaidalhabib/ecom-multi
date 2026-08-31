import fs from "fs";
import sharp from "sharp";

/* ================== FAVICON IMAGE RULE ==================
   ✅ ছোট আইকন — crop না করে পুরো ছবি ফ্রেমের ভিতরে রেখে (transparent
   padding সহ) 64×64 WEBP এ কনভার্ট করা হয় (category/product ছবির মতো
   "cover" crop করলে লোগোর গুরুত্বপূর্ণ অংশ কেটে যেতে পারে)।
================================================= */
const FAVICON_IMAGE_RULE = {
  size: 64,
  maxBytes: 50 * 1024,
  allowedInputTypes: ["image/webp", "image/jpeg", "image/png"],
};

export const validateFaviconInputFile = (file) => {
  if (!file) return "কোনো ছবি পাওয়া যায়নি";
  if (!FAVICON_IMAGE_RULE.allowedInputTypes.includes(file.mimetype)) {
    return "শুধু jpeg/png/webp গ্রহণযোগ্য (স্বয়ংক্রিয়ভাবে 64×64 WEBP এ রূপান্তর হবে)";
  }
  if (file.size > 1 * 1024 * 1024) {
    return "ফাইল সাইজ অনেক বড়";
  }
  return "";
};

export const convertToFaviconWebp = async (inputPath) => {
  const outputPath = inputPath.replace(/\.\w+$/, "") + "__favicon.webp";

  let quality = 90;
  const render = (q) =>
    sharp(inputPath)
      .resize(FAVICON_IMAGE_RULE.size, FAVICON_IMAGE_RULE.size, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .webp({ quality })
      .toBuffer();

  let buffer = await render(quality);

  while (buffer.length > FAVICON_IMAGE_RULE.maxBytes && quality > 30) {
    quality -= 10;
    buffer = await render(quality);
  }

  if (buffer.length > FAVICON_IMAGE_RULE.maxBytes) {
    throw new Error(
      `Favicon-কে ${Math.floor(FAVICON_IMAGE_RULE.maxBytes / 1024)}KB এর নিচে কমপ্রেস করা যায়নি`
    );
  }

  fs.writeFileSync(outputPath, buffer);
  return outputPath;
};

export const safeUnlink = (filePath) => {
  if (!filePath) return;
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {
    // ignore
  }
};

export default {
  validateFaviconInputFile,
  convertToFaviconWebp,
  safeUnlink,
};
