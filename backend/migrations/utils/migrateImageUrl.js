/**
 * ✅ migrateImageUrl — reusable Cloudinary → R2 image migration helper
 *
 * ব্যবহৃত হয় cartvan (single-tenant) থেকে ecom-multi (multi-tenant)-এ ডেটা
 * migrate করার সময়, পুরনো Cloudinary URL গুলোকে নতুন শপের R2 object-এ
 * রূপান্তর করতে। এটা নিজে কোনো upload logic reimplement করে না — বিদ্যমান
 * `uploadToR2` helper (utils/r2/r2Helpers.js) reuse করে, শুধু Cloudinary
 * URL থেকে bytes fetch করে সেটাকে `uploadToR2`-এর জন্য উপযুক্ত
 * `{ buffer, mimetype }` shape-এ রূপান্তর করে দেয়।
 *
 * চালানোর জন্য বিশেষ কিছু লাগে না — `ecom-multi/backend` থেকে import
 * করলেই এর নিজের `.env` (R2_* ভ্যারিয়েবল) ও node_modules স্বাভাবিকভাবে
 * resolve হয়ে যায় (দেখুন utils/r2/r2.js)।
 */

import dotenv from "dotenv";
import { uploadToR2 } from "../../utils/r2/r2Helpers.js";

dotenv.config();

const PUBLIC_URL = (process.env.R2_PUBLIC_URL || "").replace(/\/+$/, "");

// content-type header না থাকলে / generic হলে URL extension থেকে mimetype
// আন্দাজ করার জন্য fallback map
const EXT_TO_MIME = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
  bmp: "image/bmp",
  avif: "image/avif",
  tif: "image/tiff",
  tiff: "image/tiff",
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isHttpUrl = (url) => {
  if (!url || typeof url !== "string") return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const guessMimeFromUrl = (url) => {
  try {
    const clean = url.split("?")[0].split("#")[0];
    const ext = clean.split(".").pop()?.toLowerCase();
    return (ext && EXT_TO_MIME[ext]) || "application/octet-stream";
  } catch {
    return "application/octet-stream";
  }
};

/**
 * একটা image URL কে (সাধারণত Cloudinary secure_url) fetch করে নতুন `folder`-এ
 * R2-তে আপলোড করে দেয়, বিদ্যমান `uploadToR2` helper ব্যবহার করে।
 *
 * @param {string} url - সোর্স image URL (Cloudinary বা অন্য যেকোনো http(s) URL)
 * @param {string} folder - R2 key prefix, যেমন `shops/{storageNumber}/products/main`
 * @param {object} [options]
 * @param {number} [options.retries=2] - transient failure-এ কতবার retry করবে
 * @param {string} [options.context=""] - error message-এ যোগ হবে (কোন doc/field
 *   fail করেছে সেটা caller-কে জানানোর জন্য, e.g. "Product 65f.. .image")
 *
 * @returns {Promise<{url: string, key: string|null, skipped: boolean}>}
 *   - skipped:true মানে input অপরিবর্তিত ফেরত দেওয়া হয়েছে (falsy / ইতিমধ্যে
 *     R2 URL / বৈধ http(s) URL না) — কোনো network call হয়নি।
 *   - permanent failure-এ (সব retry শেষে ব্যর্থ) throw করে, silently swallow
 *     করে না — caller-কে exact document/field সহ log করতে হবে।
 */
export async function migrateImageUrl(url, folder, options = {}) {
  const { retries = 2, context = "" } = options;

  // ✅ Skip conditions — এগুলোর কোনোটাতেই network call করার দরকার নেই
  if (!url) return { url, key: null, skipped: true };
  if (typeof url !== "string") return { url, key: null, skipped: true };
  if (PUBLIC_URL && url.startsWith(PUBLIC_URL)) {
    return { url, key: null, skipped: true }; // ইতিমধ্যে R2-এ আছে (idempotent re-run)
  }
  if (!isHttpUrl(url)) return { url, key: null, skipped: true }; // অচেনা/অকার্যকর URL

  if (!folder) {
    throw new Error(`migrateImageUrl: "folder" is required (url: ${url})`);
  }

  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Fetch failed: HTTP ${res.status} ${res.statusText}`);
      }

      // eslint-disable-next-line no-await-in-loop
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      if (!buffer.length) {
        throw new Error("Fetched image body is empty");
      }

      let mimetype = (res.headers.get("content-type") || "").split(";")[0].trim();
      if (!mimetype || !mimetype.startsWith("image/")) {
        mimetype = guessMimeFromUrl(url);
      }

      const file = { buffer, mimetype };
      // eslint-disable-next-line no-await-in-loop
      const { key, url: newUrl } = await uploadToR2(file, folder);

      return { url: newUrl, key, skipped: false };
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        // eslint-disable-next-line no-await-in-loop
        await sleep(400 * (attempt + 1));
      }
    }
  }

  const label = context ? ` [${context}]` : "";
  const wrapped = new Error(
    `migrateImageUrl: permanently failed for "${url}" -> folder "${folder}"${label}: ${lastErr?.message || lastErr}`,
  );
  wrapped.cause = lastErr;
  throw wrapped;
}

export default migrateImageUrl;
