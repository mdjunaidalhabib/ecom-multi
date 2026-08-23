import Shop from "../../src/models/Shop.js";
import Counter from "../../src/models/Counter.js";
import Admin from "../../src/models/Admin.js";
import Product from "../../src/models/Product.js";
import Order from "../../src/models/Order.js";
import Trash from "../../src/models/Trash.js";
import {
  moveToTrash,
  restoreFromTrashEntry,
  cleanupTrashAssets,
} from "../../utils/trash/trash.helpers.js";
import { permanentlyDeleteShopData } from "../../utils/shop/shopTrash.helpers.js";
import { invalidateShopCache } from "../../src/tenancy/publicShopResolver.js";
import { getPlanFeatures } from "../../src/services/planFeatureService.js";
import Plan from "../../src/models/Plan.js";
import {
  isPlanExpired,
  computePlanExpiresAt,
  PLAN_EXPIRED_SUSPEND_REASON,
} from "../../src/utils/planExpiry.js";

// ✅ body থেকে আসা subscriptionStartDate পার্স করে — undefined মানে "touch
// করো না", নাহলে বৈধ Date চাই (start date কখনো null/খালি রাখা যাবে না)।
function parseSubscriptionStartDate(value) {
  if (value === undefined) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("সাবস্ক্রিপশন শুরুর তারিখ সঠিক ফরম্যাটে দিন");
  }
  return date;
}

// ✅ body থেকে আসা subscriptionDays পার্স করে — undefined মানে "touch করো
// না", null/""/0 মানে মেয়াদ নেই (auto-suspend বন্ধ), নাহলে ধনাত্মক সংখ্যা চাই।
function parseSubscriptionDays(value) {
  if (value === undefined) return undefined;
  if (value === null || value === "" || Number(value) === 0) return null;
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) {
    throw new Error("মেয়াদকাল একটি সঠিক সংখ্যা (দিন) হতে হবে");
  }
  return Math.floor(num);
}

// frontend/lib/shopMode.js এর DOMAIN_MODE_MARKER — কোনো real শপ এই slug
// নিতে পারবে না, নাহলে custom-domain routing-এর সাথে conflict করবে
const RESERVED_SLUGS = new Set(["__domain__"]);

function normalizeSlug(value = "") {
  return value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/* -------------------------------------------------------
   Helper: name -> url-safe slug (+ auto-unique suffix)
   শুধু তখনই ব্যবহার হয় যখন ইউজার নিজে কোনো slug দেয়নি
------------------------------------------------------- */
async function generateUniqueSlug(name, { excludeId } = {}) {
  const base = normalizeSlug(name) || "shop";

  let slug = RESERVED_SLUGS.has(base) ? `${base}-shop` : base;
  let counter = 1;

  // eslint-disable-next-line no-await-in-loop
  while (
    await Shop.findOne({
      slug,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    })
  ) {
    counter += 1;
    slug = `${base}-${counter}`;
  }

  return slug;
}

function normalizeDomain(domain = "") {
  return domain
    .toString()
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/+$/, "");
}

/* -------------------------------------------------------
   GET /admin/shops  — সব শপের লিস্ট (+ প্রতিটার basic stats)
------------------------------------------------------- */
export const listShops = async (req, res) => {
  try {
    const shops = await Shop.find()
      .setOptions({ skipTenantScope: true })
      .sort({ createdAt: -1 })
      .lean();

    // প্রতিটা শপের জন্য দ্রুত কিছু কাউন্ট (product/order/admin সংখ্যা)
    const shopIds = shops.map((s) => s._id);

    const [productCounts, orderCounts, adminCounts] = await Promise.all([
      Product.aggregate([
        { $match: { shopId: { $in: shopIds } } },
        { $group: { _id: "$shopId", count: { $sum: 1 } } },
      ]).option({ skipTenantScope: true }),
      Order.aggregate([
        { $match: { shopId: { $in: shopIds } } },
        { $group: { _id: "$shopId", count: { $sum: 1 } } },
      ]).option({ skipTenantScope: true }),
      Admin.aggregate([
        {
          $match: {
            shops: { $in: shopIds },
            role: { $ne: "superadmin" },
          },
        },
        { $unwind: "$shops" },
        { $match: { shops: { $in: shopIds } } },
        { $group: { _id: "$shops", count: { $sum: 1 } } },
      ]),
    ]);

    const toMap = (arr) =>
      arr.reduce((acc, item) => {
        acc[String(item._id)] = item.count;
        return acc;
      }, {});

    const productMap = toMap(productCounts);
    const orderMap = toMap(orderCounts);
    const adminMap = toMap(adminCounts);

    const result = shops.map((shop) => ({
      ...shop,
      stats: {
        products: productMap[String(shop._id)] || 0,
        orders: orderMap[String(shop._id)] || 0,
        admins: adminMap[String(shop._id)] || 0,
      },
    }));

    res.json(result);
  } catch (err) {
    console.error("❌ listShops error:", err);
    res.status(500).json({ message: "Server error fetching shops" });
  }
};

