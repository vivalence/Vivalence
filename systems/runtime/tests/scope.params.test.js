import { specimen } from "@vivalence/typology";
import { datamap } from "@vivalence/runtime/scenarios";
import { BufferEntity, LiteralEntity, ModeEntity, ThreadEntity, TurnEntity } from "@vivalence/runtime";
import { RequestContext } from "@mikro-orm/core";

// m119 — daemon · mode · thread scoping ride mikro filter params (default: true, args: false): no params, no fence.
// A write names its scope columns; nothing stamps them. `shard.bind` sets params only inside a request.

let scenario, repos, em, fixtures, chess, e4, threadA, threadB;

const within = (params, task) =>
  scenario.datamap.shard.scope(async () => {
    const ctx = RequestContext.getEntityManager(em.name);
    for (const [name, value] of Object.entries(params)) ctx.setFilterParams(name, value);
    return await task(ctx);
  });

const slugs = (rows) => rows.map((row) => row.slug).sort();

specimen.beforeAll(async () => {
  scenario = await datamap.seed();
  ({ repos, em, fixtures } = scenario);
  chess = repos.mode.create({ slug: "chess", type: "board", daemon: fixtures.daemon, traits: [], installed: "installed" });
  await em.flush();
  e4 = repos.literal.create({ slug: "e4", mode: chess, daemon: fixtures.daemon, trait: {}, symbol: {} });
  threadA = em.create(ThreadEntity, { user: fixtures.user.id, mode: fixtures.mode.id, traits: [] });
  threadB = em.create(ThreadEntity, { user: fixtures.user.id, mode: chess.id, traits: [] });
  await em.flush();
  em.create(TurnEntity, { role: "user", parts: [{ text: "ciao" }], thread: threadA, mode: fixtures.mode });
  em.create(TurnEntity, { role: "user", parts: [{ text: "grazie" }], thread: threadA, mode: fixtures.mode });
  em.create(TurnEntity, { role: "user", parts: [{ text: "e4" }], thread: threadB, mode: chess });
  em.create(BufferEntity, { thread: threadB, mode: chess, index: 0, data: {} });
  await em.flush();
  em.clear();
});

specimen.afterAll(() => scenario.orm.close());

specimen.describe("Q4 — a filter with no params is no fence", () => {
  specimen.it("outside any request the daemon's repository reads every literal", async () => {
    specimen.expect(slugs(await repos.literal.find({}))).toEqual(["e4", "goodbye", "hello"]);
  });

  specimen.it("shard.bind outside a request sets nothing — the read stays wide", async () => {
    await scenario.datamap.shard.bind("mode", () => ({ mode: chess.id }))({}, async () => {});
    specimen.expect(slugs(await repos.literal.find({}))).toEqual(["e4", "goodbye", "hello"]);
  });
});

