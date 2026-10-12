import { TextLineStream } from "@std/streams";
import { join } from "@std/path";
import { DatabaseSync } from "node:sqlite";

export const REPOSITORY = new URL("../../../../", import.meta.url).pathname.replace(/\/$/, "");
const RUN = new URL("../../run.js", import.meta.url).pathname;
const GHOST = join(REPOSITORY, "systems/ghost/run.js");
const CONFIG = join(REPOSITORY, "deno.jsonc");
const READY = /^Status:RUNNING$/;
const CARRIED = ["PATH", "TMPDIR", "TERM", "LANG", "DENO_DIR", "NO_COLOR"];

const carried = () => Object.fromEntries(CARRIED.filter((key) => Deno.env.has(key)).map((key) => [key, Deno.env.get(key)]));

const lines = (stream, into) =>
  stream
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream())
    .pipeTo(new WritableStream({ write: (line) => into(line) }));

export function free() {
  const listener = Deno.listen({ port: 0 });
  const { port } = listener.addr;
  listener.close();
  return port;
}

export async function copy(from, to, { skip = [] } = {}) {
  await Deno.mkdir(to, { recursive: true });
  for await (const entry of Deno.readDir(from)) {
    if (skip.includes(entry.name)) continue;
    const source = join(from, entry.name);
    const target = join(to, entry.name);
    if (entry.isDirectory) await copy(source, target, { skip });
    else if (entry.isFile) await Deno.copyFile(source, target);
  }
}

export const exists = (path) => Deno.stat(path).then(() => true, () => false);

export async function pin(shelf, values) {
  const file = join(shelf, ".env");
  const held = (await Deno.readTextFile(file).catch(() => "")).split("\n");
  for (const [key, value] of Object.entries(values)) {
    const at = held.findIndex((line) => line.startsWith(`${key}=`));
    if (at === -1) held.push(`${key}=${value}`);
    else held[at] = `${key}=${value}`;
  }
  await Deno.writeTextFile(file, held.join("\n"));
}

export async function ledger(prefix) {
  const root = await Deno.makeTempDir({ prefix });
  await Deno.mkdir(join(root, "home"));
  await Deno.mkdir(join(root, "ledger"));
  const origin = `http://localhost:${free()}`;
  const environment = (extra = {}) => ({
    ...carried(),
    HOME: join(root, "home"),
    XDG_CONFIG_HOME: join(root, "home"),
    VIVA_LEDGER_MOUNT: join(root, "ledger"),
    VIVA_REPOSITORY_MOUNT: REPOSITORY,
    VIVA_REGISTRY_MOUNT: join(root, "ledger/registry"),
    VIVA_RUNTIME_ORIGIN: origin,
    ...extra,
  });
  return { root, origin, environment, remove: () => Deno.remove(root, { recursive: true }).catch(() => {}) };
}

export async function viva(world, args, extra = {}) {
  const command = new Deno.Command(Deno.execPath(), {
    args: ["run", "--config", CONFIG, "--no-check", "-A", GHOST, ...args, "--json"],
    cwd: world.root,
    env: world.environment(extra),
    clearEnv: true,
    stdin: "null",
    stdout: "piped",
    stderr: "piped",
  });
  const { code, stdout, stderr } = await command.output();
  const out = new TextDecoder().decode(stdout);
  const err = new TextDecoder().decode(stderr);
  const held = out.split("\n");
  const start = held.lastIndexOf("{");
  let effect = null;
  try {
    effect = start >= 0 ? JSON.parse(held.slice(start).join("\n")) : null;
  } catch {
    effect = null;
  }
  return { code, out, err, effect };
}

