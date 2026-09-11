import sharp from "sharp";

/**
 * ✅ শপের আপলোড করা brand logo থেকে derived আইকন ভ্যারিয়েন্ট বানায়।
 *
 * কেন দরকার: আসল logo সাধারণত চওড়া (landscape) WEBP — ব্রাউজার ট্যাবে
 * pixelated দেখায়, আর PWA "Add to Home Screen" install prompt-এ square
 * আইকন লাগে (Chrome কমপক্ষে 144px চায়, 192 ও 512 recommended)। আগে শুধু
 * 64×64 favicon বানানো হতো, ফলে install prompt-এ শপের নিজের আইকনই আসতো না —
 * frontend/public/manifest.json এর হার্ডকোডেড প্ল্যাটফর্ম আইকন/নাম দেখাতো।
 *
 * PWA আইকন দুটো `contain` করে আঁকা হয় (crop নয় — চওড়া logo `cover` করলে
 * মাঝখানের কয়েকটা অক্ষর ছাড়া কিছুই থাকতো না), সাদা ব্যাকগ্রাউন্ডে, চারপাশে
 * ~10% padding রেখে। এই padding-টাই maskable safe-zone হিসেবেও কাজ করে,
 * তাই একই ফাইল `purpose: "any maskable"` হিসেবে ব্যবহার করা যায় — Android-এ
 * আইকন গোল করে কাটলেও logo কাটা পড়ে না।
 */
export const FAVICON_SIZE = 64;
export const PWA_ICON_SIZES = [192, 512];

// আইকনের প্রতি পাশে কত অংশ ফাঁকা থাকবে (maskable safe-zone এর জন্য)।
const PWA_ICON_PADDING_RATIO = 0.1;

const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };

/**
 * @param {Buffer|string} source - image buffer অথবা local file path
 * @param {number} size - final square size (px)
 */
async function renderPwaIcon(source, size) {
  const inner = Math.round(size * (1 - PWA_ICON_PADDING_RATIO * 2));

  const resized = await sharp(source)
    .resize(inner, inner, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .png()
    .toBuffer();

  return sharp({
    create: { width: size, height: size, channels: 4, background: WHITE },
  })
    .composite([{ input: resized, gravity: "center" }])
    .png()
    .toBuffer();
}

/**
 * logo থেকে favicon + PWA আইকন সব বাফার একসাথে বানায়।
 *
 * ⚠️ uploadToR2() diskStorage-এর temp file আপলোড শেষে unlink করে দেয়, তাই
 * কোনো কিছু আপলোড করার *আগেই* এই ফাংশনটা কল করতে হবে।
 *
 * @returns {Promise<{ favicon: Buffer, pwa192: Buffer, pwa512: Buffer }>}
 */
export async function buildBrandIconBuffers(source) {
  const [favicon, pwa192, pwa512] = await Promise.all([
    sharp(source).resize(FAVICON_SIZE, FAVICON_SIZE, { fit: "cover" }).png().toBuffer(),
    renderPwaIcon(source, 192),
    renderPwaIcon(source, 512),
  ]);

  return { favicon, pwa192, pwa512 };
}
