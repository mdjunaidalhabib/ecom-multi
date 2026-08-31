import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import passport from "passport";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import compression from "compression";

import dbConnect from "./src/lib/db.js";
import { configurePassport } from "./src/auth/passport.js";
import createSuperAdmin from "./src/config/createSuperAdmin.js";

import publicRoutes from "./src/routes/public/index.js";
import adminRoutes from "./src/routes/admin/index.js";
import { isKnownShopDomain } from "./src/tenancy/publicShopResolver.js";
import { purgeExpiredTrash } from "./utils/trash/trash.helpers.js";
import { autoSuspendExpiredShops } from "./utils/shop/shopAutoSuspend.helpers.js";
import invoiceExportService from "./src/services/invoiceExportService.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const isProd = process.env.NODE_ENV === "production";

// ✅ Required environment validation
const requiredEnv = ["MONGO_URI", "DB_NAME", "JWT_SECRET"];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length) {
  console.error(`❌ Missing required environment variables: ${missingEnv.join(", ")}`);
  process.exit(1);
}

// ✅ Small built-in rate limiter, avoids adding another runtime dependency
//
// 🔥 FIX (memory leak): আগে rateLimitStore Map-এ প্রতিটা নতুন IP-এর entry
// যোগ হতো কিন্তু কখনো মুছত না — সময়ের সাথে এই Map অসীম বড় হতে থাকতো এবং
// সার্ভারের RAM শেষ করে ফেলতো (বিশেষ করে অনেক শপ/ভিজিটর একসাথে চললে)।
// এখন প্রতি ৫ মিনিটে expired entry গুলো (যাদের resetAt সময় পার হয়ে গেছে)
// clean up করা হয়, তাই Map-এর সাইজ সবসময় "গত windowMs সময়ে সক্রিয় IP"
// সংখ্যার কাছাকাছি বাউন্ডেড থাকে।
//
// 🔥 FIX (admin panel মাঝপথে "আটকে" যাওয়া — মেনু/ডাটা হারিয়ে যায়, রিফ্রেশ/
// হার্ড রিফ্রেশ/লগআউট কোনোটাই কাজ করে না):
// আগে এই limiter পুরো অ্যাপের প্রতিটা request-কে (login, logout, session
// check, dashboard-এর প্রতিটা ছোট API কল — সব) একই ভাগে ফেলত এবং শুধু IP
// দিয়ে count করত (windowMs=15min, limit=300)। Admin dashboard নিজে থেকেই
// অনেক request পাঠায় (AdminSessionGuard প্রতি ১০ সেকেন্ডে "/admin/me" পোল
// করে, Header প্রতিটা পেজে "/admin/verify" + "/admin/my-features" কল করে,
// এর উপর সব লিস্ট/উইজেট আলাদা API) — তার উপর একই অফিস/দোকানের একাধিক
// staff একই IP (NAT/router) থেকে অ্যাক্সেস করলে ১৫ মিনিটের মধ্যেই সেই
// একটামাত্র shared bucket ৩০০ ছাড়িয়ে যায়। এরপর সেই IP-এর প্রতিটা request
// (নতুন পেজ লোড, রিফ্রেশ, এমনকি /admin/logout পর্যন্ত) 429 পেতে থাকে,
// যতক্ষণ না ১৫ মিনিটের window শেষ হয় — ঠিক এই উপসর্গটাই রিপোর্ট করা
// হয়েছিল (মেনু/ডাটা হারানো, রিফ্রেশ/হার্ড রিফ্রেশ/লগআউট কিছুই কাজ না করা)।
//
// সমাধান:
//   ১) সেশন-ক্রিটিক্যাল রুট (login/logout/verify/me) কে rate limit থেকে
//      সম্পূর্ণ বাদ দেওয়া হলো — এই রুটগুলো যেন কখনোই ব্লক না হয়, ব্যবহারকারী
//      যেন সবসময় লগআউট করতে পারে বা সেশন-চেক কাজ করে।
//   ২) লগইন করা admin/staff-দের জন্য key এখন IP-এর বদলে তাদের admin_token
//      কুকি (per-session) দিয়ে করা হচ্ছে — তাই একই অফিসের একাধিক
//      admin/staff একে অপরের quota শেয়ার করবে না। লগইন-বিহীন (public
//      storefront) ট্রাফিকের জন্য এখনও IP-ভিত্তিক limit প্রযোজ্য।
//   ৩) admin panel-এর স্বাভাবিক ব্যবহারে (অনেকগুলো ছোট API কল + পোলিং)
//      যথেষ্ট headroom দিতে limit ৩০০ থেকে বাড়িয়ে ১২০০/১৫মিনিট করা হলো।
const rateLimitStore = new Map();
const RATE_LIMIT_CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

