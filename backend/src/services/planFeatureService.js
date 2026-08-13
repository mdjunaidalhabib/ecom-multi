import { getPlatformSettings } from "../models/PlatformSettings.js";

// PlatformSettings.planFeatures না পাওয়া গেলে (পুরনো doc, migration না চলা
// অবস্থায়) এই ফলব্যাক ব্যবহার হয় — কোনো plan-ই ভুলবশত ব্লক না হয়ে যায়
const FALLBACK_FEATURES = {
  customDomain: false,
  analytics: false,
  promo: false,
  maxProducts: 200,
  maxAdmins: 2,
};

export async function getPlanFeatures(planId) {
  const settings = await getPlatformSettings();
  const planFeatures = settings.planFeatures?.[planId];
  return planFeatures
    ? planFeatures.toObject?.() || planFeatures
    : FALLBACK_FEATURES;
}

export async function shopHasFeature(shop, featureKey) {
  const features = await getPlanFeatures(shop?.plan);
  return !!features?.[featureKey];
}

export default { getPlanFeatures, shopHasFeature };
