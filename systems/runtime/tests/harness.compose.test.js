import { belt, Cortex, Mode, Path, shape, shard, specimen, steer, ToolCall, Vector } from "@vivalence/typology";
import { Runtime, ThreadEntity, TurnEntity, traits } from "@vivalence/runtime";
import { textTurn, toolUseTurn } from "../../../commons/fixtures/testing/data/faculties.js";
import { create } from "./scenarios/cortex.js";
import { accio } from "./scenarios/registry.js";

const { PRIMER, TOOLING } = traits.mode;

const HARNESS = "/runtime/runtime/mode/harness/runtime";
const FS = `${HARNESS}/fs`;
const HARVEST = "/daemon/test-daemon/mode/tactics/harvest";

let scenario;
let captured;
let rounds;
let script;

const scripted = {
  type: "dialogue",
  id: "script",
  tune: [0.9, 0.3, 0.5],
  context: 200000,
  channels: {
    render: {
      in: [{ type: "text" }, { type: "tool_result" }, { type: "tool_use" }],
      out: [{ type: "text" }, { type: "tool_use" }],
      via: async (request) => {
        rounds.push(request.tools.map((tool) => tool.name));
        return script.shift() ?? textTurn("done");
      },
    },
  },
};

const declared = () => belt.hallucinate.declarations(captured.tools).map((tool) => tool.name);

const stored = async (thread) =>
  (await scenario.em.fork().findOneOrFail(ThreadEntity, { id: thread.id }, { filters: false })).trait;

const ask = async (trait, turns = []) => {
  const thread = await scenario.createThread();
  Object.assign(thread.trait, trait);
  await scenario.em.flush();
  rounds = [];
  script = turns;
  await scenario.dewey.harness.dialogue.render({ thread: thread.id, parts: [{ type: "text", text: "go" }] });
  return thread;
};

const again = async (thread) => {
  rounds = [];
  script = [];
  await scenario.dewey.harness.dialogue.render({ thread: thread.id, parts: [{ type: "text", text: "again" }] });
  return { declared: declared(), system: await shape.primer.load(captured.primer) };
};

