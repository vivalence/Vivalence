import { shard, specimen, steer, ToolCall, Vector } from "@vivalence/typology";
import { accio } from "../../../systems/runtime/tests/scenarios/registry.js";
import { tool, unload } from "./load.test.js";
import { preload } from "./preload.test.js";
import { primer } from "./primer-reference.test.js";

specimen.describe("Q33B — a reference that matches nothing loads the rest and is answered as missed", () => {
  specimen.it("tool_load · tool_preload · primer_load · tool_unload, each with /nowhere beside a real reference", async () => {
    const harvest = await accio("@education/tactic/harvest");
    const nyan = await accio("@education/game/nyan");
    const francesca = { manifest: { type: "teacher", slug: "francesca" }, tools: new Vector() };
    const education = { reference: "/daemon/education", modes: { tactic: { harvest }, game: { nyan }, teacher: { francesca } } };
    const thread = { trait: { TOOLED: {}, PRIMED: {} } };
    const tools = new Vector().graft(tool, unload, preload, primer);
    const ctx = {
      tools,
      runtime: { reference: "/runtime/runtime", modes: {}, daemons: { education } },
      daemon: education,
      reference: education.reference,
      mode: francesca,
      thread,
      entities: { em: { flush: async () => {} } },
    };
    for (const [key, held] of Object.entries(ctx)) tools.use(shard.context.bind(key, held));
    const call = (name, input) => steer.dispatch.invoke(tools, new ToolCall(name), steer.strategy.guarded)(input);
    const answers = {
      tool_load: (await call("tool_load", { references: ["/tactic/harvest/drain", "/nowhere"] })).output.missed,
      tool_preload: (await call("tool_preload", { references: ["/tactic/harvest/survey", "/nowhere"] })).output.missed,
      primer_load: (await call("primer_load", { references: ["/tactic/harvest/archivist", "/game/nyan", "/nowhere"] })).output.missed,
      tool_unload: (await call("tool_unload", { references: ["/tactic/harvest/drain", "/nowhere"] })).output.missed,
    };
    console.log(JSON.stringify({ answers, trait: thread.trait }, null, 2));
    specimen.expect(answers).toEqual({
      tool_load: ["/nowhere"],
      tool_preload: ["/nowhere"],
      primer_load: ["/game/nyan", "/nowhere"],
      tool_unload: ["/nowhere"],
    });
  });
});
