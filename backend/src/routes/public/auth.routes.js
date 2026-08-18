import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import User from "../../models/User.js";
import Shop from "../../models/Shop.js";
import { runWithShopId } from "../../tenancy/shopContext.js";
import { resolveShopByDomain } from "../../tenancy/publicShopResolver.js";

const router = express.Router();

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
  // (frontend middleware সবসময় এটা বসায়)। CLIENT_URLS (CORS allow-list)
  // এর বিপরীতে মিলিয়ে নেওয়া হচ্ছে, যাতে callback শেষে ঠিক এই origin-এই
  // ফেরত পাঠানো যায় — নাহলে সবসময় CLIENT_URLS-এর প্রথম entry-তে চলে যেত।
  const clientUrls = (process.env.CLIENT_URLS || "")
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean);
  const requestHost = (req.headers["x-shop-domain"] || "").toString().toLowerCase().trim();
  const matchedClientUrl = clientUrls.find((u) => {
    try {
      return new URL(u).host.toLowerCase() === requestHost;
    } catch {
      return false;
    }
  });

  const statePayload = JSON.stringify({
    r: redirect,
    s: req.shopId.toString(),
    c: matchedClientUrl || "",
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

    const clientUrls = process.env.CLIENT_URLS;
    if (!clientUrls) {
      return res.status(500).json({
        error: "CLIENT_URLS is not set in environment variables",
      });
    }
    // ✅ state-এ carry করা origin CLIENT_URLS allow-list-এর মধ্যে থাকলে
    // (অর্থাৎ কাস্টমার যেখান থেকে লগইন শুরু করেছিল) সেখানেই ফেরত পাঠানো
    // হবে — নাহলে (state tamper/missing) আগের মতোই প্রথম entry-তে fallback।
    const allowedClientUrls = clientUrls
      .split(",")
      .map((u) => u.trim())
      .filter(Boolean);
    const clientUrl = allowedClientUrls.includes(req._loginClientUrl)
      ? req._loginClientUrl
      : allowedClientUrls[0];

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