// এই path গুলোতে rate limit কখনো প্রযোজ্য হবে না — সেশন সবসময় pull/kill
// করা যাওয়া উচিত, ভুল করে "silently locked out" অবস্থা যেন তৈরি না হয়।
const RATE_LIMIT_EXEMPT_PATHS = new Set([
  "/admin/login",
  "/admin/super-login",
  "/admin/logout",
  "/admin/verify",
  "/admin/me",
]);

const rateLimit = ({ windowMs = 15 * 60 * 1000, limit = 1200 } = {}) => {
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetAt <= now) rateLimitStore.delete(key);
    }
  }, RATE_LIMIT_CLEANUP_INTERVAL_MS);
  cleanupTimer.unref?.(); // process বন্ধ হতে বাধা দেবে না

  return (req, res, next) => {
    // সেশন-ক্রিটিক্যাল রুট — কোনো অবস্থাতেই ব্লক না করে সরাসরি পাস করাও।
    if (RATE_LIMIT_EXEMPT_PATHS.has(req.path)) {
      return next();
    }

    // লগইন করা থাকলে per-admin-session key (cookie), নাহলে per-IP fallback —
    // যাতে একই IP/office-এর ভিন্ন ভিন্ন admin/staff একে অপরের quota শেয়ার না
    // করে ("x-forwarded-for" এ প্রক্সি চেইনে একাধিক IP কমা দিয়ে আসতে পারে,
    // তাই প্রথমটা নেওয়া হচ্ছে)।
    const forwardedIp = (req.headers["x-forwarded-for"] || "")
      .split(",")[0]
      ?.trim();
    const ip = req.ip || forwardedIp || "unknown";
    const sessionToken = req.cookies?.admin_token;
    const key = sessionToken ? `session:${sessionToken}` : `ip:${ip}`;

    const now = Date.now();
    const current = rateLimitStore.get(key) || { count: 0, resetAt: now + windowMs };

    if (current.resetAt <= now) {
      current.count = 0;
      current.resetAt = now + windowMs;
    }

    current.count += 1;
    rateLimitStore.set(key, current);

    res.setHeader("X-RateLimit-Limit", String(limit));
    res.setHeader("X-RateLimit-Remaining", String(Math.max(0, limit - current.count)));

    if (current.count > limit) {
      return res.status(429).json({ message: "Too many requests. Please try again later." });
    }

    next();
  };
};

// ✅ trust nginx / proxy for secure cookies
app.set("trust proxy", 1);

app.use(compression());
app.use(cookieParser());
app.use(rateLimit());

