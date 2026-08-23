/**
 * migrateCartvanShop.js
 *
 * ✅ ONE-TIME (but safely re-runnable) data migration: turns the single-tenant
 * "cartvan" store into one tenant ("Shop") inside the multi-tenant "ecom-multi"
 * platform database.
 *
 * SAFETY MODEL
 * ------------
 *  - cartvan's database is READ-ONLY, always. This script never calls
 *    insert/update/delete/drop on the `cartvanDb` handle — only `.find()`.
 *  - ecom-multi's database is ADDITIVE-ONLY. This script only ever:
 *      1) inserts a new Shop document (or reuses an existing one by slug),
 *      2) inserts tenant-scoped documents tagged with that shop's _id
 *         (never touching documents belonging to any other shop),
 *      3) upserts two new Counter docs scoped to this shop's _id,
 *      4) inserts new Admin documents (skipping on email collision),
 *      5) sets `ownerAdminId` on *this* shop's own document (matched by _id).
 *    It never runs an unscoped updateMany/deleteMany against ecom-multi.
 *  - IDEMPOTENT: re-running after a partial failure must not error out or
 *    create duplicates. Every write path checks for pre-existing data first
 *    (by slug, by _id, by email, or via $setOnInsert) before writing.
 *  - Image fields (image, images, logo, avatar, src, photo, ...) are copied
 *    verbatim (Cloudinary URLs untouched) — a later pass migrates those to R2.
 *
 * USAGE
 * -----
 *   cd ecom-multi/backend
 *   node migrations/migrateCartvanShop.js
 *
 * Requires network access to BOTH MongoDB deployments. ecom-multi's DB in
 * this project lives on a private Docker network (see ../../.env.tunnel) —
 * from a machine that can't reach it directly, first run `npm run tunnel`
 * (from the ecom-multi repo root) in another terminal, then point MONGO_URI
 * in ecom-multi/backend/.env (or an env override) at the local tunnel port
 * before running this script.
 */

import { MongoClient, ObjectId } from "mongodb";
import mongoose from "mongoose";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODELS_DIR = path.join(__dirname, "..", "src", "models");

// ─────────────────────────────────────────────────────────────────────────
// CLI args — generalized so this script can migrate ANY single-tenant
// sibling project into ecom-multi as a new shop, not just cartvan.
//   node migrations/migrateCartvanShop.js --source=openupbd-main --name="Openup" --slug=openup
// Defaults preserve the original cartvan behavior when run with no args.
// ─────────────────────────────────────────────────────────────────────────
const cliArgs = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [key, ...rest] = arg.replace(/^--/, "").split("=");
    return [key, rest.join("=")];
  }),
);
const SOURCE_PROJECT = cliArgs.source || "cartvan";
const SHOP_NAME = cliArgs.name || "Cartvan";
const SHOP_SLUG = (cliArgs.slug || "cartvan").toLowerCase();

const SOURCE_ENV_PATH = path.resolve(__dirname, "..", "..", "..", SOURCE_PROJECT, "backend", ".env");
const ECOM_ENV_PATH = path.resolve(__dirname, "..", ".env");

// ─────────────────────────────────────────────────────────────────────────
// Env loading — two fully separate parses, so neither MONGO_URI/DB_NAME can
// clobber the other (no shared process.env, no single dotenv.config() call).
// ─────────────────────────────────────────────────────────────────────────
function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`env file not found: ${filePath}`);
  }
  const content = fs.readFileSync(filePath, "utf8");
  const out = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

const sourceEnv = parseEnvFile(SOURCE_ENV_PATH);
const ecomEnv = parseEnvFile(ECOM_ENV_PATH);

