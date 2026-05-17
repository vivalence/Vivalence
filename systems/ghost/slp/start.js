import paladin from "@vivalence/paladin";
import fs from "@std/fs";
import * as jsonc from "@std/jsonc";
import { join } from "@std/path";
import { resolveVariant } from "../lib/variant.js";
import { buildRuntimeEnv } from "../lib/env.js";
import { recordProcess } from "../lib/processes.js";

export function start(trajectory) {
  trajectory.open("/start", async (ctx) => {
    const [slugOrPath, target] = ctx.argv;

    const resolved = await resolveVariant(slugOrPath);
    const variantPath = resolved.path;

    const wafer = await loadWaferMarker(variantPath);
    if (!wafer) throw new Error(`no variant marker at ${variantPath}`);

    const plan = pickStartPlan(wafer, target);

    const repository = paladin.scope.repository?.absolute;
    if (!repository) throw new Error("paladin.scope.repository unavailable");

    const result = { status: "STARTED", variant: variantPath, slug: resolved.slug };

    if (plan.runtime) {
      const serve = await readServeUrl(variantPath);
      result.runtime = await startRuntime({
        variantPath,
        repository,
        serve,
        runtime: plan.runtime,
        flags: ctx.flags,
      });
    }

    if (plan.clients.length) {
      result.clients = [];
      for (const client of plan.clients) {
        result.clients.push(
          await startClient({ variantPath, repository, client, flags: ctx.flags }),
        );
      }
    }

    return result;
  });
}

export function pickStartPlan(wafer, target) {
  const clients = Object.values(wafer.clients ?? {});

  if (!target) return { runtime: wafer.runtime, clients };
  if (target === "runtime") return { runtime: wafer.runtime, clients: [] };
  if (target === "client" || target === "clients") return { runtime: null, clients };

  if (wafer.runtime?.slug === target) return { runtime: wafer.runtime, clients: [] };

  const client = wafer.clients?.[target] ?? clients.find((c) => c.slug === target);
  if (client) return { runtime: null, clients: [client] };

  throw new Error(`unknown target: ${target}`);
}

async function startRuntime({ variantPath, repository, serve, flags }) {
  const runtimePath = join(repository, "systems", "runtime", "run.js");
  if (!(await fs.pathExists(runtimePath))) {
    throw new Error(`runtime not found at ${runtimePath}`);
  }

  const env = buildRuntimeEnv(variantPath);
  const foreground = !!flags.foreground;

  if (foreground) {
    const command = new Deno.Command("deno", {
      args: ["run", "-A", runtimePath],
      env,
      clearEnv: false,
      stdout: "inherit",
      stderr: "inherit",
    });
    const child = command.spawn();
    const status = await child.status;
    return {
      status: status.success ? "EXITED" : "FAILED",
      code: status.code,
    };
  }

  const log = await openLogFile(variantPath, "runtime");
  const pid = await spawnDetached({
    cmd: `deno run -A "${runtimePath}"`,
    log,
    env,
  });

  const entry = {
    kind: "runtime",
    slug: "runtime",
    pid,
    variant: variantPath,
    serve,
    log,
    started: new Date().toISOString(),
  };
  await recordProcess(entry);
  return entry;
}

async function startClient({ variantPath, repository, client, flags }) {
  const dir = join(repository, "systems", client.slug);
  if (!(await fs.pathExists(dir))) {
    throw new Error(`client directory not found: ${dir}`);
  }

  const env = buildRuntimeEnv(variantPath);
  const foreground = !!flags.foreground;

  if (foreground) {
    const command = new Deno.Command("deno", {
      args: ["task", "--cwd", dir, "start"],
      env,
      clearEnv: false,
      stdout: "inherit",
      stderr: "inherit",
    });
    const child = command.spawn();
    const status = await child.status;
    return {
      kind: "client",
      slug: client.slug,
      status: status.success ? "EXITED" : "FAILED",
      code: status.code,
    };
  }

  const log = await openLogFile(variantPath, client.slug);
  const pid = await spawnDetached({
    cmd: `deno task --cwd "${dir}" start`,
    log,
    env,
  });

  const entry = {
    kind: "client",
    slug: client.slug,
    pid,
    variant: variantPath,
    log,
    started: new Date().toISOString(),
  };
  await recordProcess(entry);
  return entry;
}

async function spawnDetached({ cmd, log, env }) {
  const script = `nohup ${cmd} >> "${log}" 2>&1 </dev/null & pid=$!; echo $pid`;
  const result = await new Deno.Command("sh", {
    args: ["-c", script],
    env,
    clearEnv: false,
    stdout: "piped",
    stderr: "piped",
  }).output();

  if (!result.success) {
    const err = new TextDecoder().decode(result.stderr).trim();
    throw new Error(`spawn failed (${result.code}): ${err}`);
  }

  const pid = Number(new TextDecoder().decode(result.stdout).trim());
  if (!pid) throw new Error(`failed to capture pid for: ${cmd}`);
  return pid;
}

async function openLogFile(variantPath, slug) {
  const logsDir = join(variantPath, ".logs");
  await fs.ensureDir(logsDir);
  return join(logsDir, `${slug}.log`);
}

async function loadWaferMarker(variantPath) {
  for await (const entry of Deno.readDir(variantPath)) {
    if (entry.isDirectory) continue;
    if (!entry.name.endsWith(".viva.js")) continue;
    const path = join(variantPath, entry.name);
    try {
      const mod = await import(`file://${path}`);
      if (mod.manifest?.type === "variant") return mod;
    } catch {}
  }
  for await (const entry of Deno.readDir(variantPath)) {
    if (!entry.isDirectory || entry.name === "bak") continue;
    const result = await loadWaferMarker(join(variantPath, entry.name));
    if (result) return result;
  }
  return null;
}

async function readServeUrl(variantPath) {
  const candidates = ["variant.jsonc", "variant.json"];
  for (const name of candidates) {
    const path = join(variantPath, "environment", name);
    try {
      const text = await Deno.readTextFile(path);
      const parsed = jsonc.parse(text);
      const url = parsed?.PUBLIC_VIVA_RUNTIME_REMOTE ?? parsed?.VIVA_RUNTIME_SERVE;
      if (url) return url;
    } catch {}
  }
  return null;
}
