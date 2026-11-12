import { shape, shard, specimen, steer, ToolCall, Vector } from "@vivalence/typology";
import { accio } from "../../../systems/runtime/tests/scenarios/registry.js";
import { found, narrow, natures, section } from "./load.test.js";
import { primer as primerLoad } from "./primer-reference.test.js";

export const primed = (ctx) => {
  const primer = new Vector();
  if (ctx.mode.primer) primer.graft(ctx.mode.primer);
  const keys = Object.entries(ctx.thread.trait.PRIMED).sort(([a], [b]) => natures(a).length - natures(b).length);
  for (const [reference, load] of keys) {
    if (load === "none") primer.trim(narrow(ctx, reference));
    else for (const entry of found(ctx, reference, (mode) => mode.primer)) section(ctx, primer, entry, load);
  }
  return primer;
};

const world = async () => {
  const harvest = await accio("@education/tactic/harvest");
  const nyan = await accio("@education/game/nyan");
  const francesca = {
    manifest: { type: "teacher", slug: "francesca" },
    primer: new Vector()
      .open({ nature: "role", valence: "who she is" }, () => "You are Francesca.")
      .open({ nature: "grammar", valence: "her grammar notes", load: "lazy" }, () => "Passato prossimo first."),
  };
  const education = { reference: "/daemon/education", modes: { tactic: { harvest }, game: { nyan }, teacher: { francesca } } };
  const runtime = { reference: "/runtime/runtime", modes: {}, daemons: { education } };
  return { runtime, daemon: education, reference: education.reference, mode: francesca };
};

const system = async (PRIMED) => {
  const ctx = { ...(await world()), thread: { trait: { PRIMED } } };
  return await shape.primer.load(primed(ctx), ctx);
};

const ARCHIVIST = "/daemon/education/mode/tactic/harvest/archivist";

specimen.describe("Q9A — the next request's system prompt is composed from PRIMED", () => {
  specimen.it("an empty delta: the thread mode's own primer", async () => {
    const sections = await system({});
    console.log(JSON.stringify(sections, null, 2));
    specimen.expect(Object.keys(sections)).toEqual(["role", "primer"]);
  });

  specimen.it("an eager key: harvest's archivist enters, narrowed from the thread's mode", async () => {
    const sections = await system({ [ARCHIVIST]: "eager" });
    console.log(JSON.stringify(sections, null, 2));
    specimen.expect(Object.keys(sections)).toEqual(["role", "primer", "tactic/harvest/archivist"]);
  });

  specimen.it("a lazy key on a whole mode: listed, never in full", async () => {
    const sections = await system({ "/daemon/education/mode/tactic/harvest": "lazy" });
    console.log(JSON.stringify(sections, null, 2));
    specimen.expect(Object.keys(sections)).toEqual(["role", "primer"]);
    specimen.expect(sections.primer.includes("tactic/harvest/archivist")).toBe(true);
  });

  specimen.it("a none key prunes the thread mode's own section; a daemon-wide key skips a mode with no primer (nyan)", async () => {
    const sections = await system({
      "/daemon/education": "eager",
      "/daemon/education/mode/teacher/francesca/role": "none",
    });
    console.log(JSON.stringify(Object.keys(sections), null, 2));
    specimen.expect(sections.role).toBe(undefined);
    specimen.expect(Object.keys(sections).includes("tactic/harvest/archivist")).toBe(true);
  });

  specimen.it("primer_load writes PRIMED; the next request carries the section it returned", async () => {
    const ctx = { ...(await world()), thread: { trait: { PRIMED: {} } }, entities: { em: { flush: async () => {} } } };
    const tools = new Vector().graft(primerLoad);
    for (const [key, held] of Object.entries(ctx)) tools.use(shard.context.bind(key, held));
    const loaded = await steer.dispatch.invoke(tools, new ToolCall("primer_load"), steer.strategy.guarded)({ references: ["/tactic/harvest"] });
    const sections = await shape.primer.load(primed(ctx), ctx);
    console.log(JSON.stringify({ PRIMED: ctx.thread.trait.PRIMED, sections: Object.keys(sections) }, null, 2));
    specimen.expect(sections["tactic/harvest/archivist"]).toBe(loaded.output.primers["tactic/harvest/archivist"]);
  });
});
