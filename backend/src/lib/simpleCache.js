/**
 * ✅ Simple in-process TTL cache (ধাপ ৩: caching, Redis ছাড়া)
 *
 * কেন দরকার:
 *  publicShopResolver প্রতিটা customer-facing request-এ (প্রতিটা প্রোডাক্ট
 *  পেজ লোড, প্রতিটা API কল) MongoDB-তে `Shop.findOne({ domain })` চালাতো।
 *  শপের ট্রাফিক যত বাড়বে, এই একটা query-ই DB-র সবচেয়ে বড় লোড হয়ে
 *  দাঁড়াবে — অথচ শপের তথ্য (domain, status) সেকেন্ডে সেকেন্ডে বদলায় না।
 *
 *  এখন Redis নেই (single VPS), তাই এই ছোট in-memory cache দিয়ে কাজ
 *  চালানো হচ্ছে। এটা প্রতিটা process/worker-এর নিজস্ব মেমরিতে থাকে
 *  (PM2 cluster mode-এ শেয়ার হয় না) — সেটা এখানে সমস্যা না, কারণ প্রতিটা
 *  worker কিছুক্ষণ পর নিজে থেকেই একবার DB থেকে আবার ফ্রেশ ডেটা তুলে
 *  নেবে (TTL অনুযায়ী)।
 *
 *  ভবিষ্যতে multi-server/Redis-এ গেলে এই মডিউলটার বদলে ioredis-based
 *  ভার্সন বসালেই বাকি কোড (publicShopResolver.js) অপরিবর্তিত থাকবে —
 *  get/set/del ইন্টারফেসটা ইচ্ছাকৃতভাবে Redis-এর মতোই সহজ রাখা হয়েছে।
 */

const store = new Map(); // key -> { value, expiresAt }

const DEFAULT_TTL_MS = 60 * 1000; // 60 সেকেন্ড
const MAX_ENTRIES = 5000; // safety cap, খুব বড় হয়ে গেলে পুরনো এন্ট্রি ফেলে দেওয়া হবে

export function cacheGet(key) {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt <= Date.now()) {
    store.delete(key);
    return undefined;
  }
  return entry.value;
}

export function cacheSet(key, value, ttlMs = DEFAULT_TTL_MS) {
  if (store.size >= MAX_ENTRIES) {
    // crude eviction: সবচেয়ে পুরনো entry (Map insertion order) ফেলে দাও
    const oldestKey = store.keys().next().value;
    if (oldestKey !== undefined) store.delete(oldestKey);
  }
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function cacheDelete(key) {
  store.delete(key);
}

export function cacheDeleteByPrefix(prefix) {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}

// প্রতি ২ মিনিটে expired entry গুলো ঝেড়ে ফেলা হয়, যাতে TTL পার হয়ে যাওয়া
// entry গুলোও মেমরিতে বসে না থাকে (শুধু lazy cacheGet-এর ভরসায় না থেকে)
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.expiresAt <= now) store.delete(key);
  }
}, 2 * 60 * 1000);
cleanupTimer.unref?.();

export default { cacheGet, cacheSet, cacheDelete, cacheDeleteByPrefix };
