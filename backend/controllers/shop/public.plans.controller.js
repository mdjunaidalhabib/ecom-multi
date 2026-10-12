import { listActivePlans } from "../../src/models/Plan.js";

// ✅ পাবলিক (লগইন ছাড়া) plan catalog — ECMS ল্যান্ডিং পেজ এবং Hikmah IT সাইট
// দুজনেই এটা থেকে প্ল্যান পড়ে। সুপার-অ্যাডমিনে প্ল্যান বদলালে এখানেও বদলায়,
// তাই দাম/ফিচার আর কোথাও হাতে লিখে রাখতে হয় না।
//
// শুধু isVisible !== false প্ল্যান যায়। ভেতরের তথ্য (theme, _id) বের করা হয় না।

const BN = (n) => Number(n || 0).toLocaleString("bn-BD");

function buildHighlights(plan) {
  const f = plan.features || {};
  const l = plan.limits || {};
  const out = [];
  out.push(`${BN(l.maxProducts)}টি পর্যন্ত প্রোডাক্ট`);
  out.push(`${BN(l.maxAdmins)} জন অ্যাডমিন`);
  if (f.fullStorefront) out.push("সম্পূর্ণ স্টোরফ্রন্ট");
  if (f.analytics && f.promo) out.push("অ্যানালিটিক্স ও প্রোমো কোড");
  else if (f.analytics) out.push("অ্যানালিটিক্স");
  else if (f.promo) out.push("প্রোমো কোড");
  if (f.payment) out.push("পেমেন্ট ইন্টিগ্রেশন");
  if (f.customDomain) out.push("কাস্টম ডোমেইন");
  if (f.landingPages) out.push("ল্যান্ডিং পেজ বিল্ডার");
  if (f.invoiceCustomization) out.push("ইনভয়েস কাস্টমাইজেশন");
  return out;
}

function toPublicPlan(plan) {
  const p = plan.toObject ? plan.toObject() : plan;
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
    highlights: buildHighlights(p),
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