/* -------------------------------------------------------
   GET /admin/shops/:id
------------------------------------------------------- */
export const getShopById = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id).setOptions({
      skipTenantScope: true,
    });
    if (!shop) return res.status(404).json({ message: "Shop not found" });
    res.json(shop);
  } catch (err) {
    console.error("❌ getShopById error:", err);
    res.status(500).json({ message: "Server error fetching shop" });
  }
};

/* -------------------------------------------------------
   POST /admin/shops  — নতুন শপ তৈরি
------------------------------------------------------- */
export const createShop = async (req, res) => {
  try {
    const {
      name,
      slug: rawSlug,
      domain,
      contactEmail,
      contactPhone,
      plan,
      subscriptionStartDate,
      subscriptionDays,
    } = req.body || {};

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "শপের নাম আবশ্যক" });
    }

    let resolvedStartDate;
    let resolvedDays;
    try {
      // ✅ না দিলে "এখন" (শপ তৈরির মুহূর্ত) — নতুন শপের জন্য স্বাভাবিক ডিফল্ট।
      // আগে থেকে চলা সাবস্ক্রিপশন হলে super-admin ফর্মে আসল শুরুর তারিখ দেবে।
      resolvedStartDate = parseSubscriptionStartDate(subscriptionStartDate) ?? new Date();
      resolvedDays = parseSubscriptionDays(subscriptionDays) ?? null;
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    let resolvedPlan = "free";
    if (plan) {
      const planDoc = await Plan.findOne({ key: plan }).select("key");
      if (planDoc) resolvedPlan = planDoc.key;
    }
    const planFeatures = await getPlanFeatures(resolvedPlan);

    // ✅ ডোমেইন ঐচ্ছিক — না দিলে শপ শুধু platform-এর slug-based path
    // (/shop/<slug>/...) দিয়ে চলবে, পরে যেকোনো সময় custom domain যোগ করা যাবে
    const trimmedDomain = domain && domain.trim() ? domain.trim() : "";
    let normalizedDomain = "";

    if (trimmedDomain) {
      if (!planFeatures.customDomain) {
        return res.status(400).json({
          message: `${resolvedPlan} প্ল্যানে কাস্টম ডোমেইন সুবিধা নেই। প্ল্যান আপগ্রেড করুন অথবা Plans পেজ থেকে এই প্ল্যানে ডোমেইন চালু করুন।`,
        });
      }

      normalizedDomain = normalizeDomain(trimmedDomain);

      const existing = await Shop.findOne({ domain: normalizedDomain });
      if (existing) {
        return res
          .status(409)
          .json({ message: "এই ডোমেইন দিয়ে ইতিমধ্যে একটা শপ আছে" });
      }
    }

    // ✅ Slug ঐচ্ছিকভাবে নিজে দেওয়া যায় — না দিলে নাম থেকে অটো তৈরি হবে।
    // নিজে দিলে exact match uniqueness চেক হয় (auto-generate-এর মতো চুপচাপ
    // -2, -3 suffix বসানো হয় না, বরং স্পষ্ট এরর দেখানো হয়)।
    const trimmedSlug = rawSlug && rawSlug.trim() ? rawSlug.trim() : "";
    let slug;

    if (trimmedSlug) {
      const normalizedSlug = normalizeSlug(trimmedSlug);
      if (!normalizedSlug) {
        return res.status(400).json({
          message: "Slug সঠিক ফরম্যাটে দিন (শুধু ছোট হাতের অক্ষর, সংখ্যা, হাইফেন)",
        });
      }
      if (RESERVED_SLUGS.has(normalizedSlug)) {
        return res.status(400).json({ message: "এই Slug ব্যবহার করা যাবে না" });
      }
      const slugClash = await Shop.findOne({ slug: normalizedSlug });
      if (slugClash) {
        return res
          .status(409)
          .json({ message: "এই Slug দিয়ে ইতিমধ্যে একটা শপ আছে" });
      }
      slug = normalizedSlug;
    } else {
      slug = await generateUniqueSlug(name);
    }

    // ✅ R2 storage key-এর জন্য পরিষ্কার, sequential (1, 2, 3, ...) নাম্বার —
    // Counter দিয়ে atomically বসানো, একবার সেট হলে আর বদলায় না
    const storageCounter = await Counter.findOneAndUpdate(
      { name: "shopStorageNumber" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );

    const shop = await Shop.create({
      name: name.trim(),
      slug,
      storageNumber: storageCounter.seq,
      ...(normalizedDomain ? { domain: normalizedDomain, domainStatus: "pending_dns" } : {}),
      status: "trial",
      plan: resolvedPlan,
      subscriptionStartDate: resolvedStartDate,
      subscriptionDays: resolvedDays,
      planExpiresAt: computePlanExpiresAt(resolvedStartDate, resolvedDays),
      // ✅ Plan-এর ডিফল্ট limits দিয়ে শুরু হয় (PlatformSettings.planFeatures) —
      // পরে শপের নিজের এডিট ফর্ম থেকে override করা যাবে
      limits: {
        maxProducts: planFeatures.maxProducts,
        maxAdmins: planFeatures.maxAdmins,
      },
      contactEmail: contactEmail || "",
      contactPhone: contactPhone || "",
      ownerAdminId: req.admin?._id || null,
    });

    res.status(201).json({
      message: "✅ নতুন শপ তৈরি হয়েছে",
      shop,
      ...(normalizedDomain
        ? {
            dnsInstructions: {
              note: "কাস্টমার এই ডোমেইনে ঢুকতে পারার জন্য DNS পয়েন্ট করাতে হবে।",
              recommended: [
                { type: "A", host: "@", value: process.env.SERVER_IP || "<SERVER_IP>" },
                { type: "CNAME", host: "www", value: normalizedDomain },
              ],
            },
          }
        : {}),
    });
  } catch (err) {
    console.error("❌ createShop error:", err);
    if (err?.code === 11000) {
      return res
        .status(409)
        .json({ message: "এই নাম, Slug বা ডোমেইন দিয়ে ইতিমধ্যে একটা শপ আছে" });
    }
    res.status(500).json({ message: "Server error creating shop" });
  }
};

