import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import passport from "passport";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import dbConnect from "./src/lib/db.js";
import { configurePassport } from "./src/auth/passport.js";
import createSuperAdmin from "./src/config/createSuperAdmin.js";

import publicRoutes from "./src/routes/public/index.js";
import adminRoutes from "./src/routes/admin/index.js";
import { purgeExpiredTrash } from "./utils/trash/trash.helpers.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const isProd = process.env.NODE_ENV === "production";

// ✅ Required environment validation
const requiredEnv = ["MONGO_URI", "JWT_SECRET"];
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
const rateLimitStore = new Map();
const RATE_LIMIT_CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

const rateLimit = ({ windowMs = 15 * 60 * 1000, limit = 300 } = {}) => {
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetAt <= now) rateLimitStore.delete(key);
    }
  }, RATE_LIMIT_CLEANUP_INTERVAL_MS);
  cleanupTimer.unref?.(); // process বন্ধ হতে বাধা দেবে না

  return (req, res, next) => {
    const key = req.ip || req.headers["x-forwarded-for"] || "unknown";
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

// ✅ CORS allow list
const allowedOrigins = (process.env.CLIENT_URLS || "")
  .split(",")
  .map(normalize)
  .filter(Boolean);

if (!isProd) console.log("✅ Allowed CORS Origins:", allowedOrigins);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // allow Postman/curl

      const normalizedOrigin = normalize(origin);
      if (allowedOrigins.includes(normalizedOrigin)) {
        return cb(null, true);
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
