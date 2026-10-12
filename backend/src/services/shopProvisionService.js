import crypto from "crypto";
import Shop from "../models/Shop.js";
import Admin from "../models/Admin.js";
import Plan from "../models/Plan.js";
import Counter from "../models/Counter.js";
import { invalidateShopCache } from "../tenancy/publicShopResolver.js";
import { computePlanExpiresAt, PLAN_EXPIRED_SUSPEND_REASON } from "../utils/planExpiry.js";
import { generateUniqueSlug } from "../../controllers/shop/admin.shop.controller.js";

// ✅ Hikmah IT-তে অর্ডার approve হলে provisionShop(), পরে reject হলে revokeProvision() চলে।
//
//   provisionShop:
//     • নতুন কাস্টমার (ইমেইল দিয়ে কোনো শপ নেই) → শপ + shop-admin অ্যাকাউন্ট তৈরি।
//       কাস্টমার চেকআউটে যে পাসওয়ার্ড দিয়েছে (bcrypt hash হিসেবে আসে) সেটাই বসে।
//       পাসওয়ার্ড (passwordHash) বাধ্যতামূলক — না থাকলে শপ তৈরিই হয় না, সিস্টেম নিজে
//       কোনো পাসওয়ার্ড বানায় না।
//     • আগের কাস্টমার (ওই ইমেইলের শপ আছে) → প্ল্যান বদল/মেয়াদ নবায়ন
//   revokeProvision:
//     • তৈরি হওয়া শপ → সাসপেন্ড (ডেটা মোছা হয় না)
//     • নবায়ন/আপগ্রেড → প্রয়োগের আগের অবস্থায় ফেরানো
//
// externalRef (Hikmah purchase id) দিয়ে দুটোই idempotent।

export class ProvisionError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// অর্ডার বাতিলের কারণে সাসপেন্ড — নবায়নে (re-approve) এই কারণে সাসপেন্ড শপ আবার চালু হয়
export const ORDER_REVOKED_SUSPEND_REASON =
  "অর্ডার বাতিল হওয়ায় শপ সাময়িকভাবে বন্ধ আছে — বিস্তারিত জানতে Hikmah IT-এর সাথে যোগাযোগ করুন।";

const MAX_HISTORY = 50;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BCRYPT_HASH_RE = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

// Admin মডেলে password আবশ্যক, তাই অ্যাকাউন্ট তৈরির মুহূর্তে একটা অজানা অভ্যন্তরীণ মান বসে —
// সাথে সাথেই কাস্টমারের hash দিয়ে বদলে দেওয়া হয়। এটা কোথাও ফেরত যায় না, কারো জানার উপায়ও নেই।
const internalPlaceholderSecret = () => crypto.randomBytes(24).toString("base64url");

const plain = (e) => (e?.toObject ? e.toObject() : e);

// প্রয়োগের আগের অবস্থা — revoke-এ এখান থেকেই ফেরানো হয়
function snapshot(shop) {
  return {
    plan: shop.plan,
    limits: {
      maxProducts: shop.limits?.maxProducts,
      maxAdmins: shop.limits?.maxAdmins,
    },
    subscriptionStartDate: shop.subscriptionStartDate,
    subscriptionDays: shop.subscriptionDays,
    planExpiresAt: shop.planExpiresAt,
    status: shop.status,
    suspendedReason: shop.suspendedReason || "",
  };
}

// idempotency ref + ইতিহাসে একসাথে যোগ (সর্বোচ্চ MAX_HISTORY)
function recordApplied(shop, ref, result, prev) {
  shop.externalRefs = [...(shop.externalRefs || []), ref].slice(-MAX_HISTORY);
  shop.provisionHistory = [
    ...(shop.provisionHistory || []).map(plain),
    { ref, result, appliedAt: new Date(), revokedAt: null, prev },
  ].slice(-MAX_HISTORY);
}

function summarize(shop) {
  return {
    id: String(shop._id),
    name: shop.name,
    slug: shop.slug,
    plan: shop.plan,
    status: shop.status,
    planExpiresAt: shop.planExpiresAt,
  };
}