specimen.describe("Q4 — params inside a request fence every verb", () => {
  specimen.it("mode params: find · count · findOne see the mode's rows only", async () => {
    await within({ mode: { mode: chess.id } }, async (ctx) => {
      specimen.expect(slugs(await ctx.find(LiteralEntity, {}))).toEqual(["e4"]);
      specimen.expect(await ctx.count(LiteralEntity, {})).toBe(1);
      specimen.expect(await ctx.findOne(LiteralEntity, { slug: "hello" })).toBeNull();
    });
  });

  specimen.it("daemon params: the daemon's slug reads its rows, another daemon's reads none, null reads all", async () => {
    specimen.expect(await within({ daemon: { daemon: fixtures.daemon.slug } }, (ctx) => ctx.count(LiteralEntity, {}))).toBe(3);
    specimen.expect(await within({ daemon: { daemon: "other" } }, (ctx) => ctx.count(LiteralEntity, {}))).toBe(0);
    specimen.expect(await within({ daemon: { daemon: null } }, (ctx) => ctx.count(LiteralEntity, {}))).toBe(3);
  });

  specimen.it("a where naming another mode ANDs with the fence — []", async () => {
    await within({ mode: { mode: chess.id } }, async (ctx) => {
      specimen.expect(await ctx.find(LiteralEntity, { mode: fixtures.mode.id })).toEqual([]);
    });
  });

  specimen.it("filters: { mode: false } names the wide read", async () => {
    await within({ mode: { mode: chess.id } }, async (ctx) => {
      specimen.expect(await ctx.count(LiteralEntity, {}, { filters: { mode: false } })).toBe(3);
    });
  });

  specimen.it("shard.bind inside a request sets the params on the request's em", async () => {
    await scenario.datamap.shard.scope(async () => {
      await scenario.datamap.shard.bind("mode", () => ({ mode: chess.id }))({}, async () => {});
      specimen.expect(slugs(await em.find(LiteralEntity, {}))).toEqual(["e4"]);
    });
  });

  specimen.it("two requests interleaved keep their own params", async () => {
    const [a, b] = await Promise.all([
      within({ mode: { mode: fixtures.mode.id } }, async (ctx) => {
        await new Promise((resolve) => setTimeout(resolve, 5));
        return slugs(await ctx.find(LiteralEntity, {}));
      }),
      within({ mode: { mode: chess.id } }, async (ctx) => slugs(await ctx.find(LiteralEntity, {}))),
    ]);
    specimen.expect(a).toEqual(["goodbye", "hello"]);
    specimen.expect(b).toEqual(["e4"]);
  });

  specimen.it("carry() re-enters the request for a stream pulled outside it", async () => {
    const stream = await within({ mode: { mode: chess.id } }, async () => {
      const carried = scenario.datamap.shard.carry();
      return (async function* () {
        yield await carried(async () => slugs(await em.find(LiteralEntity, {})));
      })();
    });
    specimen.expect((await stream.next()).value).toEqual(["e4"]);
  });

  specimen.it("thread params fence Turn and Buffer; the user filter still needs its params", async () => {
    await within({ user: { user: fixtures.user.id }, thread: { thread: threadA.id } }, async (ctx) => {
      specimen.expect((await ctx.getRepository(TurnEntity).history({})).map((turn) => turn.parts[0].text)).toEqual(["ciao", "grazie"]);
      specimen.expect(await ctx.count(BufferEntity, {})).toBe(0);
    });
    await within({ user: { user: fixtures.user.id }, thread: { thread: threadB.id } }, async (ctx) => {
      specimen.expect(await ctx.count(TurnEntity, {})).toBe(1);
      specimen.expect(await ctx.count(BufferEntity, {})).toBe(1);
    });
  });
});

specimen.describe("Q5 — a write names its scope columns, nothing stamps them", () => {
  specimen.it("a literal created without daemon is refused at flush", async () => {
    await within({ mode: { mode: chess.id } }, async (ctx) => {
      ctx.create(LiteralEntity, { slug: "d4", mode: chess.id, trait: {}, symbol: {} });
      await specimen.expect(ctx.flush()).rejects.toThrow("Value for LiteralEntity.daemon is required");
      ctx.clear();
    });
  });

  specimen.it("a literal created under mode params but naming another mode keeps the named one", async () => {
    await within({ mode: { mode: chess.id } }, async (ctx) => {
      ctx.create(LiteralEntity, { slug: "ciao", mode: fixtures.mode.id, daemon: fixtures.daemon.slug, trait: {}, symbol: {} });
      await ctx.flush();
      ctx.clear();
      specimen.expect((await ctx.findOne(LiteralEntity, { slug: "ciao" }, { filters: { mode: false } })).mode.id).toBe(fixtures.mode.id);
    });
  });
});

specimen.describe("Q3 — a mode's death orphans its threads · turns · buffers, never removes them", () => {
  specimen.it("remove(mode) → thread.mode · turn.mode · buffer.mode are null, the rows stay", async () => {
    await within({ user: { user: fixtures.user.id } }, async (ctx) => {
      const mode = await ctx.findOneOrFail(ModeEntity, { id: chess.id });
      ctx.remove(mode);
      await ctx.flush();
      ctx.clear();
      const thread = await ctx.findOneOrFail(ThreadEntity, { id: threadB.id });
      specimen.expect(thread.mode).toBeNull();
      specimen.expect((await ctx.find(TurnEntity, { thread: threadB.id })).map((turn) => turn.mode)).toEqual([null]);
      specimen.expect((await ctx.find(BufferEntity, { thread: threadB.id })).map((buffer) => buffer.mode)).toEqual([null]);
    });
  });
});
