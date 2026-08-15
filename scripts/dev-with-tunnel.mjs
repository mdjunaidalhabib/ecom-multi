// Local dev only: opens an SSH tunnel to the VPS's MongoDB container, then starts
// frontend/admin/super-admin/backend with MONGO_URI pointed at the tunnel — without
// ever writing to backend/.env. Never used in production (PM2 starts server.js directly).

import { spawn } from "node:child_process";
import { connect } from "node:net";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import treeKill from "tree-kill";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const tunnelOnly = process.argv.includes("--tunnel-only");

function parseEnvFile(filePath) {
  const env = {};
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return env;
}

function loadTunnelConfig() {
  const configPath = path.join(rootDir, ".env.tunnel");
  if (!existsSync(configPath)) {
    console.error(
      `\n[dev-tunnel] Missing ${configPath}\n` +
        `Copy tunnel.env.example to .env.tunnel and fill in your VPS SSH details, then try again.\n`
    );
    process.exit(1);
  }
  const cfg = parseEnvFile(configPath);
  for (const key of ["SSH_HOST", "SSH_USER"]) {
    if (!cfg[key]) {
      console.error(`[dev-tunnel] .env.tunnel is missing required key: ${key}`);
      process.exit(1);
    }
  }
  return {
    sshHost: cfg.SSH_HOST,
    sshUser: cfg.SSH_USER,
    sshPort: cfg.SSH_PORT || "22",
    sshKeyPath: cfg.SSH_KEY_PATH || "",
    mongoContainer: cfg.MONGO_CONTAINER_NAME || "r5tsr3ibnibab126euufthwp",
    mongoNetwork: cfg.MONGO_DOCKER_NETWORK || "coolify",
    mongoRemotePort: cfg.MONGO_REMOTE_PORT || "27017",
    localPort: cfg.LOCAL_TUNNEL_PORT || "27018",
  };
}

function sshBaseArgs(cfg) {
  // BatchMode=yes: fail fast instead of hanging on a password/host-key prompt
  // that nothing here can answer (this script never handles passwords).
  const args = ["-p", cfg.sshPort, "-o", "BatchMode=yes"];
  if (cfg.sshKeyPath) args.push("-i", cfg.sshKeyPath);
  return args;
}

// Resolve the Mongo container's *current* IP on the coolify network via SSH,
// instead of hardcoding it — it can change whenever Coolify recreates the container.
function resolveContainerIp(cfg) {
  return new Promise((resolve, reject) => {
    const dockerCmd = `docker inspect -f '{{(index .NetworkSettings.Networks "${cfg.mongoNetwork}").IPAddress}}' ${cfg.mongoContainer}`;
    const args = [...sshBaseArgs(cfg), `${cfg.sshUser}@${cfg.sshHost}`, dockerCmd];
    const proc = spawn("ssh", args, { stdio: ["ignore", "pipe", "inherit"] });
    let out = "";
    proc.stdout.on("data", (d) => (out += d));
    proc.on("error", reject);
    proc.on("exit", (code) => {
      const ip = out.trim();
      if (code !== 0 || !/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) {
        reject(
          new Error(
            `Could not resolve container IP (exit ${code}, got "${ip}"). ` +
              `Check MONGO_CONTAINER_NAME/MONGO_DOCKER_NETWORK in .env.tunnel and that the container is running.`
          )
        );
        return;
      }
      resolve(ip);
    });
  });
}

function waitForPort(port, host = "127.0.0.1", timeoutMs = 20000) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const socket = connect({ port, host }, () => {
        socket.end();
        resolve();
      });
      socket.on("error", () => {
        socket.destroy();
        if (Date.now() > deadline) {
          reject(new Error(`Timed out waiting for tunnel on ${host}:${port}`));
        } else {
          setTimeout(attempt, 300);
        }
      });
    };
    attempt();
  });
}

// Rebuilds MONGO_URI with only host:port swapped, treating credentials as an
// opaque blob so the password is never parsed out or hardcoded here.
function buildTunneledUri(originalUri, localPort) {
  const m = originalUri.match(/^(mongodb(?:\+srv)?:\/\/)([^/]+)(\/.*)?$/);
  if (!m) throw new Error("MONGO_URI in backend/.env is not in a recognizable mongodb:// format");
  const [, prefix, authority, rest] = m;
  const at = authority.lastIndexOf("@");
  const creds = at >= 0 ? authority.slice(0, at + 1) : "";
  return `${prefix}${creds}localhost:${localPort}${rest || ""}`;
}

function redact(uri) {
  return uri.replace(/:\/\/[^@]+@/, "://***:***@");
}

function loadLocalMongoUri(localPort) {
  const backendEnvPath = path.join(rootDir, "backend", ".env");
  if (!existsSync(backendEnvPath)) {
    console.error(`[dev-tunnel] backend/.env not found at ${backendEnvPath}`);
    process.exit(1);
  }
  const backendEnv = parseEnvFile(backendEnvPath);
  if (!backendEnv.MONGO_URI) {
    console.error("[dev-tunnel] backend/.env has no MONGO_URI to base the tunneled URI on.");
    process.exit(1);
  }
  return buildTunneledUri(backendEnv.MONGO_URI, localPort);
}

async function main() {
  const cfg = loadTunnelConfig();

  console.log(`[dev-tunnel] Resolving ${cfg.mongoContainer} IP on network "${cfg.mongoNetwork}"...`);
  const containerIp = await resolveContainerIp(cfg);
  console.log(`[dev-tunnel] Container IP: ${containerIp}`);

  const tunnelArgs = [
    ...sshBaseArgs(cfg),
    "-N",
    "-L",
    `${cfg.localPort}:${containerIp}:${cfg.mongoRemotePort}`,
    `${cfg.sshUser}@${cfg.sshHost}`,
  ];
  console.log(`[dev-tunnel] Opening SSH tunnel: localhost:${cfg.localPort} -> ${containerIp}:${cfg.mongoRemotePort}`);
  const tunnelProc = spawn("ssh", tunnelArgs, { stdio: ["ignore", "inherit", "inherit"] });

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

  try {
    await waitForPort(Number(cfg.localPort));
  } catch (err) {
    console.error(`[dev-tunnel] ${err.message}`);
    shutdown(1);
    return;
  }
  console.log(`[dev-tunnel] Tunnel is up on localhost:${cfg.localPort}`);

  if (tunnelOnly) {
    console.log("[dev-tunnel] --tunnel-only: leaving tunnel open. Press Ctrl+C to stop.");
    return;
  }

  const mongoUri = loadLocalMongoUri(cfg.localPort);
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