/* -------------------------------------------------------
   PATCH /admin/shops/:id  — শপের তথ্য/ব্র্যান্ডিং/প্ল্যান আপডেট
------------------------------------------------------- */
export const updateShop = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id).setOptions({
      skipTenantScope: true,
    });
    if (!shop) return res.status(404).json({ message: "Shop not found" });

    const originalDomain = shop.domain; // cache invalidate করার জন্য আগের ডোমেইনটা রাখা হলো
    const originalSlug = shop.slug;

    const {
      name,
      slug,
      domain,
      contactEmail,
      contactPhone,
      plan,
      subscriptionStartDate,
      subscriptionDays,
      themeColor,
      theme,
      maxProducts,
      maxAdmins,
    } = req.body || {};

    if (name !== undefined && name.trim()) shop.name = name.trim();

    if (slug !== undefined && slug.trim()) {
      const normalizedSlug = normalizeSlug(slug);
      if (!normalizedSlug) {
        return res.status(400).json({
          message: "Slug সঠিক ফরম্যাটে দিন (শুধু ছোট হাতের অক্ষর, সংখ্যা, হাইফেন)",
        });
      }
      if (normalizedSlug !== shop.slug) {
        if (RESERVED_SLUGS.has(normalizedSlug)) {
          return res.status(400).json({ message: "এই Slug ব্যবহার করা যাবে না" });
        }
        const slugClash = await Shop.findOne({
          slug: normalizedSlug,
          _id: { $ne: shop._id },
        });
        if (slugClash) {
          return res
            .status(409)
            .json({ message: "এই Slug দিয়ে অন্য একটা শপ ইতিমধ্যে আছে" });
        }
        shop.slug = normalizedSlug;
      }
    }

    if (plan !== undefined) {
      const planDoc = await Plan.findOne({ key: plan }).select("key");
      if (planDoc) shop.plan = planDoc.key;
    }

    if (subscriptionStartDate !== undefined || subscriptionDays !== undefined) {
      let resolvedStartDate;
      let resolvedDays;
      try {
        resolvedStartDate = parseSubscriptionStartDate(subscriptionStartDate);
        resolvedDays = parseSubscriptionDays(subscriptionDays);
      } catch (err) {
        return res.status(400).json({ message: err.message });
      }

      if (resolvedStartDate !== undefined) shop.subscriptionStartDate = resolvedStartDate;
      if (resolvedDays !== undefined) shop.subscriptionDays = resolvedDays;
      shop.planExpiresAt = computePlanExpiresAt(
        shop.subscriptionStartDate,
        shop.subscriptionDays,
      );

      // ✅ মেয়াদ নবায়ন/বাড়ানো হলে — এটা আগে auto-suspend (মেয়াদ শেষ হওয়ার
      // কারণে) হয়ে থাকলে সাথে সাথে আবার active করে দেয়, যাতে super-admin-কে
      // আলাদা করে "Activate" বাটনও চাপতে না হয়। কিন্তু manual কারণে
      // suspend করা শপ এভাবে আপনাআপনি active হবে না — সেটার জন্য super-admin
      // কে ইচ্ছাকৃতভাবে Activate করতে হবে।
      const stillExpired = isPlanExpired({ planExpiresAt: shop.planExpiresAt });
      if (
        !stillExpired &&
        shop.status === "suspended" &&
        shop.suspendedReason === PLAN_EXPIRED_SUSPEND_REASON
      ) {
        shop.status = "active";
        shop.suspendedReason = "";
      }
    }

    if (domain !== undefined && domain.trim()) {
      const normalizedDomain = normalizeDomain(domain);
      if (normalizedDomain !== shop.domain) {
        const planFeatures = await getPlanFeatures(shop.plan);
        if (!planFeatures.customDomain) {
          return res.status(400).json({
            message: `${shop.plan} প্ল্যানে কাস্টম ডোমেইন সুবিধা নেই। প্ল্যান আপগ্রেড করুন অথবা Plans পেজ থেকে এই প্ল্যানে ডোমেইন চালু করুন।`,
          });
        }

        const clash = await Shop.findOne({
          domain: normalizedDomain,
          _id: { $ne: shop._id },
        });
        if (clash) {
          return res
            .status(409)
            .json({ message: "এই ডোমেইন দিয়ে অন্য একটা শপ ইতিমধ্যে আছে" });
        }
        shop.domain = normalizedDomain;
        // ডোমেইন পাল্টালে আবার নতুন করে DNS ভেরিফাই করা লাগবে
        shop.domainStatus = "pending_dns";
        shop.domainVerifiedAt = null;
      }
    }

    if (contactEmail !== undefined) shop.contactEmail = contactEmail;
    if (contactPhone !== undefined) shop.contactPhone = contactPhone;
    if (themeColor !== undefined) shop.branding.themeColor = themeColor;
    if (theme !== undefined) {
      // খালি স্ট্রিং/"" মানে override সরিয়ে plan-এর default theme ব্যবহার করা
      if (["", "classic", "aurora", "terra"].includes(theme)) {
        shop.branding.theme = theme;
      }
    }
    if (maxProducts !== undefined) {
      shop.limits.maxProducts = Number(maxProducts) || shop.limits.maxProducts;
    }
    if (maxAdmins !== undefined) {
      shop.limits.maxAdmins = Number(maxAdmins) || shop.limits.maxAdmins;
    }

    await shop.save();

    // 🔥 FIX: shop cache invalidate — নাহলে ডোমেইন/স্লাগ/স্ট্যাটাস বদলানোর পরও
    // পুরনো cached ডেটা দিয়ে (৬০ সেকেন্ড পর্যন্ত) request সার্ভ হতে পারতো
    invalidateShopCache({ domain: originalDomain, slug: originalSlug });
    invalidateShopCache({ domain: shop.domain, slug: shop.slug });

    res.json({ message: "✅ শপ আপডেট হয়েছে", shop });
  } catch (err) {
    console.error("❌ updateShop error:", err);
    if (err?.code === 11000) {
      return res.status(409).json({ message: "ডুপ্লিকেট ডোমেইন/স্লাগ" });
    }
    res.status(500).json({ message: "Server error updating shop" });
  }
};