// ✅ Helmet
app.use(
  helmet({
    contentSecurityPolicy: isProd ? undefined : false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// ✅ normalize helper
const normalize = (url = "") => url.replace(/\/$/, "").trim();

// ✅ CORS allow list — শুধু platform-এর নিজস্ব (fixed, ছোট সংখ্যক) domain,
// যেমন main site/admin panel। শপগুলোর custom domain এখানে বসাতে হয় না —
// নিচে dynamic check DB থেকে সেটা resolve করে (দেখুন isKnownShopDomain)।
const allowedOrigins = (process.env.CLIENT_URLS || "")
  .split(",")
  .map(normalize)
  .filter(Boolean);

if (!isProd) console.log("✅ Allowed CORS Origins:", allowedOrigins);

app.use(
  cors({
    origin: async (origin, cb) => {
      if (!origin) return cb(null, true); // allow Postman/curl

      const normalizedOrigin = normalize(origin);
      if (allowedOrigins.includes(normalizedOrigin)) {
        return cb(null, true);
      }

      // 🔥 FIX (SaaS scaling): আগে প্রতিটা শপের custom domain এই
      // static allow-list-এ ম্যানুয়ালি যোগ করে redeploy করতে হতো —
      // ১০০/২০০+ শপে এটা টেকসই না। এখন origin কোনো registered, active
      // শপের custom domain কিনা সেটা DB (cache-সহ) থেকে চেক করা হয়,
      // তাই নতুন শপ/domain যোগ হলে কোনো env/deploy change ছাড়াই কাজ করে।
      try {
        const hostname = new URL(origin).hostname;
        if (await isKnownShopDomain(hostname)) {
          return cb(null, true);
        }
      } catch {
        // malformed origin header — নিচে reject হবে
      }

      if (!isProd) console.log("❌ Blocked by CORS Origin:", origin);
      return cb(new Error(`Not allowed by CORS: ${origin}`), false);
    },
    credentials: true, // ✅ allow cookies
    exposedHeaders: ["Content-Disposition"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-shop-domain", // ✅ customer-facing frontend পাঠাবে, কোন শপ resolve করতে হবে
      "x-active-shop-id", // ✅ admin panel পাঠাবে, superadmin কোন শপ দেখছে
    ],
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

configurePassport();
app.use(passport.initialize());

// ✅ Infrastructure routes must bypass tenant/domain resolution.
app.get("/", (req, res) => res.send("✅ API is running..."));
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "✅ cartvan api is running",
    timestamp: new Date().toISOString(),
  });
});
app.use("/uploads", express.static("uploads"));
app.use(express.static("public"));

// ✅ Admin APIs are global platform APIs. They must be mounted BEFORE the
// public tenant router, otherwise publicShopResolver tries to find a shop for
// /admin/super-login and blocks Super Admin login on non-shop domains.
app.use("/admin", adminRoutes);

// Prevent an unknown /admin/* request from falling through to the public
// domain resolver and returning a misleading "shop not found" response.
app.use("/admin", (req, res) => {
  res.status(404).json({ message: "Admin route not found" });
});

// ✅ Customer-facing APIs are tenant scoped and resolve the shop by domain.
app.use("/", publicRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Uncaught error:", err);
  res.status(500).json({
    error: "Internal server error",
    details: isProd ? undefined : String(err),
  });
});

let server;

const startServer = async () => {
  try {
    await dbConnect(process.env.MONGO_URI);
    await createSuperAdmin();

    // ✅ Trash auto-purge: 3 দিনের পুরনো item গুলো boot এ একবার,
    // তারপর প্রতি ঘন্টায় check করে permanently delete করবে
    purgeExpiredTrash();
    setInterval(purgeExpiredTrash, 60 * 60 * 1000);

    // ✅ Plan-expiry auto-suspend: বুট-এ একবার, তারপর প্রতি ঘন্টায়
    autoSuspendExpiredShops();
    setInterval(autoSuspendExpiredShops, 60 * 60 * 1000);

    server = app.listen(PORT, "0.0.0.0", () =>
      console.log(`🚀 Backend running on port ${PORT}`)
    );
  } catch (err) {
    console.error("❌ Failed to connect DB:", err);
    process.exit(1);
  }
};

startServer();

/**
 * 🔥 FIX (graceful shutdown): PM2 দিয়ে restart/deploy/scale করার সময় বা
 * সার্ভার crash হলে, আগে process সাথে সাথে kill হয়ে যেত — যেসব request
 * তখন চলছিল সেগুলো mid-air-এ drop হতো, আর MongoDB connection ও নোংরাভাবে
 * বন্ধ হতো। এখন SIGTERM/SIGINT পেলে প্রথমে নতুন connection নেওয়া বন্ধ করে,
 * চলমান request গুলো শেষ হওয়া পর্যন্ত অপেক্ষা করে, তারপর DB connection
 * বন্ধ করে exit করে। PM2 cluster mode-এ প্রতিটা worker-কে এভাবেই
 * gracefully restart করা হয় বলে zero-downtime deploy সম্ভব হয়।
 */
const shutdown = (signal) => {
  console.log(`\n🛑 ${signal} received, shutting down gracefully...`);

  if (!server) process.exit(0);

  // নতুন কানেকশন আর নেবে না, কিন্তু চলমান request শেষ হতে দেবে
  server.close(async (err) => {
    if (err) {
      console.error("❌ Error while closing HTTP server:", err);
    }
    try {
      await invoiceExportService.close();
      const mongoose = (await import("mongoose")).default;
      await mongoose.connection.close(false);
      console.log("✅ MongoDB connection closed. Bye 👋");
    } catch (closeErr) {
      console.error("❌ Error while closing MongoDB connection:", closeErr);
    } finally {
      process.exit(err ? 1 : 0);
    }
  });

  // কোনো request যদি আটকে থেকে যায় (hang), ১০ সেকেন্ড পর জোর করে exit —
  // নাহলে PM2/Docker অনন্তকাল অপেক্ষা করতে থাকবে
  setTimeout(() => {
    console.error("⚠️ Forced shutdown after 10s timeout");
    process.exit(1);
  }, 10_000).unref();
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// অপ্রত্যাশিত error-এ process চুপচাপ hang বা করাপ্ট state-এ থাকার বদলে
// লগ করে গ্রেসফুলভাবে বন্ধ হবে — PM2 সাথে সাথে fresh process চালু করবে
process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Promise Rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  shutdown("uncaughtException");
});

export default app;
