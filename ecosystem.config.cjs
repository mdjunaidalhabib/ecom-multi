/**
 * ✅ PM2 ecosystem config (ধাপ ২: cluster mode)
 *
 * কেন দরকার:
 *  আগে `node server.js` দিয়ে backend সরাসরি চালানো হতো — Node.js
 *  single-threaded, তাই একটা process মানে সার্ভারের একটা মাত্র CPU কোর
 *  ব্যবহার হচ্ছিল। বাকি কোরগুলো idle থাকতো। PM2 cluster mode Node-এর
 *  built-in `cluster` module ব্যবহার করে একই পোর্টে একাধিক worker process
 *  চালায় (load balanced), আর কোনো worker crash করলে PM2 নিজে থেকেই
 *  সেটাকে restart করে — downtime অনেক কমে যায়।
 *
 * ব্যবহার:
 *   npm install -g pm2          (একবারই, সার্ভারে)
 *   pm2 start ecosystem.config.cjs
 *   pm2 status                  (সব app-এর অবস্থা দেখতে)
 *   pm2 logs                    (লাইভ লগ দেখতে)
 *   pm2 restart all             (zero-downtime restart)
 *   pm2 save && pm2 startup     (সার্ভার রিবুট হলেও অটো-স্টার্ট হওয়ার জন্য)
 *
 * ⚠️ গুরুত্বপূর্ণ ক্যাভিয়েট (Redis ছাড়া, single VPS ধরে):
 *   backend cluster mode-এ চললে প্রতিটা worker-এর নিজস্ব আলাদা মেমরি থাকে।
 *   তাই server.js-এর in-memory rate limiter আর shop-cache প্রতিটা worker-এ
 *   আলাদাভাবে কাজ করবে (শেয়ার হবে না) — যেমন rate limit 300/window সেট
 *   থাকলে ৪টা worker-এ কার্যত ভিজিটর প্রতি ৪×৩০০=১২০০ পর্যন্ত অনুমোদন হতে
 *   পারে যদি worker বদলে বদলে হিট করে। এটা এখনকার জন্য গ্রহণযোগ্য
 *   trade-off (কোনো memory-leak বা crash হবে না), কিন্তু সত্যিকারের
 *   cross-worker সঠিক rate-limit/shared cache লাগলে ভবিষ্যতে Redis যোগ
 *   করা লাগবে (আগের লিস্টের আইটেম ৭)।
 */

const path = require("path");

module.exports = {
  apps: [
    {
      name: "cartvan-backend",
      cwd: path.join(__dirname, "backend"),
      script: "server.js",
      exec_mode: "cluster",
      // 🔧 "max" মানে সার্ভারের সবকটা CPU কোর ব্যবহার হবে। ছোট VPS-এ
      // (যেমন 1-2 vCPU) admin/frontend-এর জন্যও কোর দরকার হবে, তাই
      // চাইলে এখানে একটা fixed সংখ্যা বসাতে পারেন (যেমন 2)।
      instances: "max",
      max_memory_restart: "400M", // worker যদি মেমরি leak করে, এই লিমিটে auto-restart হবে
      env: {
        NODE_ENV: "production",
      },
      out_file: path.join(__dirname, "logs/backend-out.log"),
      error_file: path.join(__dirname, "logs/backend-error.log"),
      time: true,
    },
    {
      name: "cartvan-admin",
      cwd: path.join(__dirname, "admin"),
      script: "node_modules/next/dist/bin/next",
      args: "start -H 0.0.0.0 -p 3008",
      exec_mode: "cluster",
      instances: 2, // Next.js app — ২টা worker সাধারণত যথেষ্ট, দরকার হলে বাড়ান
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
      },
      out_file: path.join(__dirname, "logs/admin-out.log"),
      error_file: path.join(__dirname, "logs/admin-error.log"),
      time: true,
    },
    {
      name: "cartvan-frontend",
      cwd: path.join(__dirname, "frontend"),
      script: "node_modules/next/dist/bin/next",
      args: "start -H 0.0.0.0 -p 3007",
      exec_mode: "cluster",
      // 🔧 frontend সব শপের কাস্টমার ট্রাফিক নেয় — এটাতে সবচেয়ে বেশি
      // worker রাখা ভালো (VPS-এর কোর সংখ্যা দেখে বাড়ান/কমান)
      instances: 2,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
      },
      out_file: path.join(__dirname, "logs/frontend-out.log"),
      error_file: path.join(__dirname, "logs/frontend-error.log"),
      time: true,
    },
  ],
};
