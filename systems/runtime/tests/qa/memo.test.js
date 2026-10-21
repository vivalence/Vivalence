import { specimen } from "@vivalence/typology";
import { READY } from "../scenarios/hello.js";
import { join } from "@std/path";
import { boot, exists, ledger, pin, viva } from "./rig.js";

const { describe, it, expect, beforeAll, afterAll } = specimen;

const MODE = "/daemon/memo/mode/srs/memo";
const DOMAIN = "/daemon/memo";

describe("T-demo — a clean ledger, ghost's verbs, the memo demo instance: the Latin core installed, the deck dealt, a grade kept", () => {
  let world;
  let shelf;
  let runtime;
  let learner;

  beforeAll(async () => {
    world = await ledger("viva-qa-memo-");
  });

  afterAll(async () => {
    await runtime?.stop("SIGKILL");
    await world.remove();
  });

  it("ledger/install taps both packages of the checkout — @commons and @memo nested in it", async () => {
    const { code, effect } = await viva(world, ["ledger/install"]);
    expect([code, effect?.error ?? null]).toEqual([0, null]);
    expect(JSON.parse(await Deno.readTextFile(join(world.root, "ledger/registry.json")))).toEqual({
      "@commons": { slug: "commons", mount: effect.commons },
      "@memo": { slug: "memo", mount: join(effect.commons, "fixtures/memo") },
    });
  });

  it("instance/clone memo --use --install clones the demo recipe alone onto the shelf", async () => {
    const { effect, err } = await viva(world, ["instance/clone", "memo", "--use", "--install"]);
    expect(effect?.slug ?? err).toBe("memo");
    shelf = effect.target;
    expect(effect.source).toBe("@memo/instance/memo");
    const files = [];
    for await (const entry of Deno.readDir(shelf)) files.push(entry.name);
    expect(files.sort()).toEqual([".env", "instance.viva.json"]);
    expect(effect.installed.env).toBe("present");
    await pin(shelf, { VIVA_RUNTIME_ORIGIN: world.origin });
    expect((await viva(world, ["instance/use", "memo", "--ledger"])).effect.selected).toBe(shelf);
  });

  it("instance/doctor: zero faults, one daemon holding the domain, the topography and the mode, the ledger's hallucinators dormant without keys", async () => {
    const { effect, err } = await viva(world, ["instance/doctor"]);
    expect(effect?.manifest?.slug ?? err).toBe("memo");
    expect([effect.faults, effect.problems]).toEqual([[], []]);
    expect(Object.keys(effect.daemons)).toEqual(["memo"]);
    expect(Object.keys(effect.dormant).sort()).toEqual(["hallucinators[0]", "hallucinators[1]"]);
  });

  it("run.js on the shelf installs the Latin core — 269 literals, 242 symbols, every literal a word or a sentence", async () => {
    runtime = await boot(world, { shelf, slug: "memo" });
    expect(runtime.ready ?? runtime.tail()).toMatch(READY);
    expect(await exists(join(shelf, "mountpoint/memo.viva.db"))).toBe(true);
    expect(runtime.query("select slug from Daemon")).toEqual([{ slug: "memo" }]);
    expect(runtime.query("select ontology, count(*) as n from Literal group by ontology order by ontology")).toEqual([
      { ontology: "sentence", n: 50 },
      { ontology: "word", n: 219 },
    ]);
    expect(runtime.query("select count(*) as n from Symbol").at(0).n).toBe(242);
  });

  it("a learner signs up through ghost, is dealt deus first, grades it GOOD, and the next deal skips it", async () => {
    const signup = await viva(world, ["instance/lighthouse/signup", "discipulus", "memo"]);
    expect(signup.effect?.status ?? signup.err).toBe("SUCCESS");
    learner = signup.effect.authority.access;
    const dealt = await runtime.call(`${MODE}/deck`, { limit: 3 }, learner);
    expect([dealt.language, dealt.cards.map((card) => card.slug)]).toEqual([{ known: "English", learning: "Latin" }, ["deus.noun", "dominus.noun", "verbum.noun"]]);
    const graded = await runtime.call(`${MODE}/grade`, { card: "deus.noun", signal: "GOOD" }, learner);
    expect([graded.status, graded.preview.GOOD]).toEqual(["LEARNING", 24]);
    expect((await runtime.call(`${MODE}/deck`, { limit: 1 }, learner)).cards[0].slug).toBe("dominus.noun");
    expect(runtime.query("select slug from Note order by slug").map((row) => row.slug.split(".")[0])).toEqual(["retention", "trace"]);
    const progress = await runtime.call(`${MODE}/stats`, {}, learner);
    expect([progress.cards, progress.byStatus.LEARNING, progress.byStatus.UNTOUCHED]).toEqual([269, 1, 268]);
  });

  it("the domain on the daemon: feed skips the graded card, history traces the grade, a lapse makes a leech, a suspension leaves every deal until resumed", async () => {
    expect((await runtime.call(`${DOMAIN}/pick/literal/feed`, { limit: 2 }, learner)).map((card) => card.slug)).toEqual(["dominus.noun", "verbum.noun"]);
    const history = await runtime.call(`${DOMAIN}/history/literal`, { literal: "deus.noun" }, learner);
    expect(history.map((grade) => [grade.signal, grade.status])).toEqual([["GOOD", "LEARNING"]]);
    for (const signal of ["GOOD", "GOOD", "AGAIN"]) await runtime.call(`${DOMAIN}/review/literal`, { literal: "crux.noun", signal }, learner);
    const leeches = await runtime.call(`${DOMAIN}/pick/literal/leeches`, { lapses: 1, limit: 5 }, learner);
    expect(leeches.map((card) => [card.slug, card.status, card.lapses])).toEqual([["crux.noun", "UNKNOWN", 1]]);
    const suspended = await runtime.call(`${DOMAIN}/suspend/literal`, { literal: "dominus.noun", reason: "qa" }, learner);
    expect(suspended.suspended).toBe(true);
    expect((await runtime.call(`${MODE}/deck`, { limit: 1 }, learner)).cards[0].slug).toBe("verbum.noun");
    expect((await runtime.call(`${DOMAIN}/resume/literal`, { literal: "dominus.noun" }, learner)).suspended).toBe(false);
    expect((await runtime.call(`${MODE}/deck`, { limit: 1 }, learner)).cards[0].slug).toBe("dominus.noun");
    const stats = await runtime.call(`${MODE}/stats`, {}, learner);
    expect([stats.touched, stats.byStatus.UNKNOWN, stats.leeches.map((leech) => leech.slug), stats.suspended]).toEqual([2, 1, [], 0]);
  });

  it("the topography's files ride the deck: a depicted card carries its picture's file url, and the url serves the png", async () => {
    const { cards } = await runtime.call(`${MODE}/deck`, { limit: 50, symbols: ["topic.bellum"] }, learner);
    const gladius = cards.find((card) => card.slug === "gladius.noun");
    expect(gladius.picture).toMatch(/\/attached\/file\/[0-9a-f-]{36}$/);
    const served = await fetch(gladius.picture, { headers: { authorization: `Bearer ${learner}` } });
    expect([served.status, served.headers.get("content-type")]).toEqual([200, "image/png"]);
    await served.body?.cancel();
  });

  it("SIGTERM → exit 0", async () => {
    expect(await runtime.stop("SIGTERM")).toBe(0);
  });
});
