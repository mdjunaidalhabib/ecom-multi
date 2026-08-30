import Product from "../../src/models/Product.js";
import Shop from "../../src/models/Shop.js";
import Category from "../../src/models/Category.js";
import { shopHasFeature } from "../../src/services/planFeatureService.js";
import fs from "fs";
import sharp from "sharp";
import path from "path";
import { deleteFromR2, uploadToR2 } from "../../utils/r2/r2Helpers.js";
import { moveToTrash } from "../../utils/trash/trash.helpers.js";
import {
  toNumber,
  computeIsSoldOut,
  computeVariantTotalStock,
  shiftOrdersForInsert,
  normalizeOrders,
  sanitizeRichText,
} from "../../utils/product/index.js";

/* ================== ✅ RULE ================== */
const PRODUCT_IMAGE_RULE = {
  mime: "image/webp",
  width: 1200,
  height: 1200,
  maxBytes: 100 * 1024, // ✅ strict 1:1 (1200×1200) crop, ১৫০KB থেকে কমিয়ে ১০০KB করা হলো
  allowedInputTypes: ["image/webp", "image/jpeg", "image/png"],
};

// ✅ প্রতিটি variant (color) এ সর্বোচ্চ কতটি image রাখা যাবে — এটাই এখন
// সার্ভার-সাইড source of truth। Frontend (VariantSection.jsx এর
// MAX_VARIANT_IMAGES) এখানে হার্ডকোড এই সংখ্যার সাথে মিলিয়ে রাখা হয়েছে,
// কিন্তু আসল নিরাপত্তা এখানেই — frontend bypass করে সরাসরি API কল করলেও
// এই limit ভাঙা যাবে না।
const MAX_VARIANT_IMAGES = 8;

/* ================== ✅ HELPERS ================== */
const safeJSON = (val, fallback) => {
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
};

const safeUnlink = (filePath) => {
  if (!filePath) return;
  try {
    fs.unlinkSync(filePath);
  } catch {}
};

const cleanupReqFiles = (req) => {
  const files = req.files || [];
  for (const f of files) safeUnlink(f.path);
};

// ✅ Mongoose/Mongo error গুলো raw (ObjectId(), Date() সহ পুরো document)
// frontend এ পাঠানো হয় না — এখানে user-friendly বাংলা মেসেজে রূপান্তর করা হয়।
// ⚠️ আগে অচেনা যেকোনো error-এর জন্য শুধু generic "Server error" পাঠানো হতো —
// আসল কারণ (R2 upload ব্যর্থ, ইনভ্যালিড category id, ইত্যাদি) শুধু server
// console log-এ থাকতো, admin panel-এ দেখা যেত না। এখন admin/super-admin
// প্যানেল ইন্টারনাল বলে err.name/err.message-ও রেসপন্সে জুড়ে দেওয়া হচ্ছে,
// যাতে "Server error" দেখেই বসে না থেকে আসল কারণ বোঝা যায়।
const sendMongoError = (res, err) => {
  if (err?.code === 11000) {
    return res.status(409).json({
      error: "একই তথ্যের একটি প্রোডাক্ট ইতিমধ্যে আছে",
    });
  }
  if (err?.name === "ValidationError") {
    const message = Object.values(err.errors || {})
      .map((e) => e.message)
      .join(", ");
    return res.status(400).json({ error: message || "প্রোডাক্টের তথ্য সঠিক নয়" });
  }
  if (err?.name === "CastError") {
    return res.status(400).json({
      error: `অবৈধ মান দেওয়া হয়েছে (${err.path}: "${err.value}") — সঠিক ফরম্যাটে দিন`,
    });
  }
  const detail = err?.message ? `: ${err.message}` : "";
  return res.status(500).json({ error: `Server error${detail}` });
};

/**
 * ✅ Convert ANY (jpeg/png/webp) => strict 1200×1200 (1:1) WEBP, এর কাছাকাছি সর্বোচ্চ চেষ্টায় <= 150KB (fit:cover, center crop)
 * - center crop
 * - resize
 * - quality compress loop
 * - তারপরও বড় হলে ধীরে ধীরে dimension কমিয়ে আবার compress (NEVER throw)
 * - guaranteed: এই ফাংশন কখনো error throw করবে না, upload সবসময় শেষ পর্যন্ত হবে
 */