export async function boot(world, { shelf, slug, extra = {}, deadline = 120_000 }) {
  const child = new Deno.Command(Deno.execPath(), {
    args: ["run", "-A", "--no-check", "--config", CONFIG, RUN],
    cwd: shelf,
    env: world.environment({ VIVA_INSTANCE_MOUNT: shelf, ...extra }),
    clearEnv: true,
    stdin: "null",
    stdout: "piped",
    stderr: "piped",
  }).spawn();

  const log = [];
  let settled = false;
  let timer;
  const tail = () => log.slice(-30).join("\n");
  let drained;
  const outcome = await new Promise((resolve) => {
    drained = Promise.all([
      lines(child.stdout, (line) => {
        log.push(line);
        if (READY.test(line.trim())) resolve({ ready: line.trim(), code: null });
      }),
      lines(child.stderr, (line) => log.push(line)),
    ]);
    child.status.then((exit) => !settled && resolve({ ready: null, code: exit.code }));
    timer = setTimeout(() => resolve({ ready: null, code: "DEADLINE" }), deadline);
  });
  settled = true;
  clearTimeout(timer);
  if (outcome.code === "DEADLINE") child.kill("SIGKILL");
  if (outcome.code !== null) await drained;

  const { origin } = world;
  const headers = (token) => ({ "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) });
  const post = (path, body, token) => fetch(`${origin}${path}`, { method: "POST", headers: headers(token), body: JSON.stringify(body ?? {}) });
  const call = async (path, body, token) => {
    const response = await post(path, body, token);
    const parsed = await response.json();
    if (!response.ok) throw new Error(`${path} ${response.status} ${JSON.stringify(parsed)}`);
    return parsed;
  };
  const get = (path, token) => fetch(`${origin}${path}`, { headers: token ? { authorization: `Bearer ${token}` } : {} });
  const query = (sql) => {
    const db = new DatabaseSync(join(shelf, `mountpoint/${slug}.viva.db`), { readOnly: true });
    try {
      return db.prepare(sql).all().map((row) => ({ ...row }));
    } finally {
      db.close();
    }
  };
  const subscribe = async (path, token) => {
    const response = await fetch(`${origin}${path}`, { headers: { accept: "text/event-stream", ...(token ? { authorization: `Bearer ${token}` } : {}) } });
    if (!response.ok) throw new Error(`${path} ${response.status}`);
    const reader = response.body.pipeThrough(new TextDecoderStream()).pipeThrough(new TextLineStream()).getReader();
    const events = [];
    const waiters = [];
    const pump = (async () => {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) return;
        if (!value.startsWith("data:")) continue;
        let parsed;
        try {
          parsed = JSON.parse(value.slice(5).trim());
        } catch {
          continue;
        }
        events.push(parsed);
        waiters.splice(0).forEach((wake) => wake());
      }
    })();
    const next = (predicate = () => true, ms = 5_000) =>
      new Promise((resolve, reject) => {
        const look = () => {
          const found = events.find(predicate);
          if (found) resolve(found);
          else waiters.push(look);
        };
        setTimeout(() => reject(new Error(`no event within ${ms} ms — saw ${JSON.stringify(events).slice(0, 400)}`)), ms);
        look();
      });
    const close = async () => {
      await reader.cancel().catch(() => {});
      await pump.catch(() => {});
    };
    return { events, next, close };
  };
  const sink = Deno.env.get("VIVA_QA_LOG");
  const dump = () => (sink ? Deno.writeTextFile(sink, `\n--- ${shelf} exit=${outcome.code}\n${log.join("\n")}\n`, { append: true }) : Promise.resolve());
  const stop = async (signal = "SIGTERM") => {
    if (outcome.code !== null) return (await dump(), outcome.code);
    try {
      child.kill(signal);
    } catch {
      return (await child.status).code;
    }
    const exit = await child.status;
    await drained;
    await dump();
    return exit.code;
  };
  return { child, ready: outcome.ready, exit: outcome.code, log, tail, origin, post, call, get, query, subscribe, stop };
}

export const RECIPE = (slug, daemons, { hallucinators = [], clients = [] } = {}) => ({
  manifest: { type: "instance", slug, version: "0.0.1" },
  runtime: {
    manifest: { slug: "runtime" },
    statics: { serve: "${VIVA_RUNTIME_SERVE}", remote: "${PUBLIC_VIVA_RUNTIME_REMOTE}" },
    secrets: { jwt: "${SECRET_VIVA_JWT}" },
  },
  lighthouse: {
    secrets: { jwt: "${SECRET_VIVA_JWT}" },
    traits: ["JOINABLE"],
  },
  datamap: { module: "@commons/datamap/libsql" },
  hallucinators,
  clients,
  services: [],
  daemons,
  environment: {
    type: "object",
    required: ["VIVA_RUNTIME_SERVE", "PUBLIC_VIVA_RUNTIME_REMOTE", "SECRET_VIVA_JWT"],
    properties: {
      VIVA_RUNTIME_ORIGIN: { type: "string", description: "Scheme and authority the runtime is reachable at.", default: "http://localhost:2501", group: "addresses" },
      VIVA_RUNTIME_SERVE: { type: "string", description: "Base URL the runtime serves on.", default: "${VIVA_RUNTIME_ORIGIN}/", group: "addresses" },
      PUBLIC_VIVA_RUNTIME_REMOTE: { type: "string", description: "Runtime address a client calls.", default: "${VIVA_RUNTIME_SERVE}", group: "addresses" },
      SECRET_VIVA_JWT: { type: "string", minLength: 24, description: "Signing secret, minted by viva instance/init.", group: "keys" },
    },
    additionalProperties: false,
  },
});
