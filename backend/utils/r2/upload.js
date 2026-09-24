import multer from "multer";
import path from "path";
import { AsyncResource } from "node:async_hooks";

/* ================== ✅ STORAGE ================== */
// ⚠️ আগে শুধু Date.now() দিয়ে filename বানানো হতো — কিন্তু একই request-এ
// (যেমন multi-variant এ ৮টা image একসাথে) একাধিক file একই millisecond-এ
// আসলে তাদের filename একই হয়ে যেত, ফলে একটা file আরেকটার temp path
// overwrite/delete করে দিতো এবং পরে sharp() গিয়ে "Input file is missing"
// error দিতো। এখন Date.now() + random suffix দিয়ে guaranteed-unique filename।
const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

/* ================== ✅ SHOP CONTEXT PRESERVE ================== */
// ⚠️ FIX: multer (busboy) stream event-এর ভেতর থেকে next() কল করে — সেখানে
// AsyncLocalStorage-এর context (requireShopContext যে shopId বসায়) মাঝে মাঝে
// হারিয়ে যায়। ফলে controller-এ getCurrentShopId() null পেত, tenantPlugin
// নতুন document-এ shopId বসাতে পারত না → "Path `shopId` is required" (মাঝে
// মাঝে fail), আর countDocuments()/shiftOrdersForInsert সব শপ জুড়ে চলত।
// এখন next() কে middleware কল হওয়ার মুহূর্তের async context-এ bind করে দেওয়া
// হচ্ছে, যাতে multer শেষ হওয়ার পরও একই shopId context থাকে।
function withShopContext(instance) {
  const wrap = (method) =>
    (...args) => {
      const middleware = method.apply(instance, args);
      return (req, res, next) =>
        middleware(req, res, AsyncResource.bind(next));
    };

  return {
    single: wrap(instance.single),
    array: wrap(instance.array),
    fields: wrap(instance.fields),
    any: wrap(instance.any),
    none: wrap(instance.none),
  };
}

/* ================== ✅ DEFAULT UPLOAD (GENERIC) ================== */
// ⚠️ FIX: এই limit আগে 100KB ছিল, কিন্তু admin panel-এর ImageUploader
// (admin/components/ImageUploader.jsx এর DEFAULT_IMAGE_RULE) client-side
// এ ছবি compress করে 220KB পর্যন্ত রাখে — অর্থাৎ client "সফলভাবে" convert
// করা 100–220KB এর যেকোনো ফাইলই এখানে multer-এর LIMIT_FILE_SIZE error দিয়ে
// reject হয়ে যেত (কোনো readable message ছাড়াই), profile avatar (admin.routes.js
// PUT /me) ও navbar logo (navbar.admin.routes.js) দুটোই এই default upload
// ব্যবহার করে বলে ভুগত। এখন client-এর maxBytes-এর চেয়ে বেশি রাখা হলো, যাতে
// client যা "পাস" বলে সেটা সবসময় server-ও গ্রহণ করে।
const upload = withShopContext(multer({
  storage,
  limits: { fileSize: 300 * 1024 }, // ✅ 300KB (client compresses to ≤220KB)
}));

/* ================== ✅ CATEGORY UPLOAD ================== */
export const categoryUpload = withShopContext(multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // ✅ input can be larger (server will compress)
  fileFilter: (req, file, cb) => {
    const allowed = ["image/webp", "image/jpeg", "image/png"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only jpeg/png/webp allowed"), false);
    }
    cb(null, true);
  },
}));

/* ================== ✅ PRODUCT UPLOAD ================== */
export const productUpload = withShopContext(multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // ✅ input can be larger (server will compress)
    files: 40,
  },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/webp", "image/jpeg", "image/png"];
    if (!allowed.includes(file.mimetype)) {
      return cb(
        new Error("Only jpeg/png/webp allowed (Auto convert to 600×600 WEBP)"),
        false
      );
    }
    cb(null, true);
  },
}));

/* ================== ✅ SLIDER UPLOAD ==================
   ✅ UPDATED RULE:
   INPUT : jpeg/png/webp allowed
   OUTPUT: controller will convert to 1500×500 WEBP under 100KB
================================================== */
export const sliderUpload = withShopContext(multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // ✅ input can be larger
  fileFilter: (req, file, cb) => {
    const allowed = ["image/webp", "image/jpeg", "image/png"];
    if (!allowed.includes(file.mimetype)) {
      return cb(
        new Error("Only jpeg/png/webp allowed (Auto convert to 1500×500 WEBP)"),
        false
      );
    }
    cb(null, true);
  },
}));

/* ================== ✅ HOMEPAGE POPUP UPLOAD ==================
   INPUT : jpeg/png/webp allowed
   OUTPUT: controller will convert to 800×800 WEBP (1:1) under 200KB
================================================== */
export const popupUpload = withShopContext(multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // ✅ input can be larger
  fileFilter: (req, file, cb) => {
    const allowed = ["image/webp", "image/jpeg", "image/png"];
    if (!allowed.includes(file.mimetype)) {
      return cb(
        new Error("Only jpeg/png/webp allowed (Auto convert to 800×800 WEBP)"),
        false
      );
    }
    cb(null, true);
  },
}));

/* ================== ✅ SUPPORT TEAM PHOTO UPLOAD ==================
   INPUT : jpeg/png/webp allowed (client আগে থেকেই WEBP এ convert করে পাঠায়)
   OUTPUT: 400×400 (1:1) WEBP, ছোট ছবি বলে limit ছোট রাখা হলো
================================================== */
export const teamPhotoUpload = withShopContext(multer({
  storage,
  limits: { fileSize: 1 * 1024 * 1024 }, // ✅ input can be larger (client already compresses)
  fileFilter: (req, file, cb) => {
    const allowed = ["image/webp", "image/jpeg", "image/png"];
    if (!allowed.includes(file.mimetype)) {
      return cb(
        new Error("Only jpeg/png/webp allowed (Auto convert to 400×400 WEBP)"),
        false
      );
    }
    cb(null, true);
  },
}));

/* ================== ✅ LANDING PAGE HERO IMAGE UPLOAD ==================
   INPUT : jpeg/png/webp allowed
   OUTPUT: controller resizes to fit within 1600×1600 (aspect preserved,
   NOT force-cropped like product/category images — ad hero images vary
   widely in shape) under ~250KB WEBP
================================================== */
export const landingHeroUpload = withShopContext(multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 }, // ✅ input can be larger (server will compress)
  fileFilter: (req, file, cb) => {
    const allowed = ["image/webp", "image/jpeg", "image/png"];
    if (!allowed.includes(file.mimetype)) {
      return cb(
        new Error("Only jpeg/png/webp allowed (Auto convert to WEBP)"),
        false
      );
    }
    cb(null, true);
  },
}));

/* ================== ✅ INVOICE BACKGROUND UPLOAD ==================
   INPUT : jpeg/png/webp allowed
   OUTPUT: controller resizes to fit within an A4-ish 1240×1754 box
   (aspect preserved) under ~300KB WEBP
================================================== */
export const invoiceBgUpload = withShopContext(multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // ✅ input can be larger (server will compress)
  fileFilter: (req, file, cb) => {
    const allowed = ["image/webp", "image/jpeg", "image/png"];
    if (!allowed.includes(file.mimetype)) {
      return cb(
        new Error("Only jpeg/png/webp allowed (Auto convert to WEBP)"),
        false
      );
    }
    cb(null, true);
  },
}));

export default upload;