// নবায়ন/আপগ্রেডে নতুন মেয়াদ কীভাবে হবে — pure function, সহজে টেস্টযোগ্য
export function computeRenewal({ shop, planKey, days, now = new Date() }) {
  if (!days) {
    return { start: now, subscriptionDays: null, expiresAt: null, note: "প্ল্যানে মেয়াদ নেই (billingDays=0), শপের মেয়াদ সীমাহীন করা হয়েছে" };
  }
  const samePlan = shop.plan === planKey;
  const expiry = shop.planExpiresAt ? new Date(shop.planExpiresAt) : null;

  // একই প্ল্যান + মেয়াদ এখনো আছে → বাকি মেয়াদের সাথে যোগ হবে (টাকা নষ্ট হবে না)
  if (samePlan && expiry && expiry.getTime() > now.getTime()) {
    const start = shop.subscriptionStartDate ? new Date(shop.subscriptionStartDate) : now;
    const expiresAt = new Date(expiry);
    expiresAt.setDate(expiresAt.getDate() + days);
    const subscriptionDays = Math.max(1, Math.round((expiresAt - start) / 86400000));
    return { start, subscriptionDays, expiresAt, note: `বর্তমান মেয়াদের সাথে ${days} দিন যোগ হয়েছে` };
  }

  // একই প্ল্যান কিন্তু শপের কোনো মেয়াদই নেই (সুপার-অ্যাডমিন সীমাহীন রেখেছিল) → যেমন আছে তেমন
  if (samePlan && !expiry) {
    return { keep: true, note: "শপের মেয়াদ সীমাহীন ছিল, তাই বদলানো হয়নি" };
  }

  // প্ল্যান বদল বা মেয়াদ শেষ → আজ থেকে নতুন মেয়াদ
  const expiresAt = computePlanExpiresAt(now, days);
  return { start: now, subscriptionDays: days, expiresAt, note: `আজ থেকে ${days} দিনের নতুন মেয়াদ` };
}

