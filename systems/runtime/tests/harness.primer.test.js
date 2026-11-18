import { belt, Mode, Path, shape, shard, specimen, steer, ToolCall, Vector } from "@vivalence/typology";
import { Runtime, ThreadEntity, traits } from "@vivalence/runtime";
import { create } from "./scenarios/cortex.js";
const { PRIMER } = traits.mode;

let scenario;
let captured;

const HARVEST = "/daemon/test-daemon/mode/tactics/harvest";

const ask = async (PRIMED, thread) => {
  thread ??= await scenario.createThread();
  if (PRIMED) {
    thread.trait.PRIMED = PRIMED;
    await scenario.em.flush();
  }
  await scenario.dewey.harness.dialogue.render({ thread: thread.id, parts: [{ type: "text", text: "what do you know?" }] });
  return await shape.primer.load(captured.primer);
};

specimen.describe("harness — the request's primer", () => {
  specimen.beforeAll(async () => {
    const harness = new Vector().use(async (ctx, next) => {
      captured = ctx.hallucination;
      await next();
    });
    scenario = await create({ harness });
    const { daemon, dewey } = scenario;
    dewey.module.primer = new Vector().open("dewey", "You are Dewey.");
    PRIMER(dewey);
    const harvest = new Mode({ module: { manifest: { type: "tactics", slug: "harvest", traits: ["PRIMER"] } } });
    harvest.module.primer = new Vector().open({ nature: "archivist", valence: "the harvest persona" }, "ARCHIVIST");
    PRIMER(harvest);
    daemon.modes.tactics = { harvest };
    const runtime = new Runtime({ mask: { manifest: { slug: "runtime" }, reference: new Path("/runtime/runtime") }, daemons: { [daemon.slug]: daemon } });
    dewey.aperture.branch("/harness").use(shard.context.bind("runtime", runtime));
  });
  specimen.afterAll(async () => {
    await scenario.orm.close();
  });

  specimen.it("PRIMER mints the mode's own primer; an empty PRIMED reads no other mode; the seven load tools ride every request", async () => {
    const system = await ask();
    const declared = belt.hallucinate.declarations(captured.tools).map((tool) => tool.name);
    console.log(JSON.stringify({ system, declared }, null, 2));
    specimen.expect(Object.keys(system)).toEqual(["dewey"]);
    specimen.expect(declared).toEqual(["modes_index", "tool_load", "tool_preload", "tool_unload", "primer_load", "primer_preload", "primer_unload"]);
  });

  specimen.it("a lazy PRIMED key lists another mode's primer for primer_load, narrowed; no mode is written", async () => {
    const { dewey, daemon } = scenario;
    const system = await ask({ [HARVEST]: "lazy" });
    console.log(JSON.stringify(system, null, 2));
    specimen.expect(Object.keys(system)).toEqual(["dewey", "primer"]);
    specimen.expect(system.primer).toBe("Load on demand with primer_load { references }:\n/tactics/harvest/archivist — the harvest persona");
    specimen.expect(shape.primer.keys(dewey.primer)).toEqual(["dewey"]);
    specimen.expect(shape.primer.keys(daemon.modes.tactics.harvest.primer)).toEqual(["archivist"]);
  });

  specimen.it("Q9A — primer_load answers the section, keys PRIMED; the next request carries it in full", async () => {
    const thread = await scenario.createThread();
    await ask({ [HARVEST]: "lazy" }, thread);
    const loaded = await steer.dispatch.invoke(captured.tools, new ToolCall("primer_load"), steer.strategy.guarded)({ references: ["/tactics/harvest/archivist"] });
    const stored = (await scenario.em.fork().findOneOrFail(ThreadEntity, { id: thread.id }, { filters: false })).trait.PRIMED;
    const system = await ask(undefined, thread);
    console.log(JSON.stringify({ loaded: loaded.output, stored, system }, null, 2));
    specimen.expect(loaded.output).toEqual({ primers: { "tactics/harvest/archivist": "ARCHIVIST" }, missed: [] });
    specimen.expect(stored).toEqual({ [HARVEST]: "lazy", [`${HARVEST}/archivist`]: "eager" });
    specimen.expect(system).toEqual({ dewey: "You are Dewey.", "tactics/harvest/archivist": "ARCHIVIST" });
  });

  specimen.it("a domain's primer hangs under the domain's slug on every request", async () => {
    const { daemon } = scenario;
    daemon.domain = { manifest: { type: "domain", slug: "memo" }, primer: new Vector().open("srs", "GLOSSARY") };
    const system = await ask();
    specimen.expect(Object.keys(system)).toEqual(["dewey", "memo/srs"]);
    specimen.expect(system["memo/srs"]).toBe("GLOSSARY");
    delete daemon.domain;
  });

  specimen.it("PRIMER on a mode that exports no primer is loud", () => {
    const bare = new Mode({ module: { manifest: { type: "tactics", slug: "bare", traits: ["PRIMER"] } } });
    specimen.expect(() => PRIMER(bare)).toThrow("PRIMER: bare declares the trait and exports no primer");
  });
});
