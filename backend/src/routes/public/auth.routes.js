import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
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

/**
 * 🔹 getPlatformUrls — CLIENT_URLS env থেকে platform-এর নিজস্ব origin list।
 */
function getPlatformUrls() {
  return (process.env.CLIENT_URLS || "")
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean);
}

/**
 * 🔹 resolveClientOrigin
 * state-এ carry করা origin আবার resolveTrustedOrigin দিয়ে re-validate করে
 * (state query param হওয়ায় client-side থেকে tamper করা সম্ভব, তাই আগে থেকে
 * trust করা যায় না) — resolved শপের registered domain বা platform-এর নিজস্ব
 * domain হলেই সেটা ব্যবহার হবে, নাহলে platform-এর প্রথম entry-তে fallback।
 */
function resolveClientOrigin(stateClientUrl, shop) {
  let stateHostname = "";
  try {
    stateHostname = stateClientUrl ? new URL(stateClientUrl).hostname : "";
  } catch {
    // malformed — নিচে fallback হবে
  }
  return resolveTrustedOrigin(stateHostname, shop) || getPlatformUrls()[0] || "";
}

/**
 * 🔹 sanitizeRedirectPath
 * Safety net: কেউ যদি ভুলবশত/পুরনো link থেকে পুরো URL (origin সহ) পাঠায়,
 * সেখান থেকে শুধু path+search বের করে নেওয়া হচ্ছে। নাহলে cartvan.com এবং
 * www.cartvan.com এর মধ্যে redirect হলে localStorage token হারিয়ে যায়।
 */
function sanitizeRedirectPath(redirect) {
  let path = redirect || "/";
  if (/^https?:\/\//i.test(path)) {
    try {
      const parsed = new URL(path);
      path = parsed.pathname + parsed.search;
    } catch {
      path = "/";
    }
  }
  // protocol-relative (//evil.com) ও open-redirect, তাই সেটাও ছেঁটে ফেলা হচ্ছে
  if (!path.startsWith("/") || path.startsWith("//")) path = "/";

  // ✅ আগের কোনো বাতিল হওয়া লগইনের ?login=... ছেঁটে ফেলা হচ্ছে। navbar-এর
  // Login বাটন redirect হিসেবে window.location.search সহ পুরো path পাঠায়,
  // তাই এটা না মুছলে বারবার cancel করলে ?login=cancelled&login=cancelled…
  // জমতে থাকতো।
  const [pathname, search = ""] = path.split("?");
  if (!search) return pathname;
  const params = new URLSearchParams(search);
  params.delete("login");
  const rest = params.toString();
  return rest ? `${pathname}?${rest}` : pathname;
}

/**
 * 🔹 buildAbortRedirect
 * ⚠️ ইউজার Google-এর consent স্ক্রিনে "Cancel" চাপলে (বা passport যেকোনো
 * কারণে fail করলে) তাকে যেখান থেকে লগইন শুরু করেছিল ঠিক সেই পেজেই ফেরত
 * পাঠানো হয়। আগে এখানে relative "/login" ব্যবহার হতো — ব্রাউজার সেটা
 * backend-এর নিজের ডোমেইনে (ecomapi.…/login) resolve করতো, আর সেই রুটে
 * কোনো শপ resolve না হওয়ায় ইউজার raw JSON error দেখতো।
 */
