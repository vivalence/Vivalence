import { specimen } from "@vivalence/typology";
import { TextLineStream } from "@std/streams";
import { join } from "@std/path";
import { DatabaseSync } from "node:sqlite";

const { describe, it, expect, beforeAll, afterAll } = specimen;

const REPOSITORY = new URL("../../../../", import.meta.url).pathname;
const SHIPPED = join(REPOSITORY, "commons/instances/hello-world");
const LEDGER = join(REPOSITORY, "commons/ledger");
const RUN = new URL("../../run.js", import.meta.url).pathname;
const READY = /^Status:RUNNING$/;
const DEADLINE = 90_000;
const SECRET = "hello-secret-hello-secret-hello-secret";
const CARRIED = ["PATH", "HOME", "TMPDIR", "TERM", "LANG", "DENO_DIR", "NO_COLOR"];

const RECIPE = {
  manifest: { type: "instance", slug: "hello-world", version: "0.0.1" },
  runtime: {
    manifest: { slug: "house" },
    statics: { serve: "${VIVA_RUNTIME_SERVE}", remote: "${VIVA_RUNTIME_SERVE}" },
    secrets: { jwt: "${SECRET_VIVA_JWT}" },
    modes: ["./probe.viva.js"],
  },
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

const PROBE = `import { Vector } from "@vivalence/typology";
export const manifest = { type: "home", slug: "probe", version: "0.0.1", traits: ["RUNTIME", "EXPOSED", "TOOLING", "DATASET"] };
export const aperture = new Vector().open("/ping", (_, ctx) => ({ reference: ctx.reference.absolute, mode: ctx.mode.manifest.slug, note: "note" in ctx.entities, daemon: ctx.daemon ?? null }));
export const tools = new Vector();
export const dataset = {};
`;

const lines = (stream, into) =>
  stream
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream())
    .pipeTo(new WritableStream({ write: (line) => into(line) }));

function free() {
  const listener = Deno.listen({ port: 0 });
  const { port } = listener.addr;
  listener.close();
  return port;
}

async function copy(from, to) {
  await Deno.mkdir(to, { recursive: true });
  for await (const entry of Deno.readDir(from)) {
    const source = join(from, entry.name);
    const target = join(to, entry.name);
    if (entry.isDirectory) await copy(source, target);
    else await Deno.copyFile(source, target);
  }
}

async function boot({ prefix, recipe, ledger = null, environment = () => ({}) }) {
  const root = await Deno.makeTempDir({ prefix });
  await Deno.mkdir(join(root, "ledger"));
  if (ledger) {
    await copy(ledger, join(root, "ledger"));
    await Deno.writeTextFile(join(root, "ledger/instances.json"), "{}\n");
    await Deno.writeTextFile(join(root, "ledger/registry.json"), `${JSON.stringify({ "@commons": { slug: "commons", mount: join(REPOSITORY, "commons") } })}\n`);
  }
  await Deno.mkdir(join(root, "instance/mountpoint"), { recursive: true });
  await recipe(join(root, "instance"));
  const origin = `http://localhost:${free()}`;
  const carried = Object.fromEntries(CARRIED.filter((key) => Deno.env.has(key)).map((key) => [key, Deno.env.get(key)]));
  const log = [];

  const child = new Deno.Command(Deno.execPath(), {
    args: ["run", "-A", "--no-check", "--config", join(REPOSITORY, "deno.jsonc"), RUN],
    cwd: join(root, "instance"),
    env: {
      ...carried,
      VIVA_INSTANCE_MOUNT: join(root, "instance"),
      VIVA_LEDGER_MOUNT: join(root, "ledger"),
      VIVA_REPOSITORY_MOUNT: REPOSITORY,
      VIVA_REGISTRY_MOUNT: join(root, "ledger/registry"),
      VIVA_RUNTIME_SERVE: `${origin}/`,
      SECRET_VIVA_JWT: SECRET,
      ...environment(origin),
    },
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
      body: JSON.stringify(body ?? {}),
    });
  const get = (path, token) => fetch(`${origin}${path}`, { headers: token ? { authorization: `Bearer ${token}` } : {} });
  const query = (sql) => {
    const db = new DatabaseSync(join(root, "instance/mountpoint/hello-world.viva.db"), { readOnly: true });
    try {
      return db.prepare(sql).all().map((row) => ({ ...row }));
    } finally {
      db.close();
    }
  };
  const stop = async () => {
    try {
      child.kill("SIGKILL");
    } catch {
      // already exited
    }
    await child.status;
    await drained;
    await Deno.remove(root, { recursive: true });
  };
  return { root, origin, ready, log, child, post, get, query, stop };
}

