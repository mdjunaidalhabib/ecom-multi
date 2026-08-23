import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import User from "../../models/User.js";
import Shop from "../../models/Shop.js";
import { runWithShopId } from "../../tenancy/shopContext.js";
import { resolveShopByDomain } from "../../tenancy/publicShopResolver.js";

const router = express.Router();

/**
 * 🔹 resolveTrustedOrigin
 * Login flow কোথা থেকে শুরু হয়েছে (platform-এর নিজস্ব ডোমেইন, নাকি কোনো
 * শপের custom domain) সেটা resolve করে, যাতে login শেষে ঠিক সেই origin-এই
 * ফেরত পাঠানো যায়। এটাই একমাত্র জায়গা যেখানে redirect target ঠিক হয়,
 * তাই open-redirect ঠেকাতে শুধু দুই ধরনের trusted origin-ই ফেরত দেয়:
 *
 *   1. platform-এর নিজস্ব fixed domain (CLIENT_URLS env, ছোট static list —
 *      main site/admin panel, শপ-count বাড়লেও এটা বদলায় না)
 *   2. request যে শপের context-এ resolve হয়েছে, ঠিক তারই registered/verified
 *      domain (DB-driven, তাই ১০০/২০০+ শপে নতুন custom domain যোগ হলেও
 *      কোনো env/deploy change লাগে না)
 *
 * অন্য যেকোনো hostname (attacker-controlled বা ভুল) ফাঁকা string ফেরত পায়,
 * যাতে caller নিরাপদে platform-এর default origin-এ fallback করতে পারে।
 */
function resolveTrustedOrigin(hostname, shop) {
  const normalizedHost = (hostname || "")
    .toString()
    .toLowerCase()
    .replace(/^www\./, "")
    .split(":")[0]
    .trim();

  if (!normalizedHost) return "";

  const platformUrls = (process.env.CLIENT_URLS || "")
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean);

  const matchedPlatformUrl = platformUrls.find((u) => {
    try {
      return new URL(u).hostname.toLowerCase().replace(/^www\./, "") === normalizedHost;
    } catch {
      return false;
    }
  });
  if (matchedPlatformUrl) return matchedPlatformUrl;

  // ✅ resolveShopByDomain-এর মতোই, production-এ DNS ownership প্রমাণিত
  // (verified) ডোমেইনকেই trust করা হয় — নাহলে যেকোনো শপ admin panel-এ
  // অনভেরিফাইড কোনো ডোমেইন বসিয়ে সেখানে redirect পাওয়ার সুযোগ পেয়ে যেত।
  const isDev = process.env.NODE_ENV !== "production";
  const domainVerified = shop?.domain && (isDev || shop.domainStatus === "verified");
  if (domainVerified && shop.domain.toLowerCase() === normalizedHost) {
    return `https://${shop.domain}`;
  }

  return "";
}

// 🔹 JWT Middleware
function authenticateJWT(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "Missing token" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = payload;
    next();
  });
}

// 🔹 Google Login (redirect + কোন শপ থেকে লগইন শুরু হয়েছে, দুটোই state এ carry করা হচ্ছে)
// ⚠️ এই রুট backend-এর নিজের ডোমেইনে হিট হয়, কাস্টমারের শপ-ডোমেইনে না — তবে
// এই প্রাথমিক request-টা frontend প্রক্সির মাধ্যমেই আসে (/api/auth/google),
// তাই x-shop-slug/x-shop-domain হেডার তখনও ঠিকই ভ্যালিড শপ বহন করে (অন্য
// সব public রুটের মতোই resolveShopByDomain দিয়ে resolve করা যায়)। শুধু
// callback-এ (Google সরাসরি backend-এ হিট করে) এই হেডার আর কাজে দেয় না —
// তাই শপের id state-এ carry করে callback-এ ব্যবহার করা হচ্ছে।
router.get("/google", resolveShopByDomain, (req, res, next) => {
  if (!passport._strategy("google")) {
    return res.status(503).json({
      error:
        "Google login এই সার্ভারে কনফিগার করা নেই (GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET/AUTH_API_URL সেট করুন)।",
    });
  }

  const redirect = req.query.redirect || "/";

  // ✅ কাস্টমার আসলে কোন origin থেকে লগইন শুরু করেছে (path-based platform
  // domain, নাকি কোনো শপের custom domain) সেটা x-shop-domain হেডারে থাকে
  // (frontend middleware সবসময় এটা বসায়)। resolveTrustedOrigin দিয়ে
  // ভ্যালিডেট করে state-এ carry করা হচ্ছে, যাতে callback শেষে ঠিক এই
  // origin-এই ফেরত পাঠানো যায় — resolveShopByDomain এর মাধ্যমে req.shop
  // ইতিমধ্যে resolve হয়ে গেছে বলে শপের custom domain সরাসরি trust করা যায়।
  const requestHost = req.headers["x-shop-domain"] || "";
  const originForState = resolveTrustedOrigin(requestHost, req.shop);

  const statePayload = JSON.stringify({
    r: redirect,
    s: req.shopId.toString(),
    c: originForState,
  });

  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
    state: encodeURIComponent(statePayload),
  })(req, res, next);
});

