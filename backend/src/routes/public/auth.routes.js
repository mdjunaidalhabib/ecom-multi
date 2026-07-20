import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import User from "../../models/User.js";
import Shop from "../../models/Shop.js";
import { runWithShopId } from "../../tenancy/shopContext.js";

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
// ⚠️ এই রুট backend-এর নিজের ডোমেইনে হিট হয়, কাস্টমারের শপ-ডোমেইনে না — তাই
// শপ domain resolve করার জন্য Host header এর বদলে frontend থেকে পাঠানো
// ?shopDomain= query param ব্যবহার করা হচ্ছে।
router.get("/google", (req, res, next) => {
  if (!passport._strategy("google")) {
    return res.status(503).json({
      error:
        "Google login এই সার্ভারে কনফিগার করা নেই (GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET/AUTH_API_URL সেট করুন)।",
    });
  }

  const redirect = req.query.redirect || "/";
  const shopDomain = (req.query.shopDomain || "")
    .toString()
    .toLowerCase()
    .replace(/^www\./, "")
    .split(":")[0]
    .trim();

  const statePayload = JSON.stringify({ r: redirect, d: shopDomain });

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
    let shopDomain = "";

    try {
      const parsed = JSON.parse(decodeURIComponent(req.query.state || ""));
      redirect = parsed.r || "/";
      shopDomain = (parsed.d || "").toLowerCase();
    } catch {
      // malformed/missing state — নিচে shop না পেলে এমনিতেই 400 দেবে
    }

    if (!shopDomain) {
      return res
        .status(400)
        .json({ error: "শপ শনাক্ত করা যায়নি (missing shop info in state)" });
    }

    const shop = await Shop.findOne({ domain: shopDomain });
    if (!shop || shop.status === "suspended") {
      return res.status(404).json({ error: "শপ খুঁজে পাওয়া যায়নি" });
    }

    req._loginRedirect = redirect;
    req._loginShopId = shop._id;

    return runWithShopId(shop._id, () => {
      passport.authenticate("google", {
        session: false,
        failureRedirect: "/login",
      })(req, res, next);
    });
  },
  (req, res) => {
    const { token, user } = req.user;

    // ✅ CLIENT_URLS থেকে প্রথম client url নিবে
    const clientUrls = process.env.CLIENT_URLS;
    if (!clientUrls) {
      return res.status(500).json({
        error: "CLIENT_URLS is not set in environment variables",
      });
    }
    const clientUrl = clientUrls.split(",")[0].trim();

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
router.get("/me", authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