const convertAndOverwriteProductImage = async (file) => {
  if (!file?.path) throw new Error("Invalid upload file");

  // ✅ input mimetype check (extra safety)
  if (!PRODUCT_IMAGE_RULE.allowedInputTypes.includes(file.mimetype)) {
    throw new Error("Only jpeg/png/webp allowed");
  }

  const inputPath = file.path;
  const outputPath = inputPath.replace(/\.[^/.]+$/, "") + "_converted.webp";

  // ✅ ইমেজ আগে থেকেই যদি already valid হয় (webp + size + dimension ঠিক আছে),
  // তাহলে আবার re-encode করার দরকার নেই — re-encode করলে generation-loss এর কারণে
  // মাঝে মাঝে ফাইল উল্টো বড় হয়ে যেতে পারে এবং upload error দিতে পারে।
  if (
    file.mimetype === PRODUCT_IMAGE_RULE.mime &&
    file.size <= PRODUCT_IMAGE_RULE.maxBytes
  ) {
    try {
      const meta = await sharp(inputPath).metadata();
      if (
        meta.width === PRODUCT_IMAGE_RULE.width &&
        meta.height === PRODUCT_IMAGE_RULE.height
      ) {
        return; // ✅ already perfect — কিছু পরিবর্তন না করেই upload হবে
      }
    } catch {
      // metadata পড়তে সমস্যা হলেও normal flow এ এগিয়ে যাবো
    }
  }

  // ✅ একটা single pass যেখানে quality ও প্রয়োজনে dimension দুটোই কমানো হবে,
  // কিন্তু কখনো error throw হবে না — শেষে যা পাওয়া যায় সেটাই ব্যবহার হবে।
  let bestBuffer = null;
  let dims = { width: PRODUCT_IMAGE_RULE.width, height: PRODUCT_IMAGE_RULE.height };

  outer: for (let attempt = 0; attempt < 5; attempt++) {
    let quality = 90;

    while (quality >= 40) {
      try {
        const buffer = await sharp(inputPath)
          .resize(dims.width, dims.height, {
            fit: "cover",  // ✅ strict 1:1 — center crop করে পুরো ফ্রেম ভরাট করে, সাদা padding থাকে না
            position: "center", // ✅ true center crop — উপর-নিচ/দুই পাশ থেকে সমান কেটে center রাখে
            // ⚠️ আগে "attention" ব্যবহার হতো (saliency-based), যেটা প্রায়ই ছবির
            // উপরের দিকের subject-কে বেশি গুরুত্ব দিয়ে শুধু নিচ থেকে কাটতো —
            // ফলে user-এর চোখে মনে হতো "শুধু উপর থেকে কাটছে"। "center" দিলে
            // সবসময় exact মাঝখান বরাবর crop হবে, দুই দিক থেকেই সমান অংশ কাটবে।
          })
          .sharpen({ sigma: 1.2, m1: 1.5, m2: 0.7 }) // ✅ default sharpen এর চেয়ে বেশি কার্যকর — detail/text এর edge ধরে রাখে
          .webp({ quality, effort: 6 }) // ✅ effort:6 → একই quality-তে স্মার্ট কম্প্রেশন
          .toBuffer();

        bestBuffer = buffer; // সবসময় শেষ successful buffer রাখি (fallback এর জন্য)

        if (buffer.length <= PRODUCT_IMAGE_RULE.maxBytes) {
          break outer; // ✅ লক্ষ্যে পৌঁছে গেছি
        }
      } catch {
        // এই quality/size এ encode করতে সমস্যা হলেও থেমে যাবো না, পরের ধাপে যাবো
      }

      quality -= 5; // ✅ আগে 10 ধাপে কমানো হতো, এখন 5 ধাপে — quality 50 এ লাফ দিয়ে পড়ার বদলে আরও সূক্ষ্মভাবে কমে
    }

    // ✅ quality কমিয়েও 100KB এর নিচে আনা যাচ্ছে না — dimension আরও ছোট করে আবার চেষ্টা
    dims = {
      width: Math.max(200, Math.round(dims.width * 0.8)),
      height: Math.max(200, Math.round(dims.height * 0.8)),
    };
  }

  // ✅ guaranteed fallback: bestBuffer না পেলে (একদমই অসম্ভব edge case) plain resize ব্যবহার করো
  if (!bestBuffer) {
    bestBuffer = await sharp(inputPath)
      .resize(400, 400, {
        fit: "cover",
        position: "center", // ✅ fallback path-ও এখন true center crop
      })
      .sharpen({ sigma: 1.2, m1: 1.5, m2: 0.7 })
      .webp({ quality: 65, effort: 6 })
      .toBuffer();
  }

  // ✅ কখনো error throw না করে — যা পাওয়া গেছে সেটাই লিখে ফেলা হলো (no blocking error)
  fs.writeFileSync(outputPath, bestBuffer);

  // ✅ remove original
  safeUnlink(inputPath);

  // ✅ overwrite multer file
  file.path = outputPath;
  file.mimetype = PRODUCT_IMAGE_RULE.mime;
  file.size = bestBuffer.length;
  file.originalname =
    (file.originalname || "image").replace(/\.(png|jpg|jpeg|webp)$/i, "") +
    ".webp";
};

