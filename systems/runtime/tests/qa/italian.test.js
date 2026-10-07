import { specimen } from "@vivalence/typology";
import { join } from "@std/path";
import { RECIPE, REPOSITORY, boot, copy, exists, ledger, pin, viva } from "./rig.js";

const { describe, it, expect, beforeAll, afterAll } = specimen;

const SOURCE = Deno.env.get("VIVA_QA_REGISTRY") ?? join(REPOSITORY, "campaign/registry");
const PROBE = new URL("./probe.viva.js", import.meta.url).pathname;
const supplied = (await exists(join(SOURCE, "education/education.viva.js"))) && (await exists(join(SOURCE, "chess/package.viva.js")));

const ITALIAN = {
  manifest: { type: "daemon", slug: "italian", version: "0.0.1" },
  statics: { language: { known: { slug: "english", name: "English" }, learning: { slug: "italian", name: "Italiano" } } },
  modes: [
    "@education/domain/language-learning",
    "@education/topology/word",
    "@education/topology/sentence",
    "@education/topology/conjugation",
    "@education/topography/english-to-italian",
    "@education/game/dojo",
    "./probe.viva.js",
  ],
};

const CHESS = {
  manifest: { type: "daemon", slug: "chess", version: "0.1.0" },
  modes: [
    "@chess/domain/chess",
    "@chess/topology/game",
    "@chess/topology/position",
    "@chess/topology/opening",
    "@chess/topology/puzzle",
    "@chess/topography/puzzles",
    "@chess/riddle/puzzles",
  ],
};

const SINK = (root) => join(root, "registry/education/topographies/english-to-italian/dataset/literals/words/noun.js");

const until = async (predicate, ms = 10_000, every = 100) => {
  const started = Date.now();
  while (!(await predicate())) {
    if (Date.now() - started > ms) throw new Error(`until: ${ms} ms passed`);
    await new Promise((resolve) => setTimeout(resolve, every));
  }
};