/* -------------------------------------------------------
   PATCH /admin/shops/:id/status  — suspend / activate / trial
------------------------------------------------------- */
export const updateShopStatus = async (req, res) => {
  try {
    const { status, suspendedReason } = req.body || {};

    if (!["active", "suspended", "trial"].includes(status)) {
      return res.status(400).json({ message: "অবৈধ status" });
    }

    const normalizedSuspendedReason = suspendedReason?.toString().trim() || "";

    if (status === "suspended" && !normalizedSuspendedReason) {
      return res.status(400).json({
        message: "শপ সাসপেন্ড করার কারণ লিখতে হবে।",
      });
    }

    const shop = await Shop.findById(req.params.id).setOptions({
      skipTenantScope: true,
    });
    if (!shop) return res.status(404).json({ message: "Shop not found" });

    if (status !== "suspended" && isPlanExpired(shop)) {
      return res.status(400).json({
        message:
          "এই শপের প্ল্যানের মেয়াদ শেষ হয়ে গেছে — আগে শপ এডিট করে মেয়াদ বাড়ান, তাহলেই শপ আবার চালু হয়ে যাবে।",
      });
    }

    shop.status = status;
    shop.suspendedReason =
      status === "suspended" ? normalizedSuspendedReason : "";
    await shop.save();

    // 🔥 FIX: সাসপেন্ড/একটিভ করার সাথে সাথেই effect হওয়া উচিত — cache-এর
    // TTL (৬০ সেকেন্ড) শেষ হওয়া পর্যন্ত অপেক্ষা করা ঠিক না, বিশেষ করে
    // সাসপেনশনের ক্ষেত্রে।
    invalidateShopCache({ domain: shop.domain, slug: shop.slug });

    res.json({
      message:
        status === "suspended"
          ? "🚫 শপ সাসপেন্ড করা হয়েছে"
          : status === "active"
            ? "✅ শপ একটিভ করা হয়েছে"
            : "✅ শপ ট্রায়াল স্ট্যাটাসে বসানো হয়েছে",
      shop,
    });
  } catch (err) {
    console.error("❌ updateShopStatus error:", err);
    res.status(500).json({ message: "Server error updating shop status" });
  }
};

