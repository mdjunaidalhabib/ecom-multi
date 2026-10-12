import crypto from "crypto";

// ✅ সার্ভার-টু-সার্ভার ইন্টিগ্রেশন auth (Hikmah IT → ECMS)।
// Header: x-integration-key — ECMS backend-এর env HIKMAH_INTEGRATION_KEY-এর সাথে মিলতে হবে।
// key সেট না থাকলে বা ২৪ ক্যারেক্টারের কম হলে ফিচার পুরোপুরি বন্ধ (503) — ভুল করে
// খোলা রয়ে যাওয়ার সুযোগ নেই।
const MIN_KEY_LENGTH = 24;

const digest = (value) => crypto.createHash("sha256").update(String(value)).digest();

export function requireIntegrationKey(req, res, next) {
  const expected = process.env.HIKMAH_INTEGRATION_KEY || "";
  if (expected.length < MIN_KEY_LENGTH) {
    return res.status(503).json({ message: "Integration is not configured" });
  }

  const provided = req.get("x-integration-key") || "";
  // sha256 করে তুলনা — দৈর্ঘ্য আলাদা হলেও timingSafeEqual নিরাপদে চলে
  if (!provided || !crypto.timingSafeEqual(digest(provided), digest(expected))) {
    return res.status(401).json({ message: "Invalid integration key" });
  }
  next();
}
