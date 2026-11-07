import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import Lead from "../src/models/Lead.js";
import LeadRateLimit from "../src/models/LeadRateLimit.js";
import Admin from "../src/models/Admin.js";
import Shop from "../src/models/Shop.js";
import publicRoutes from "../src/routes/public/leads.routes.js";
import adminRoutes from "../src/routes/admin/leads.superadmin.routes.js";
import { createFormToken, validFormToken, validateLead, normalizeLeadPhone } from "../src/services/leadValidation.js";

// No .env loading, server.js import, database connection, or external services.
process.env.JWT_SECRET = "local-lead-tests-only";
const body = (extra = {}) => ({ name: "পরীক্ষা ব্যবসা", phone: "01712345678", businessStatus: "New Business", interestedPlan: "Starter", message: "যোগাযোগ করুন", eventId: randomUUID(), formToken: createFormToken(Date.now() - 3000), website: "", attribution: { utm_source: "facebook", fbclid: "test-click" }, ...extra });

test("Lead validation and signed anti-spam tokens", () => {
  assert.equal(normalizeLeadPhone("০১৭১২৩৪৫৬৭৮"), "+8801712345678");
  assert.equal(normalizeLeadPhone("+880 1712-345678"), "+8801712345678");
  for (const value of ["123", "01112345678", { $ne: "" }, "017123456789"]) assert.throws(() => normalizeLeadPhone(value));
  const valid = body();
  assert.equal(validateLead(valid).attribution.fbclid, "test-click");
  for (const change of [{ name: " " }, { interestedPlan: "bad" }, { businessStatus: "bad" }, { message: "x".repeat(2001) }, { attribution: { utm_source: { $ne: "" } } }, { name: "<script>" }, { eventId: "bad" }]) assert.throws(() => validateLead({ ...valid, ...change }));
  const now = Date.now();
  assert.equal(validFormToken(createFormToken(now), now), false);
  const token = createFormToken(now - 3000);
  assert.equal(validFormToken(token, now), true);
  assert.equal(validFormToken(`${token.slice(0, -1)}${token.endsWith("0") ? "1" : "0"}`, now), false);
  assert.equal(validFormToken(createFormToken(now - 3 * 60 * 60 * 1000), now), false);
});

