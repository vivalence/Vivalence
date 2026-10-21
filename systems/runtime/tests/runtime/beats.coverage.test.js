import { join } from "@std/path";
import { atom } from "nanostores";
import { Aperture, Connection, crypto, mime, Mode, Path, shape, shard, specimen, Url, Vector } from "@vivalence/typology";
import { lifecycle, ViewEntity } from "@vivalence/runtime";
import { seed } from "../scenarios/datamap.js";
import { connector, lighthouseOf } from "../scenarios/daemon.js";

// the runtime's lifecycle beats over a hand-built die on :memory: — law 9 (/attached/view/:id · /attached/file/:id with
// x-viva-integrity), the host metadata the beats open, the userspace routes, the patrol interval (process census + file sweep), Deno.serve on a free port

const { resolution, integration } = lifecycle.runtime;

let scenario;
let directory;
let killed;

const controlled = (subject) => ({ ...subject, controller: { kill: async (signal) => killed.push(signal) } });

const buildMode = (type, slug, module = {}) => {
  const mode = new Mode({ manifest: { type, slug, traits: [] }, ...module });
  mode.aperture = new Aperture();
  mode.reference = new Path(`/mode/${type}/${slug}`);
  mode.entity = scenario.fixtures.mode;
  mode.mountpoint = join(directory, slug);
  return mode;
};

const buildDie = () => {
  const lighthouse = lighthouseOf(scenario.datamap, scenario.repos.user);
  const status = atom({ code: "RUNNING" });
  const runtime = {
    reference: new Path("/runtime/house"),
    attach: new Path("/attached"),
    aperture: new Aperture(),
    manifest: { type: "runtime", slug: "house" },
    statics: { serve: "http://127.0.0.1:0" },
    datamap: scenario.datamap,
    entities: scenario.repos,
    twitch: scenario.twitch,
    lighthouse,
    cortex: null,
    modes: {},
    services: {},
    daemons: {},
    controller: { status: { $transient: status } },
    instance: { manifest: { slug: "house" } },
  };
  const die = {
    aperture: new Aperture().use(shard.datamap.inject(scenario.datamap)),
    runtime,
    mask: { manifest: runtime.manifest, statics: { serve: new URL("http://127.0.0.1:0") } },
    controller: { stdout: { log: (record) => noted.push(record) }, abort: new AbortController() },
    traits: {},
  };
  const noted = [];
  die.noted = noted;
  return die;
};

const run = (beat, die) =>
  new Promise((resolve, reject) => {
    beat(die, async () => resolve(null)).catch(reject);
  });

const through = (beat, die, inside) => beat(die, inside);

const client = async (die) => connector(shape.http(die.aperture))(scenario.fixtures.user);

