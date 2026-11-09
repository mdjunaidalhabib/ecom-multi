// Run after building frontend and super-admin. Uses only a loopback API and
// in-memory model substitutes; never imports server.js or opens MongoDB.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import { chromium } from "playwright";
import Lead from "../src/models/Lead.js";
import LeadRateLimit from "../src/models/LeadRateLimit.js";
import Admin from "../src/models/Admin.js";
import publicRoutes from "../src/routes/public/leads.routes.js";
import adminRoutes from "../src/routes/admin/leads.superadmin.routes.js";

process.env.JWT_SECRET = "isolated-browser-tests-only";
const records = [];
let failNextSave = false;
LeadRateLimit.findOneAndUpdate = async () => ({ count: 1 });
Lead.findOne = async filter => records.find(item => item.eventId === filter.eventId) || null;
Lead.create = async input => {
  if (failNextSave) { failNextSave = false; throw new Error("Simulated save failure"); }
  const value = { ...input, _id: String(records.length + 1).padStart(24, "0"), status: "New", notes: [], createdAt: new Date().toISOString() };
  records.push(value);
  return value;
};
const filtered = filter => records.filter(item => (!filter.status || item.status === filter.status) && (!filter.interestedPlan || item.interestedPlan === filter.interestedPlan) && (!filter.businessStatus || item.businessStatus === filter.businessStatus) && (!filter.$or || filter.$or.some(part => { const [key, pattern] = Object.entries(part)[0]; return new RegExp(pattern.$regex, pattern.$options).test(item[key]); })));
Lead.find = filter => ({ sort: () => ({ skip: start => ({ limit: size => ({ lean: async () => structuredClone(filtered(filter).slice(start, start + size)) }) }) }) });
Lead.countDocuments = async filter => filtered(filter).length;
Lead.aggregate = async () => Object.entries(records.reduce((counts, record) => { counts[record.status] = (counts[record.status] || 0) + 1; return counts; }, {})).map(([_id, count]) => ({ _id, count }));
Lead.findByIdAndUpdate = async (id, update) => {
  const item = records.find(value => value._id === id);
  if (!item) return null;
  Object.assign(item, update.$set || {});
  if (update.$push) item.notes.push({ ...update.$push.notes, _id: `note-${item.notes.length}` });
  return item;
};
Admin.findById = () => ({ select: async () => ({ _id: "123456789012345678901234", name: "Local Super Admin", role: "superadmin", status: "active" }) });

const api = express();
api.use(cookieParser(), express.json());
api.use("/leads", publicRoutes);
api.use("/admin/leads", adminRoutes);
api.get("/admin/me", (req, res) => res.json({ name: "Local Super Admin", role: "superadmin" }));
api.get("/admin/shops", (req, res) => res.json([]));
api.get("/platform-tracking", (req, res) => res.json({ gtmId: "" }));
api.get("/platform-projects", (req, res) => res.json({ projectPageUrl: "https://example.test/projects" }));
api.get("/plans", (req, res) => res.json(["Starter", "Business", "Custom", "Reseller"].map(name => ({ name, key: name.toLowerCase(), highlights: [], notIncluded: [], price: 1000, billingDays: 30 }))));
api.use((req, res) => res.status(404).json({ message: "Local test route not found" }));
const server = api.listen(0, "127.0.0.1");
await new Promise(resolve => server.once("listening", resolve));
const apiUrl = `http://127.0.0.1:${server.address().port}`;
const processes = [];
let browser;
async function startApp(app, port) {
  const cwd = fileURLToPath(new URL(`../../${app}/`, import.meta.url));
  const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-H", "127.0.0.1", "-p", String(port)], {
    cwd, windowsHide: true, env: { ...process.env, NODE_ENV: "production", BACKEND_API_URL: apiUrl, PLATFORM_DOMAIN: "127.0.0.1", HIKMAH_SITE_URL: "https://checkout.example.test", NEXT_TELEMETRY_DISABLED: "1" }, stdio: ["ignore", "pipe", "pipe"],
  });
  processes.push(child);
  let logs = "";
  child.stdout.on("data", value => { logs = (logs + value).slice(-5000); });
  child.stderr.on("data", value => { logs = (logs + value).slice(-5000); });
  const url = `http://127.0.0.1:${port}`;
  for (let count = 0; count < 80; count++) {
    if (child.exitCode !== null) throw new Error(`${app} failed: ${logs}`);
    try { await fetch(`${url}/favicon.ico`); return url; } catch { await new Promise(resolve => setTimeout(resolve, 250)); }
  }
  throw new Error(`${app} did not start: ${logs}`);
}
async function fill(page, name = "পরীক্ষা গ্রাহক") {
  await page.locator("#lead-name").fill(name);
  await page.locator("#lead-phone").fill("০১৭১২৩৪৫৬৭৮");
  await page.locator("#lead-business").selectOption("Existing Business");
  await page.locator("#lead-message").fill("ব্যবসার জন্য যোগাযোগ করুন");
}
async function submit(page) {
  const submitButton = page.locator('#lead-form button[type="submit"]');
  await submitButton.waitFor();
  await page.waitForFunction(() => !document.querySelector('#lead-form button[type="submit"]').disabled);
  await submitButton.click();
}

