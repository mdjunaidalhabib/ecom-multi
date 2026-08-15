import Plan, { listActivePlans } from "../../src/models/Plan.js";
import Shop from "../../src/models/Shop.js";

const THEME_KEYS = ["classic", "aurora", "terra"];
const BOOLEAN_KEYS = [
  "customDomain",
  "analytics",
  "promo",
  "payment",
  "landingPages",
  "fullStorefront",
];
const NUMBER_KEYS = ["maxProducts", "maxAdmins"];

function normalizeKey(value = "") {
  return value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function generateUniqueKey(name) {
  const base = normalizeKey(name) || "plan";
  let key = base;
  let counter = 1;

  // eslint-disable-next-line no-await-in-loop
  while (await Plan.findOne({ key })) {
    counter += 1;
    key = `${base}-${counter}`;
  }

  return key;
}

function parseFeatures(input = {}) {
  const features = {};
  for (const key of BOOLEAN_KEYS) {
    if (input[key] !== undefined) features[key] = !!input[key];
  }
  return features;
}

function parseLimits(input = {}) {
  const limits = {};
  for (const key of NUMBER_KEYS) {
    if (input[key] === undefined) continue;
    const num = Number(input[key]);
    if (!Number.isFinite(num) || num < 0) {
      throw new Error(`${key}-এর জন্য অবৈধ মান`);
    }
    limits[key] = Math.floor(num);
  }
  return limits;
}

/* -------------------------------------------------------
   GET /admin/plans — সব plan (super-admin এবং shop-admin/staff দুজনেই
   দেখতে পারে — shop-admin এর নিজের "My Plan" পেজে upgrade dropdown এবং
   super-admin এর plan-requests review পেজে লেবেল দেখাতে দরকার হয়)

   ✅ super-admin সবসময় সব plan দেখে (visible/hidden নির্বিশেষে, ম্যানেজ
   করার জন্য)। shop-admin/staff শুধু isVisible:true plan-গুলো দেখে —
   তবে তাদের শপ ইতিমধ্যে যে plan-এ আছে সেটা hidden হয়ে গেলেও লিস্টে থাকবে,
   নাহলে "বর্তমান প্ল্যান" কার্ডেই সেই প্ল্যানের নাম resolve করা যেত না।
------------------------------------------------------- */
export const listPlans = async (req, res) => {
  try {
    const plans = await listActivePlans();

    if (req.admin?.role === "superadmin") {
      return res.json(plans);
    }

    const myShops = await Shop.find({ _id: { $in: req.admin?.shops || [] } })
      .select("plan")
      .lean();
    const myPlanKeys = new Set(myShops.map((s) => s.plan));

    const visiblePlans = plans.filter(
      (p) => p.isVisible !== false || myPlanKeys.has(p.key),
    );
    return res.json(visiblePlans);
  } catch (err) {
    console.error("listPlans error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* -------------------------------------------------------
   POST /admin/plans — নতুন plan তৈরি (super-admin only)
------------------------------------------------------- */
export const createPlan = async (req, res) => {
  try {
    const { name, tagline, theme, features, limits, isVisible } = req.body || {};
    const trimmedName = (name || "").toString().trim();
    if (!trimmedName) {
      return res.status(400).json({ message: "প্ল্যানের নাম প্রয়োজন" });
    }

    if (theme !== undefined && !THEME_KEYS.includes(theme)) {
      return res.status(400).json({ message: `অবৈধ theme: ${theme}` });
    }

    let parsedLimits;
    try {
      parsedLimits = parseLimits(limits);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    const key = await generateUniqueKey(trimmedName);
    const lastPlan = await Plan.findOne({}).sort({ order: -1 }).select("order");

    const plan = await Plan.create({
      key,
      name: trimmedName,
      tagline: tagline ? String(tagline).trim().slice(0, 200) : "",
      order: (lastPlan?.order ?? -1) + 1,
      theme: theme || "classic",
      isVisible: isVisible !== false,
      features: { fullStorefront: true, ...parseFeatures(features) },
      limits: { maxProducts: 50, maxAdmins: 1, ...parsedLimits },
    });

    return res.status(201).json(plan);
  } catch (err) {
    console.error("createPlan error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

/* -------------------------------------------------------
   PATCH /admin/plans/:id — plan আপডেট (super-admin only)
   key immutable — নাম/ট্যাগলাইন/থিম/ফিচার/লিমিট/order বদলানো যায়
------------------------------------------------------- */
export const updatePlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const { name, tagline, theme, order, features, limits, isVisible } = req.body || {};

    if (isVisible !== undefined) {
      plan.isVisible = !!isVisible;
    }

    if (name !== undefined) {
      const trimmedName = String(name).trim();
      if (!trimmedName) {
        return res.status(400).json({ message: "প্ল্যানের নাম খালি রাখা যাবে না" });
      }
      plan.name = trimmedName;
    }

    if (tagline !== undefined) {
      plan.tagline = String(tagline).trim().slice(0, 200);
    }

    if (theme !== undefined) {
      if (!THEME_KEYS.includes(theme)) {
        return res.status(400).json({ message: `অবৈধ theme: ${theme}` });
      }
      plan.theme = theme;
    }

    if (order !== undefined) {
      const num = Number(order);
      if (Number.isFinite(num)) plan.order = num;
    }

    if (features && typeof features === "object") {
      Object.assign(plan.features, parseFeatures(features));
    }

    if (limits && typeof limits === "object") {
      try {
        Object.assign(plan.limits, parseLimits(limits));
      } catch (err) {
        return res.status(400).json({ message: err.message });
      }
    }

    await plan.save();
    return res.json(plan);
  } catch (err) {
    console.error("updatePlan error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

/* -------------------------------------------------------
   DELETE /admin/plans/:id — plan ডিলিট (super-admin only)
   ব্লক করা হয়: (ক) কোনো শপ এখনও এই plan-এ থাকলে, (খ) এটাই শেষ plan হলে
------------------------------------------------------- */
export const deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const totalPlans = await Plan.estimatedDocumentCount();
    if (totalPlans <= 1) {
      return res
        .status(400)
        .json({ message: "সর্বশেষ প্ল্যান ডিলিট করা যাবে না — অন্তত একটি প্ল্যান থাকতেই হবে।" });
    }

    const shopsOnPlan = await Shop.countDocuments({ plan: plan.key });

    if (shopsOnPlan > 0) {
      return res.status(400).json({
        message: `${shopsOnPlan}টি শপ এখনও এই প্ল্যানে আছে — আগে সেগুলোকে অন্য প্ল্যানে সরিয়ে নিন।`,
      });
    }

    await plan.deleteOne();
    return res.json({ message: "প্ল্যান ডিলিট হয়েছে" });
  } catch (err) {
    console.error("deletePlan error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};