specimen.describe("runtime lifecycle beats on a hand-built die", { sanitizeResources: false, sanitizeOps: false }, () => {
  specimen.beforeAll(async () => {
    scenario = await seed();
    directory = await Deno.makeTempDir({ prefix: "beats-" });
    killed = [];
  });
  specimen.afterAll(async () => {
    await scenario.orm.close();
    await Deno.remove(directory, { recursive: true });
  });

  specimen.it("resolution.attach: /attached/view/:id answers the row with its files; /attached/file/:id serves the bytes under the file's mime with x-viva-integrity", async () => {
    const die = buildDie();
    const { repos, em, fixtures } = scenario;
    await Deno.writeTextFile(join(directory, "board.js"), "export default () => 'board';");
    const text = await Deno.readTextFile(join(directory, "board.js"));
    const integrity = `sha256-${await crypto.digest(text)}`;
    const view = await repos.view.create({ mode: fixtures.mode, slug: "board", mime: mime.tty.solid, entry: "board.js" });
    const file = await repos.file.create({ mode: fixtures.mode, view, path: "board.js", mount: join(directory, "board.js"), mime: mime.javascript, hash: integrity.slice(7), integrity, bytes: text.length });
    await em.flush();
    const service = { reference: new Path("/service/tts"), attachment: new Aperture().open("/ping", () => ({ pong: true })) };
    die.runtime.services = { tts: service };

    await through(resolution.attach, die, async () => {
      const handler = shape.http(die.aperture);
      const listed = await (await handler(new Request(`http://test/attached/view/${view.id}`))).json();
      specimen.expect(listed).toEqual({ id: view.id, slug: "board", mime: mime.tty.solid, entry: "board.js", traits: [], files: [{ id: file.id, path: "board.js", mime: mime.javascript, integrity }] });

      const served = await handler(new Request(`http://test/attached/file/${file.id}`));
      specimen.expect(served.status).toBe(200);
      specimen.expect(served.headers.get("content-type")).toBe(mime.javascript);
      specimen.expect(served.headers.get("x-viva-integrity")).toBe(integrity);
      specimen.expect(await served.text()).toBe(text);

      specimen.expect(await (await handler(new Request("http://test/service/tts/ping"))).json()).toEqual({ pong: true });
      specimen.expect((await handler(new Request("http://test/attached/view/nope"))).status).toBe(404);
      specimen.expect((await handler(new Request("http://test/attached/file/nope"))).status).toBe(404);
    });
  });

  specimen.it("resolution.expose: the runtime's status and batch, and every daemon's, open under their references", async () => {
    const die = buildDie();
    const daemon = { reference: new Path("/daemon/memo"), aperture: new Aperture().open("/hello", () => "hi"), $status: atom({ code: "BOOTING" }) };
    die.runtime.daemons = { memo: daemon };
    await through(resolution.expose, die, async () => {
      const handler = shape.http(die.aperture);
      specimen.expect(await (await handler(new Request("http://test/runtime/house/status"))).json()).toEqual({ code: "RUNNING" });
      specimen.expect(await (await handler(new Request("http://test/daemon/memo/status"))).json()).toEqual({ code: "BOOTING" });
      specimen.expect(await (await handler(new Request("http://test/daemon/memo/hello"))).json()).toBe("hi");
      specimen.expect(Object.keys(shape.strip(die.aperture.branch("/runtime/house")).branches)).toContain("batch");
    });
  });

  specimen.it("resolution.metadata: manifest · aperture · datamap · daemons · services under /metadata", async () => {
    const die = buildDie();
    const daemon = { slug: "memo", reference: new Path("/daemon/memo"), modes: { srs: { memo: {} } } };
    const service = { slug: "tts", manifest: { type: "voice" }, reference: new Path("/service/tts") };
    die.runtime.daemons = { memo: daemon };
    die.runtime.services = { tts: service };
    await through(resolution.metadata, die, async () => {
      const handler = shape.http(die.aperture);
      const read = async (path) => (await handler(new Request(`http://test/metadata${path}`))).json();
      specimen.expect(await read("/manifest")).toEqual({ type: "runtime", slug: "house" });
      specimen.expect(Object.keys((await read("/aperture")).branches)).toContain("metadata");
      specimen.expect(Object.keys(await read("/datamap"))).toContain("view");
      specimen.expect(await read("/daemons")).toEqual([{ slug: "memo", reference: "/daemon/memo", modes: 1, metadata: "/daemon/memo/metadata" }]);
      specimen.expect(await read("/services")).toEqual([{ type: "voice", slug: "tts", reference: "/service/tts", metadata: "/service/tts/metadata" }]);
    });
  });

  specimen.it("resolution.lighthouse · services · daemons · modes: each factory runs on the die, the processes are killed in finally, the modes are grafted under the runtime", async () => {
    const die = buildDie();
    const ran = [];
    const factory = (subject) => async (target) => ran.push([subject.slug ?? subject.manifest?.slug ?? "lighthouse", target === die || target.context === die.runtime]);
    die.runtime.lighthouse.slug = "lighthouse";
    die.runtime.services = { tts: controlled({ slug: "tts" }) };
    die.runtime.daemons = { memo: controlled({ slug: "memo" }) };
    const mode = buildMode("home", "probe");
    mode.aperture.open("/whoami", () => "probe");
    mode.finalizers = [() => ran.push(["finalized", true])];
    mode.terminators = [() => ran.push(["terminated", true])];
    mode.stdout = { stop: () => ran.push(["stopped", true]) };
    die.runtime.modes = { home: { probe: mode } };

    await run(resolution.lighthouse(factory), die);
    await run(resolution.services(factory), die);
    await run(resolution.daemons(factory), die);
    await through(resolution.modes(factory), die, async () => {
      specimen.expect(Object.keys(shape.strip(die.runtime.aperture.branch("/mode/home/probe")).branches)).toEqual(["whoami"]);
    });
    specimen.expect(ran).toEqual([["lighthouse", true], ["tts", true], ["memo", true], ["probe", true], ["finalized", true], ["terminated", true], ["stopped", true]]);
    specimen.expect(killed).toEqual(["SIGTERM", "SIGTERM"]);
  });

  specimen.it("integration.patrol: the interval is armed for the beat's span and cleared after it", async () => {
    const die = buildDie();
    let inside = false;
    await through(integration.patrol, die, async () => {
      inside = true;
    });
    specimen.expect(inside).toBe(true);
    specimen.expect(die.noted).toEqual([]);
  });

  specimen.it("integration.serve: Deno.serve on the mask's serve url for the beat's span, the aperture behind cors; the server is down after it", async () => {
    const die = buildDie();
    const listener = Deno.listen({ port: 0, hostname: "127.0.0.1" });
    const port = listener.addr.port;
    listener.close();
    die.mask.statics.serve = new URL(`http://127.0.0.1:${port}`);
    die.aperture.open("/ping", () => ({ pong: true }));
    await through(integration.serve, die, async () => {
      const response = await fetch(`http://127.0.0.1:${port}/ping`);
      specimen.expect(await response.json()).toEqual({ pong: true });
      specimen.expect(Object.keys(shape.strip(die.aperture).branches)).toContain("multiplex");
    });
    await specimen.expect(fetch(`http://127.0.0.1:${port}/ping`)).rejects.toThrow();
  });

  specimen.it("integration.prune: a mode row no live mode claims is removed; the live one stays", async () => {
    const die = buildDie();
    const { repos, em, fixtures } = scenario;
    repos.mode.create({ slug: "orphan", type: "test", traits: [], installed: "installed" });
    await em.flush();
    die.runtime.modes = { test: { test: buildMode("test", "test") } };
    await run(integration.prune, die);
    specimen.expect(await em.fork().count(repos.mode.entityName ?? fixtures.mode.constructor, { slug: "orphan" })).toBe(0);
    specimen.expect(await em.fork().count(fixtures.mode.constructor, { slug: "test" })).toBe(1);
  });

  specimen.it("integration.userspace: the view and file routes answer an authorized call by the datamap shard; a bare request is refused; /view/bundle is opened", async () => {
    const die = buildDie();
    const mode = buildMode("test", "test");
    die.runtime.modes = { test: { test: mode } };
    await through(integration.userspace, die, async () => {
      const conn = await client(die);
      const views = await conn.call("/userspace/entities/view/find", { where: {} });
      specimen.expect(views.map((row) => row.slug)).toContain("board");
      const files = await conn.call("/userspace/entities/file/find", { where: { path: "board.js" } });
      specimen.expect(files).toHaveLength(1);
      specimen.expect(Object.keys(shape.strip(die.aperture.branch("/userspace/entities/view")).branches)).toContain("bundle");
      specimen.expect(Object.keys(shape.strip(die.aperture.branch("/userspace/entities")).branches).sort()).toEqual(["activity", "buffer", "file", "intent", "note", "terminal", "thread", "turn", "view"]);

      const bare = new Connection(new Url("http://test"), shard.transmitter.inline(shape.http(die.aperture)));
      specimen.expect((await bare.fetch("/userspace/entities/view/find")).status).toBe(401);
      await specimen.expect(conn.call("/userspace/entities/view/bundle", { data: { mode: "nobody" } })).rejects.toThrow("[view/bundle] no live mode holds entity nobody");
    });
  });

  specimen.it("integration.entities · metadata · cortex: the host opens /entities/mode, /metadata/* for the runtime and each mode by trait, and the cortex avenues", async () => {
    const die = buildDie();
    const memo = buildMode("srs", "memo", { emitter: new Vector().open("/literal", () => "emitted") });
    memo.manifest.traits = ["VIEWABLE", "EMITTER", "HARNESSED"];
    memo.manifest.name = "Memo";
    memo.statics = { language: "latin" };
    memo.mountpoint = new Path(join(directory, "memo"));
    memo.aperture.branch("/harness").open("/ask", () => "asked");
    const bare = buildMode("home", "probe");
    die.runtime.modes = { srs: { memo }, home: { probe: bare } };

    await run(integration.entities, die);
    await run(integration.metadata, die);
    die.runtime.cortex = { findOne: ({ type, via }) => (type === "dialogue" ? { via: { [via]: async (request) => ({ echoed: request }) } } : null) };
    await run(integration.cortex, die);
    die.runtime.cortex = null;
    const runtime = die.aperture.branch("/runtime/house", die.runtime.aperture);
    const handler = shape.http(die.aperture);
    const read = async (path, body) =>
      (await handler(new Request(`http://test${path}`, body === undefined ? {} : { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }))).json();

    specimen.expect(await read("/runtime/house/metadata/manifest")).toEqual({ type: "runtime", slug: "house" });
    specimen.expect(await read("/runtime/house/metadata/statics")).toEqual({ serve: "http://127.0.0.1:0" });
    specimen.expect(await read("/runtime/house/metadata/cortex")).toEqual([]);
    specimen.expect(Object.keys(await read("/runtime/house/metadata/datamap"))).toContain("file");
    specimen.expect(Object.keys((await read("/runtime/house/metadata/aperture")).branches)).toContain("entities");
    specimen.expect(await read("/runtime/house/metadata/modes")).toEqual([
      { type: "srs", slug: "memo", name: "Memo", traits: ["VIEWABLE", "EMITTER", "HARNESSED"], reference: "/runtime/house/mode/srs/memo", metadata: "/runtime/house/mode/srs/memo/metadata" },
      { type: "home", slug: "probe", name: "probe", traits: [], reference: "/runtime/house/mode/home/probe", metadata: "/runtime/house/mode/home/probe/metadata" },
    ]);
    specimen.expect(await read("/runtime/house/mode/srs/memo/metadata/statics")).toEqual({ language: "latin" });
    specimen.expect(await read("/runtime/house/mode/srs/memo/metadata/mountpoint")).toBe(join(directory, "memo"));
    specimen.expect((await handler(new Request("http://test/runtime/house/mode/srs/memo/metadata/application"))).status).toBe(404);
    specimen.expect(Object.keys((await read("/runtime/house/mode/srs/memo/metadata/emitter")).branches)).toEqual(["literal"]);
    specimen.expect(Object.keys((await read("/runtime/house/mode/srs/memo/metadata/harness")).branches)).toEqual(["ask"]);
    specimen.expect(Object.keys((await read("/runtime/house/mode/home/probe/metadata/aperture")).branches)).toEqual([]);
    specimen.expect(await read("/runtime/house/entities/mode/find", { where: { slug: "test" } })).toHaveLength(1);
    specimen.expect((await read("/runtime/house/entities/daemon/find", { where: {} })).map((daemon) => [daemon.id, daemon.slug])).toEqual([["test-daemon", "test-daemon"]]);
    specimen.expect(await read("/runtime/house/cortex/dialogue/render", { tune: "warm", prompt: "hi" })).toEqual({ echoed: { prompt: "hi" } });
    specimen.expect((await read("/runtime/house/cortex/object/stream", { prompt: "hi" })).message).toMatch(/no 'object' faculty resolves a 'stream' avenue/);
    specimen.expect(runtime).toBe(die.aperture.branch("/runtime/house"));
  });

  specimen.it("integration.cortex on a host without a cortex opens nothing", async () => {
    const die = buildDie();
    await run(integration.cortex, die);
    specimen.expect(Object.keys(shape.strip(die.runtime.aperture).branches)).not.toContain("cortex");
  });
});
