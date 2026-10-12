import { specimen } from "@vivalence/typology";
import { join } from "@std/path";
import { hello } from "../scenarios/index.js";

const { describe, it, expect, beforeAll, afterAll } = specimen;

describe("runtime boot — the rig's run.js on a temp ledger: one datamap, the lighthouse inside", () => {
  let world;
  let finn;
  let thread;

  beforeAll(async () => {
    world = await hello.boot();
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

  it("/lighthouse/metadata is the lighthouse manifest — the recipe says JOINABLE", async () => {
    const metadata = await (await world.post("/lighthouse/metadata", {})).json();
    expect(metadata).toEqual({ type: "lighthouse", slug: "lighthouse", traits: ["JOINABLE"] });
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
    const response = await fetch(`${application.url}${application.bundle.entries[0].mount}`);
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/javascript");
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

  it("the root carries no runtime's or daemon's facets — its manifest sits under /metadata, the runtime's modes under /runtime/<slug>", async () => {
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

  it("a runtime mode answers with the runtime's words spread flat and no ctx.daemon", async () => {
    const response = await world.post("/runtime/house/mode/home/probe/ping", {}, finn.access);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ reference: "/runtime/house", mode: "probe", note: true, daemon: null });
  });

  it("the runtime serves what a daemon serves — status and metadata — behind the token", async () => {
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
    world = await hello.launch({
      prefix: "viva-shipped-",
      home: (home) => hello.copy(hello.SHIPPED, home),
      ledger: hello.LEDGER,
      environment: hello.ENVIRONMENT,
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
