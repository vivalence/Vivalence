import { specimen, steer, ToolCall, v, Vector } from "@vivalence/typology";

specimen.describe("invoke takes a ToolCall as it is", () => {
  specimen.it("no .signal", async () => {
    const tools = new Vector()
      .open({ nature: "/modes/index", valence: "x", input: v.object({ reference: v.string() }) }, (ctx) => ({
        output: { seen: ctx.input.reference, signal: ctx.signal?.constructor.name },
      }))
      .open({ nature: "/tool/:name", valence: "y" }, (ctx) => ({ output: { params: ctx.params } }));
    const call = new ToolCall("modes_index");
    const direct = await steer.dispatch.invoke(tools, call, steer.strategy.guarded)({ reference: "/runtime" });
    const wrapped = await steer.dispatch.invoke(tools, call.signal, steer.strategy.guarded)({ reference: "/runtime" });
    const param = await steer.dispatch.invoke(tools, new ToolCall("tool_load"), steer.strategy.guarded)({});
    console.log(["", `direct  ${JSON.stringify(direct)}`, `wrapped ${JSON.stringify(wrapped)}`, `param   ${JSON.stringify(param)}`].join("\n"));
    let fault;
    try {
      await steer.dispatch.invoke(tools, new ToolCall("nope_x"), steer.strategy.guarded)({});
    } catch (error) {
      fault = error.message;
    }
    console.log(`miss    ${fault}`);
  });
});