function buildAbortRedirect({ shop, stateClientUrl, redirect, reason }) {
  const origin = resolveClientOrigin(stateClientUrl, shop);
  const path = sanitizeRedirectPath(redirect);
  const sep = path.includes("?") ? "&" : "?";
  return `${origin}${path}${sep}login=${encodeURIComponent(reason)}`;
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

    // ⚠️ ইউজার Google-এর consent স্ক্রিনে "Cancel" চাপলে Google এখানেই
    // ?error=access_denied নিয়ে ফেরত পাঠায় (state অক্ষত থাকে)। এটা কোনো
    // সার্ভার-এরর না, নিছক ইউজারের সিদ্ধান্ত — তাই JSON error না দেখিয়ে
    // যেখান থেকে লগইন শুরু হয়েছিল ঠিক সেই পেজে ফেরত পাঠানো হচ্ছে।
    const oauthError = req.query.error ? String(req.query.error) : "";

    if (!shopId) {
      // state হারিয়ে গেলে শপ জানা যায় না — cancel হলে অন্তত platform-এর
      // হোমপেজে ফেরত, নাহলে আগের মতোই 400।
      if (oauthError) {
        const fallback = getPlatformUrls()[0];
        if (fallback) return res.redirect(fallback);
      }
      return res
        .status(400)
        .json({ error: "শপ শনাক্ত করা যায়নি (missing shop info in state)" });
    }

    const shop = await Shop.findById(shopId);
    if (!shop || shop.status === "suspended") {
      if (oauthError) {
        const fallback = getPlatformUrls()[0];
        if (fallback) return res.redirect(fallback);
      }
      return res.status(404).json({ error: "শপ খুঁজে পাওয়া যায়নি" });
    }

    if (oauthError) {
      return res.redirect(
        buildAbortRedirect({
          shop,
          stateClientUrl,
          redirect,
          reason: oauthError === "access_denied" ? "cancelled" : "failed",
        })
      );
    }

    req._loginRedirect = redirect;
    req._loginShopId = shop._id;
    req._loginShop = shop;
    req._loginClientUrl = stateClientUrl;

    return runWithShopId(shop._id, () => {
      // ⚠️ এখানে failureRedirect: "/login" ব্যবহার করা যাবে না — ওটা relative
      // path, ব্রাউজার সেটা backend-এর নিজের ডোমেইনে (ecomapi.…/login)
      // resolve করে, যেখানে কোনো শপ resolve হয় না বলে ইউজার
      // {"message":"এই ডোমেইনে কোনো শপ খুঁজে পাওয়া যায়নি"} raw JSON দেখতো।
      // তাই custom callback দিয়ে সবসময় trusted client origin-এ ফেরত পাঠানো হয়।
      passport.authenticate("google", { session: false }, (err, data) => {
        if (err || !data) {
          if (err) console.error("❌ Google callback failed:", err);
          return res.redirect(
            buildAbortRedirect({
              shop,
              stateClientUrl,
              redirect,
              reason: "failed",
            })
          );
        }
        req.user = data;
        return next();
      })(req, res, next);
    });
  },
  (req, res) => {
    const { token } = req.user;

    if (!getPlatformUrls().length) {
      return res.status(500).json({
        error: "CLIENT_URLS is not set in environment variables",
      });
    }

    const clientUrl = resolveClientOrigin(req._loginClientUrl, req._loginShop);
    const redirect = sanitizeRedirectPath(req._loginRedirect);

    // সবসময় /auth/callback এ পাঠানো হবে
    res.redirect(
      `${clientUrl}/auth/callback?token=${token}&redirect=${encodeURIComponent(
        redirect
      )}`
    );
  }
);

// ─────────────────────────────────────────────────────────────────────────
// 🔹 ইমেইল + পাসওয়ার্ড (ম্যানুয়াল) Sign up / Login
//
// Google login-এর মতোই User মডেল per-shop identity, তাই এই দুটো রুটেও
// resolveShopByDomain বসানো — সেটাই runWithShopId দিয়ে AsyncLocalStorage-এ
// shopId সেট করে, ফলে User.findOne/create নিজে থেকেই সঠিক শপে scope হয়।
// একই ইমেইল ভিন্ন শপে আলাদা account হতে পারে।
// টোকেনের shape Google flow-এর সাথে হুবহু এক ({ id, email, shopId }, 90d),
// তাই /auth/me, resolveAuthedCustomer ইত্যাদি কিছুই বদলাতে হয়নি।
// ─────────────────────────────────────────────────────────────────────────

const PASSWORD_MIN = 6;
// bcrypt শুধু প্রথম ৭২ বাইটে কাজ করে — এর বেশি দিলে চুপচাপ ছেঁটে যেত।
const PASSWORD_MAX = 72;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// timing-attack ঠেকাতে: ইউজার না থাকলেও একটা bcrypt compare চালানো হয়,
// যাতে "ইমেইল আছে কিনা" রেসপন্স-টাইম দেখে বোঝা না যায়।
const DUMMY_HASH = bcrypt.hashSync("dummy-password-for-timing", 10);

// ছোট in-memory brute-force রোধক: প্রতি (শপ+ইমেইল)-এ ১৫ মিনিটে সর্বোচ্চ ১০ বার
// ভুল চেষ্টা। সফল লগইনে কাউন্টার মুছে যায়। প্রসেস রিস্টার্টে রিসেট হয় —
// একাধিক server instance চালালে Redis-ভিত্তিক limiter লাগবে।
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_FAILS = 10;
const loginFails = new Map();

function loginKey(shopId, email) {
  return `${shopId}:${email}`;
}

