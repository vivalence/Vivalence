import { TextLineStream } from "@std/streams";
import { join } from "@std/path";
import { DatabaseSync } from "node:sqlite";

export const REPOSITORY = new URL("../../../../", import.meta.url).pathname;
export const SHIPPED = join(REPOSITORY, "commons/instances/hello-world");
export const LEDGER = join(REPOSITORY, "commons/ledger");
const RUN = new URL("../../run.js", import.meta.url).pathname;
export const READY = /^\[runtime\/[^/\]]+\] start\s*$/;
const WATCH = [`--watch=${join(REPOSITORY, "commons")}`, "--watch-exclude=**/dataset/**"];
const DEADLINE = 90_000;
export const SECRET = "hello-secret-hello-secret-hello-secret";
const CARRIED = ["PATH", "HOME", "TMPDIR", "TERM", "LANG", "DENO_DIR", "NO_COLOR"];

export const RECIPE = {
  manifest: { type: "instance", slug: "hello-world", version: "0.0.1" },
  runtime: {
    manifest: { slug: "house" },
    statics: { serve: "${VIVA_RUNTIME_SERVE}", remote: "${VIVA_RUNTIME_SERVE}" },
    secrets: { jwt: "${SECRET_VIVA_JWT}" },
    modes: ["@commons/home/probe"],
  },
  lighthouse: { secrets: { jwt: "${SECRET_VIVA_JWT}" }, traits: ["JOINABLE"] },
  datamap: { module: "@commons/datamap/libsql" },
  hallucinators: [],
  clients: [],
  services: [],
  daemons: [
    {
      manifest: { type: "daemon", slug: "hello", version: "0.0.1" },
      modes: ["@commons/demo/hello-world"],
      consume: { reader: { module: "@commons/service/reader" } },
    },
  ],
  environment: {
    type: "object",
    required: ["VIVA_RUNTIME_SERVE", "SECRET_VIVA_JWT"],
    properties: {
      VIVA_RUNTIME_SERVE: { type: "string", description: "Base URL the runtime serves on." },
      SECRET_VIVA_JWT: { type: "string", minLength: 24, description: "The runtime's signing secret." },
    },
    additionalProperties: false,
  },
};

export const ENVIRONMENT = (origin) => ({
  VIVA_RUNTIME_ORIGIN: origin,
  PUBLIC_VIVA_RUNTIME_REMOTE: `${origin}/`,
  VIVA_CLIENT_ANIMA_ORIGIN: "http://localhost:1794",
  VIVA_CLIENT_ANIMA_SERVE: "http://localhost:1794/",
});

export const lines = (stream, into) =>
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

export async function copy(from, to) {
  await Deno.mkdir(to, { recursive: true });
  for await (const entry of Deno.readDir(from)) {
    const source = join(from, entry.name);
    const target = join(to, entry.name);
    if (entry.isDirectory) await copy(source, target);
    else await Deno.copyFile(source, target);
  }
}

export async function boot({ recipe = RECIPE, modes = [], prefix = "viva-hello-", watch = false } = {}) {
  const composed = { ...recipe, runtime: { ...recipe.runtime, modes: [...recipe.runtime.modes, ...modes] } };
  return await launch({
    prefix,
    ledger: LEDGER,
    environment: ENVIRONMENT,
    watch,
    home: (home) => Deno.writeTextFile(join(home, "instance.viva.json"), JSON.stringify(composed, null, 2)),
  });
}

export async function launch({ prefix, home, ledger = null, environment = () => ({}), watch = false }) {
  const root = await Deno.makeTempDir({ prefix });
  await Deno.mkdir(join(root, "ledger"));
  await Deno.mkdir(join(root, "instance/mountpoint"), { recursive: true });
  await home(join(root, "instance"));
  if (ledger) {
    const { manifest } = JSON.parse(await Deno.readTextFile(join(root, "instance/instance.viva.json")));
    await copy(ledger, join(root, "ledger"));
    await Deno.writeTextFile(join(root, "ledger/instances.json"), `${JSON.stringify({ [manifest.slug]: { mount: await Deno.realPath(join(root, "instance")) } })}\n`);
    await Deno.writeTextFile(
      join(root, "ledger/registry.json"),
      `${JSON.stringify({
        "@commons": { slug: "commons", mount: join(REPOSITORY, "commons") },
        "@memo": { slug: "memo", mount: join(REPOSITORY, "commons/fixtures/memo") },
      })}\n`,
    );
  }
  return await spawn({ root, port: free(), environment, watch });
}

export async function revive(world) {
  return await spawn({ root: world.root, port: world.port, environment: world.environment, watch: world.watch });
}

async function spawn({ root, port, environment, watch }) {
  const origin = `http://localhost:${port}`;
  const carried = Object.fromEntries(CARRIED.filter((key) => Deno.env.has(key)).map((key) => [key, Deno.env.get(key)]));
  const log = [];

  const env = {
    VIVA_INSTANCE_MOUNT: join(root, "instance"),
    VIVA_LEDGER_MOUNT: join(root, "ledger"),
    VIVA_REPOSITORY_MOUNT: REPOSITORY,
    VIVA_REGISTRY_MOUNT: join(root, "ledger/registry"),
    VIVA_RUNTIME_SERVE: `${origin}/`,
    SECRET_VIVA_JWT: SECRET,
    ...environment(origin),
  };
  const child = new Deno.Command(Deno.execPath(), {
    args: ["run", "-A", "--no-check", "--config", join(REPOSITORY, "deno.jsonc"), ...(watch ? WATCH : []), RUN],
    cwd: join(root, "instance"),
    env: { ...carried, ...env },
    clearEnv: true,
    stdin: "null",
    stdout: "piped",
    stderr: "piped",
  }).spawn();

  let settled = false;
  let timer;
  let drained;
  const tail = () => log.slice(-20).join("\n");
  const readiness = new Promise((resolve, reject) => {
    drained = Promise.all([
      lines(child.stdout, (line) => {
        log.push(line);
        if (READY.test(line.trim())) resolve(line.trim());
      }),
      lines(child.stderr, (line) => log.push(line)),
    ]);
    child.status.then((exit) => !settled && reject(new Error(`runtime exited ${exit.code} before ready\n${tail()}`)));
    timer = setTimeout(() => reject(new Error(`runtime not ready after ${DEADLINE} ms\n${tail()}`)), DEADLINE);
  });
  let ready;
  try {
    ready = await readiness;
  } finally {
    settled = true;
    clearTimeout(timer);
  }

  const post = (path, body, token) =>
    fetch(`${origin}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
    });
  const get = (path, token) => fetch(`${origin}${path}`, { headers: token ? { authorization: `Bearer ${token}` } : {} });
  const query = (sql) => {
    const database = new DatabaseSync(join(root, "instance/mountpoint/hello-world.viva.db"), { readOnly: true });
    try {
      return database.prepare(sql).all().map((row) => ({ ...row }));
    } finally {
      database.close();
    }
  };
  const stop = async () => {
    try {
      child.kill("SIGKILL");
    } catch (error) {
      if (!(error instanceof TypeError)) throw error;
    }
    await child.status;
    await drained;
    await Deno.remove(root, { recursive: true });
  };
  return { url: origin, origin, port, secret: SECRET, root, env, environment, watch, ready, log, child, post, get, query, stop };
}
