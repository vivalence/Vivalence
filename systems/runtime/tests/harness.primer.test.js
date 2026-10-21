import { Mode, shape, specimen, steer, ToolCall, Vector } from "@vivalence/typology";
import { traits } from "@vivalence/runtime";
import { create } from "./scenarios/cortex.js";
const { PRIMER } = traits.mode;

let scenario;
let captured;

const ask = async () => {
  const thread = await scenario.createThread();
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
    const harvest = new Mode({ manifest: { type: "tactics", slug: "harvest", traits: ["PRIMER"] } });
    harvest.module.primer = new Vector().open({ nature: "archivist", valence: "the harvest persona" }, "ARCHIVIST");
    PRIMER(harvest);
    daemon.modes.tactics = { harvest };
  });
  specimen.afterAll(async () => {
    await scenario.orm.close();
  });

  specimen.it("PRIMER mints the mode's own primer; a mode without AGENTIC reads no sibling", async () => {
    const system = await ask();
    specimen.expect(Object.keys(system)).toEqual(["dewey", "thread"]);
    specimen.expect(captured.tools.trie.has("primer")).toBe(false);
  });

  specimen.it("an AGENTIC mode lists every sibling's primer lazily, reads one with primer_read, and writes no mode", async () => {
    const { dewey, daemon } = scenario;
    dewey.manifest.traits.push("AGENTIC");
    const system = await ask();
    specimen.expect(Object.keys(system)).toEqual(["dewey", "primer", "thread"]);
    specimen.expect(system.primer).toBe("Read on demand with primer_read { nature }:\nharvest/archivist — the harvest persona");
    specimen.expect(await shape.primer.read(captured.primer, "harvest/archivist")).toBe("ARCHIVIST");
    specimen.expect(captured.tools.trie.has("primer")).toBe(true);
    specimen.expect(shape.primer.keys(dewey.primer)).toEqual(["dewey"]);
    specimen.expect(shape.primer.keys(daemon.modes.tactics.harvest.primer)).toEqual(["archivist"]);
    dewey.manifest.traits.pop();
  });

  specimen.it("a read lands in the turn, never in the primer: the loaded record and the armed tools are byte-equal across a primer_read", async () => {
    const { dewey } = scenario;
    dewey.manifest.traits.push("AGENTIC");
    await ask();
    const before = { system: JSON.stringify(await shape.primer.load(captured.primer)), tools: JSON.stringify(shape.strip(captured.tools)) };
    specimen.expect(await steer.dispatch.invoke(captured.tools, new ToolCall("primer_read").signal, steer.strategy.guarded)({ nature: "harvest/archivist" })).toEqual({ output: { message: "ARCHIVIST" } });
    specimen.expect(JSON.stringify(await shape.primer.load(captured.primer))).toBe(before.system);
    specimen.expect(JSON.stringify(shape.strip(captured.tools))).toBe(before.tools);
    dewey.manifest.traits.pop();
  });

  specimen.it("a domain's primer hangs under the domain's slug on every request", async () => {
    const { daemon } = scenario;
    daemon.domain = { manifest: { type: "domain", slug: "memo" }, primer: new Vector().open("srs", "GLOSSARY") };
    const system = await ask();
    specimen.expect(Object.keys(system)).toEqual(["dewey", "memo/srs", "thread"]);
    specimen.expect(system["memo/srs"]).toBe("GLOSSARY");
    delete daemon.domain;
  });

  specimen.it("PRIMER on a mode that exports no primer is loud", () => {
    const bare = new Mode({ manifest: { type: "tactics", slug: "bare", traits: ["PRIMER"] } });
    specimen.expect(() => PRIMER(bare)).toThrow("PRIMER: bare declares the trait and exports no primer");
  });
});
