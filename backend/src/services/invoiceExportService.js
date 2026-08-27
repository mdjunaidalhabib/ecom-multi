import { chromium } from "playwright";

const FRONTEND_ORIGIN = (process.env.FRONTEND_ORIGIN || "").replace(/\/$/, "");
const DEFAULT_PAGE_SIZE = { width: 794, height: 1123 };

const MAX_CONCURRENT_RENDERS = 3;
const MAX_QUEUE_SIZE = 20; // এর বেশি একসাথে অপেক্ষারত রিকোয়েস্ট এলে সাথে সাথে "ব্যস্ত" বলে দেওয়া হয়
const QUEUE_TIMEOUT_MS = 15_000; // queue-তে এর বেশি সময় আটকে থাকলে fail — অনন্তকাল জমতে দেওয়া হয় না

export class AbortError extends Error {
  constructor(message = "বাতিল করা হয়েছে") {
    super(message);
    this.name = "AbortError";
  }
}

export class ServerBusyError extends Error {
  constructor(message = "সার্ভার এই মুহূর্তে অনেক ব্যস্ত, একটু পরে আবার চেষ্টা করুন") {
    super(message);
    this.name = "ServerBusyError";
    this.statusCode = 503;
  }
}

/**
 * ✅ ছোট concurrency limiter — প্রতিটা PDF জেনারেশন একটা রিয়েল Chromium ট্যাব
 * চালায় (real CPU/memory)। কোনো cap না থাকলে একসাথে অনেক কাস্টমার/অ্যাডমিন
 * ইনভয়েস ডাউনলোড করলে পুরো সার্ভার প্রসেস OOM হয়ে যেতে পারে।
 *
 * SaaS-এ ট্রাফিক স্পাইক হলে শুধু "queue করে অপেক্ষা করানো" যথেষ্ট না — তাই
 * এখানে দুইটা hard limit আছে: queue-র সাইজ (MAX_QUEUE_SIZE, এর বেশি হলে
 * সাথে সাথে 503) এবং queue-তে অপেক্ষার সময় (QUEUE_TIMEOUT_MS)। এতে queue
 * কখনো unbounded বেড়ে মেমোরি/সকেট শেষ করতে পারে না।
 */
class Semaphore {
  constructor(max, { maxQueue, queueTimeoutMs }) {
    this.max = max;
    this.count = 0;
    this.queue = [];
    this.maxQueue = maxQueue;
    this.queueTimeoutMs = queueTimeoutMs;
  }

  acquire(signal) {
    if (signal?.aborted) return Promise.reject(new AbortError());

    if (this.count < this.max) {
      this.count += 1;
      return Promise.resolve();
    }

    if (this.queue.length >= this.maxQueue) {
      return Promise.reject(new ServerBusyError());
    }

    return new Promise((resolve, reject) => {
      const entry = {};

      const cleanup = () => {
        clearTimeout(timer);
        signal?.removeEventListener("abort", onAbort);
      };
      const removeFromQueue = () => {
        const idx = this.queue.indexOf(entry);
        if (idx !== -1) this.queue.splice(idx, 1);
      };

      const onAbort = () => {
        cleanup();
        removeFromQueue();
        reject(new AbortError());
      };
      const timer = setTimeout(() => {
        cleanup();
        removeFromQueue();
        reject(new ServerBusyError("ইনভয়েস তৈরির অপেক্ষায় সময় শেষ হয়ে গেছে, একটু পরে আবার চেষ্টা করুন"));
      }, this.queueTimeoutMs);

      entry.settle = () => {
        cleanup();
        this.count += 1;
        resolve();
      };

      signal?.addEventListener("abort", onAbort, { once: true });
      this.queue.push(entry);
    });
  }

  release() {
    this.count -= 1;
    const next = this.queue.shift();
    if (next) next.settle();
  }
}

class InvoiceExportService {
  constructor() {
    this.browserPromise = null;
    this.semaphore = new Semaphore(MAX_CONCURRENT_RENDERS, {
      maxQueue: MAX_QUEUE_SIZE,
      queueTimeoutMs: QUEUE_TIMEOUT_MS,
    });
  }

