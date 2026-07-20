import Shop from "../../src/models/Shop.js";
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
import { invalidateShopDomainCache } from "../../src/tenancy/publicShopResolver.js";

/* -------------------------------------------------------
   Helper: name -> url-safe slug (+ auto-unique suffix)
------------------------------------------------------- */
async function generateUniqueSlug(name) {
  const base =
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "shop";

  let slug = base;
  let counter = 1;

  // eslint-disable-next-line no-await-in-loop
  while (await Shop.findOne({ slug })) {
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
    const { name, domain, contactEmail, contactPhone, plan } = req.body || {};

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "শপের নাম আবশ্যক" });
    }
    if (!domain || !domain.trim()) {
      return res.status(400).json({ message: "ডোমেইন আবশ্যক" });
    }

    const normalizedDomain = normalizeDomain(domain);

    const existing = await Shop.findOne({ domain: normalizedDomain });
    if (existing) {
      return res
        .status(409)
        .json({ message: "এই ডোমেইন দিয়ে ইতিমধ্যে একটা শপ আছে" });
    }

    const slug = await generateUniqueSlug(name);

    const shop = await Shop.create({
      name: name.trim(),
      slug,
      domain: normalizedDomain,
      domainStatus: "pending_dns",
      status: "trial",
      plan: plan && ["free", "starter", "pro"].includes(plan) ? plan : "free",
      contactEmail: contactEmail || "",
      contactPhone: contactPhone || "",
      ownerAdminId: req.admin?._id || null,
    });

    res.status(201).json({
      message: "✅ নতুন শপ তৈরি হয়েছে",
      shop,
      dnsInstructions: {
        note: "কাস্টমার এই ডোমেইনে ঢুকতে পারার জন্য DNS পয়েন্ট করাতে হবে।",
        recommended: [
          { type: "A", host: "@", value: process.env.SERVER_IP || "<SERVER_IP>" },
          { type: "CNAME", host: "www", value: normalizedDomain },
        ],
      },
    });
  } catch (err) {
    console.error("❌ createShop error:", err);
    if (err?.code === 11000) {
      return res
        .status(409)
        .json({ message: "এই নাম বা ডোমেইন দিয়ে ইতিমধ্যে একটা শপ আছে" });
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

    const {
      name,
      domain,
      contactEmail,
      contactPhone,
      plan,
      themeColor,
      maxProducts,
      maxAdmins,
    } = req.body || {};

    if (name !== undefined && name.trim()) shop.name = name.trim();

    if (domain !== undefined && domain.trim()) {
      const normalizedDomain = normalizeDomain(domain);
      if (normalizedDomain !== shop.domain) {
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
    if (plan !== undefined && ["free", "starter", "pro"].includes(plan)) {
      shop.plan = plan;
    }
    if (themeColor !== undefined) shop.branding.themeColor = themeColor;
    if (maxProducts !== undefined) {
      shop.limits.maxProducts = Number(maxProducts) || shop.limits.maxProducts;
    }
    if (maxAdmins !== undefined) {
      shop.limits.maxAdmins = Number(maxAdmins) || shop.limits.maxAdmins;
    }

    await shop.save();

    // 🔥 FIX: shop cache invalidate — নাহলে ডোমেইন/স্ট্যাটাস বদলানোর পরও
    // পুরনো cached ডেটা দিয়ে (৬০ সেকেন্ড পর্যন্ত) request সার্ভ হতে পারতো
    invalidateShopDomainCache(originalDomain);
    invalidateShopDomainCache(shop.domain);

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

    shop.status = status;
    shop.suspendedReason =
      status === "suspended" ? normalizedSuspendedReason : "";
    await shop.save();

    // 🔥 FIX: সাসপেন্ড/একটিভ করার সাথে সাথেই effect হওয়া উচিত — cache-এর
    // TTL (৬০ সেকেন্ড) শেষ হওয়া পর্যন্ত অপেক্ষা করা ঠিক না, বিশেষ করে
    // সাসপেনশনের ক্ষেত্রে।
    invalidateShopDomainCache(shop.domain);

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
    invalidateShopDomainCache(shop.domain);

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

/* -------------------------------------------------------
   POST /admin/shops/:id/verify-domain
   — সহজ DNS lookup: শপের ডোমেইন আমাদের সার্ভারের দিকে পয়েন্ট করছে কিনা চেক করে
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
      await shop.save();
      invalidateShopDomainCache(shop.domain);
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
    await shop.save();
    invalidateShopDomainCache(shop.domain);

    res.json({
      verified,
      resolvedIps,
      expectedIp,
      message: verified
        ? "✅ ডোমেইন সঠিকভাবে সার্ভারে পয়েন্ট করা আছে"
        : `❌ ডোমেইন এখনো ${expectedIp}-এ পয়েন্ট করছে না`,
      shop,
    });
  } catch (err) {
    console.error("❌ verifyShopDomain error:", err);
    res.status(500).json({ message: "Server error verifying domain" });
  }
};