specimen.describe("the composer — every request rebuilt from TOOLED · PRIMED over the mode's offer", () => {
  specimen.beforeAll(async () => {
    const harness = new Vector().use(async (ctx, next) => {
      captured = ctx.hallucination;
      await next();
    });
    scenario = await create({ harness });
    const { daemon, dewey } = scenario;
    daemon.cortex = new Cortex().register([scripted]);
    dewey.module.primer = new Vector().open("dewey", "You are Dewey.");
    PRIMER(dewey);
    const harvest = new Mode({ module: { manifest: { type: "tactics", slug: "harvest", traits: ["PRIMER", "TOOLING"] } } });
    harvest.module.primer = new Vector().open({ nature: "archivist", valence: "the harvest persona" }, "ARCHIVIST");
    harvest.module.tools = new Vector().open({ nature: "/drain", valence: "Writes the dataset." }, () => ({ output: {} }));
    harvest.tools = new Vector();
    PRIMER(harvest);
    TOOLING(harvest);
    daemon.modes.tactics = { harvest };
    const runtimeHarness = await accio("@commons/harness/runtime");
    const runtime = new Runtime({
      mask: { manifest: { slug: "runtime" }, reference: new Path("/runtime/runtime") },
      modes: { harness: { runtime: { manifest: runtimeHarness.manifest, tools: runtimeHarness.tools } } },
      daemons: { [daemon.slug]: daemon },
    });
    dewey.aperture.branch("/harness").use(shard.context.bind("runtime", runtime));
  });

  specimen.afterAll(async () => {
    await scenario.orm.close();
  });

  specimen.it("rounds — stop 9: the loop declares the live tree each round; the next request rebuilds it from TOOLED", async () => {
    const thread = await ask({}, [
      toolUseTurn("call-1", "tool_load", { references: [FS] }),
      toolUseTurn("call-2", "tool_unload", { references: [`${FS}/delete`, `${FS}/write`, `${FS}/move`] }),
      textTurn("done"),
    ]);
    const catalogs = rounds;
    const live = steer.trie.leaves(captured.tools).map(({ steps }) => new ToolCall(steps).name);
    const { TOOLED } = await stored(thread);
    const next = await again(thread);
    console.log(JSON.stringify({ catalogs, live, TOOLED, next: next.declared }, null, 2));
    const fs = (names) => names.filter((name) => name.startsWith("runtime_harness_runtime_fs_")).sort();
    const kept = [
      "runtime_harness_runtime_fs_find",
      "runtime_harness_runtime_fs_read",
      "runtime_harness_runtime_fs_stat",
      "runtime_harness_runtime_fs_tree",
    ];
    const loaded = [...kept, "runtime_harness_runtime_fs_delete", "runtime_harness_runtime_fs_move", "runtime_harness_runtime_fs_write"];
    specimen.expect(catalogs.map(fs)).toEqual([[], loaded.sort(), kept]);
    specimen.expect(fs(live)).toEqual(kept);
    specimen.expect(TOOLED).toEqual({
      [FS]: "eager",
      [`${FS}/delete`]: "none",
      [`${FS}/write`]: "none",
      [`${FS}/move`]: "none",
    });
    specimen.expect(fs(next.declared)).toEqual(kept);
  });

  specimen.it("exclude — /runtime eager, a branch none, a leaf back in; the delta wins, shortest key first", async () => {
    const cases = {
      all: { "/runtime": "eager" },
      "a branch out": { "/runtime": "eager", [FS]: "none" },
      "a leaf out": { "/runtime": "eager", [`${FS}/delete`]: "none" },
      "a branch out, a leaf back in": { "/runtime": "eager", [FS]: "none", [`${FS}/read`]: "eager" },
    };
    const results = {};
    for (const [label, TOOLED] of Object.entries(cases)) {
      await ask({ TOOLED });
      results[label] = declared().filter((name) => name.startsWith("runtime_harness_runtime_fs_"));
    }
    console.log(JSON.stringify(results, null, 2));
    specimen.expect(results.all.length).toBe(7);
    specimen.expect(results["a branch out"]).toEqual([]);
    specimen.expect(results["a leaf out"].length).toBe(6);
    specimen.expect(results["a leaf out"]).not.toContain("runtime_harness_runtime_fs_delete");
    specimen.expect(results["a branch out, a leaf back in"]).toEqual(["runtime_harness_runtime_fs_read"]);
  });

  specimen.it("preloaded — a lazy TOOLED key is listed in the system prompt, declared nowhere", async () => {
    await ask({ TOOLED: { [HARVEST]: "lazy" } });
    const system = await shape.primer.load(captured.primer);
    console.log(JSON.stringify({ system, declared: declared() }, null, 2));
    specimen.expect(system.preloaded).toBe(
      `Load on demand with tool_load { references }:\n${HARVEST}/drain — Writes the dataset.`,
    );
    specimen.expect(declared()).not.toContain("tactics_harvest_drain");
  });

  specimen.it("compose — one pull brings a mode's tools and its primer: TOOLED and PRIMED, eager", async () => {
    const thread = await ask({ TOOLED: { [HARVEST]: "eager" }, PRIMED: { [HARVEST]: "eager" } });
    const first = { declared: declared(), system: await shape.primer.load(captured.primer) };
    const next = await again(thread);
    console.log(JSON.stringify({ thread: await stored(thread), first, next }, null, 2));
    specimen.expect(first.declared).toContain("tactics_harvest_drain");
    specimen.expect(first.system).toEqual({ dewey: "You are Dewey.", "tactics/harvest/archivist": "ARCHIVIST" });
    specimen.expect(next).toEqual(first);
  });

  specimen.it("Q9 · Q9A — a user load runs the model's tool: the trait only, never a turn (11-17); all missed writes nothing", async () => {
    const thread = await scenario.createThread();
    const loaded = await scenario.dewey.harness.tool.load({ thread: thread.id, references: [FS] });
    const unloaded = await scenario.dewey.harness.tool.unload({ thread: thread.id, references: [`${FS}/delete`] });
    const missed = await scenario.dewey.harness.tool.load({ thread: thread.id, references: ["/nowhere"] });
    const journal = await scenario.em.fork().find(TurnEntity, { thread: thread.id }, { orderBy: { createdAt: "ASC" }, filters: false });
    const { TOOLED } = await stored(thread);
    console.log(JSON.stringify({ loaded: loaded.missed, unloaded, missed, TOOLED, journal: journal.map((turn) => [turn.role, turn.parts[0].text.split("\n")[0]]) }, null, 2));
    specimen.expect(TOOLED).toEqual({ [FS]: "eager", [`${FS}/delete`]: "none" });
    specimen.expect(unloaded).toEqual({ unloaded: [`${FS}/delete`], missed: [] });
    specimen.expect(missed).toEqual({ tools: [], missed: ["/nowhere"] });
    specimen.expect(journal.map((turn) => [turn.role, turn.parts[0].text.split("\n")[0]])).toEqual([]);
    const reset = await scenario.dewey.harness.tool.reset({ thread: thread.id, references: [FS, "/nowhere"] });
    specimen.expect(reset).toEqual({ reset: [FS], missed: ["/nowhere"] });
    specimen.expect((await stored(thread)).TOOLED).toEqual({ [`${FS}/delete`]: "none" });
  });

  specimen.it("a none PRIMED key prunes the thread mode's own section", async () => {
    await ask({ PRIMED: { "/daemon/test-daemon/mode/teacher/dewey/dewey": "none" } });
    const system = await shape.primer.load(captured.primer);
    console.log(JSON.stringify(system, null, 2));
    specimen.expect(system).toEqual({});
  });
});