  // ✅ একবার লঞ্চ করা browser instance বারবার ব্যবহার — প্রতিটা রিকোয়েস্টে
  // নতুন chromium.launch() করলে cold-launch latency-ই সবচেয়ে বড় খরচ হয়ে
  // যেত। শুধু per-request `context` (হালকা, isolated) তৈরি/বন্ধ হয়।
  async getBrowser() {
    if (this.browserPromise) {
      const existing = await this.browserPromise;
      if (existing.isConnected()) return existing;
      this.browserPromise = null;
    }
    this.browserPromise = chromium.launch({ headless: true });
    return this.browserPromise;
  }

  async generatePdf(orderId, { signal } = {}) {
    if (!FRONTEND_ORIGIN) {
      throw new Error("FRONTEND_ORIGIN env var সেট করা নেই — Playwright কোন URL এ যাবে জানে না");
    }
    if (signal?.aborted) throw new AbortError();

    await this.semaphore.acquire(signal);

    let context;
    try {
      const browser = await this.getBrowser();
      context = await browser.newContext();

      // ✅ ক্লায়েন্ট মাঝপথে ডাউনলোড বাতিল/কানেকশন বন্ধ করলে (দেখুন
      // invoiceExport.routes.js) এই context সাথে সাথে বন্ধ করে দেওয়া হয় —
      // নাহলে Chromium ট্যাবটা ব্যাকগ্রাউন্ডে পুরো রেন্ডার শেষ করেই যেত,
      // সার্ভারের রিসোর্স নষ্ট করে যার ফলাফল কেউ ব্যবহারই করবে না।
      const onAbort = () => context.close().catch(() => {});
      signal?.addEventListener("abort", onAbort, { once: true });

      try {
        const page = await context.newPage();
        const printUrl = `${FRONTEND_ORIGIN}/print/invoices/${orderId}`;

        // ⚠️ "networkidle" এর বদলে "domcontentloaded" — dev-এ Next.js এর
        // live-reload websocket সবসময় খোলা থাকে বলে "networkidle" আসলে
        // network কখনো idle হতে দেখেই না, ফলে প্রতিটা রিকোয়েস্ট পুরো ৩০ সেকেন্ড
        // অপেক্ষা করে টাইমআউট পর্যন্ত যেত। আসল readiness যাচাই এমনিতেই নিচের
        // waitForSelector('[data-ready="true"]') করছে, তাই networkidle এর
        // দরকারই নেই — এটাই ছিল "১ পেজ PDF-এও অনেক সময় লাগছে" এই সমস্যার মূল কারণ।
        await page.goto(printUrl, { waitUntil: "domcontentloaded", timeout: 30_000 });
        await page.waitForSelector('[data-ready="true"]', { timeout: 20_000 });

        // ইনভয়েস টেমপ্লেটের pageSize শপ-ভেদে ভিন্ন হতে পারে (কাস্টম টেমপ্লেট) —
        // রেন্ডার হওয়া আসল DOM node থেকে সাইজ পড়া হয়, যাতে PDF page এক-পৃষ্ঠার
        // পুরো কনটেন্টের সাথে হুবহু মেলে (footer/element কেটে না যায়)।
        const measuredSize = await page.evaluate(() => {
          const node = document.querySelector("[data-invoice-page]");
          if (!node) return null;
          const rect = node.getBoundingClientRect();
          return { width: Math.ceil(rect.width), height: Math.ceil(rect.height) };
        });
        const { width, height } = measuredSize || DEFAULT_PAGE_SIZE;

        return await page.pdf({
          width: `${width}px`,
          height: `${height}px`,
          printBackground: true,
          margin: { top: 0, right: 0, bottom: 0, left: 0 },
        });
      } finally {
        signal?.removeEventListener("abort", onAbort);
      }
    } catch (err) {
      if (signal?.aborted) throw new AbortError();
      throw err;
    } finally {
      if (context) await context.close().catch(() => {}); // context.close() একাধিকবার কল করা নিরাপদ
      this.semaphore.release();
    }
  }

  async close() {
    if (!this.browserPromise) return;
    const browser = await this.browserPromise;
    this.browserPromise = null;
    await browser.close().catch(() => {});
  }
}

const invoiceExportService = new InvoiceExportService();
export default invoiceExportService;
