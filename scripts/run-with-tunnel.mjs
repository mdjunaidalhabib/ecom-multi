// Local dev only: opens an SSH tunnel to the VPS's MongoDB container (same
// one dev-with-tunnel.mjs uses), then runs a single one-off command against
// it with MONGO_URI pointed at the tunnel — without ever writing to
// backend/.env. Meant for one-off scripts like migrations.
//
// Usage (from repo root):
//   npm run with-tunnel -- node migrations/migratePlanBusinessCustomReseller.js
//
// The command runs with cwd=backend/ by default (pass --cwd=<dir> to change),
// so relative imports and backend/.env-based dotenv loading keep working the
// same as running the command directly inside backend/.

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import treeKill from "tree-kill";

import {
  loadTunnelConfig,
  loadLocalMongoUri,
  redact,
  openTunnel,
  waitForPort,
} from "./tunnelLib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

let cwd = "backend";
const commandArgs = [];
for (const arg of process.argv.slice(2)) {
  if (arg.startsWith("--cwd=")) {
    cwd = arg.slice("--cwd=".length);
  } else {
    commandArgs.push(arg);
  }
}

if (commandArgs.length === 0) {
  console.error(
    "[with-tunnel] No command given.\n" +
      "  Usage: npm run with-tunnel -- node migrations/yourScript.js\n"
  );
  process.exit(1);
}

async function main() {
  const cfg = loadTunnelConfig(rootDir);

  // Reuse an already-open tunnel from another terminal (e.g. `npm run tunnel`)
  // instead of failing when the local port is already bound.
  let tunnelProc = null;
  let reused = false;
  try {
    await waitForPort(Number(cfg.localPort), "127.0.0.1", 1000);
    reused = true;
    console.log(`[with-tunnel] Reusing existing tunnel on localhost:${cfg.localPort}`);
  } catch {
    tunnelProc = await openTunnel(cfg);
  }

  const mongoUri = loadLocalMongoUri(rootDir, cfg.localPort);
  console.log(`[with-tunnel] Using MONGO_URI override: ${redact(mongoUri)}`);

  const [cmd, ...args] = commandArgs;
  const child = spawn(cmd, args, {
    cwd: path.resolve(rootDir, cwd),
    stdio: "inherit",
    env: { ...process.env, MONGO_URI: mongoUri },
    shell: process.platform === "win32",
  });

  const shutdown = async (code) => {
    if (tunnelProc && !reused) {
      await new Promise((resolve) => treeKill(tunnelProc.pid, resolve));
    }
    process.exit(code);
  };

  child.on("error", (err) => {
    console.error("[with-tunnel] Failed to run command:", err.message);
    shutdown(1);
  });
  child.on("exit", (code) => shutdown(code ?? 0));
}

main().catch((err) => {
  console.error("[with-tunnel]", err.message);
  process.exit(1);
});
