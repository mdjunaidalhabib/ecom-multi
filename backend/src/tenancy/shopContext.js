import { AsyncLocalStorage } from "node:async_hooks";

/**
 * ✅ Shop Context
 * প্রতিটা request-এর জন্য shopId কে request-scoped ভাবে রাখা হয়,
 * যাতে controller-এ ম্যানুয়ালি না বসালেও tenantPlugin (দেখুন
 * ./tenantPlugin.js) automatically সব query-তে shopId filter করে।
 *
 * ⚠️ এটা কোনো security boundary "একা" প্রতিস্থাপন করে না — এটা একটা
 * অতিরিক্ত সুরক্ষা স্তর (defense-in-depth)। প্রতিটা route-এ এখনো
 * req.shopId ঠিকমতো middleware দিয়ে সেট হওয়া আবশ্যক।
 */
const als = new AsyncLocalStorage();

export function runWithShopId(shopId, fn) {
  return als.run({ shopId: shopId ? String(shopId) : null }, fn);
}

export function getCurrentShopId() {
  const store = als.getStore();
  return store ? store.shopId : null;
}

export default { runWithShopId, getCurrentShopId };