describe("T-italian — language-learning boots empty beside chess, the dojo's corpus installs and feeds, a review writes notes, the sink drains under a subscription", { ignore: !supplied }, () => {
  let world;
  let shelf;
  let runtime;
  let finn;
  let casa;

  beforeAll(async () => {
    world = await ledger("viva-qa-italian-");
    await copy(join(SOURCE, "education"), join(world.root, "registry/education"), { skip: ["freight", "bak", "node_modules"] });
    await copy(join(SOURCE, "chess"), join(world.root, "registry/chess"), { skip: ["bak", "node_modules"] });
    await viva(world, ["ledger/init"]);
    for (const location of [join(world.root, "registry/education"), join(world.root, "registry/chess")]) {
      const { effect, err } = await viva(world, ["registry/tap", location]);
      if (!effect?.location) throw new Error(`registry/tap ${location} failed: ${err}`);
    }
    await Deno.mkdir(join(world.root, "recipe"));
    await Deno.writeTextFile(join(world.root, "recipe/instance.viva.json"), JSON.stringify(RECIPE("italian", [ITALIAN, CHESS]), null, 2));
    await Deno.copyFile(PROBE, join(world.root, "recipe/probe.viva.js"));
    const { effect, err } = await viva(world, ["instance/create", join(world.root, "recipe"), "--slug=italian", "--use", "--init"]);
    if (!effect?.target) throw new Error(`instance/create failed: ${err}`);
    shelf = effect.target;
    await pin(shelf, { VIVA_RUNTIME_ORIGIN: world.origin });
    runtime = await boot(world, { shelf, slug: "italian", deadline: 300_000 });
  });

  afterAll(async () => {
    await runtime?.stop("SIGKILL");
    await world.remove();
  });

  it("boots: two daemons in one datamap, each topography's dataset installed under its own daemon", () => {
    expect(runtime.ready ?? runtime.tail()).toBe("Status:RUNNING");
    expect(runtime.query("select slug from Daemon order by slug")).toEqual([{ slug: "chess" }, { slug: "italian" }]);
    const counts = Object.fromEntries(runtime.query("select daemon_slug, count(*) as n from Literal group by daemon_slug").map((row) => [row.daemon_slug, row.n]));
    expect(counts.italian).toBeGreaterThan(100);
    expect(counts.chess).toBeGreaterThan(0);
    expect(runtime.query("select daemon_slug from Literal where slug = 'casa.noun'")).toEqual([{ daemon_slug: "italian" }]);
  });

  it("the daemon's /datamap strip names literal once — one fixed schema, no per-daemon table", async () => {
    const signup = await runtime.call("/lighthouse/signup", { username: "finn", password: "hunter22" });
    finn = { user: signup.user, access: signup.authority.access };
    const strip = await (await runtime.get("/daemon/italian/datamap", finn.access)).json();
    const names = Object.keys(strip);
    expect(names.filter((name) => name === "literal")).toEqual(["literal"]);
    expect(names.filter((name) => /italian|chess|runtime/i.test(name))).toEqual([]);
  });

  it("casa exists once per daemon: chess creates its own casa through its repository, italian's stays its own", async () => {
    const [mode] = await runtime.call("/daemon/chess/entities/mode/find", { where: {}, options: { limit: 1 } }, finn.access);
    await runtime.call("/daemon/chess/entities/literal/create", { data: { slug: "casa.noun", mode: mode.id, traits: [], trait: {} } }, finn.access);
    expect(runtime.query("select daemon_slug from Literal where slug = 'casa.noun' order by daemon_slug")).toEqual([{ daemon_slug: "chess" }, { daemon_slug: "italian" }]);
    const [own] = await runtime.call("/daemon/italian/entities/literal/find", { where: { slug: "casa.noun" } }, finn.access);
    expect(own.daemon?.slug ?? own.daemon).toBe("italian");
    casa = own;
  });

  it("the dojo feeds: the domain's feed answers novel italian words, none of chess's", async () => {
    const feed = await runtime.call("/daemon/italian/pick/literal/feed", { limit: 5 }, finn.access);
    expect(feed.length).toBe(5);
    for (const row of feed) expect(row.daemon?.slug ?? row.daemon).toBe("italian");
  });

  it("a review writes a RETAINED note with a TRACED child; the row reads its retention through the note", async () => {
    const reviewed = await runtime.call("/daemon/italian/review/literal", { signal: "SUCCESS", scope: { literal: "casa.noun" } }, finn.access);
    expect(reviewed.traits).toContain("RETAINED");
    const retained = await runtime.call("/userspace/entities/note/find", { where: { literal: casa.id, traits: "RETAINED" } }, finn.access);
    expect(retained.length).toBe(1);
    expect(retained[0].trait.RETAINED.lastSignal).toBe("SUCCESS");
    const traced = await runtime.call("/userspace/entities/note/find", { where: { literal: casa.id, traits: "TRACED" } }, finn.access);
    expect(traced.length).toBe(1);
    expect(traced[0].parent?.id ?? traced[0].parent).toBe(retained[0].id);
    const byStatus = await runtime.call("/daemon/italian/pick/literal/byStatus", { status: retained[0].trait.RETAINED.status }, finn.access);
    expect(byStatus.map((row) => row.slug)).toContain("casa.noun");
    const novel = await runtime.call("/daemon/italian/pick/literal/novel", { limit: 500 }, finn.access);
    expect(novel.map((row) => row.slug)).not.toContain("casa.noun");
    expect(runtime.query("select daemon_slug, user_id from Note where literal_id = ? ".replace("?", `'${casa.id}'`))).toEqual([
      { daemon_slug: "italian", user_id: finn.user.id },
      { daemon_slug: "italian", user_id: finn.user.id },
    ]);
  });

  it("chess beside it: a failed puzzle attempt writes a TRACED note through chess's repository", async () => {
    const [puzzle] = await runtime.call("/daemon/chess/entities/literal/find", { where: { traits: "POSED" }, options: { limit: 1 } }, finn.access);
    expect(puzzle).toBeTruthy();
    const attempt = await runtime.call("/daemon/chess/puzzle/attempt", { puzzle: puzzle.id, moves: ["a1a1"] }, finn.access);
    expect(attempt.status).toBe("FAILED");
    expect(runtime.query(`select daemon_slug from Note where literal_id = '${puzzle.id}'`)).toEqual([{ daemon_slug: "chess" }]);
  });

  it("DATASINK drains on /after/literal/update while a client holds /subscribe — an aperture handler's own flush fires the update lane (known-issue 582); the drain projects the whole corpus, minutes", async () => {
    const before = (await Deno.stat(SINK(world.root))).mtime;
    const stream = await runtime.subscribe("/daemon/italian/entities/literal/subscribe", finn.access);
    try {
      const at = Date.now();
      const poked = await runtime.call("/daemon/italian/mode/probe/poke/poke", { slug: "casa.noun", at }, finn.access);
      expect(poked.poked).toEqual({ at });
      const event = await stream.next((held) => held.op === "update" && held.entity?.slug === "casa.noun");
      expect(event.entity.trait.POKED).toEqual({ at });
      await until(async () => (await Deno.stat(SINK(world.root))).mtime > before, 300_000, 1_000);
      expect(await Deno.readTextFile(SINK(world.root))).toContain(`"at": ${at}`);
      console.log(`[T-italian] the DATASINK drained ${Math.round((Date.now() - at) / 1000)} s after the poke`);
    } finally {
      await stream.close();
    }
  });

  it("SIGTERM → exit 0", async () => {
    let timer;
    const deadline = new Promise((resolve) => (timer = setTimeout(() => resolve("no exit within 30 s"), 30_000)));
    try {
      expect(await Promise.race([runtime.stop("SIGTERM"), deadline])).toBe(0);
    } finally {
      clearTimeout(timer);
    }
  });
});
