// ✅ ছোট, dependency-free helper — Shop-এর plan মেয়াদ পার হয়ে গেছে কিনা
// চেক করে। adminShopAccess.js এবং publicShopResolver.js দুটোতেই দরকার
// হয় বলে আলাদা ফাইলে রাখা হলো (নাহলে ওই দুই ফাইলের মধ্যে circular import
// হয়ে যেত, কারণ auto-suspend sweep publicShopResolver থেকে cache
// invalidate করে)।
export function isPlanExpired(shop) {
  return !!shop?.planExpiresAt && new Date(shop.planExpiresAt).getTime() <= Date.now();
}

export const PLAN_EXPIRED_SUSPEND_REASON =
  "প্ল্যানের মেয়াদ শেষ হয়ে গেছে — নবায়ন করতে সুপার-অ্যাডমিনের সাথে যোগাযোগ করুন।";

// ✅ subscriptionStartDate + subscriptionDays থেকে planExpiresAt বের করে।
// days null/0/falsy হলে "মেয়াদ নেই" (কখনো auto-suspend হবে না)। দিন-ভিত্তিক
// (মাস-ভিত্তিক না) রাখা হয়েছে যাতে ১ মাস/৩ মাস/৬ মাস/১ বছর প্রিসেট আর
// custom — দুটোই একই এককে (দিন) হিসাব হয়, আলাদা লজিক লাগে না।
export function computePlanExpiresAt(startDate, days) {
  if (!days) return null;
  const base = startDate ? new Date(startDate) : new Date();
  if (Number.isNaN(base.getTime())) return null;
  const expiry = new Date(base);
  expiry.setDate(expiry.getDate() + Number(days));
  return expiry;
}