function isLoginBlocked(key) {
  const entry = loginFails.get(key);
  if (!entry) return false;
  if (Date.now() > entry.resetAt) {
    loginFails.delete(key);
    return false;
  }
  return entry.count >= LOGIN_MAX_FAILS;
}

function recordLoginFail(key) {
  const now = Date.now();
  const entry = loginFails.get(key);
  if (!entry || now > entry.resetAt) {
    loginFails.set(key, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
  } else {
    entry.count += 1;
  }
  // memory leak ঠেকাতে মাঝে মাঝে মেয়াদোত্তীর্ণ entry সাফ করা
  if (loginFails.size > 5000) {
    for (const [k, v] of loginFails) if (now > v.resetAt) loginFails.delete(k);
  }
}

function signCustomerToken(user, shopId) {
  return jwt.sign(
    { id: user._id, email: user.email, shopId },
    process.env.JWT_SECRET,
    { expiresIn: "90d" }
  );
}

function publicUser(user) {
  const obj = typeof user.toObject === "function" ? user.toObject() : { ...user };
  delete obj.password;
  return obj;
}

router.post("/register", resolveShopByDomain, async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");

    if (!name || name.length > 80) {
      return res.status(400).json({ error: "আপনার নাম দিন (সর্বোচ্চ ৮০ অক্ষর)।" });
    }
    if (!EMAIL_RE.test(email) || email.length > 254) {
      return res.status(400).json({ error: "সঠিক ইমেইল দিন।" });
    }
    if (password.length < PASSWORD_MIN) {
      return res
        .status(400)
        .json({ error: `পাসওয়ার্ড কমপক্ষে ${PASSWORD_MIN} অক্ষরের হতে হবে।` });
    }
    if (Buffer.byteLength(password, "utf8") > PASSWORD_MAX) {
      return res.status(400).json({ error: "পাসওয়ার্ড অনেক বড় হয়ে গেছে।" });
    }

    // ⚠️ এই ইমেইলে (Google বা ম্যানুয়াল যেকোনো) account থাকলে নতুন করে
    // পাসওয়ার্ড বসানো যাবে না — নাহলে অন্যের Google account-এ পাসওয়ার্ড বসিয়ে
    // ঢুকে পড়া যেত।
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        error: "এই ইমেইল দিয়ে আগেই account আছে। Login করুন।",
        code: "EMAIL_EXISTS",
      });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash, avatar: "" });

    return res.status(201).json({
      token: signCustomerToken(user, req.shopId),
      user: publicUser(user),
    });
  } catch (err) {
    // দুটো একসাথে একই ইমেইলে sign up করলে unique index-এ আটকায়
    if (err?.code === 11000) {
      return res.status(409).json({
        error: "এই ইমেইল দিয়ে আগেই account আছে। Login করুন।",
        code: "EMAIL_EXISTS",
      });
    }
    console.error("❌ Register failed:", err);
    return res.status(500).json({ error: "Sign up করা যায়নি, আবার চেষ্টা করুন।" });
  }
});

router.post("/login", resolveShopByDomain, async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");

    if (!email || !password) {
      return res.status(400).json({ error: "ইমেইল ও পাসওয়ার্ড দিন।" });
    }

    const key = loginKey(req.shopId, email);
    if (isLoginBlocked(key)) {
      return res.status(429).json({
        error: "অনেকবার ভুল চেষ্টা হয়েছে। ১৫ মিনিট পরে আবার চেষ্টা করুন।",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    // Google-only account (পাসওয়ার্ড সেট করা নেই) — কাস্টমারকে সঠিক পথ দেখানো হচ্ছে
    if (user && !user.password) {
      return res.status(400).json({
        error: "এই account Google দিয়ে তৈরি। \"Google দিয়ে Login\" বাটন ব্যবহার করুন।",
        code: "GOOGLE_ONLY",
      });
    }

    const ok = await bcrypt.compare(password, user?.password || DUMMY_HASH);
    if (!user || !ok) {
      recordLoginFail(key);
      return res.status(401).json({ error: "ইমেইল বা পাসওয়ার্ড ভুল।" });
    }

    loginFails.delete(key);

    return res.json({
      token: signCustomerToken(user, req.shopId),
      user: publicUser(user),
    });
  } catch (err) {
    console.error("❌ Login failed:", err);
    return res.status(500).json({ error: "Login করা যায়নি, আবার চেষ্টা করুন।" });
  }
});

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
