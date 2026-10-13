// সার্ভার চালু হওয়ার সময় একবার চলে (Next.js instrumentation hook)।
//
// HIKMAH_SITE_URL না থাকলে ল্যান্ডিং পেজের "এখনই কিনুন" বাটন চুপচাপ WhatsApp-এ
// ফিরে যায় — সাইট ভাঙে না, কিন্তু ভুলটা চোখেও পড়ে না। তাই এখানে লগে স্পষ্ট
// error দেওয়া হয়। কড়া মোড চাইলে STRICT_ENV_CHECK=true দিন — তখন env ভুল
// থাকলে সার্ভার চালুই হবে না, ডিপ্লয়ের সময়েই ধরা পড়বে।
export function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const problems = [];
  const url = (process.env.HIKMAH_SITE_URL || "").trim();

  if (!url) {
    problems.push(
      "HIKMAH_SITE_URL সেট করা নেই — ল্যান্ডিং পেজের সব প্ল্যান বাটন WhatsApp-এ যাবে, 'এখনই কিনুন' বন্ধ থাকবে (যেমন: https://hikmahit.com)",
    );
  } else if (!/^https:\/\/[^\s/]+\.[^\s/]+/.test(url)) {
    problems.push(
      `HIKMAH_SITE_URL ভুল ফরম্যাটে ("${url}") — https:// দিয়ে শুরু হওয়া পূর্ণ ডোমেইন দিন, যেমন https://hikmahit.com`,
    );
  }

  if (!(process.env.SALES_WHATSAPP_NUMBER || "").trim()) {
    problems.push("SALES_WHATSAPP_NUMBER সেট করা নেই — WhatsApp বাটনগুলো কোথাও যাবে না");
  }

  if (!problems.length) return;

  for (const msg of problems) console.error(`[ENV CHECK] ❌ ${msg}`);

  if (process.env.STRICT_ENV_CHECK === "true") {
    throw new Error(`ENV ভুল — সার্ভার চালু করা যাচ্ছে না:\n- ${problems.join("\n- ")}`);
  }
}
