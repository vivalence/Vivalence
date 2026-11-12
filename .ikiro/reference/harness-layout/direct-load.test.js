import { shard, specimen, steer, ToolCall, v, Vector } from "@vivalence/typology";
import { accio } from "../../../systems/runtime/tests/scenarios/registry.js";

specimen.describe("a tool tree from the same process: grafted, its owner bound", () => {
  specimen.it("harvest's tools grafted under its address keep harvest as ctx.mode", async () => {
    const harvest = await accio("@education/tactic/harvest");
    const owner = { manifest: { type: "tactic", slug: "harvest" } };
    const loader = { manifest: { type: "teacher", slug: "francesca" } };
    const seen = [];
    const tools = new Vector().open({ nature: "/teacher/francesca/whoami", valence: "Names the mode." }, (ctx) => {
      seen.push(`whoami ran under ${ctx.mode.manifest.slug}`);
      return { output: { message: ctx.mode.manifest.slug } };
    });
    tools.use(shard.context.bind("mode", loader));
    const spy = new Vector().open({ nature: "/probe", valence: "Names the mode.", input: v.object({}) }, (ctx) => {
      seen.push(`probe ran under ${ctx.mode.manifest.slug}`);
      return { output: { message: ctx.mode.manifest.slug } };
    });
    tools
      .branch("/education/tactic/harvest")
      .use(shard.context.bind("mode", owner))
      .graft(harvest.tools, spy);
    const declared = shard.hallucinate.declarations(tools);
    await steer.dispatch.invoke(tools, new ToolCall("teacher_francesca_whoami").signal, steer.strategy.guarded)({});
    await steer.dispatch.invoke(tools, new ToolCall("education_tactic_harvest_probe").signal, steer.strategy.guarded)({});
    console.log(["", ...declared.map((tool) => `declared ${tool.name}`), ...seen].join("\n"));
    specimen.expect(seen).toEqual(["whoami ran under francesca", "probe ran under harvest"]);
  });
});
