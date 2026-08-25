// Local dev only: opens an SSH tunnel to the VPS's MongoDB container, then starts
// frontend/admin/super-admin/backend with MONGO_URI pointed at the tunnel — without
// ever writing to backend/.env. Never used in production (PM2 starts server.js directly).

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import treeKill from "tree-kill";

import { loadTunnelConfig, loadLocalMongoUri, redact, openTunnel } from "./tunnelLib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const tunnelOnly = process.argv.includes("--tunnel-only");

async function main() {
  const cfg = loadTunnelConfig(rootDir);
  const tunnelProc = await openTunnel(cfg);

  let shuttingDown = false;
  let appsProc = null;

  const shutdown = async (code) => {
    if (shuttingDown) return;
    shuttingDown = true;
    // appsProc runs through a shell on Windows (see below), so plain .kill() would
    // only stop the shell and leak the actual dev servers underneath it. Wait for
    // tree-kill's helper process to actually finish before exiting — otherwise this
    // process (and the helper it just spawned) can be torn down by process.exit()
    // before the kill has taken effect.
    if (appsProc && appsProc.pid) {
      await new Promise((resolve) => treeKill(appsProc.pid, resolve));
    }
    tunnelProc.kill();
    process.exit(code);
  };

  tunnelProc.on("error", (err) => {
    console.error("[dev-tunnel] Failed to start ssh:", err.message);
    shutdown(1);
  });
  tunnelProc.on("exit", (code, signal) => {
    if (shuttingDown) return;
    console.error(`[dev-tunnel] SSH tunnel closed unexpectedly (code ${code}, signal ${signal}).`);
    shutdown(1);
  });

  process.on("SIGINT", () => shutdown(0));
  process.on("SIGTERM", () => shutdown(0));

  if (tunnelOnly) {
    console.log("[dev-tunnel] --tunnel-only: leaving tunnel open. Press Ctrl+C to stop.");
    return;
  }

  const mongoUri = loadLocalMongoUri(rootDir, cfg.localPort);
  console.log(`[dev-tunnel] Using MONGO_URI override: ${redact(mongoUri)}`);

  const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
  appsProc = spawn(npmCmd, ["run", "dev:apps"], {
    cwd: rootDir,
    stdio: "inherit",
    env: { ...process.env, MONGO_URI: mongoUri },
    // npm.cmd is a batch file on Windows — Node's spawn() throws EINVAL trying
    // to exec it directly there, so it needs to go through a shell.
    shell: process.platform === "win32",
  });

  appsProc.on("exit", (code) => shutdown(code ?? 0));
}

main().catch((err) => {
  console.error("[dev-tunnel]", err.message);
  process.exit(1);
});
