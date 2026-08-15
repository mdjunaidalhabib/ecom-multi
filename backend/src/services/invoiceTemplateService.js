import Shop from "../models/Shop.js";
import InvoiceTemplate from "../models/InvoiceTemplate.js";
import { getOrCreateDefaultInvoiceTemplate } from "../models/InvoiceTemplateDefault.js";
import { shopHasFeature } from "./planFeatureService.js";

/**
 * ✅ resolveInvoiceTemplateForShop — "শপের নিজস্ব কাস্টম টেমপ্লেট, নাকি
 * প্ল্যাটফর্ম ডিফল্ট" এই সিদ্ধান্তটা নেওয়ার একমাত্র জায়গা। প্রতিটা consumer
 * route (order-data endpoint, admin resolved-template endpoint) এই একই
 * ফাংশন কল করে — কোথাও এই rule আলাদাভাবে re-implement করা হয় না।
 */
export async function resolveInvoiceTemplateForShop(shopId) {
  const shop = await Shop.findById(shopId).setOptions({ skipTenantScope: true });
  const allowed = shop ? await shopHasFeature(shop, "invoiceCustomization") : false;

  const shopInfo = shop
    ? {
        name: shop.name,
        logo: shop.branding?.logo || "",
        contactEmail: shop.contactEmail || "",
        contactPhone: shop.contactPhone || "",
      }
    : null;

  if (allowed) {
    const shopTemplate = await InvoiceTemplate.findOne({ shopId }).setOptions({
      skipTenantScope: true,
    });
    if (shopTemplate) {
      return { template: shopTemplate, source: "shop", shop: shopInfo };
    }
  }

  const defaultTemplate = await getOrCreateDefaultInvoiceTemplate();
  return { template: defaultTemplate, source: "default", shop: shopInfo };
}

export default { resolveInvoiceTemplateForShop };