/* -------------------------------------------------------
   DELETE /admin/shops/:id — Shop-কে 3 দিনের Trash-এ পাঠায়
------------------------------------------------------- */
export const deleteShop = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id).setOptions({
      skipTenantScope: true,
    });
    if (!shop) return res.status(404).json({ message: "Shop not found" });

    const assignedAdmins = await Admin.find({
      shops: shop._id,
      role: { $ne: "superadmin" },
    })
      .select("_id")
      .lean();

    const trashEntry = await moveToTrash("Shop", shop, {
      shopId: shop._id,
      metadata: {
        assignedAdminIds: assignedAdmins.map((admin) => admin._id),
      },
    });

    // A deleted shop must not remain accessible from an assigned admin login.
    await Admin.updateMany(
      { shops: shop._id },
      { $pull: { shops: shop._id } },
    );

    // 🔥 FIX: শপ trash-এ যাওয়ার পরও পুরনো cache-এর কারণে ৬০ সেকেন্ড পর্যন্ত
    // ডোমেইনে হিট হলে শপ "পাওয়া যাচ্ছে" বলে দেখাতে পারতো
    invalidateShopCache({ domain: shop.domain, slug: shop.slug });

    res.json({
      message: "🗑️ Shop Trash-এ পাঠানো হয়েছে। ৩ দিনের মধ্যে Restore করা যাবে।",
      trashItem: trashEntry,
    });
  } catch (err) {
    console.error("❌ deleteShop error:", err);
    res.status(500).json({ message: "Server error deleting shop" });
  }
};

/* -------------------------------------------------------
   GET /admin/shops/trash — Super Admin-এর deleted Shop list
------------------------------------------------------- */
export const listShopTrash = async (req, res) => {
  try {
    const items = await Trash.find({ collectionName: "Shop" })
      .setOptions({ skipTenantScope: true })
      .sort({ deletedAt: -1 });

    res.json(items);
  } catch (err) {
    console.error("❌ listShopTrash error:", err);
    res.status(500).json({ message: "Server error fetching shop trash" });
  }
};

/* -------------------------------------------------------
   POST /admin/shops/trash/:trashId/restore
------------------------------------------------------- */
export const restoreDeletedShop = async (req, res) => {
  try {
    const entry = await Trash.findOne({
      _id: req.params.trashId,
      collectionName: "Shop",
    }).setOptions({ skipTenantScope: true });

    if (!entry) {
      return res.status(404).json({ message: "Deleted shop not found" });
    }

    const assignedAdminIds = entry.metadata?.assignedAdminIds || [];
    const restoredShop = await restoreFromTrashEntry(entry);

    if (assignedAdminIds.length) {
      await Admin.updateMany(
        {
          _id: { $in: assignedAdminIds },
          role: { $ne: "superadmin" },
        },
        { $addToSet: { shops: restoredShop._id } },
      );
    }

    res.json({
      message: "♻️ Shop সফলভাবে Restore হয়েছে",
      shop: restoredShop,
    });
  } catch (err) {
    console.error("❌ restoreDeletedShop error:", err);
    if (err?.code === 11000) {
      return res.status(409).json({
        message:
          "এই Shop-এর domain বা slug বর্তমানে অন্য Shop ব্যবহার করছে, তাই Restore করা যায়নি।",
      });
    }
    res.status(500).json({ message: "Server error restoring shop" });
  }
};

/* -------------------------------------------------------
   DELETE /admin/shops/trash/:trashId — Shop + tenant data forever
------------------------------------------------------- */
export const permanentDeleteShop = async (req, res) => {
  try {
    const entry = await Trash.findOne({
      _id: req.params.trashId,
      collectionName: "Shop",
    }).setOptions({ skipTenantScope: true });

    if (!entry) {
      return res.status(404).json({ message: "Deleted shop not found" });
    }

    await permanentlyDeleteShopData(entry.originalId);
    await cleanupTrashAssets("Shop", entry.data);
    await entry.deleteOne();

    res.json({ message: "🗑️ Shop এবং এর সব data permanently deleted" });
  } catch (err) {
    console.error("❌ permanentDeleteShop error:", err);
    res.status(500).json({ message: "Server error permanently deleting shop" });
  }
};