for (const [label, env, p] of [
  [SOURCE_PROJECT, sourceEnv, SOURCE_ENV_PATH],
  ["ecom-multi", ecomEnv, ECOM_ENV_PATH],
]) {
  if (!env.MONGO_URI || !env.DB_NAME) {
    throw new Error(`${label}: MONGO_URI/DB_NAME missing in ${p}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Dynamic tenant-model discovery — scan src/models/*.js for
// `.plugin(tenantPlugin)` instead of hardcoding a list from memory.
// ─────────────────────────────────────────────────────────────────────────

// New ecom-multi-only features with nothing to migrate from cartvan, even if
// they happen to use tenantPlugin (kept as an explicit safety net on top of
// the dynamic scan, per the migration spec).
const EXCLUDED_MODEL_NAMES = new Set([
  "Plan",
  "PlanChangeRequest",
  "PlatformSettings",
  "LandingPage",
  "InvoiceTemplate",
  "InvoiceTemplateDefault",
]);

function discoverTenantModels() {
  const files = fs.readdirSync(MODELS_DIR).filter((f) => f.endsWith(".js"));
  const results = [];
  for (const file of files) {
    const text = fs.readFileSync(path.join(MODELS_DIR, file), "utf8");
    if (!/\.plugin\(\s*tenantPlugin\s*\)/.test(text)) continue;

    const modelMatch = text.match(/mongoose\.model\(\s*["']([A-Za-z0-9_]+)["']/);
    if (!modelMatch) {
      console.warn(`[warn] ${file}: uses tenantPlugin but no mongoose.model(...) name found — skipping`);
      continue;
    }
    const modelName = modelMatch[1];
    if (EXCLUDED_MODEL_NAMES.has(modelName)) continue;

    const collectionName = mongoose.pluralize()(modelName.toLowerCase());
    results.push({ file, modelName, collectionName });
  }
  return results;
}

// ─────────────────────────────────────────────────────────────────────────
// Generic, idempotent collection copy (raw driver — bypasses Mongoose
// validation on purpose; docs are already valid, we're only adding shopId).
// ─────────────────────────────────────────────────────────────────────────
async function copyCollection(cartvanDb, ecomDb, collectionName, shopId) {
  const sourceCol = cartvanDb.collection(collectionName); // READ-ONLY use
  const targetCol = ecomDb.collection(collectionName);

  const sourceDocs = await sourceCol.find({}).toArray();
  const sourceCount = sourceDocs.length;

  if (sourceCount === 0) {
    return { collection: collectionName, source: 0, inserted: 0, skipped: 0, errors: 0 };
  }

  const ids = sourceDocs.map((d) => d._id);
  const existingIds = new Set(
    (await targetCol.find({ _id: { $in: ids } }, { projection: { _id: 1 } }).toArray()).map((d) =>
      String(d._id),
    ),
  );

  const toInsert = sourceDocs
    .filter((d) => !existingIds.has(String(d._id)))
    .map((d) => ({ ...d, shopId }));

  let inserted = 0;
  let dupErrors = 0;
  let otherErrors = 0;

  if (toInsert.length > 0) {
    try {
      const res = await targetCol.insertMany(toInsert, { ordered: false });
      inserted = res.insertedCount;
    } catch (e) {
      inserted = e.result?.insertedCount ?? e.insertedCount ?? 0;
      const writeErrors = e.writeErrors || [];
      for (const we of writeErrors) {
        const code = we.code ?? we.err?.code;
        if (code === 11000) dupErrors++;
        else otherErrors++;
      }
      if (otherErrors > 0) {
        console.error(`  [error] ${collectionName}: ${otherErrors} non-duplicate insert error(s):`);
        writeErrors
          .filter((we) => (we.code ?? we.err?.code) !== 11000)
          .slice(0, 3)
          .forEach((we) => console.error("    -", we.errmsg || we.err?.errmsg || we));
      }
    }
  }

  const skipped = existingIds.size + dupErrors;
  return { collection: collectionName, source: sourceCount, inserted, skipped, errors: otherErrors };
}

// ─────────────────────────────────────────────────────────────────────────
// Shop upsert — idempotent by slug.
// ─────────────────────────────────────────────────────────────────────────
async function ensureShop(ecomDb) {
  const shops = ecomDb.collection("shops");
  const existing = await shops.findOne({ slug: SHOP_SLUG });
  if (existing) {
    return { shopId: existing._id, created: false, ownerAdminId: existing.ownerAdminId || null };
  }

  const shopId = new ObjectId();
  const now = new Date();
  // Every field below is either a literal schema default (see src/models/Shop.js)
  // or an explicitly-specified value from the migration spec. `domain` is
  // intentionally omitted entirely (not even null) to respect the sparse
  // unique index — matches the schema's own `default: undefined` intent.
  const doc = {
    _id: shopId,
    name: SHOP_NAME,
    slug: SHOP_SLUG,
    domainStatus: "pending_dns",
    domainVerifiedAt: null,
    domainLastCheckedAt: null,
    status: "active", // real live data, not a trial
    suspendedReason: "",
    subscriptionStartDate: now,
    subscriptionDays: null,
    planExpiresAt: null,
    branding: { logo: "", logoPublicId: "", themeColor: "#0ea5e9", theme: "" },
    ownerAdminId: null, // filled in after admin migration below
    plan: "free", // schema default — not hand-picked
    limits: { maxProducts: 200, maxAdmins: 2 },
    contactEmail: "",
    contactPhone: "",
    createdAt: now,
    updatedAt: now,
  };
  await shops.insertOne(doc);
  return { shopId, created: true, ownerAdminId: null };
}

// ─────────────────────────────────────────────────────────────────────────
// Admin migration — special-cased (shops: [] array, not a plain shopId field;
// role mapping; global email-uniqueness collision check).
// ─────────────────────────────────────────────────────────────────────────
async function migrateAdmins(cartvanDb, ecomDb, shopId) {
  const cartvanAdmins = await cartvanDb.collection("admins").find({}).toArray(); // READ-ONLY
  const ecomAdmins = ecomDb.collection("admins");

  const rows = [];
  const ownerCandidates = []; // { _id, email, createdAt, status: "inserted"|"already-migrated" }

  for (const a of cartvanAdmins) {
    const emailLower = String(a.email || "").toLowerCase();

    // Idempotency: already migrated in a previous run?
    const byId = await ecomAdmins.findOne({ _id: a._id });
    if (byId) {
      rows.push({ email: a.email, cartvanRole: a.role, outcome: "already-existed (same _id)" });
      if (a.role === "superadmin") {
        ownerCandidates.push({ _id: a._id, email: a.email, createdAt: a.createdAt || new Date(0) });
      }
      continue;
    }

    // Collision check: Admin.email is globally unique in ecom-multi.
    const byEmail = await ecomAdmins.findOne({ email: emailLower });
    if (byEmail) {
      rows.push({ email: a.email, cartvanRole: a.role, outcome: "SKIPPED — email collision (manual review)" });
      continue;
    }

    // Role mapping: cartvan has no staff/permissions concept at all (its own
    // schema only allows superadmin/admin). Any cartvan role — including a
    // stray legacy "staff" value found in live data that bypasses cartvan's
    // own enum — becomes a plain shop-level "admin" in ecom-multi. Only the
    // original cartvan "superadmin" is a *candidate* for this shop's owner.
    const newRole = "admin";
    const newDoc = {
      ...a,
      role: newRole,
      shops: [shopId],
    };
    delete newDoc.permissions; // not meaningful for role "admin"; schema defaults to {} on read

    try {
      await ecomAdmins.insertOne(newDoc);
      rows.push({ email: a.email, cartvanRole: a.role, outcome: "migrated -> admin" });
      if (a.role === "superadmin") {
        ownerCandidates.push({ _id: a._id, email: a.email, createdAt: a.createdAt || new Date(0) });
      }
    } catch (e) {
      if (e.code === 11000) {
        rows.push({ email: a.email, cartvanRole: a.role, outcome: "SKIPPED — duplicate key (username/other, manual review)" });
      } else {
        rows.push({ email: a.email, cartvanRole: a.role, outcome: `SKIPPED — error: ${e.message}` });
      }
    }
  }

  // Pick the owner: earliest-created successfully-migrated ex-cartvan-superadmin.
  ownerCandidates.sort((x, y) => new Date(x.createdAt) - new Date(y.createdAt));
  const owner = ownerCandidates[0] || null;

  return { rows, owner, ambiguousOwners: ownerCandidates.length > 1 ? ownerCandidates : null };
}

// ─────────────────────────────────────────────────────────────────────────
// Counter seeding — new Counter docs keyed by shop, seeded (never regressed)
// from cartvan's global counters, per the naming pattern in User.js/Order.js.
// ─────────────────────────────────────────────────────────────────────────
async function seedCounters(cartvanDb, ecomDb, shopId) {
  const cartvanCounters = await cartvanDb.collection("counters").find({}).toArray(); // READ-ONLY
  const bySourceName = Object.fromEntries(cartvanCounters.map((c) => [c.name, c.seq]));

  const results = [];
  for (const [sourceName, targetPrefix] of [
    ["userId", "userId"],
    ["orderNumber", "orderNumber"],
  ]) {
    const sourceSeq = bySourceName[sourceName];
    const targetName = `${targetPrefix}:${shopId}`;
    if (sourceSeq === undefined) {
      results.push({ name: targetName, sourceSeq: null, resultSeq: null, note: `no cartvan counter named "${sourceName}"` });
      continue;
    }

    const countersCol = ecomDb.collection("counters");
    // $setOnInsert: never regress an already-advanced counter on re-run.
    await countersCol.updateOne(
      { name: targetName },
      { $setOnInsert: { name: targetName, seq: sourceSeq } },
      { upsert: true },
    );
    const finalDoc = await countersCol.findOne({ name: targetName });
    results.push({
      name: targetName,
      sourceSeq,
      resultSeq: finalDoc.seq,
      note: finalDoc.seq === sourceSeq ? "seeded" : "already existed with a different seq (left untouched)",
    });
  }
  return results;
}

// ─────────────────────────────────────────────────────────────────────────
// Location — NOT tenant-scoped, shared reference data. Compare only, don't copy
// unless cartvan genuinely has extra/different data.
// ─────────────────────────────────────────────────────────────────────────
async function compareLocations(cartvanDb, ecomDb) {
  const cartvanCount = await cartvanDb.collection("locations").countDocuments(); // READ-ONLY
  const ecomCount = await ecomDb.collection("locations").countDocuments();
  const cartvanSample = await cartvanDb.collection("locations").find({}).limit(3).toArray();
  return { cartvanCount, ecomCount, cartvanSample };
}

// ─────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`=== migrateCartvanShop.js (source=${SOURCE_PROJECT}, shop="${SHOP_NAME}", slug=${SHOP_SLUG}) ===`);
  console.log(`source env:     ${SOURCE_ENV_PATH}`);
  console.log(`ecom-multi env: ${ECOM_ENV_PATH}\n`);

  const cartvanClient = new MongoClient(sourceEnv.MONGO_URI, { serverSelectionTimeoutMS: 15000 });
  const ecomClient = new MongoClient(ecomEnv.MONGO_URI, { serverSelectionTimeoutMS: 15000 });

  await cartvanClient.connect();
  console.log(`[connected] ${SOURCE_PROJECT} -> ${sourceEnv.DB_NAME}`);
  await ecomClient.connect();
  console.log(`[connected] ecom-multi -> ${ecomEnv.DB_NAME}\n`);

  const cartvanDb = cartvanClient.db(sourceEnv.DB_NAME); // READ-ONLY handle, never write via this
  const ecomDb = ecomClient.db(ecomEnv.DB_NAME);

  try {
    // 1) Shop
    const { shopId, created, ownerAdminId: existingOwner } = await ensureShop(ecomDb);
    console.log(`[shop] slug="${SHOP_SLUG}" _id=${shopId} (${created ? "newly created" : "reused existing"})\n`);

    // 2) Tenant-scoped collections
    const tenantModels = discoverTenantModels();
    console.log(`[discover] ${tenantModels.length} tenant-scoped models found (after exclusions):`);
    console.log("  " + tenantModels.map((m) => m.modelName).join(", ") + "\n");

    const collectionRows = [];
    for (const { modelName, collectionName } of tenantModels) {
      const row = await copyCollection(cartvanDb, ecomDb, collectionName, shopId);
      collectionRows.push({ model: modelName, ...row });
      console.log(
        `[copy] ${modelName.padEnd(20)} (${collectionName}): source=${row.source} inserted=${row.inserted} skipped=${row.skipped} errors=${row.errors}`,
      );
    }

    // 3) Admins
    console.log("\n[admins] migrating...");
    const { rows: adminRows, owner, ambiguousOwners } = await migrateAdmins(cartvanDb, ecomDb, shopId);
    adminRows.forEach((r) => console.log(`  ${r.email} (cartvan role: ${r.cartvanRole}) -> ${r.outcome}`));
    if (ambiguousOwners) {
      console.log(
        `  [warn] multiple successfully-migrated ex-superadmins found; chose earliest-created (${owner.email}) as owner. Review manually if wrong:`,
      );
      ambiguousOwners.forEach((c) => console.log(`    - ${c.email} (_id=${c._id}, createdAt=${c.createdAt})`));
    }

    // 4) Set ownerAdminId on the shop (only if not already set)
    let ownerSet = null;
    if (!existingOwner && owner) {
      await ecomDb.collection("shops").updateOne({ _id: shopId }, { $set: { ownerAdminId: owner._id } });
      ownerSet = owner;
      console.log(`\n[shop] ownerAdminId set -> ${owner.email} (_id=${owner._id})`);
    } else if (existingOwner) {
      console.log(`\n[shop] ownerAdminId already set (_id=${existingOwner}) — left untouched`);
    } else {
      console.log(`\n[shop] [warn] no eligible owner admin found — ownerAdminId left null. Manual review needed.`);
    }

    // 5) Counters
    console.log("\n[counters] seeding...");
    const counterResults = await seedCounters(cartvanDb, ecomDb, shopId);
    counterResults.forEach((c) =>
      console.log(`  ${c.name}: cartvan seq=${c.sourceSeq} -> ecom-multi seq=${c.resultSeq} (${c.note})`),
    );

    // 6) Location comparison (report only, no copy)
    console.log("\n[locations] comparing (not tenant-scoped, not copied automatically)...");
    const locComparison = await compareLocations(cartvanDb, ecomDb);
    console.log(
      `  cartvan.locations count=${locComparison.cartvanCount}  ecom-multi.locations count=${locComparison.ecomCount}`,
    );
    if (locComparison.cartvanCount > 0 && locComparison.cartvanCount !== locComparison.ecomCount) {
      console.log("  [warn] counts differ and cartvan has data — review manually, nothing was copied.");
    } else {
      console.log("  No action taken (per spec: compare only).");
    }

    // Final summary table
    console.log("\n=== SUMMARY ===");
    console.log(`Shop: _id=${shopId} slug=${SHOP_SLUG} (${created ? "created" : "reused"})`);
    console.log("\nModel".padEnd(22) + "Source".padStart(8) + "Inserted".padStart(10) + "Skipped".padStart(10) + "Errors".padStart(8));
    for (const r of collectionRows) {
      console.log(
        r.model.padEnd(22) +
          String(r.source).padStart(8) +
          String(r.inserted).padStart(10) +
          String(r.skipped).padStart(10) +
          String(r.errors).padStart(8),
      );
    }
    const totalErrors = collectionRows.reduce((s, r) => s + r.errors, 0);
    console.log(`\nAdmins: ${adminRows.filter((r) => r.outcome.startsWith("migrated")).length} migrated, ${adminRows.filter((r) => r.outcome.startsWith("SKIPPED")).length} skipped`);
    console.log(`Owner admin: ${ownerSet ? ownerSet.email : existingOwner ? "(already set previously)" : "NONE — needs manual review"}`);
    console.log(`Total non-duplicate collection errors: ${totalErrors}`);
    if (totalErrors > 0) {
      console.log("[warn] Some collections had non-duplicate insert errors — see log above, safe to re-run.");
    }
  } finally {
    await cartvanClient.close();
    await ecomClient.close();
  }
}

main().catch((err) => {
  console.error("\n[FATAL]", err);
  process.exitCode = 1;
});