describe("runtime boot — the rig's run.js on a temp ledger: one datamap, the lighthouse inside", () => {
  let world;
  let finn;
  let thread;

  beforeAll(async () => {
    world = await boot({
      prefix: "viva-hello-",
      recipe: async (home) => {
        await Deno.writeTextFile(join(home, "instance.viva.json"), JSON.stringify(RECIPE, null, 2));
        await Deno.writeTextFile(join(home, "probe.viva.js"), PROBE);
      },
    });
  });

  afterAll(() => world.stop());

  it("prints the readiness line", () => {
    expect(world.ready).toBe("Status:RUNNING");
  });

  it("ONE datamap on disk at the instance mountpoint — no per-daemon db", async () => {
    const files = [];
    for await (const entry of Deno.readDir(join(world.root, "instance/mountpoint"))) files.push(entry.name);
    expect(files.filter((name) => name.endsWith(".viva.db"))).toEqual(["hello-world.viva.db"]);
    for await (const entry of Deno.readDir(join(world.root, "instance/mountpoint/daemon_hello"))) expect(entry.name.endsWith(".viva.db")).toBe(false);
    expect(world.query("select slug from Daemon")).toEqual([{ slug: "hello" }]);
  });

  it("/status · /metadata answer with no token", async () => {
    for (const path of ["/status", "/metadata/manifest", "/metadata/daemons", "/metadata/aperture"]) {
      const response = await world.get(path);
      expect([path, response.status]).toEqual([path, 200]);
      await response.body?.cancel();
    }
  });

  it("/userspace and /daemon/<slug> refuse without a token", async () => {
    const userspace = await world.post("/userspace/entities/thread/find", { where: {} });
    expect(userspace.status).toBe(401);
    expect((await userspace.json()).error.code).toBe("MISSING_TOKEN");
    const daemon = await world.get("/daemon/hello/status");
    expect(daemon.status).toBe(401);
    expect((await daemon.json()).error.code).toBe("MISSING_TOKEN");
    expect(world.query("select * from User_daemons")).toEqual([]);
  });

  it("signup → login over /lighthouse, no handshake", async () => {
    const signup = await (await world.post("/lighthouse/signup", { username: "finn", password: "hunter22" })).json();
    expect(signup.status).toBe("SUCCESS");
    const login = await (await world.post("/lighthouse/login", { username: "finn", password: "hunter22" })).json();
    expect(login.status).toBe("SUCCESS");
    expect(login.user.id).toBe(signup.user.id);
    finn = { user: login.user, access: login.authority.access };
    const handshake = await world.post("/daemon/hello/userspace/handshake", {}, finn.access);
    expect(handshake.status).toBe(404);
    await handshake.body?.cancel();
  });

  it("a runtime-level thread — mode null — under /userspace", async () => {
    const response = await world.post("/userspace/entities/thread/create", { data: {} }, finn.access);
    expect(response.status).toBe(200);
    thread = await response.json();
    expect(thread.user.id ?? thread.user).toBe(finn.user.id);
    expect(thread.mode ?? null).toBe(null);
    expect(world.query(`select mode from Thread where id = '${thread.id}'`)).toEqual([{ mode: null }]);
  });

  it("a turn on the runtime-level thread lands and is stored — no second Thread, nobody answers", async () => {
    const response = await world.post("/userspace/entities/turn/create", { data: { thread: thread.id, role: "user", parts: [{ type: "text", text: "hello" }] } }, finn.access);
    const body = await response.json();
    expect([response.status, body.code ?? null]).toEqual([200, null]);
    expect(world.query(`select thread, mode from Turn`)).toEqual([{ thread: thread.id, mode: null }]);
    expect(world.query(`select count(*) as threads from Thread`)).toEqual([{ threads: 1 }]);
  });

  it("a user's first daemon request writes User_daemons", async () => {
    const response = await world.get("/daemon/hello/status", finn.access);
    expect(response.status).toBe(200);
    await response.body?.cancel();
    expect(world.query("select user_entity_id as user, daemon_entity_slug as daemon from User_daemons")).toEqual([{ user: finn.user.id, daemon: "hello" }]);
  });

  it("/attached/bundle/* answers with no token", async () => {
    const application = await (await world.get("/daemon/hello/mode/demo/hello-world/metadata/application", finn.access)).json();
    const url = new URL(application.url);
    expect(url.pathname).toBe("/attached/bundle/daemon/hello/mode/demo/hello-world");
    const response = await fetch(`${application.url}${application.view.mount}`);
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/javascript");
    await response.body?.cancel();
  });

  it("the Daemon row's mask is the recipe entry", () => {
    const [row] = world.query("select mask from Daemon where slug = 'hello'");
    expect(JSON.parse(row.mask)).toEqual({
      manifest: { type: "daemon", slug: "hello", version: "0.0.1" },
      modes: ["@commons/demo/hello-world"],
      consume: { reader: { module: "@commons/service/reader" } },
    });
  });

  it("the root carries no host's facets — its manifest sits under /metadata, the runtime's modes under /runtime/<slug>", async () => {
    for (const path of ["/manifest", "/metadata/modes", "/metadata/instance"]) {
      const response = await world.get(path);
      expect([path, response.status]).toEqual([path, 404]);
      await response.body?.cancel();
    }
  });

  it("a runtime mode's aperture refuses without a token, like a daemon's", async () => {
    const response = await world.post("/runtime/house/mode/home/probe/ping", {});
    expect(response.status).toBe(401);
    expect((await response.json()).error.code).toBe("MISSING_TOKEN");
  });

  it("a runtime mode declaring DATASET is named at boot — the runtime's catalog does not offer it", () => {
    expect(world.log.filter((line) => line.includes("[trait] home/probe declares DATASET, which /runtime/house does not offer")).length).toBe(1);
  });

  it("a runtime mode answers with the runtime's host words spread flat and no ctx.daemon", async () => {
    const response = await world.post("/runtime/house/mode/home/probe/ping", {}, finn.access);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ reference: "/runtime/house", mode: "probe", note: true, daemon: null });
  });

  it("the runtime host serves what a daemon serves — status and metadata — behind the token", async () => {
    const refused = await world.get("/runtime/house/metadata/modes");
    expect(refused.status).toBe(401);
    expect((await refused.json()).error.code).toBe("MISSING_TOKEN");
    for (const path of ["/status", "/metadata/manifest", "/metadata/statics", "/metadata/cargo", "/metadata/datamap", "/metadata/aperture", "/metadata/cortex"]) {
      const response = await world.get(`/runtime/house${path}`, finn.access);
      expect([path, response.status]).toEqual([path, 200]);
      await response.body?.cancel();
    }
    expect((await (await world.get("/runtime/house/metadata/manifest", finn.access)).json()).slug).toBe("house");
  });

  it("both rungs list their modes in one shape, absolute references", async () => {
    const runtime = await (await world.get("/runtime/house/metadata/modes", finn.access)).json();
    const daemon = await (await world.get("/daemon/hello/metadata/modes", finn.access)).json();
    expect(runtime).toEqual([
      { type: "home", slug: "probe", name: "probe", traits: ["RUNTIME", "EXPOSED", "TOOLING", "DATASET"], reference: "/runtime/house/mode/home/probe", metadata: "/runtime/house/mode/home/probe/metadata" },
    ]);
    expect(daemon.map((mode) => Object.keys(mode))).toEqual(daemon.map(() => Object.keys(runtime[0])));
    expect(daemon.map(({ reference, metadata }) => ({ reference, metadata }))).toEqual([
      { reference: "/daemon/hello/mode/demo/hello-world", metadata: "/daemon/hello/mode/demo/hello-world/metadata" },
    ]);
  });

  it("a runtime mode's metadata answers at the URL its listing names", async () => {
    const [probe] = await (await world.get("/runtime/house/metadata/modes", finn.access)).json();
    const manifest = await world.get(`${probe.metadata}/manifest`, finn.access);
    expect(manifest.status).toBe(404);
    await manifest.body?.cancel();
    const aperture = await world.get(`${probe.metadata}/aperture`, finn.access);
    expect(aperture.status).toBe(200);
    expect(JSON.stringify(await aperture.json())).toContain("ping");
  });

  it("the runtime's cortex is routed like a daemon's — /runtime/<slug>/cortex/<type>/{render,stream}", async () => {
    const response = await world.post("/runtime/house/cortex/dialogue/render", { turns: [] }, finn.access);
    const body = await response.text();
    expect([response.status === 404, body]).toEqual([false, expect.stringContaining("no 'dialogue' faculty resolves a 'render' avenue")]);
  });

  it("the runtime mode's row has no daemon; the daemon's mode keeps its own", () => {
    expect(world.query("select daemon_slug as daemon, type, slug from Mode order by slug")).toEqual([
      { daemon: "hello", type: "demo", slug: "hello-world" },
      { daemon: null, type: "home", slug: "probe" },
    ]);
  });

  it("SIGTERM → exit 0, the port released", async () => {
    world.child.kill("SIGTERM");
    const exit = await world.child.status;
    expect(exit.code).toBe(0);
    await expect(fetch(`${world.origin}/status`)).rejects.toThrow();
  });
});

