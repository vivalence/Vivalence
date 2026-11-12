import { shard, specimen, steer, ToolCall, v, Vector } from "@vivalence/typology";

specimen.describe("a tool reads the tree it sits in", () => {
  specimen.it("ctx.tools is the tool tree, as the tool sees it", async () => {
    const tools = new Vector()
      .open({ nature: "/francesca/drill", valence: "Deals a drill." }, () => ({}))
      .open(
        { nature: "/tool/load", valence: "Loads one tool.", input: v.object({ nature: v.string() }) },
        (ctx) => ({ output: { declared: shard.hallucinate.declarations(ctx.tools) } }),
      );
    tools.use(shard.context.bind("tools", tools));
    const seen = await steer.dispatch.invoke(tools, new ToolCall("tool_load").signal, steer.strategy.guarded)({
      nature: "/modeB/search",
    });
    console.log(JSON.stringify(seen, null, 2));
    specimen.expect(seen.output.declared.map((tool) => tool.name)).toEqual(["francesca_drill", "tool_load"]);
  });
});
