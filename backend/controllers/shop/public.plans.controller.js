import { listActivePlans } from "../../src/models/Plan.js";

// ✅ পাবলিক (লগইন ছাড়া) plan catalog — ECMS ল্যান্ডিং পেজ এবং Hikmah IT সাইট
// দুজনেই এটা থেকে প্ল্যান পড়ে। সুপার-অ্যাডমিনে প্ল্যান বদলালে এখানেও বদলায়,
// তাই দাম/ফিচার আর কোথাও হাতে লিখে রাখতে হয় না।
//
// শুধু isVisible !== false প্ল্যান যায়। ভেতরের তথ্য (theme, _id) বের করা হয় না।

const BN = (n) => Number(n || 0).toLocaleString("bn-BD");

// ✅ প্ল্যান কার্ডে যে ফিচারগুলো দেখানো হয় (ক্রম ঠিক এভাবেই)। প্ল্যানে ফিচার চালু
// থাকলে ✓, বন্ধ থাকলে কাটা (✗) অবস্থায় দেখায় — তাই ক্রেতা এক নজরে তুলনা করতে পারে।
// ECMS ল্যান্ডিং ও Hikmah IT সাইট দুজনেই এই লেবেল ব্যবহার করে, কোথাও আলাদা করে
// লিখতে হয় না।
const FEATURE_CATALOG = [
  { key: "fullStorefront", label: "সম্পূর্ণ স্টোরফ্রন্ট" },
  { key: "analytics", label: "ভিজিটর অ্যানালিটিক্স" },
  { key: "promo", label: "প্রোমো ও কুপন কোড" },
  { key: "payment", label: "পেমেন্ট ইন্টিগ্রেশন" },
  { key: "customDomain", label: "কাস্টম ডোমেইন" },
  { key: "landingPages", label: "ল্যান্ডিং পেজ বিল্ডার" },
  { key: "invoiceCustomization", label: "ইনভয়েস কাস্টমাইজেশন" },
];

// প্রোডাক্ট/অর্ডার/অ্যাডমিন — সবসময় "আছে" ধরনের লিমিট লাইন। maxProducts = 0 মানে
// আনলিমিটেড; অর্ডারের কোনো লিমিট কোনো প্ল্যানেই নেই।
function buildLimitItems(plan) {
  const l = plan.limits || {};
  return [
    {
      key: "maxProducts",
      label: l.maxProducts > 0 ? `${BN(l.maxProducts)}টি পর্যন্ত প্রোডাক্ট` : "আনলিমিটেড প্রোডাক্ট",
      included: true,
    },
    { key: "orders", label: "আনলিমিটেড অর্ডার", included: true },
    { key: "maxAdmins", label: `${BN(l.maxAdmins)} জন অ্যাডমিন`, included: true },
  ];
}

// চালু ফিচার আগে, বন্ধ ফিচার পরে — প্রতিটি দলের ভেতরে FEATURE_CATALOG-এর ক্রম বজায় থাকে।
function buildFeatureList(plan) {
  const f = plan.features || {};
  const toggles = FEATURE_CATALOG.map(({ key, label }) => ({ key, label, included: !!f[key] }));
  return [
    ...buildLimitItems(plan),
    ...toggles.filter((item) => item.included),
    ...toggles.filter((item) => !item.included),
  ];
}

function toPublicPlan(plan) {
  const p = plan.toObject ? plan.toObject() : plan;
  const featureList = buildFeatureList(p);
  return {
    key: p.key,
    name: p.name,
    tagline: p.tagline || "",
    order: p.order ?? 0,
    price: p.price ?? 0,
    originalPrice: p.originalPrice ?? 0,
    billingDays: p.billingDays ?? 30,
    isPopular: !!p.isPopular,
    ctaType: p.ctaType || "buy",
    features: p.features || {},
    limits: p.limits || {},
    // ✅ নতুন: প্রতিটি ফিচার + চালু/বন্ধ অবস্থা (UI এটা দিয়েই ✓/✗ আঁকে)
    featureList,
    // আগের কনজিউমারদের জন্য (পুরোনো Hikmah/ল্যান্ডিং বিল্ড) — শুধু চালু ফিচারের লেবেল
    highlights: featureList.filter((item) => item.included).map((item) => item.label),
    // বন্ধ ফিচারের লেবেল — কাটা অবস্থায় দেখানোর জন্য
    notIncluded: featureList.filter((item) => !item.included).map((item) => item.label),
  };
}

export const listPublicPlans = async (req, res) => {
  try {
    const plans = await listActivePlans();
    const visible = plans.filter((p) => p.isVisible !== false).map(toPublicPlan);
    res.set("Cache-Control", "public, max-age=30, stale-while-revalidate=120");
    return res.json(visible);
  } catch (err) {
    console.error("listPublicPlans error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getPublicPlan = async (req, res) => {
  try {
    const plans = await listActivePlans();
    const plan = plans.find((p) => p.key === req.params.key && p.isVisible !== false);
    if (!plan) return res.status(404).json({ message: "Plan not found" });
    res.set("Cache-Control", "public, max-age=30");
    return res.json(toPublicPlan(plan));
  } catch (err) {
    console.error("getPublicPlan error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
