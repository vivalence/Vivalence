import { shape, shard, specimen, steer, ToolCall, Vector } from "@vivalence/typology";
import * as harness from "../../../commons/harnesses/runtime/runtime-harness.viva.js";
import { accio } from "../../../systems/runtime/tests/scenarios/registry.js";
import { tool, unload } from "./load.test.js";
import { tooled } from "./rounds.test.js";
import { primed } from "./system.test.js";

const HARNESS = "/runtime/runtime/mode/harness/runtime";
const FS = `${HARNESS}/fs`;
const GUIDE = "/runtime/runtime/mode/guide";

const world = async (TOOLED = {}, PRIMED = {}) => {
  const harvest = await accio("@education/tactic/harvest");
  const editor = {
    manifest: { type: "guide", slug: "editor" },
    tools: new Vector().open({ nature: "/open", valence: "Opens the editor." }, () => ({ output: {} })),
  };
  const francesca = {
    manifest: { type: "teacher", slug: "francesca" },
    tools: new Vector(),
    primer: new Vector().open({ nature: "role" }, () => "You are Francesca."),
  };
  const education = { reference: "/daemon/education", modes: { tactic: { harvest }, teacher: { francesca } } };
  const runtime = {
    reference: "/runtime/runtime",
    modes: { harness: { runtime: { manifest: harness.manifest, tools: harness.tools } }, guide: { editor } },
    daemons: { education },
  };
  return {
    runtime,
    daemon: education,
    reference: education.reference,
    mode: francesca,
    thread: { trait: { TOOLED, PRIMED } },
    entities: { em: { flush: async () => {} } },
  };
};

const names = (tools) => steer.trie.leaves(tools).map(({ steps }) => new ToolCall(steps).name);
const declared = async (TOOLED) => names(tooled(await world(TOOLED))).filter((name) => name.startsWith("runtime_"));

specimen.describe("all of /runtime, then nested branches and leaves excluded", () => {
  specimen.it("the next request, rebuilt from TOOLED", async () => {
    const cases = {
      all: { "/runtime": "eager" },
      "a branch out": { "/runtime": "eager", [FS]: "none" },
      "a leaf out": { "/runtime": "eager", [`${FS}/delete`]: "none" },
      "a branch out, a leaf back in": { "/runtime": "eager", [FS]: "none", [`${FS}/read`]: "eager" },
      "a whole mode type out": { "/runtime": "eager", [GUIDE]: "none" },
    };
    const results = {};
    for (const [label, TOOLED] of Object.entries(cases)) results[label] = await declared(TOOLED);
    console.log(JSON.stringify(Object.fromEntries(Object.entries(results).map(([label, held]) => [label, { count: held.length, held }])), null, 2));
    const fs = (held) => held.filter((name) => name.includes("_fs_"));
    specimen.expect(results.all.length).toBe(17);
    specimen.expect(fs(results["a branch out"])).toEqual([]);
    specimen.expect(results["a leaf out"].includes("runtime_harness_runtime_fs_delete")).toBe(false);
    specimen.expect(fs(results["a leaf out"]).length).toBe(6);
    specimen.expect(fs(results["a branch out, a leaf back in"])).toEqual(["runtime_harness_runtime_fs_read"]);
    specimen.expect(results["a whole mode type out"].includes("runtime_guide_editor_open")).toBe(false);
    specimen.expect(results["a whole mode type out"].length).toBe(16);
  });

  specimen.it("through the tools: tool_load /runtime, tool_unload a leaf and a mode type; live = rebuilt", async () => {
    const ctx = await world();
    const tools = new Vector().graft(tool, unload);
    for (const [key, held] of Object.entries({ ...ctx, tools })) tools.use(shard.context.bind(key, held));
    const call = (name, input) => steer.dispatch.invoke(tools, new ToolCall(name), steer.strategy.guarded)(input);
    const loaded = await call("tool_load", { references: ["/runtime"] });
    const unloaded = await call("tool_unload", { references: [`${FS}/delete`, GUIDE] });
    const live = names(tools).filter((name) => name.startsWith("runtime_"));
    const rebuilt = names(tooled(ctx)).filter((name) => name.startsWith("runtime_"));
    console.log(JSON.stringify({ loaded: loaded.output.missed, unloaded: unloaded.output, TOOLED: ctx.thread.trait.TOOLED, live, rebuilt }, null, 2));
    specimen.expect(ctx.thread.trait.TOOLED).toEqual({
      "/runtime": "eager",
      [`${FS}/delete`]: "none",
      [GUIDE]: "none",
    });
    specimen.expect(live).toEqual(rebuilt);
    specimen.expect(live.includes("runtime_harness_runtime_fs_delete")).toBe(false);
    specimen.expect(live.includes("runtime_guide_editor_open")).toBe(false);
  });

  specimen.it("Q35 — the key is the reference added: a runtime mode born later is covered", async () => {
    const ctx = await world();
    const tools = new Vector().graft(tool);
    for (const [key, held] of Object.entries({ ...ctx, tools })) tools.use(shard.context.bind(key, held));
    await steer.dispatch.invoke(tools, new ToolCall("tool_load"), steer.strategy.guarded)({ references: ["/runtime", "/tactic/harvest"] });
    ctx.runtime.modes.later = { born: { manifest: { type: "later", slug: "born" }, tools: new Vector().open({ nature: "/ping" }, () => ({ output: {} })) } };
    const rebuilt = names(tooled(ctx)).filter((name) => name.startsWith("runtime_later"));
    console.log(JSON.stringify({ TOOLED: ctx.thread.trait.TOOLED, rebuilt }, null, 2));
    specimen.expect(Object.keys(ctx.thread.trait.TOOLED)).toEqual(["/runtime", "/daemon/education/mode/tactic/harvest"]);
    specimen.expect(rebuilt).toEqual(["runtime_later_born_ping"]);
  });

  specimen.it("primer: a daemon eager, one section none", async () => {
    const ctx = await world({}, {
      "/daemon/education": "eager",
      "/daemon/education/mode/tactic/harvest/archivist": "none",
    });
    const sections = Object.keys(await shape.primer.load(primed(ctx), ctx));
    console.log(JSON.stringify(sections, null, 2));
    specimen.expect(sections.includes("tactic/harvest/archivist")).toBe(false);
    specimen.expect(sections.includes("role")).toBe(true);
  });
});
