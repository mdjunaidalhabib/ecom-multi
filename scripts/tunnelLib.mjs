// Shared helpers for opening an SSH tunnel to the VPS's MongoDB container.
// Used by dev-with-tunnel.mjs (starts the dev apps) and run-with-tunnel.mjs
// (runs a single one-off command, e.g. a migration script).

import { spawn } from "node:child_process";
import { connect } from "node:net";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

export function parseEnvFile(filePath) {
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

export function loadTunnelConfig(rootDir) {
  const configPath = path.join(rootDir, ".env.tunnel");
  if (!existsSync(configPath)) {
    console.error(
      `\n[tunnel] Missing ${configPath}\n` +
        `Copy tunnel.env.example to .env.tunnel and fill in your VPS SSH details, then try again.\n`
    );
    process.exit(1);
  }
  const cfg = parseEnvFile(configPath);
  for (const key of ["SSH_HOST", "SSH_USER"]) {
    if (!cfg[key]) {
      console.error(`[tunnel] .env.tunnel is missing required key: ${key}`);
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

export function sshBaseArgs(cfg) {
  // BatchMode=yes: fail fast instead of hanging on a password/host-key prompt
  // that nothing here can answer (this script never handles passwords).
  const args = ["-p", cfg.sshPort, "-o", "BatchMode=yes"];
  if (cfg.sshKeyPath) args.push("-i", cfg.sshKeyPath);
  return args;
}

// Resolve the Mongo container's *current* IP on the coolify network via SSH,
// instead of hardcoding it — it can change whenever Coolify recreates the container.
export function resolveContainerIp(cfg) {
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

export function waitForPort(port, host = "127.0.0.1", timeoutMs = 20000) {
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

// Rebuilds MONGO_URI with host:port swapped to the tunnel, treating credentials
// as an opaque blob so the password is never parsed out or hardcoded here.
//
// replicaSet=... is dropped in favor of directConnection=true: the tunnel is a
// single point-to-point link to one node, so replica-set topology discovery
// breaks it — MongoDB reports the primary by its internal hostname (the
// Coolify container name), which doesn't resolve on this machine, and the
// driver reconnects there directly instead of through the tunnel (ENOTFOUND).
// directConnection=true skips discovery and talks to the tunneled node only;
// transactions still work since that node is a real replica-set primary.
export function buildTunneledUri(originalUri, localPort) {
  const m = originalUri.match(/^(mongodb(?:\+srv)?:\/\/)([^/]+)(\/.*)?$/);
  if (!m) throw new Error("MONGO_URI in backend/.env is not in a recognizable mongodb:// format");
  const [, prefix, authority, rest] = m;
  const at = authority.lastIndexOf("@");
  const creds = at >= 0 ? authority.slice(0, at + 1) : "";

  const [path, query = ""] = (rest || "/").split("?");
  const params = new URLSearchParams(query);
  params.delete("replicaSet");
  params.set("directConnection", "true");

  return `${prefix}${creds}localhost:${localPort}${path || "/"}?${params.toString()}`;
}

export function redact(uri) {
  return uri.replace(/:\/\/[^@]+@/, "://***:***@");
}

export function loadLocalMongoUri(rootDir, localPort) {
  const backendEnvPath = path.join(rootDir, "backend", ".env");
  if (!existsSync(backendEnvPath)) {
    console.error(`[tunnel] backend/.env not found at ${backendEnvPath}`);
    process.exit(1);
  }
  const backendEnv = parseEnvFile(backendEnvPath);
  if (!backendEnv.MONGO_URI) {
    console.error("[tunnel] backend/.env has no MONGO_URI to base the tunneled URI on.");
    process.exit(1);
  }
  return buildTunneledUri(backendEnv.MONGO_URI, localPort);
}

// Opens the SSH tunnel and resolves once it's accepting connections. Returns
// the spawned ssh ChildProcess so the caller can kill() it when done.
export async function openTunnel(cfg) {
  console.log(`[tunnel] Resolving ${cfg.mongoContainer} IP on network "${cfg.mongoNetwork}"...`);
  const containerIp = await resolveContainerIp(cfg);
  console.log(`[tunnel] Container IP: ${containerIp}`);

  const tunnelArgs = [
    ...sshBaseArgs(cfg),
    "-N",
    "-L",
    `${cfg.localPort}:${containerIp}:${cfg.mongoRemotePort}`,
    `${cfg.sshUser}@${cfg.sshHost}`,
  ];
  console.log(`[tunnel] Opening SSH tunnel: localhost:${cfg.localPort} -> ${containerIp}:${cfg.mongoRemotePort}`);
  const tunnelProc = spawn("ssh", tunnelArgs, { stdio: ["ignore", "inherit", "inherit"] });

  await waitForPort(Number(cfg.localPort));
  console.log(`[tunnel] Tunnel is up on localhost:${cfg.localPort}`);

  return tunnelProc;
}