// 🔹 Google Callback (✅ শুধুমাত্র একবার)
router.get(
  "/google/callback",
  // ✅ passport strategy চালানোর আগে state থেকে শপ resolve করে
  // AsyncLocalStorage context বসিয়ে দেওয়া হচ্ছে, যাতে passport.js এর
  // ভেতরের User.findOne/User.create automatically সঠিক শপে scope হয়
  async (req, res, next) => {
    let redirect = "/";
    let shopId = "";
    let stateClientUrl = "";

    try {
      const parsed = JSON.parse(decodeURIComponent(req.query.state || ""));
      redirect = parsed.r || "/";
      shopId = parsed.s || "";
      stateClientUrl = parsed.c || "";
    } catch {
      // malformed/missing state — নিচে shop না পেলে এমনিতেই 400 দেবে
    }

    if (!shopId) {
      return res
        .status(400)
        .json({ error: "শপ শনাক্ত করা যায়নি (missing shop info in state)" });
    }

    const shop = await Shop.findById(shopId);
    if (!shop || shop.status === "suspended") {
      return res.status(404).json({ error: "শপ খুঁজে পাওয়া যায়নি" });
    }

    req._loginRedirect = redirect;
    req._loginShopId = shop._id;
    req._loginShop = shop;
    req._loginClientUrl = stateClientUrl;

    return runWithShopId(shop._id, () => {
      passport.authenticate("google", {
        session: false,
        failureRedirect: "/login",
      })(req, res, next);
    });
  },
  (req, res) => {
    const { token, user } = req.user;

    const platformUrls = (process.env.CLIENT_URLS || "")
      .split(",")
      .map((u) => u.trim())
      .filter(Boolean);
    if (!platformUrls.length) {
      return res.status(500).json({
        error: "CLIENT_URLS is not set in environment variables",
      });
    }

    // ✅ state-এ carry করা origin আবার resolveTrustedOrigin দিয়ে re-validate
    // করা হচ্ছে (state query param হওয়ায় client-side থেকে tamper করা সম্ভব,
    // তাই আগে থেকে trust করা যায় না) — resolved শপের registered domain বা
    // platform-এর নিজস্ব domain হলেই সেখানে ফেরত পাঠানো হবে, নাহলে (tamper/
    // missing) platform-এর প্রথম entry-তে fallback।
    let stateHostname = "";
    try {
      stateHostname = req._loginClientUrl ? new URL(req._loginClientUrl).hostname : "";
    } catch {
      // malformed — নিচে fallback হবে
    }
    const trustedOrigin = resolveTrustedOrigin(stateHostname, req._loginShop);
    const clientUrl = trustedOrigin || platformUrls[0];

    let redirect = req._loginRedirect || "/";

    // ✅ Safety net: কেউ যদি ভুলবশত/পুরনো link থেকে পুরো URL (origin সহ) পাঠায়,
    // সেখান থেকে শুধু path+search বের করে নেওয়া হচ্ছে। নাহলে cartvan.com এবং
    // www.cartvan.com এর মধ্যে redirect হলে localStorage token হারিয়ে যায়।
    if (/^https?:\/\//i.test(redirect)) {
      try {
        const parsed = new URL(redirect);
        redirect = parsed.pathname + parsed.search;
      } catch {
        redirect = "/";
      }
    }

    // সবসময় /auth/callback এ পাঠানো হবে
    res.redirect(
      `${clientUrl}/auth/callback?token=${token}&redirect=${encodeURIComponent(
        redirect
      )}`
    );
  }
);

// 🔹 Current User (protected)
// ⚠️ /auth পুরোটাই resolveShopByDomain-এর আগে mount করা (google callback-এর
// জন্য বাইপাস দরকার ছিল), তাই এই রুটে আলাদাভাবে resolveShopByDomain বসিয়ে
// req.shopId পাওয়া হচ্ছে — নাহলে token-এর shopId ভ্যালিডেট করার কিছু থাকে না,
// আর একটা শপের token অন্য যেকোনো শপে "logged in" দেখিয়ে দিত (User মডেল
// per-shop identity, দেখুন models/User.js)।
router.get("/me", authenticateJWT, resolveShopByDomain, async (req, res) => {
  try {
    if (String(req.user.shopId || "") !== String(req.shopId)) {
      return res.status(401).json({ error: "এই শপে এই সেশন বৈধ নয়" });
    }

    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