export async function provisionShop(input = {}) {
  const externalRef = String(input.externalRef || "").trim();
  const planKey = String(input.planKey || "").trim().toLowerCase();
  const email = String(input.customerEmail || "").trim().toLowerCase();
  const customerName = String(input.customerName || "").trim();
  const customerPhone = String(input.customerPhone || "").trim();
  const shopName = String(input.shopName || "").trim() || customerName;
  const passwordHash = input.passwordHash ? String(input.passwordHash) : "";

  if (!externalRef) throw new ProvisionError(400, "externalRef আবশ্যক");
  if (!planKey) throw new ProvisionError(400, "planKey আবশ্যক");
  if (!EMAIL_RE.test(email)) throw new ProvisionError(400, "সঠিক customerEmail আবশ্যক");
  if (!customerName) throw new ProvisionError(400, "customerName আবশ্যক");
  if (shopName.length < 2 || shopName.length > 60) {
    throw new ProvisionError(400, "শপের নাম ২ থেকে ৬০ অক্ষরের মধ্যে হতে হবে");
  }
  if (passwordHash && !BCRYPT_HASH_RE.test(passwordHash)) {
    throw new ProvisionError(400, "passwordHash বৈধ bcrypt hash নয়");
  }

  const plan = await Plan.findOne({ key: planKey });
  if (!plan) throw new ProvisionError(400, `অজানা প্ল্যান: ${planKey}`);

  // ১) Idempotency — এই অর্ডার আগেই প্রয়োগ হয়ে থাকলে আবার কিছু করা হবে না
  const processed = await Shop.findOne({ externalRefs: externalRef });
  if (processed) {
    return { result: "already_processed", shop: processed, adminEmail: email, passwordMode: "existing", notes: [] };
  }

  const platformSuperAdminEmail = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  if (platformSuperAdminEmail && email === platformSuperAdminEmail) {
    throw new ProvisionError(409, "এই ইমেইল Platform Super Admin-এর — শপ প্রভিশন করা যাবে না");
  }

  const days = plan.billingDays > 0 ? plan.billingDays : null;
  const limits = {
    maxProducts: plan.limits?.maxProducts ?? 200,
    maxAdmins: plan.limits?.maxAdmins ?? 2,
  };

  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin?.role === "superadmin") {
    throw new ProvisionError(409, "এই ইমেইল Platform Super Admin-এর — শপ প্রভিশন করা যাবে না");
  }

  // ২) নবায়ন / আপগ্রেড — এই ইমেইলের admin-এর শপ আগে থেকেই আছে
  if (existingAdmin && existingAdmin.shops.length > 0) {
    if (existingAdmin.role !== "admin") {
      throw new ProvisionError(409, "এই ইমেইল একটি শপের staff — শপ-মালিকের (admin) ইমেইল দিয়ে কিনতে হবে");
    }
    const shop = await Shop.findById(existingAdmin.shops[0]);
    if (!shop) throw new ProvisionError(409, "এই ইমেইলের শপ খুঁজে পাওয়া যায়নি");

    const prev = snapshot(shop);
    const renewal = computeRenewal({ shop, planKey: plan.key, days });
    const notes = [renewal.note, "এই ইমেইলের শপ আগে থেকেই আছে — শপের নাম ও পাসওয়ার্ড বদলানো হয়নি"];

    shop.plan = plan.key;
    shop.limits = limits;
    if (!renewal.keep) {
      shop.subscriptionStartDate = renewal.start;
      shop.subscriptionDays = renewal.subscriptionDays;
      shop.planExpiresAt = renewal.expiresAt;
    }

    // মেয়াদ-শেষে বা অর্ডার-বাতিলে সাসপেন্ড হওয়া শপ নবায়নে আবার চালু হবে; হাতে সাসপেন্ড করা শপ নয়
    if (shop.status === "suspended") {
      if (
        shop.suspendedReason === PLAN_EXPIRED_SUSPEND_REASON ||
        shop.suspendedReason === ORDER_REVOKED_SUSPEND_REASON
      ) {
        shop.status = "active";
        shop.suspendedReason = "";
        notes.push("সাসপেন্ড হওয়া শপ আবার চালু করা হয়েছে");
      } else {
        notes.push("⚠️ শপটি হাতে সাসপেন্ড করা — তাই চালু করা হয়নি, সুপার-অ্যাডমিন দেখুন");
      }
    } else if (shop.status === "trial") {
      shop.status = "active";
    }

    recordApplied(shop, externalRef, "renewed", prev);
    await shop.save();
    invalidateShopCache({ domain: shop.domain, slug: shop.slug });
    return { result: "renewed", shop, adminEmail: email, passwordMode: "existing", notes };
  }

  // ৩) নতুন শপ + নতুন admin — এখানে কাস্টমারের পাসওয়ার্ড আবশ্যক
  if (!passwordHash) {
    throw new ProvisionError(
      400,
      "নতুন শপ খুলতে কাস্টমারের পাসওয়ার্ড (passwordHash) আবশ্যক — অর্ডারে পাসওয়ার্ড নেই",
    );
  }

  let slug;
  try {
    const slugBase = /[a-z0-9]/i.test(shopName) ? shopName : email.split("@")[0];
    slug = await generateUniqueSlug(slugBase);
  } catch {
    throw new ProvisionError(500, "Slug তৈরি করা যায়নি");
  }

  const storageCounter = await Counter.findOneAndUpdate(
    { name: "shopStorageNumber" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );

  const now = new Date();
  let shop;
  try {
    shop = await Shop.create({
      name: shopName,
      slug,
      storageNumber: storageCounter.seq,
      status: "active",
      plan: plan.key,
      subscriptionStartDate: now,
      subscriptionDays: days,
      planExpiresAt: computePlanExpiresAt(now, days),
      limits,
      contactEmail: email,
      contactPhone: customerPhone,
      externalRefs: [externalRef],
      provisionHistory: [{ ref: externalRef, result: "created", appliedAt: now, revokedAt: null, prev: null }],
    });
  } catch (err) {
    if (err?.code === 11000) throw new ProvisionError(409, "শপ তৈরিতে ডুপ্লিকেট (নাম/slug) — আবার চেষ্টা করুন");
    throw err;
  }

  const initialPassword = internalPlaceholderSecret(); // hook এটাকে হ্যাশ করবে, নিচে সাথে সাথে বদলে যায়

  let createdAdminId = null;
  let reusedAdminId = null;
  try {
    let admin = existingAdmin; // shops খালি থাকা পুরোনো অ্যাকাউন্ট — নতুন করে ওভাররাইট (inviteShopAdmin-এর নিয়মেই)
    if (admin) {
      reusedAdminId = admin._id;
      admin.name = customerName;
      admin.password = initialPassword;
      admin.role = "admin";
      admin.shops = [shop._id];
      if (customerPhone) admin.phone = customerPhone;
      await admin.save();
    } else {
      admin = await Admin.create({
        name: customerName,
        email,
        phone: customerPhone || undefined,
        password: initialPassword,
        role: "admin",
        shops: [shop._id],
      });
      createdAdminId = admin._id;
    }

    // pre-save hook আবার হ্যাশ করবে বলে কাস্টমারের hash সরাসরি updateOne-এ বসানো হয় (hook ঘোরে না)
    await Admin.updateOne({ _id: admin._id }, { $set: { password: passwordHash } });

    shop.ownerAdminId = admin._id;
    await shop.save();
  } catch (err) {
    // আধা-তৈরি অবস্থা রেখে দেওয়া যাবে না — নাহলে পরের রিট্রাইতে "শপ খুঁজে পাওয়া যায়নি" এ আটকে যেত
    await Shop.deleteOne({ _id: shop._id }).catch(() => {});
    if (createdAdminId) await Admin.deleteOne({ _id: createdAdminId }).catch(() => {});
    else if (reusedAdminId) await Admin.updateOne({ _id: reusedAdminId }, { $set: { shops: [] } }).catch(() => {});
    if (err?.code === 11000) throw new ProvisionError(409, "এই ইমেইল দিয়ে ইতিমধ্যে একটা admin আছে");
    throw err;
  }

  invalidateShopCache({ domain: shop.domain, slug: shop.slug });
  return {
    result: "created",
    shop,
    adminEmail: email,
    passwordMode: "customer", // কাস্টমারের নিজের দেওয়া পাসওয়ার্ড — রেসপন্সে কোনো পাসওয়ার্ড যায় না
    notes: [],
  };
}

