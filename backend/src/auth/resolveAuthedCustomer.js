import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * ✅ কাস্টমার-facing রুটগুলোতে (orders/promos) client যা "userId" পাঠায় সেটা
 * আগে সরাসরি বিশ্বাস করা হতো — কেউ ইচ্ছে করলে যেকোনো userId দিয়ে অন্যের
 * নামে order বসিয়ে দিতে পারত, বা userId=1,2,3... বসিয়ে অন্য কাস্টমারের পুরো
 * order history (নাম/ফোন/ঠিকানা) দেখে ফেলতে পারত (User.userId শপ-প্রতি ছোট
 * sequential integer, তাই সহজে অনুমানযোগ্য)।
 *
 * এখন থেকে userId সবসময় verified JWT থেকে সার্ভার-সাইডে বের করা হয় — client
 * শুধু guest checkout-এর জন্য phone/billing পাঠাতে পারে, নিজের identity না।
 *
 * /auth/me-এর মতোই token-এর shopId বর্তমান শপ (req.shopId, resolveShopByDomain
 * বসায়) এর সাথে না মিললে token অগ্রাহ্য হয় — একটা শপের সেশন অন্য শপে চলে না।
 *
 * @returns {Promise<{ _id: string, userId: number } | null>}
 */
export async function resolveAuthedCustomer(req) {
  const authHeader = req.headers["authorization"] || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return null;

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }

  if (!payload?.id || String(payload.shopId || "") !== String(req.shopId || "")) {
    return null;
  }

  const user = await User.findById(payload.id).select("_id userId");
  return user || null;
}

export default resolveAuthedCustomer;