describe("runtime boot — the shipped commons/instances/hello-world/instance.viva.json, copied to a temp shelf", () => {
  let world;

  beforeAll(async () => {
    world = await boot({
      prefix: "viva-shipped-",
      recipe: (home) => copy(SHIPPED, home),
      ledger: LEDGER,
      environment: (origin) => ({
        VIVA_RUNTIME_ORIGIN: origin,
        VIVA_CLIENT_ANIMA_ORIGIN: "http://localhost:1794",
        VIVA_CLIENT_ANIMA_SERVE: "http://localhost:1794/",
        PUBLIC_VIVA_RUNTIME_REMOTE: `${origin}/`,
      }),
    });
  });

  afterAll(() => world.stop());

  it("boots the shipped recipe as authored — the relative modes, both hallucinators dormant on blank keys", async () => {
    expect(world.ready).toBe("Status:RUNNING");
    expect(world.query("select slug from Daemon")).toEqual([{ slug: "hello" }]);
    expect(world.log.filter((line) => /\[instance\] hallucinators\[\d\] filtered/.test(line)).length).toBe(2);
    const daemons = await (await world.get("/metadata/daemons")).json();
    expect(daemons.map((daemon) => daemon.slug)).toEqual(["hello"]);
  });

  it("signs a user up and lets them into the shipped daemon", async () => {
    const signup = await (await world.post("/lighthouse/signup", { username: "beef", password: "hunter22" })).json();
    expect(signup.status).toBe("SUCCESS");
    const status = await world.get("/daemon/hello/status", signup.authority.access);
    expect(status.status).toBe(200);
    await status.body?.cancel();
    const modes = await (await world.get("/daemon/hello/metadata/modes", signup.authority.access)).json();
    expect(JSON.stringify(modes)).toContain("hello-world");
  });

  it("SIGTERM → exit 0", async () => {
    world.child.kill("SIGTERM");
    expect((await world.child.status).code).toBe(0);
  });
});