// অর্ডার পরে reject হলে — নিরাপদে ফেরানো/বন্ধ করা
export async function revokeProvision(input = {}) {
  const externalRef = String(input.externalRef || "").trim();
  if (!externalRef) throw new ProvisionError(400, "externalRef আবশ্যক");

  const shop = await Shop.findOne({ "provisionHistory.ref": externalRef });
  if (!shop) {
    return { result: "not_applied", shop: null, notes: ["এই অর্ডার ECMS-এ প্রয়োগ হয়নি, তাই কিছু বদলানো হয়নি"] };
  }

  const history = (shop.provisionHistory || []).map(plain);

  // একই অর্ডার revoke → re-approve হলে ইতিহাসে একই ref দুইবার থাকে — তাই সবসময়
  // সর্বশেষ এন্ট্রি (index দিয়ে) ধরা হয়, প্রথম মিল নয়
  let entryIndex = -1;
  history.forEach((e, i) => {
    if (e.ref === externalRef) entryIndex = i;
  });
  const entry = history[entryIndex];
  if (entry.revokedAt) {
    return { result: "already_revoked", shop, notes: [] };
  }

  // শুধু সর্বশেষ সক্রিয় প্রয়োগ ফেরানো যায় — পরে আরও অর্ডার প্রয়োগ হয়ে থাকলে
  // নিজে থেকে ফেরানো ভুল ডেটা তৈরি করতে পারে, তাই হাতে দেখার জন্য আটকে দেওয়া হয়
  let lastActiveIndex = -1;
  history.forEach((e, i) => {
    if (!e.revokedAt) lastActiveIndex = i;
  });
  if (lastActiveIndex !== entryIndex) {
    throw new ProvisionError(
      409,
      "এই অর্ডারের পরে এই শপে আরও অর্ডার প্রয়োগ হয়েছে — নিজে থেকে ফেরানো নিরাপদ নয়, সুপার-অ্যাডমিন হাতে দেখুন",
    );
  }

  const notes = [];
  let result;
  if (entry.result === "created") {
    // নতুন তৈরি শপ — ডেটা মোছা হয় না, শুধু সাসপেন্ড; মেয়াদ এখনই শেষ ধরা হয়
    // (যাতে re-approve করলে বাকি মেয়াদের সাথে দ্বিগুণ হয়ে না যায়)
    if (shop.status !== "suspended") {
      shop.status = "suspended";
      shop.suspendedReason = ORDER_REVOKED_SUSPEND_REASON;
    }
    shop.planExpiresAt = new Date();
    result = "suspended";
    notes.push("শপ সাসপেন্ড করা হয়েছে (ডেটা অক্ষত আছে)");
  } else {
    const prev = entry.prev || {};
    shop.plan = prev.plan ?? shop.plan;
    shop.limits = prev.limits ?? shop.limits;
    shop.subscriptionStartDate = prev.subscriptionStartDate ?? shop.subscriptionStartDate;
    shop.subscriptionDays = prev.subscriptionDays ?? null;
    shop.planExpiresAt = prev.planExpiresAt ?? null;
    shop.status = prev.status ?? shop.status;
    shop.suspendedReason = prev.suspendedReason ?? "";
    result = "reverted";
    notes.push("প্ল্যান ও মেয়াদ প্রয়োগের আগের অবস্থায় ফিরিয়ে দেওয়া হয়েছে");
  }

  shop.provisionHistory = history.map((e, i) => (i === entryIndex ? { ...e, revokedAt: new Date() } : e));
  shop.externalRefs = (shop.externalRefs || []).filter((r) => r !== externalRef);
  await shop.save();
  invalidateShopCache({ domain: shop.domain, slug: shop.slug });

  return { result, shop, notes };
}

export { summarize as summarizeShop };