/* -------------------------------------------------------
   DELETE /admin/shops/trash/empty — সব deleted Shop forever
------------------------------------------------------- */
export const emptyShopTrash = async (req, res) => {
  try {
    const entries = await Trash.find({ collectionName: "Shop" }).setOptions({
      skipTenantScope: true,
    });

    for (const entry of entries) {
      await permanentlyDeleteShopData(entry.originalId);
      await cleanupTrashAssets("Shop", entry.data);
      await entry.deleteOne();
    }

    res.json({
      message: `🗑️ Shop Trash emptied (${entries.length} item removed)`,
    });
  } catch (err) {
    console.error("❌ emptyShopTrash error:", err);
    res.status(500).json({ message: "Server error emptying shop trash" });
  }
};

/* -------------------------------------------------------
   GET /admin/shops/:id/admins — এই শপে assign করা সব admin/staff
------------------------------------------------------- */
export const listShopAdmins = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id).setOptions({
      skipTenantScope: true,
    });
    if (!shop) return res.status(404).json({ message: "Shop not found" });

    const admins = await Admin.find({ shops: shop._id }).select("-password");
    res.json(admins);
  } catch (err) {
    console.error("❌ listShopAdmins error:", err);
    res.status(500).json({ message: "Server error fetching shop admins" });
  }
};

/* -------------------------------------------------------
   POST /admin/shops/:id/admins
   — নতুন admin/staff তৈরি করে এই শপে assign করে, অথবা ইমেইল আগে থেকে
   থাকলে সেই existing admin-কেই এই শপে যোগ করে দেয় (multi-shop staff)
------------------------------------------------------- */
export const inviteShopAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body || {};

    const shop = await Shop.findById(req.params.id).setOptions({
      skipTenantScope: true,
    });
    if (!shop) return res.status(404).json({ message: "Shop not found" });

    if (!email || !email.trim()) {
      return res.status(400).json({ message: "ইমেইল আবশ্যক" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const finalRole = role === "staff" ? "staff" : "admin"; // এই রুট দিয়ে কখনো superadmin বানানো যাবে না
    const platformSuperAdminEmail = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();

    if (platformSuperAdminEmail && normalizedEmail === platformSuperAdminEmail) {
      return res.status(409).json({
        message:
          "এই ইমেইলটি Platform Super Admin-এর। Shop Admin হিসেবে ব্যবহার করা যাবে না।",
      });
    }

    let admin = await Admin.findOne({ email: normalizedEmail });

    // ✅ ইমেইলটা আগে থেকেই কোনো admin/staff-এর — শুধু এই শপ যোগ করে দেওয়া হচ্ছে
    if (admin) {
      if (admin.role === "superadmin") {
        return res
          .status(400)
          .json({ message: "এই ইমেইল ইতিমধ্যে একজন superadmin-এর" });
      }

      const alreadyAssigned = (admin.shops || [])
        .map(String)
        .includes(String(shop._id));

      if (alreadyAssigned) {
        return res
          .status(409)
          .json({ message: "এই admin ইতিমধ্যে এই শপে assign করা আছে" });
      }

      const currentCount = await Admin.countDocuments({ shops: shop._id });
      if (currentCount >= (shop.limits?.maxAdmins ?? 2)) {
        return res.status(403).json({
          message: `এই শপে সর্বোচ্চ ${shop.limits?.maxAdmins ?? 2} জন admin রাখা যাবে (প্ল্যান লিমিট)`,
        });
      }

      admin.shops.push(shop._id);
      await admin.save();

      const { password: _pw, ...adminSafe } = admin.toObject();
      return res.status(200).json({
        message: "✅ বিদ্যমান admin-কে এই শপে assign করা হলো",
        admin: adminSafe,
      });
    }

    // ✅ নতুন admin তৈরি — এক্ষেত্রে নাম ও পাসওয়ার্ড আবশ্যক
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "নতুন admin-এর জন্য নাম আবশ্যক" });
    }
    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ message: "পাসওয়ার্ড কমপক্ষে ৬ ক্যারেক্টার হতে হবে" });
    }

    const currentCount = await Admin.countDocuments({ shops: shop._id });
    if (currentCount >= (shop.limits?.maxAdmins ?? 2)) {
      return res.status(403).json({
        message: `এই শপে সর্বোচ্চ ${shop.limits?.maxAdmins ?? 2} জন admin রাখা যাবে (প্ল্যান লিমিট)`,
      });
    }

    admin = await Admin.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: finalRole,
      shops: [shop._id],
    });

    const { password: _pw, ...adminSafe } = admin.toObject();

    res.status(201).json({
      message: "✅ নতুন admin তৈরি ও assign করা হলো",
      admin: adminSafe,
    });
  } catch (err) {
    console.error("❌ inviteShopAdmin error:", err);
    if (err?.code === 11000) {
      return res.status(409).json({ message: "এই ইমেইল দিয়ে ইতিমধ্যে একজন admin আছে" });
    }
    res.status(500).json({ message: "Server error inviting shop admin" });
  }
};

