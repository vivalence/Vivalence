import { shard, specimen, Vector } from "@vivalence/typology";
import * as anthropic from "/Users/finn/vivalence/code/vivalence/commons/hallucinators/anthropic/provider/translate.js";
import * as openrouter from "/Users/finn/vivalence/code/vivalence/commons/hallucinators/openrouter/provider/translate.js";
import { snapshot } from "../lib/fixture.js";
import { print } from "../lib/world.js";
import { declarations as designDeclarations, tool, unload } from "../lib/copied/load.js";

const SNAP = new URL("../snapshots/integration", import.meta.url).pathname;
const MODEL = { id: "stub-model", thinking: false };
const translators = { anthropic, openrouter };

const lowered = async (request, policy = {}) => {
  const ctx = { input: request, policy };
  await shard.hallucinate.lowering()(ctx, async () => {});
  return ctx.input;
};

const paths = (value, prefix = "") =>
  value && typeof value === "object"
    ? Object.entries(value).flatMap(([key, held]) => [`${prefix}/${key}`, ...paths(held, `${prefix}/${key}`)])
    : [];

specimen.describe("L3 integration — translators (anthropic · openrouter; bak/ out)", () => {
  specimen.it("Q15 · Q25A — input · examples · output: what each layer forwards", async () => {
    const tools = new Vector().graft(tool, unload);
    const live = shard.hallucinate.declarations(tools);
    const design = designDeclarations(tools);
    const request = await lowered({ turns: [{ role: "user", parts: [{ type: "text", text: "hi" }] }], tools });
    const rows = [];
    for (const [name, translator] of Object.entries(translators)) {
      const params = translator.buildParams(MODEL, request);
      const path = snapshot(SNAP, `params-${name}-tools`, params);
      const flat = paths(params.tools);
      rows.push({
        translator: name,
        tools: params.tools.length,
        carriesInput: flat.some((held) => held.includes("references")),
        carriesExamples: flat.some((held) => held.endsWith("/examples")),
        carriesOutput: JSON.stringify(params.tools).includes('"unloaded"'),
        snapshot: path,
      });
    }
    print("live declarations (shard/hallucinate.js:11), whole", live);
    print("design declarations (probe load.test.js), keys per item", design.map((held) => Object.keys(held)));
    print("lowered request.tools keys per item", request.tools.map((held) => Object.keys(held)));
    print("per translator", rows);
    specimen.expect(live.every((held) => "output" in held)).toBe(true);
    specimen.expect(rows.every((row) => row.carriesInput && row.carriesExamples && row.carriesOutput)).toBe(true);
  });

  specimen.it("MISSING · old turns naming a tool no longer declared (after tool/unload)", async () => {
    const turns = [
      { role: "user", parts: [{ type: "text", text: "read the readme" }] },
      { role: "assistant", parts: [{ type: "tool_use", id: "u1", name: "runtime_harness_runtime_fs_read", input: { path: "/x" } }] },
      { role: "user", parts: [{ type: "tool_result", id: "u1", condition: "NOMINAL", output: { text: "…" } }] },
      { role: "assistant", parts: [{ type: "text", text: "done" }] },
      { role: "user", parts: [{ type: "text", text: "again" }] },
    ];
    const request = { turns, tools: [{ name: "tool_load", valence: "Loads tools.", input: { type: "object" } }] };
    const out = {};
    for (const [name, translator] of Object.entries(translators)) {
      const params = translator.buildParams(MODEL, request);
      out[name] = { declared: params.tools.map((held) => held.name ?? held.function.name), messages: params.messages };
    }
    print("params with an undeclared tool in the history, whole", out);
    const passes = Object.values(out).every((held) => JSON.stringify(held.messages).includes("runtime_harness_runtime_fs_read"));
    print("translators forward the undeclared tool_use untouched", passes);
    specimen.expect(passes).toBe(true);
  });

  specimen.it("MISSING · the history cache mark (Q8 'the history is cached')", async () => {
    const turns = Array.from({ length: 6 }, (_, index) => ({ role: index % 2 ? "assistant" : "user", parts: [{ type: "text", text: `turn ${index}` }] }));
    const request = await lowered({ system: { role: "You are X." }, turns, tools: new Vector().graft(tool) });
    print("lowered cache marks", request.cache);
    const rows = {};
    for (const [name, translator] of Object.entries(translators)) {
      const params = translator.buildParams(MODEL, request);
      const json = JSON.stringify(params.messages);
      rows[name] = { messageMarks: (json.match(/cache_control/g) ?? []).length, systemMarks: (JSON.stringify(params.system ?? []).match(/cache_control/g) ?? []).length, toolMarks: (JSON.stringify(params.tools).match(/cache_control/g) ?? []).length };
    }
    print("cache_control count per region", rows);
    specimen.expect(Object.values(rows).every((row) => row.messageMarks > 0)).toBe(true);
  });
});