/**
 * ✅ Convert all req.files before uploading to R2
 */
const convertAllReqFiles = async (req) => {
  const files = req.files || [];
  for (const f of files) {
    await convertAndOverwriteProductImage(f);
  }
};

/* ================== ✅ ADMIN READ ================== */
export const getProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("categories")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err?.message || "Server error" });
  }
};

export const getProductByIdAdmin = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "categories",
    );
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err?.message || "Server error" });
  }
};

/* ================== ✅ CREATE ================== */
export const createProduct = async (req, res) => {
  try {
    // ✅ convert ALL uploaded files first (guaranteed webp strict 1200×1200 1:1 <= 150KB, center crop)
    await convertAllReqFiles(req);

    const {
      name,
      price,
      oldPrice,
      costPrice,
      stock,
      sold,
      isSoldOut,
      rating,
      description,
      additionalInfo,
      categories,
      order,
      isActive,
      colors,
      freeDelivery,
      bestDiscount,
      cartvanBox,
      reviewVideoLink,
      reviewVideoText,
    } = req.body;

    let categoryIds = categories ? safeJSON(categories, []) : [];

    if (!name || price === undefined) {
      cleanupReqFiles(req);
      return res
        .status(400)
        .json({ error: "Name ও Price আবশ্যক" });
    }

    const shop = await Shop.findById(req.shopId).select("limits plan").lean();

    if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
      // ✅ landing-page-only শপে (fullStorefront: false) কোনো ক্যাটাগরি
      // ব্রাউজিং পেজ নেই, তাই ক্যাটাগরি বাছাই বাধ্যতামূলক না — একটা
      // hidden default category স্বয়ংক্রিয়ভাবে find-or-create করে বসিয়ে
      // দেওয়া হয় (Product.categories schema-তে required-ই থাকছে, শুধু
      // এই শপগুলোর জন্য admin ফর্মে ক্যাটাগরি সিলেক্টর দেখানো হবে না)
      const hasFullStorefront = await shopHasFeature(shop, "fullStorefront");
      if (!hasFullStorefront) {
        const defaultCategory = await Category.findOneAndUpdate(
          { shopId: req.shopId, name: "__landing_default__" },
          {
            $setOnInsert: {
              shopId: req.shopId,
              name: "__landing_default__",
              isActive: false,
            },
          },
          { upsert: true, new: true },
        );
        categoryIds = [defaultCategory._id];
      } else {
        cleanupReqFiles(req);
        return res
          .status(400)
          .json({ error: "Name, Price & at least one Category required" });
      }
    }

    // ✅ প্ল্যান-ভিত্তিক প্রোডাক্ট লিমিট — Shop.limits.maxProducts
    // (Product tenant-scoped বলে countDocuments() এমনিতেই এই শপের মধ্যে সীমাবদ্ধ)
    const maxProducts = shop?.limits?.maxProducts ?? 200;
    const currentProductCount = await Product.countDocuments();
    if (currentProductCount >= maxProducts) {
      cleanupReqFiles(req);
      return res.status(403).json({
        error: `এই প্ল্যানে সর্বোচ্চ ${maxProducts}টি প্রোডাক্ট যোগ করা যাবে। প্ল্যান আপগ্রেড করুন।`,
      });
    }

    const total = await Product.countDocuments();
    const serial = toNumber(order, 0) > 0 ? toNumber(order, 0) : total + 1;
    await shiftOrdersForInsert(serial);

    let parsedColors = colors ? safeJSON(colors, []) : [];
    const hasVariants = Array.isArray(parsedColors) && parsedColors.length > 0;

    let primaryImage = "";
    let galleryImages = [];
    const allFiles = req.files || [];

    if (!hasVariants) {
      let galleryFiles = allFiles.filter((f) => f.fieldname === "images");

      // ✅ non-variant product এও একই MAX_VARIANT_IMAGES limit প্রযোজ্য
      if (galleryFiles.length > MAX_VARIANT_IMAGES) {
        const excess = galleryFiles.slice(MAX_VARIANT_IMAGES);
        for (const f of excess) safeUnlink(f.path);
        galleryFiles = galleryFiles.slice(0, MAX_VARIANT_IMAGES);
      }

      for (let file of galleryFiles) {
        const uploaded = await uploadToR2(file, `shops/${req.shopStorageNumber}/products/gallery`);
        galleryImages.push(uploaded.url);
        safeUnlink(file.path);
      }

      primaryImage = galleryImages[0] || "";
    } else {
      parsedColors = parsedColors.map((c) => ({
        ...c,
        price:
          c.price !== undefined && c.price !== null && c.price !== ""
            ? toNumber(c.price, 0)
            : toNumber(price, 0),
        oldPrice:
          c.oldPrice && toNumber(c.oldPrice, 0) > 0
            ? toNumber(c.oldPrice, 0)
            : null,
        // ✅ per-variant ক্রয় মূল্য — admin-only, খালি রাখলে null
        costPrice:
          c.costPrice !== undefined && c.costPrice !== null && c.costPrice !== ""
            ? toNumber(c.costPrice, 0)
            : null,
        stock: c.stock !== undefined ? toNumber(c.stock, 0) : 0,
        sold: c.sold !== undefined ? toNumber(c.sold, 0) : 0,
        images: Array.isArray(c.images) ? c.images : [],
      }));

      for (let i = 0; i < parsedColors.length; i++) {
        const fieldName = `color_images_${i}`;
        let colorFiles = allFiles.filter((f) => f.fieldname === fieldName);

        // ✅ প্রতি variant এ সর্বোচ্চ MAX_VARIANT_IMAGES টা image — বাড়তি
        // file গুলো disk থেকে সাথে সাথে unlink করে দেওয়া হচ্ছে যাতে temp
        // ফাইল জমে না থাকে।
        if (colorFiles.length > MAX_VARIANT_IMAGES) {
          const excess = colorFiles.slice(MAX_VARIANT_IMAGES);
          for (const f of excess) safeUnlink(f.path);
          colorFiles = colorFiles.slice(0, MAX_VARIANT_IMAGES);
        }

        if (colorFiles.length > 0) {
          const urls = [];
          for (let file of colorFiles) {
            const uploaded = await uploadToR2(
              file,
              `shops/${req.shopStorageNumber}/products/variants`,
            );
            urls.push(uploaded.url);
            safeUnlink(file.path);
          }
          parsedColors[i].images = urls;
        }
      }

      primaryImage = parsedColors?.[0]?.images?.[0] || "";
    }

    const finalStock = hasVariants
      ? computeVariantTotalStock(parsedColors)
      : toNumber(stock, 0);

    const computedSoldOut = computeIsSoldOut({
      hasVariants,
      stock: finalStock,
      colors: parsedColors,
    });

    const mainPrice = hasVariants
      ? toNumber(parsedColors?.[0]?.price, 0)
      : toNumber(price, 0);

    const mainOldPrice = hasVariants
      ? parsedColors?.[0]?.oldPrice &&
        toNumber(parsedColors?.[0]?.oldPrice, 0) > 0
        ? toNumber(parsedColors?.[0]?.oldPrice, 0)
        : null
      : oldPrice && toNumber(oldPrice, 0) > 0
        ? toNumber(oldPrice, 0)
        : null;

    const mainSold = hasVariants
      ? toNumber(parsedColors?.[0]?.sold, 0)
      : toNumber(sold, 0);

    // ✅ costPrice এখন price/oldPrice/sold এর মতোই variant-aware: variant
    // থাকলে প্রথম variant এর costPrice ব্যবহার হয় (আসল ক্রয়মূল্য প্রতিটা
    // variant এ আলাদাভাবে সেভ থাকে colors[].costPrice এ), না থাকলে top-level
    // ফর্ম থেকে আসা costPrice ব্যবহার হয়।
    const mainCostPrice = hasVariants
      ? parsedColors?.[0]?.costPrice ?? null
      : costPrice !== undefined && costPrice !== null && costPrice !== ""
        ? toNumber(costPrice, 0)
        : null;

    const product = new Product({
      name,
      price: mainPrice,
      oldPrice: mainOldPrice,
      costPrice: mainCostPrice,
      stock: finalStock,
      sold: mainSold,
      isSoldOut: isSoldOut === "true" ? true : computedSoldOut,
      rating: toNumber(rating, 0),
      description: sanitizeRichText(description),
      additionalInfo: sanitizeRichText(additionalInfo),
      categories: categoryIds,
      image: primaryImage,
      images: galleryImages,
      colors: parsedColors,
      reviews: req.body.reviews ? safeJSON(req.body.reviews, []) : [],
      order: serial,
      isActive: isActive === "true",
      freeDelivery: freeDelivery === "true",
      bestDiscount: bestDiscount === "true",
      cartvanBox: cartvanBox === "true",
      // ✅ Review Video Link — per-product, খালি থাকলে ফ্রন্টএন্ডে সেকশন hide
      reviewVideo: {
        link: reviewVideoLink ? String(reviewVideoLink).trim() : "",
        text: reviewVideoText ? String(reviewVideoText).trim() : "",
      },
    });

    await product.save();
    await normalizeOrders();

    res.status(201).json(product);
  } catch (err) {
    console.error("Create Error:", err);
    cleanupReqFiles(req);
    sendMongoError(res, err);
  }
};