/* -------------------------------------------------------
   DELETE /admin/shops/:id/admins/:adminId
   — এই শপ থেকে admin-কে সরিয়ে দেওয়া (অ্যাকাউন্ট ডিলিট হয় না, শুধু
   এই শপের access বাদ যায় — অন্য শপে assign থাকলে সেটা থেকে যাবে)
------------------------------------------------------- */
export const removeShopAdmin = async (req, res) => {
  try {
    const { id, adminId } = req.params;

    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    if (admin.role === "superadmin") {
      return res
        .status(400)
        .json({ message: "Superadmin-কে এভাবে কোনো শপ থেকে সরানো যায় না" });
    }

    admin.shops = (admin.shops || []).filter((s) => String(s) !== String(id));
    await admin.save();

    const { password: _pw, ...adminSafe } = admin.toObject();
    res.json({ message: "✅ শপ থেকে সরানো হয়েছে", admin: adminSafe });
  } catch (err) {
    console.error("❌ removeShopAdmin error:", err);
    res.status(500).json({ message: "Server error removing shop admin" });
  }
};

// ✅ DNS ঠিক থাকলেও ডোমেইনটা হোস্টিং প্যানেলে (Coolify/Traefik) অ্যাপের সাথে
// attach করা না থাকলে সাইট লোড হয় না — তাই DNS verify এর পর সরাসরি
// https://domain এ রিকোয়েস্ট পাঠিয়ে দেখা হয় আসলে response আসছে কিনা।
async function checkShopDomainLive(domain) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(`https://${domain}/`, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
    });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

// ✅ DNS verified হওয়ার পরও সাইট লোড না হলে — Coolify API দিয়ে এই ডোমেইনটা
// (apex + www) নিজে থেকেই platform-এর frontend app-এর সাথে attach করার
// চেষ্টা করে, যাতে ৫০০-৬০০ শপের জন্য প্রতিবার Coolify ড্যাশবোর্ডে গিয়ে
// হাতে হাতে domain যোগ করতে না হয়। env var না থাকলে (COOLIFY_API_URL/
// COOLIFY_API_TOKEN/COOLIFY_APP_UUID) নিঃশব্দে স্কিপ করে — লোকাল dev-এ
// দরকার নেই। বর্তমান fqdn list read করে শুধু নতুন domain টুকু append করে,
// অন্য শপের attach করা domain কখনো মুছে না।
async function attachDomainToCoolify(domain) {
  const apiUrl = process.env.COOLIFY_API_URL;
  const token = process.env.COOLIFY_API_TOKEN;
  const appUuid = process.env.COOLIFY_APP_UUID;
  if (!apiUrl || !token || !appUuid) return { attempted: false };

  const base = apiUrl.replace(/\/+$/, "");
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  const endpoint = `${base}/api/v1/applications/${appUuid}`;

  try {
    const getRes = await fetch(endpoint, { headers });
    if (!getRes.ok) {
      return {
        attempted: true,
        ok: false,
        error: `Coolify থেকে বর্তমান domain list আনা যায়নি (HTTP ${getRes.status})`,
      };
    }
    const app = await getRes.json();
    const existing = String(app.fqdn || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const wanted = [`https://${domain}`, `https://www.${domain}`];
    const merged = [...existing];
    let changed = false;
    for (const url of wanted) {
      if (!merged.includes(url)) {
        merged.push(url);
        changed = true;
      }
    }

    if (!changed) return { attempted: true, ok: true, alreadyAttached: true };

    const patchRes = await fetch(endpoint, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ domains: merged.join(",") }),
    });
    if (!patchRes.ok) {
      return {
        attempted: true,
        ok: false,
        error: `Coolify-তে domain attach করা যায়নি (HTTP ${patchRes.status})`,
      };
    }

    // ✅ শুধু domains field আপডেট করলে Coolify "Changes pending" অবস্থায়
    // থেকে যায় — Traefik-এর router/SSL config-এ আসলে বসাতে app restart
    // করা লাগে (rebuild না, শুধু container recreate + label refresh)।
    const restartRes = await fetch(`${endpoint}/restart`, {
      method: "POST",
      headers,
    });
    if (!restartRes.ok) {
      return {
        attempted: true,
        ok: false,
        error: `Domain attach হয়েছে কিন্তু app restart করা যায়নি (HTTP ${restartRes.status}) — Coolify-তে গিয়ে ম্যানুয়ালি Restart করুন`,
      };
    }

    return { attempted: true, ok: true, alreadyAttached: false };
  } catch (err) {
    // "fetch failed" (undici) নিজে কিছু বলে না — আসল কারণ (DNS, connection
    // refused, TLS, ইত্যাদি) err.cause-এ থাকে, সেটাই লগ ও রেসপন্সে বের করা হয়।
    const detail = err.cause?.code || err.cause?.message || err.message;
    console.error("❌ attachDomainToCoolify error:", err.cause || err);
    return { attempted: true, ok: false, error: detail };
  }
}