try {
  const [frontend, panel] = await Promise.all([startApp("frontend", 33101), startApp("super-admin", 33102)]);
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  await context.route("**/*", route => new URL(route.request().url()).hostname === "127.0.0.1" ? route.continue() : route.abort());
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.addInitScript(() => { window.pixelCalls = []; window.fbq = (...args) => window.pixelCalls.push(args); });
  await page.goto(`${frontend}/?utm_source=facebook&utm_campaign=local-test&fbclid=local-click`, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "মেনু খুলুন" }).click();
  await page.getByRole("navigation", { name: "মোবাইল নেভিগেশন" }).getByRole("link", { name: "ফ্রি পরামর্শ" }).click();
  await page.waitForURL(url => url.pathname === "/" && url.hash === "#lead-form");
  await page.locator("#lead-plan").waitFor();
  assert.equal(new URL(page.url()).pathname, "/");
  assert.equal(new URL(page.url()).hash, "#lead-form");
  assert.equal(await page.locator("#lead-plan").inputValue(), "");
  await submit(page);
  await page.getByText("অনুগ্রহ করে লাল চিহ্নিত প্রয়োজনীয় তথ্যগুলো পূরণ করুন।", { exact: true }).waitFor();
  assert.equal(await page.locator('#lead-form [aria-invalid="true"]').count(), 4);
  assert.equal(records.length, 0, "Empty form must not save a lead");
  assert.equal(await page.evaluate(() => window.pixelCalls.length), 0);
  await page.locator("#lead-name").fill("পরীক্ষা");
  assert.equal(await page.locator("#lead-name").getAttribute("aria-invalid"), "false");
  assert.ok(!(await page.locator("#lead-name").getAttribute("class")).includes("border-red-400"));
  await page.locator("#lead-phone").fill("123");
  assert.equal(await page.locator("#lead-phone").getAttribute("aria-invalid"), "false");
  await page.locator("#lead-business").selectOption("New Business");
  await page.locator("#lead-plan").selectOption("Starter");
  await submit(page);
  assert.equal(await page.locator("#lead-phone").getAttribute("aria-invalid"), "true");
  await page.getByText("সঠিক বাংলাদেশি মোবাইল নম্বর দিন (যেমন 01712345678)।", { exact: true }).first().waitFor();
  assert.equal(records.length, 0, "Invalid phone must not save a lead");
  for (const width of [320, 375, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `Form must fit ${width}px viewport`);
    const bounds = await page.locator('#lead-form form').boundingBox();
    assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "মেনু খুলুন" }).click();
  assert.equal(await page.getByRole("navigation", { name: "মোবাইল নেভিগেশন" }).getByRole("link", { name: "ফ্রি পরামর্শ" }).getAttribute("href"), "/#lead-form");
  await page.getByRole("button", { name: "মেনু বন্ধ করুন" }).click();
  await page.goto(`${frontend}/?utm_source=facebook&utm_campaign=local-test&fbclid=local-click`, { waitUntil: "domcontentloaded" });
  assert.equal(await page.locator('[data-cta="lead"]').count(), 4);
  assert.equal(await page.locator("#lead-form").count(), 1, "Home page contains exactly one lead form");
  assert.equal(await page.getByRole("link", { name: "আমাদের প্রজেক্ট দেখুন", exact: true }).getAttribute("href"), "https://example.test/projects");
  assert.equal(await page.getByText("এই প্ল্যান সম্পর্কে জানতে চাই", { exact: true }).count(), 0);
  assert.equal(await page.locator('[data-cta="checkout"]').count(), 4, "Checkout CTA remains available");
  assert.equal(await page.locator('#plans a[data-cta]').count(), 8, "Exactly two CTAs per paid card");
  await page.waitForFunction(() => document.querySelector('[data-cta="lead"]').getAttribute("href").includes("utm_campaign=local-test"));
  const leadLinks = await page.locator('[data-cta="lead"]').evaluateAll(links => links.map(link => link.href));
  for (let index = 0; index < 4; index++) {
    assert.equal(new URL(leadLinks[index]).pathname, "/");
    assert.equal(new URL(leadLinks[index]).hash, "#lead-form");
    assert.equal(new URL(leadLinks[index]).searchParams.get("plan"), ["Starter", "Business", "Custom", "Reseller"][index]);
  }
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), "Mobile landing must not overflow");
  await page.locator("#lead-name").fill("অসম্পূর্ণ তথ্য");
  await page.evaluate(() => { window.sameLandingPage = true; });
  await page.locator('[data-cta="lead"]').last().click();
  await page.waitForFunction(() => document.querySelector("#lead-plan").value === "Reseller");
  assert.equal(await page.evaluate(() => window.sameLandingPage), true);
  assert.equal(await page.locator("#lead-name").inputValue(), "অসম্পূর্ণ তথ্য");
  assert.equal(new URL(page.url()).pathname, "/");
  assert.equal(await page.locator("#lead-plan").inputValue(), "Reseller");
  for (let index = 0; index < 3; index++) {
    await page.goto(leadLinks[index], { waitUntil: "domcontentloaded" });
    await page.waitForFunction(value => document.querySelector("#lead-plan")?.value === value, ["Starter", "Business", "Custom"][index]);
    assert.equal(await page.locator("#lead-plan").inputValue(), ["Starter", "Business", "Custom", "Reseller"][index]);
  }
  await page.goto(leadLinks[3], { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.querySelector("#lead-plan")?.value === "Reseller");
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), "Mobile lead page must not overflow");
  await fill(page);
  failNextSave = true;
  await submit(page);
  await page.locator('#lead-form [data-submit-error]').waitFor();
  assert.equal(records.length, 0);
  assert.equal(await page.evaluate(() => window.pixelCalls.length), 0);
  assert.equal(await page.evaluate(() => (window.dataLayer || []).filter(value => value.event === "ecms_lead").length), 0);
  await submit(page);
  await page.getByText("ধন্যবাদ! আপনার অনুরোধ পেয়েছি।").waitFor();
  await page.getByText("ধন্যবাদ! আপনার তথ্য সফলভাবে পাঠানো হয়েছে। আমাদের টিম যোগাযোগ করবে।", { exact: true }).waitFor();
  assert.equal(records.length, 1);
  assert.equal(records[0].interestedPlan, "Reseller");
  assert.equal(records[0].attribution.utm_campaign, "local-test");
  assert.equal(records[0].attribution.fbclid, "local-click");
  const calls = await page.evaluate(() => window.pixelCalls);
  assert.equal(calls.length, 1);
  assert.equal(calls[0][1], "Lead");
  assert.equal(calls[0][3].eventID, records[0].eventId);
  assert.equal(await page.evaluate(() => window.dataLayer.find(value => value.event === "ecms_lead").browser_pixel_sent), true);

  // GTM-only path, and desktop responsive layout.
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${frontend}/contact?plan=invalid`, { waitUntil: "domcontentloaded" });
  const desktopNav = page.getByRole("navigation", { name: "প্রধান নেভিগেশন" });
  assert.equal(new URL(page.url()).pathname, "/", "Old contact URLs redirect to the landing page");
  assert.equal(new URL(page.url()).hash, "#lead-form");
  assert.equal(await desktopNav.getByRole("link", { name: "ফ্রি পরামর্শ" }).getAttribute("href"), "/#lead-form");
  assert.equal(await desktopNav.getByRole("link", { name: "প্ল্যান", exact: true }).getAttribute("href"), "/#plans");
  assert.equal(await page.locator("#lead-plan").inputValue(), "", "Invalid plan leaves the visitor free to choose");
  await page.goto(`${frontend}/contact?plan=Starter&utm_source=instagram&utm_campaign=direct-ad&fbclid=direct-click`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.querySelector("#lead-plan")?.value === "Starter");
  assert.equal(new URL(page.url()).searchParams.get("fbclid"), "direct-click");
  assert.equal(await page.locator("#lead-plan").inputValue(), "Starter");
  await page.evaluate(() => { delete window.fbq; });
  await fill(page, "দ্বিতীয় গ্রাহক");
  await submit(page);
  await page.getByText("ধন্যবাদ! আপনার অনুরোধ পেয়েছি।").waitFor();
  assert.equal(records[1].attribution.utm_source, "instagram");
  assert.equal(records[1].attribution.utm_campaign, "direct-ad");
  assert.equal(records[1].attribution.fbclid, "direct-click");
  assert.equal(await page.evaluate(() => window.dataLayer.filter(value => value.event === "ecms_lead").length), 1);
  assert.equal(await page.evaluate(() => window.dataLayer.find(value => value.event === "ecms_lead").browser_pixel_sent), false);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));

  // UI uses the existing auth proxy and Super Admin layout.
  const adminPage = await context.newPage();
  adminPage.on("pageerror", error => errors.push(error.message));
  await adminPage.goto(`${panel}/leads`, { waitUntil: "domcontentloaded" });
  assert.ok(adminPage.url().endsWith("/login"));
  const wrongRole = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1h" });
  await context.addCookies([{ name: "super_admin_token", value: wrongRole, url: panel }]);
  await adminPage.goto(`${panel}/leads`, { waitUntil: "domcontentloaded" });
  assert.ok(adminPage.url().endsWith("/login"));
  const token = jwt.sign({ id: "123456789012345678901234", role: "superadmin" }, process.env.JWT_SECRET, { expiresIn: "1h" });
  await context.addCookies([{ name: "super_admin_token", value: token, url: panel }]);
  await adminPage.goto(`${panel}/leads`, { waitUntil: "domcontentloaded" });
  await adminPage.getByRole("heading", { name: "Lead Management" }).waitFor();
  await adminPage.locator("article").first().waitFor();
  assert.equal(await adminPage.locator("article").count(), 2);
  const card = adminPage.locator("article").filter({ hasText: "পরীক্ষা গ্রাহক" });
  assert.equal(await card.locator("textarea").count(), 0, "Notes stay collapsed to save space");
  assert.ok((await card.boundingBox()).height < 160, "Collapsed mobile lead rows must stay compact");
  await card.locator("select").selectOption("Follow-up");
  await card.getByRole("button", { name: "বিস্তারিত", exact: true }).click();
  await card.locator("textarea").fill("আগামীকাল যোগাযোগ করতে হবে");
  await card.getByRole("button", { name: "সংরক্ষণ করুন", exact: true }).click();
  await adminPage.getByText("পরিবর্তন সংরক্ষণ হয়েছে।").waitFor();
  assert.equal(records[0].status, "Follow-up");
  assert.equal(records[0].notes[0].text, "আগামীকাল যোগাযোগ করতে হবে");
  await adminPage.locator("#lead-search").fill("দ্বিতীয়");
  await adminPage.getByRole("button", { name: "খুঁজুন", exact: true }).click();
  await adminPage.waitForFunction(() => document.querySelectorAll("article").length === 1);
  assert.ok((await adminPage.locator("article").innerText()).includes("দ্বিতীয় গ্রাহক"));
  await adminPage.setViewportSize({ width: 390, height: 844 });
  assert.ok(await adminPage.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), "Mobile panel must not overflow");
  await adminPage.goto(`${panel}/dashboard`, { waitUntil: "domcontentloaded" });
  await adminPage.getByRole("heading", { name: "Leads Overview" }).waitFor();
  await adminPage.waitForFunction(() => [...document.querySelectorAll('a[href="/leads"]')].some(link => link.textContent.includes("Total Leads") && link.textContent.includes("২")));
  await adminPage.getByRole("link", { name: /New Leads/ }).click();
  await adminPage.locator("article").first().waitFor();
  assert.equal(await adminPage.getByRole("combobox", { name: "Filter by status", exact: true }).inputValue(), "New");
  assert.equal(await adminPage.locator("article").count(), 1);
  assert.ok((await adminPage.locator("article").innerText()).includes("দ্বিতীয় গ্রাহক"));
  assert.deepEqual(errors, []);
  console.log("PASS: inline landing form, navbar/hero anchors, no-reload plan selection with draft preservation, legacy campaign redirects, checkout preserved, mobile/desktop layout, attribution, validation/toasts, failure/retry, Pixel event ID, GTM fallback, admin status/notes and dashboard filters.");
} finally {
  await browser?.close();
  for (const child of processes) child.kill();
  await new Promise(resolve => server.close(resolve));
}
