import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import PlatformSettings from "../src/models/PlatformSettings.js";
import Admin from "../src/models/Admin.js";
import Shop from "../src/models/Shop.js";
import publicRoutes from "../src/routes/public/platformProjects.routes.js";
import adminRoutes from "../src/routes/admin/platformProjects.admin.routes.js";

test("Project page link: public read, super-admin save, validation and clearing", async t => {
  process.env.JWT_SECRET = "local-project-tests-only";
  const settings = new PlatformSettings({ key: "global", tracking: { gtmId: "GTM-TEST123" } });
  let saves = 0;
  settings.save = async () => { saves++; };
  t.mock.method(PlatformSettings, "findOne", async () => settings);
  let role = "superadmin";
  t.mock.method(Admin, "findById", () => ({ select: async () => ({ role, status: "active", shops: ["shop"] }) }));
  t.mock.method(Shop, "find", () => ({ select: () => ({ setOptions: () => ({ lean: async () => [{ _id: "shop", status: "active" }] }) }) }));
  const app = express();
  app.use(express.json(), cookieParser());
  app.use("/platform-projects", publicRoutes);
  app.use("/admin/platform-projects", adminRoutes);
  const server = app.listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const cookie = `super_admin_token=${jwt.sign({ id: "123456789012345678901234" }, process.env.JWT_SECRET)}`;
  const call = (projectPageUrl, authenticated = true) => fetch(`${base}/admin/platform-projects`, {
    method: "PUT", headers: { "Content-Type": "application/json", ...(authenticated ? { Cookie: cookie } : {}) },
    body: JSON.stringify({ projectPageUrl }),
  });
  assert.deepEqual(await (await fetch(`${base}/platform-projects`)).json(), { projectPageUrl: "" });
  assert.equal((await call("", false)).status, 401);
  assert.equal((await fetch(`${base}/admin/platform-projects`)).status, 401);
  for (role of ["admin", "staff"]) assert.equal((await call("")).status, 403);
  role = "superadmin";
  for (const input of [null, {}, ["https://example.com"], "javascript:alert(1)", "ftp://example.com", "https://user:pass@example.com", "example.com", `https://example.com/${"x".repeat(2048)}`]) {
    assert.equal((await call(input)).status, 400);
  }
  assert.equal(saves, 0);
  assert.equal((await call(" https://example.com/projects ")).status, 200);
  const expected = { projectPageUrl: "https://example.com/projects" };
  assert.deepEqual(await (await fetch(`${base}/platform-projects`)).json(), expected);
  assert.deepEqual(await (await fetch(`${base}/admin/platform-projects`, { headers: { Cookie: cookie } })).json(), expected);
  assert.equal(settings.tracking.gtmId, "GTM-TEST123");
  assert.equal((await call("")).status, 200);
  assert.deepEqual(await (await fetch(`${base}/platform-projects`)).json(), { projectPageUrl: "" });
  assert.equal(saves, 2);
});