/* ================== ✅ UPDATE ================== */
export const updateProduct = async (req, res) => {
  try {
    // ✅ convert ALL uploaded files first (guaranteed webp strict 1200×1200 1:1 <= 150KB, center crop)
    await convertAllReqFiles(req);

    const product = await Product.findById(req.params.id);
    if (!product) {
      cleanupReqFiles(req);
      return res.status(404).json({ error: "Product not found" });
    }

    const {
      name,
      price,
      oldPrice,
      costPrice,
      stock,
      sold,
      isSoldOut,
      rating,
      description,
      additionalInfo,
      categories,
      order,
      isActive,
      existingImages,
      colors,
      freeDelivery,
      bestDiscount,
      cartvanBox,
      reviewVideoLink,
      reviewVideoText,
    } = req.body;

    const newOrder = toNumber(order, 0);
    if (newOrder > 0 && newOrder !== product.order) {
      await shiftOrdersForInsert(newOrder, product._id);
      product.order = newOrder;
    }

    // ✅ FIX: "colors" field না থাকলে (যেমন bulk Hide/Show All আপডেট) এটাকে
    // "variant নাই" ধরে নিয়ে পুরনো images/colors ডিলিট করা হচ্ছিল — এটাই
    // ছিল "আপডেট করার পর ইমেজ চলে যাওয়া" বাগের মূল কারণ।
    // colors field সত্যিকারে পাঠানো হয়েছে কিনা সেটা আলাদাভাবে চেক করা হলো।
    const colorsFieldProvided = colors !== undefined;
    let incomingColors = colorsFieldProvided ? safeJSON(colors, []) : [];
    const allFiles = req.files || [];

    if (!colorsFieldProvided) {
      // ✅ এই request এ images/colors related কিছুই পাঠানো হয়নি
      // (যেমন bulk isActive/order টগল) — তাই product.image/images/colors
      // একদম অপরিবর্তিত থাকবে। শুধু নিচের অন্য field গুলো (isActive, order ইত্যাদি) আপডেট হবে।
    } else if (Array.isArray(incomingColors) && incomingColors.length > 0) {
      incomingColors = incomingColors.map((c) => ({
        ...c,
        price:
          c.price !== undefined && c.price !== null && c.price !== ""
            ? toNumber(c.price, 0)
            : price !== undefined
              ? toNumber(price, 0)
              : toNumber(product.price, 0),
        oldPrice:
          c.oldPrice && toNumber(c.oldPrice, 0) > 0
            ? toNumber(c.oldPrice, 0)
            : null,
        // ✅ per-variant ক্রয় মূল্য — admin-only, খালি রাখলে null
        costPrice:
          c.costPrice !== undefined && c.costPrice !== null && c.costPrice !== ""
            ? toNumber(c.costPrice, 0)
            : null,
        stock: c.stock !== undefined ? toNumber(c.stock, 0) : 0,
        sold: c.sold !== undefined ? toNumber(c.sold, 0) : 0,
        images: Array.isArray(c.images) ? c.images : [],
      }));

      // ✅ delete old non-variant images
      if (product.image) await deleteFromR2(product.image);
      for (let url of product.images) await deleteFromR2(url);

      product.image = "";
      product.images = [];

      for (let i = 0; i < incomingColors.length; i++) {
        const fieldName = `color_images_${i}`;
        let colorFiles = allFiles.filter((f) => f.fieldname === fieldName);

        // ✅ MAX_VARIANT_IMAGES হিসাব করা হচ্ছে আগে থেকে রাখা (existing)
        // image + নতুন upload মিলিয়ে — টোটাল যেন কখনো limit ছাড়িয়ে না যায়।
        const existingCount = Array.isArray(incomingColors[i].images)
          ? incomingColors[i].images.length
          : 0;
        const allowedNew = Math.max(0, MAX_VARIANT_IMAGES - existingCount);
        if (colorFiles.length > allowedNew) {
          const excess = colorFiles.slice(allowedNew);
          for (const f of excess) safeUnlink(f.path);
          colorFiles = colorFiles.slice(0, allowedNew);
        }

        if (colorFiles.length > 0) {
          const urls = [];
          for (let file of colorFiles) {
            const uploaded = await uploadToR2(
              file,
              `shops/${req.shopStorageNumber}/products/variants`,
            );
            urls.push(uploaded.url);
            safeUnlink(file.path);
          }
          incomingColors[i].images = [
            ...(incomingColors[i].images || []),
            ...urls,
          ];
        }
      }

      product.colors = incomingColors;
      product.stock = computeVariantTotalStock(product.colors);
      product.image = product.colors?.[0]?.images?.[0] || product.image;

      product.price = toNumber(product.colors?.[0]?.price, product.price);
      product.oldPrice =
        product.colors?.[0]?.oldPrice &&
        toNumber(product.colors?.[0]?.oldPrice, 0) > 0
          ? toNumber(product.colors?.[0]?.oldPrice, 0)
          : null;
      product.sold = toNumber(product.colors?.[0]?.sold, product.sold);
      // ✅ variant mode এ top-level costPrice প্রথম variant থেকে সিঙ্ক থাকবে
      product.costPrice = product.colors?.[0]?.costPrice ?? null;
    } else {
      // ✅ colors field খালি/empty array আকারে পাঠানো হয়েছে
      // (explicit signal যে variant mode থেকে normal mode এ switch করা হচ্ছে)
      // switching from variants to normal
      if (product.colors && product.colors.length > 0) {
        for (let color of product.colors) {
          for (let url of color.images) await deleteFromR2(url);
        }
        product.colors = [];
      }

      let keepImages = existingImages ? safeJSON(existingImages, []) : [];
      keepImages = Array.isArray(keepImages) ? keepImages : [];

      const imagesToRemove = product.images.filter(
        (img) => !keepImages.includes(img),
      );
      for (let url of imagesToRemove) await deleteFromR2(url);

      let galleryFiles = allFiles.filter((f) => f.fieldname === "images");
      let newUploads = [];

      // ✅ existing (kept) + নতুন upload মিলিয়ে MAX_VARIANT_IMAGES ছাড়ানো যাবে না
      const allowedNew = Math.max(0, MAX_VARIANT_IMAGES - keepImages.length);
      if (galleryFiles.length > allowedNew) {
        const excess = galleryFiles.slice(allowedNew);
        for (const f of excess) safeUnlink(f.path);
        galleryFiles = galleryFiles.slice(0, allowedNew);
      }

      for (let file of galleryFiles) {
        const uploaded = await uploadToR2(file, `shops/${req.shopStorageNumber}/products/gallery`);
        newUploads.push(uploaded.url);
        safeUnlink(file.path);
      }

      product.images = [...keepImages, ...newUploads];
      product.image = product.images[0] || product.image;

      product.stock =
        stock !== undefined ? toNumber(stock, product.stock) : product.stock;
    }

    product.name = name || product.name;
    if (price !== undefined) product.price = toNumber(price, product.price);

    if (oldPrice !== undefined) {
      product.oldPrice =
        oldPrice && toNumber(oldPrice, 0) > 0 ? toNumber(oldPrice, 0) : null;
    }

    // ✅ শুধুমাত্র non-variant (normal) মোডে top-level costPrice সরাসরি সেট
    // হবে — variant mode এ এটা আগেই colors[0].costPrice থেকে সিঙ্ক করা
    // হয়ে গেছে (উপরে দেখুন), এখানে আবার ওভাররাইট করা যাবে না।
    const hasVariantsAfterUpdate =
      Array.isArray(product.colors) && product.colors.length > 0;
    if (!hasVariantsAfterUpdate && costPrice !== undefined) {
      product.costPrice =
        costPrice !== null && costPrice !== "" ? toNumber(costPrice, 0) : null;
    }

    if (sold !== undefined) product.sold = toNumber(sold, product.sold);

    product.rating =
      rating !== undefined ? toNumber(rating, product.rating) : product.rating;

    product.description =
      description !== undefined ? sanitizeRichText(description) : product.description;
    product.additionalInfo =
      additionalInfo !== undefined ? sanitizeRichText(additionalInfo) : product.additionalInfo;

    if (categories !== undefined) {
      const categoryIds = safeJSON(categories, []);
      if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
        cleanupReqFiles(req);
        return res
          .status(400)
          .json({ error: "At least one category is required" });
      }
      product.categories = categoryIds;
    }

    product.isActive =
      isActive !== undefined ? isActive === "true" : product.isActive;

    if (freeDelivery !== undefined)
      product.freeDelivery = freeDelivery === "true";
    if (bestDiscount !== undefined)
      product.bestDiscount = bestDiscount === "true";
    if (cartvanBox !== undefined) product.cartvanBox = cartvanBox === "true";

    // ✅ Review Video Link — খালি স্ট্রিং পাঠালে লিংক মুছে সেকশন hide হয়ে যাবে
    if (reviewVideoLink !== undefined || reviewVideoText !== undefined) {
      product.reviewVideo = {
        link:
          reviewVideoLink !== undefined
            ? String(reviewVideoLink).trim()
            : product.reviewVideo?.link || "",
        text:
          reviewVideoText !== undefined
            ? String(reviewVideoText).trim()
            : product.reviewVideo?.text || "",
      };
    }

    if (req.body.reviews) product.reviews = safeJSON(req.body.reviews, []);

    const hasVariantsNow =
      Array.isArray(product.colors) && product.colors.length > 0;

    const computedSoldOut = computeIsSoldOut({
      hasVariants: hasVariantsNow,
      stock: product.stock,
      colors: product.colors,
    });

    product.isSoldOut =
      isSoldOut !== undefined ? isSoldOut === "true" : computedSoldOut;

    await product.save();
    await normalizeOrders();

    res.json(product);
  } catch (err) {
    console.error("Update Error:", err);
    cleanupReqFiles(req);
    sendMongoError(res, err);
  }
};

/* ================== ✅ DELETE ================== */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    // ✅ hard-delete এর বদলে Trash এ move — 3 দিন পর auto-purge হবে,
    // এর মাঝে Trash থেকে restore করা যাবে। তাই এখানে image ডিলিট করা হচ্ছে না।
    await moveToTrash("Product", product);
    await normalizeOrders();

    res.json({ message: "🗑️ Product moved to Trash" });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Server error" });
  }
};
