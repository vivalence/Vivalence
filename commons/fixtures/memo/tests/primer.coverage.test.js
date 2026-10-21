// m83: memo's mode primer IS the directory Primer (nature magister); the domain and the mode open their sections on ctx.hallucination.primer
import { shape, specimen, steer, Vector } from "@vivalence/typology";
import { harness as mode, primer } from "../mode/harness.js";
import { harness as domain } from "../domain/harness.js";
import * as memo from "../mode/memo.viva.js";

const entities = {
  note: { owner: () => ({}), find: async () => [], count: async () => 0 },
  literal: { count: async () => 3, byStrength: async () => [], leeches: async () => [] },
};

const assemble = () => {
  const run = new Vector();
  run.use(async (ctx, next) => {
    ctx.hallucination = { policy: {}, primer: new Vector().graft(primer) };
    Object.assign(ctx, { entities, statics: { language: { known: "English", learning: "Latin" } } });
    await next();
  });
  run.graft(domain);
  run.graft(mode);
  run.branch("/dialogue").open("/render", (ctx) => ({ policy: ctx.hallucination.policy, system: shape.primer.load(ctx.hallucination.primer, ctx) }));
  run.open("/render", (ctx) => ({ policy: ctx.hallucination.policy, system: shape.primer.load(ctx.hallucination.primer, ctx) }));
  return (path) => steer.dispatch.invoke(run, path, steer.strategy.guarded)({});
};

specimen.describe("memo — the primer the Magister sees", () => {
  specimen.it("the mode declares PRIMER and exports the directory primer beside its harness", () => {
    specimen.expect(memo.manifest.traits).toContain("PRIMER");
    specimen.expect(memo.manifest.traits).toContain("HARNESSED");
    specimen.expect(memo.primer).toBe(primer);
    specimen.expect(memo.harness).toBe(mode);
  });

  specimen.it("the directory primer carries magister eagerly, read from primer/magister.md", async () => {
    specimen.expect(shape.primer.keys(primer)).toEqual(["magister"]);
    specimen.expect(shape.primer.lazy(primer)).toEqual([]);
    specimen.expect((await shape.primer.read(primer, "magister")).startsWith("You are Magister")).toBe(true);
  });

  specimen.it("an object render carries magister · srs · language, tuned fast unless the request tunes", async () => {
    const { policy, system } = await assemble()("/render");
    specimen.expect(policy).toEqual({ tune: "fast" });
    specimen.expect(Object.keys(await system)).toEqual(["magister", "srs", "language"]);
    specimen.expect((await system).language).toBe("Known: English. Learning: Latin.");
    specimen.expect((await system).srs.startsWith("This daemon schedules its cards with SM-2")).toBe(true);
  });

  specimen.it("a dialogue render adds today's briefing after the mode's sections", async () => {
    const { system } = await assemble()("/dialogue/render");
    specimen.expect(Object.keys(await system)).toEqual(["magister", "srs", "language", "today"]);
    specimen.expect((await system).today).toBe("Today: 0 due, 3 untouched of 3, 0 graduated, 0 leeches, 0 suspended.");
  });

  specimen.it("a request never writes the mode's primer — the source is not mutated", async () => {
    const before = JSON.stringify(shape.primer.keys(primer));
    await assemble()("/dialogue/render");
    specimen.expect(JSON.stringify(shape.primer.keys(primer))).toBe(before);
  });
});
