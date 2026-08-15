import Plan, { ensurePlansSeeded } from "../models/Plan.js";

// Plan document না পাওয়া গেলে (ডিলিট হয়ে যাওয়া বা অজানা plan key) এই
// ফলব্যাক ব্যবহার হয় — কোনো plan-ই ভুলবশত ব্লক না হয়ে যায়
const FALLBACK_FEATURES = {
  customDomain: false,
  analytics: false,
  promo: false,
  payment: false,
  landingPages: false,
  fullStorefront: true,
  invoiceCustomization: false,
  maxProducts: 200,
  maxAdmins: 2,
};

export async function getPlanFeatures(planId) {
  await ensurePlansSeeded();
  const plan = await Plan.findOne({ key: planId });
  if (!plan) return FALLBACK_FEATURES;

  return {
    ...plan.features.toObject(),
    ...plan.limits.toObject(),
  };
}

export async function shopHasFeature(shop, featureKey) {
  const features = await getPlanFeatures(shop?.plan);
  return !!features?.[featureKey];
}

export default { getPlanFeatures, shopHasFeature };