/* -------------------------------------------------------
   POST /admin/shops/:id/verify-domain
   — DNS lookup (শপের ডোমেইন আমাদের সার্ভারের দিকে পয়েন্ট করছে কিনা) +
     verified হলে সাইট আসলে লোড হচ্ছে কিনা তার live check
------------------------------------------------------- */
export const verifyShopDomain = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id).setOptions({
      skipTenantScope: true,
    });
    if (!shop) return res.status(404).json({ message: "Shop not found" });

    const expectedIp = process.env.SERVER_IP;
    if (!expectedIp) {
      return res.status(500).json({
        message:
          "SERVER_IP env ভ্যারিয়েবল সেট করা নেই — কোথায় DNS পয়েন্ট করা উচিত সেটা জানা নেই",
      });
    }

    const dns = await import("node:dns/promises");
    let resolvedIps = [];
    try {
      resolvedIps = await dns.resolve4(shop.domain);
    } catch (e) {
      shop.domainStatus = "failed";
      shop.domainLastCheckedAt = new Date();
      shop.domainLiveStatus = "unknown";
      shop.domainLiveCheckedAt = null;
      await shop.save();
      invalidateShopCache({ domain: shop.domain });
      return res.status(200).json({
        verified: false,
        message: `"${shop.domain}" এর জন্য DNS resolve করা যায়নি`,
        shop,
      });
    }

    const verified = resolvedIps.includes(expectedIp);

    shop.domainStatus = verified ? "verified" : "failed";
    shop.domainLastCheckedAt = new Date();
    if (verified) shop.domainVerifiedAt = new Date();

    let live = false;
    let coolify = { attempted: false };
    if (verified) {
      live = await checkShopDomainLive(shop.domain);
      if (!live) {
        coolify = await attachDomainToCoolify(shop.domain);
      }
      shop.domainLiveStatus = live ? "live" : "unreachable";
      shop.domainLiveCheckedAt = new Date();
    } else {
      shop.domainLiveStatus = "unknown";
      shop.domainLiveCheckedAt = null;
    }

    await shop.save();
    invalidateShopCache({ domain: shop.domain });

    let message;
    if (!verified) {
      message = `❌ ডোমেইন এখনো ${expectedIp}-এ পয়েন্ট করছে না`;
    } else if (live) {
      message = "✅ ডোমেইন verified এবং সাইট সরাসরি লোড হচ্ছে";
    } else if (coolify.attempted && coolify.ok && !coolify.alreadyAttached) {
      message =
        "✅ DNS ঠিক আছে — ডোমেইনটা Coolify-তে attach করার অনুরোধ পাঠানো হয়েছে। SSL সেটাপ হতে ১-২ মিনিট লাগতে পারে, একটু পর আবার Verify চাপুন";
    } else if (coolify.attempted && !coolify.ok) {
      message = `⚠️ DNS ঠিক আছে, কিন্তু Coolify-তে অটোমেটিক attach করতে সমস্যা হয়েছে (${coolify.error}) — ম্যানুয়ালি Coolify ড্যাশবোর্ডে গিয়ে ডোমেইনটা যোগ করুন`;
    } else {
      message =
        "⚠️ DNS সঠিকভাবে পয়েন্ট করা আছে, কিন্তু সাইট এখনো লোড হচ্ছে না — হোস্টিং প্যানেলে (Coolify) এই ডোমেইনটা অ্যাপের সাথে attach করা প্রয়োজন";
    }

    res.json({
      verified,
      live,
      resolvedIps,
      expectedIp,
      coolify,
      message,
      shop,
    });
  } catch (err) {
    console.error("❌ verifyShopDomain error:", err);
    res.status(500).json({ message: "Server error verifying domain" });
  }
};
