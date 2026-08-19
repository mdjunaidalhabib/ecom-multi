import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import r2 from "./r2.js";

const BUCKET = process.env.R2_BUCKET_NAME;
const PUBLIC_URL = (process.env.R2_PUBLIC_URL || "").replace(/\/+$/, "");

const MIME_TO_EXT = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

/* ✅ key থেকে public delivery URL বানায় */
export const buildPublicUrl = (key) => (key ? `${PUBLIC_URL}/${key}` : "");

/* ✅ R2 public URL থেকে object key বের করে (R2_PUBLIC_URL prefix ধরে)।
   অন্য কোনো host এর URL (যেমন পুরনো Cloudinary URL) হলে null রিটার্ন করে —
   ওগুলো আর delete করার চেষ্টা করা হয় না। */
const extractKeyFromUrl = (url) => {
  try {
    if (!url || typeof url !== "string" || !PUBLIC_URL) return null;
    if (!url.startsWith(PUBLIC_URL + "/")) return null;
    return decodeURIComponent(url.slice(PUBLIC_URL.length + 1).split("?")[0]);
  } catch {
    return null;
  }
};

/* ✅ file (multer diskStorage `.path` অথবা memoryStorage `.buffer`) কে
   R2 bucket এ folder/uuid.ext নামে আপলোড করে। diskStorage হলে upload শেষে
   temp file নিজে থেকেই unlink করে দেয়। */
export const uploadToR2 = async (file, folder) => {
  if (!file) throw new Error("No file provided");

  const buffer = file.buffer || (file.path ? fs.readFileSync(file.path) : null);
  if (!buffer) throw new Error("Invalid file: missing buffer/path");

  const contentType = file.mimetype || "application/octet-stream";
  const ext =
    MIME_TO_EXT[contentType] ||
    path.extname(file.originalname || "").replace(".", "") ||
    "bin";
  const key = `${folder}/${crypto.randomUUID()}.${ext}`;

  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  if (file.path) {
    try {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    } catch {
      console.warn("⚠️ Could not delete local file:", file.path);
    }
  }

  return { key, url: buildPublicUrl(key) };
};

/* ✅ key দিয়ে সরাসরি ডিলিট (Category/Slider/Footer/Navbar/Admin avatar/... এর *Key ফিল্ড) */
export const deleteByKey = async (key) => {
  if (!key) return;
  try {
    await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
  } catch (error) {
    console.error("❌ R2 deleteByKey error:", error);
  }
};

/* ✅ URL থেকে ডিলিট — Product image/images এর মতো জায়গায় যেখানে আলাদা key
   field সংরক্ষণ করা হয় না, শুধু URL থেকেই key বের করে ডিলিট করতে হয়। */
export const deleteFromR2 = async (url) => {
  if (!url) return;

  const key = extractKeyFromUrl(url);
  if (!key) return; // R2-র নিজের URL না হলে (যেমন পুরনো Cloudinary URL) — skip

  await deleteByKey(key);
};
