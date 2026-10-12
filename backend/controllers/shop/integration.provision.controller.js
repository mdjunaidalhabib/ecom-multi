import { provisionShop, revokeProvision, summarizeShop, ProvisionError } from "../../src/services/shopProvisionService.js";

// POST /integration/provision-shop  (header: x-integration-key)
// Body: { externalRef, planKey, customerName, customerEmail, customerPhone?, shopName?, passwordHash? }
//
// নতুন শপের জন্য passwordHash (bcrypt) আবশ্যক — কাস্টমারের নিজের পাসওয়ার্ডই বসে।
// সিস্টেম কখনো পাসওয়ার্ড বানায় না, আর কোনো রেসপন্সে পাসওয়ার্ড ফেরতও যায় না।
export const provisionShopController = async (req, res) => {
  try {
    const out = await provisionShop(req.body || {});

    const platformUrl = (
      process.env.PLATFORM_PUBLIC_URL ||
      (process.env.PLATFORM_DOMAIN ? `https://${process.env.PLATFORM_DOMAIN}` : "")
    ).replace(/\/$/, "");

    // never cache — password থাকতে পারে
    res.set("Cache-Control", "no-store");
    return res.status(out.result === "created" ? 201 : 200).json({
      result: out.result, // created | renewed | already_processed
      shop: summarizeShop(out.shop),
      storeUrl: platformUrl ? `${platformUrl}/shop/${out.shop.slug}` : "",
      adminUrl: process.env.SHOP_ADMIN_URL || "",
      admin: {
        email: out.adminEmail,
        // customer = চেকআউটে কাস্টমারের নিজের দেওয়া | existing = আগের অ্যাকাউন্ট (পাসওয়ার্ড বদলায়নি)
        passwordMode: out.passwordMode,
      },
      notes: out.notes,
    });
  } catch (err) {
    if (err instanceof ProvisionError) {
      return res.status(err.status).json({ message: err.message });
    }
    console.error("❌ provisionShop error:", err);
    return res.status(500).json({ message: "Server error provisioning shop" });
  }
};

// POST /integration/revoke-shop  (header: x-integration-key)
// Body: { externalRef }
// অর্ডার পরে reject হলে: নতুন শপ → সাসপেন্ড, নবায়ন/আপগ্রেড → আগের অবস্থায় ফেরানো।
export const revokeShopController = async (req, res) => {
  try {
    const out = await revokeProvision(req.body || {});
    res.set("Cache-Control", "no-store");
    return res.json({
      result: out.result, // suspended | reverted | already_revoked | not_applied
      shop: out.shop ? summarizeShop(out.shop) : null,
      notes: out.notes,
    });
  } catch (err) {
    if (err instanceof ProvisionError) {
      return res.status(err.status).json({ message: err.message });
    }
    console.error("❌ revokeProvision error:", err);
    return res.status(500).json({ message: "Server error revoking provision" });
  }
};