test("Public and Super Admin lead HTTP contracts", async t => {
  const app = express();
  app.use(cookieParser(), express.json());
  app.use("/leads", publicRoutes);
  app.use("/admin/leads", adminRoutes);
  const server = app.listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const call = (path, payload, cookie) => fetch(`${base}${path}`, { method: payload ? (path.startsWith("/admin") ? "PATCH" : "POST") : "GET", headers: { ...(payload ? { "Content-Type": "application/json" } : {}), ...(cookie ? { Cookie: cookie } : {}) }, ...(payload ? { body: JSON.stringify(payload) } : {}) });
  const adminCookie = `super_admin_token=${jwt.sign({ id: "123456789012345678901234" }, process.env.JWT_SECRET)}`;

  await t.test("Token endpoint does not cache or expose a secret", async () => {
    const res = await call("/leads/form-token");
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("cache-control"), "no-store");
    assert.equal(typeof (await res.json()).token, "string");
  });
  await t.test("Saves attribution and ignores injected admin fields", async t => {
    const input = body({ status: "Converted", notes: [{ text: "injected" }] });
    t.mock.method(LeadRateLimit, "findOneAndUpdate", async () => ({ count: 1 }));
    t.mock.method(Lead, "findOne", async () => null);
    const create = t.mock.method(Lead, "create", async value => value);
    const res = await call("/leads", input);
    assert.equal(res.status, 201);
    assert.deepEqual(await res.json(), { success: true, eventId: input.eventId });
    const saved = create.mock.calls[0].arguments[0];
    assert.equal(saved.phone, "+8801712345678");
    assert.deepEqual(saved.attribution, input.attribution);
    assert.equal(saved.status, undefined);
    assert.equal(saved.notes, undefined);
  });
  await t.test("Retries reuse event ID and do not create another lead", async t => {
    const input = body();
    t.mock.method(LeadRateLimit, "findOneAndUpdate", async () => ({ count: 2 }));
    t.mock.method(Lead, "findOne", async () => validateLead(input));
    const create = t.mock.method(Lead, "create", async () => { throw new Error("Unexpected write"); });
    assert.equal((await call("/leads", input)).status, 200);
    assert.equal(create.mock.callCount(), 0);
    assert.equal((await call("/leads", { ...input, name: "Another person" })).status, 409);
  });
  await t.test("Concurrent duplicate-key race returns the same event", async t => {
    const input = body();
    t.mock.method(LeadRateLimit, "findOneAndUpdate", async () => ({ count: 1 }));
    let reads = 0;
    t.mock.method(Lead, "findOne", async () => ++reads === 1 ? null : validateLead(input));
    t.mock.method(Lead, "create", async () => { throw Object.assign(new Error(), { code: 11000 }); });
    assert.equal((await call("/leads", input)).status, 200);
  });
  await t.test("Rejects honeypot, fast token and bad phone without writes", async t => {
    t.mock.method(LeadRateLimit, "findOneAndUpdate", async () => ({ count: 1 }));
    const create = t.mock.method(Lead, "create", async () => {});
    for (const change of [{ website: "spam.test" }, { formToken: createFormToken() }, { phone: "bad" }]) assert.equal((await call("/leads", body(change))).status, 400);
    assert.equal(create.mock.callCount(), 0);
  });
  await t.test("Enforces shared rate limit and fails closed on database errors", async t => {
    t.mock.method(LeadRateLimit, "findOneAndUpdate", async () => ({ count: 6 }));
    const res = await call("/leads", body());
    assert.equal(res.status, 429);
    assert.ok(Number(res.headers.get("retry-after")) > 0);
    t.mock.method(LeadRateLimit, "findOneAndUpdate", async () => { throw new Error("db unavailable"); });
    assert.equal((await call("/leads", body())).status, 503);
  });
  await t.test("Save failures never return a successful analytics event", async t => {
    t.mock.method(LeadRateLimit, "findOneAndUpdate", async () => ({ count: 1 }));
    t.mock.method(Lead, "findOne", async () => null);
    t.mock.method(Lead, "create", async () => { throw new Error("private DB failure"); });
    const res = await call("/leads", body());
    assert.equal(res.status, 503);
    const data = await res.json();
    assert.equal(data.eventId, undefined);
    assert.ok(!JSON.stringify(data).includes("private DB failure"));
  });
  await t.test("Unauthenticated and invalid sessions are blocked", async () => {
    assert.equal((await call("/admin/leads")).status, 401);
    assert.equal((await call("/admin/leads/summary")).status, 401);
    assert.equal((await call("/admin/leads", null, "super_admin_token=invalid")).status, 401);
  });
  await t.test("Active institution/shop Admin and staff cannot list or update leads", async t => {
    t.mock.method(Shop, "find", () => ({ select: () => ({ setOptions: () => ({ lean: async () => [{ _id: "shop", status: "active" }] }) }) }));
    for (const role of ["admin", "staff"]) {
      t.mock.method(Admin, "findById", () => ({ select: async () => ({ role, status: "active", shops: ["shop"] }) }));
      const cookie = adminCookie.replace("super_admin_token", "admin_token");
      assert.equal((await call("/admin/leads", null, cookie)).status, 403);
      assert.equal((await call("/admin/leads/summary", null, cookie)).status, 403);
      assert.equal((await call("/admin/leads/123456789012345678901234", { status: "Converted" }, cookie)).status, 403);
    }
  });
  await t.test("Super Admin gets complete platform lead counts including zero statuses", async t => {
    t.mock.method(Admin, "findById", () => ({ select: async () => ({ role: "superadmin", status: "active" }) }));
    const aggregate = t.mock.method(Lead, "aggregate", async () => [{ _id: "New", count: 8 }, { _id: "Follow-up", count: 3 }, { _id: "Converted", count: 2 }]);
    const res = await call("/admin/leads/summary", null, adminCookie);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("cache-control"), "no-store");
    const data = await res.json();
    assert.equal(data.total, 13);
    assert.equal(data.byStatus.New, 8);
    assert.equal(data.byStatus["Follow-up"], 3);
    assert.equal(data.byStatus.Contacted, 0);
    assert.equal(Object.keys(data.byStatus).length, 6);
    assert.deepEqual(aggregate.mock.calls[0].arguments[0], [{ $group: { _id: "$status", count: { $sum: 1 } } }]);
  });
  await t.test("Super Admin can search safely and paginate", async t => {
    t.mock.method(Admin, "findById", () => ({ select: async () => ({ role: "superadmin", status: "active" }) }));
    let filter;
    t.mock.method(Lead, "find", value => { filter = value; return { sort: () => ({ skip: amount => { assert.equal(amount, 20); return { limit: count => { assert.equal(count, 20); return { lean: async () => [] }; } }; } }) }; });
    t.mock.method(Lead, "countDocuments", async () => 30);
    const res = await call("/admin/leads?search=%2E%2A&status=New&plan=Starter&page=2", null, adminCookie);
    assert.equal(res.status, 200);
    assert.equal((await res.json()).pages, 2);
    assert.equal(filter.$or[0].name.$regex, "\\.\\*");
    assert.equal(filter.status, "New");
    assert.equal((await call("/admin/leads?status=invalid", null, adminCookie)).status, 400);
  });
  await t.test("Super Admin updates status and appends an attributed note atomically", async t => {
    t.mock.method(Admin, "findById", () => ({ select: async () => ({ _id: "123456789012345678901234", role: "superadmin", status: "active" }) }));
    const update = t.mock.method(Lead, "findByIdAndUpdate", async (id, value) => ({ _id: id, status: value.$set.status }));
    const res = await call("/admin/leads/123456789012345678901234", { status: "Follow-up", note: "Call tomorrow", phone: "injection" }, adminCookie);
    assert.equal(res.status, 200);
    const data = update.mock.calls[0].arguments[1];
    assert.deepEqual(data.$set, { status: "Follow-up" });
    assert.equal(data.$push.notes.text, "Call tomorrow");
    assert.equal(data.$push.notes.author, "123456789012345678901234");
    assert.equal((await call("/admin/leads/bad", { status: "New" }, adminCookie)).status, 400);
    assert.equal((await call("/admin/leads/123456789012345678901234", { status: "invalid" }, adminCookie)).status, 400);
  });
});
