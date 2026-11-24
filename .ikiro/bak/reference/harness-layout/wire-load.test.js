import { shape, shard, specimen, steer, ToolCall, Vector } from "@vivalence/typology";
import { enhance } from "../../../subsystems/typology/schematics/v.js";
import { accio } from "../../../systems/runtime/tests/scenarios/registry.js";

specimen.describe("a tool tree crosses a wire: strip, then wire", () => {
  specimen.it("harvest's tools, served as a strip, loaded into another thread's tools", async () => {
    const harvest = await accio("@education/tactic/harvest");
    const served = JSON.parse(JSON.stringify(shape.strip(harvest.tools)));
    const sent = [];
    const remote = (address) => (path, declared) => [
      { nature: path.at(-1), valence: declared.valence, input: declared.input && enhance(declared.input), output: declared.output },
      (ctx) => {
        sent.push(`call ${address}/${path.join("/")} ${JSON.stringify(ctx.input)}`);
        return { output: { message: "answered by the other daemon" } };
      },
    ];
    const tools = new Vector();
    tools.branch("/tactic/harvest").graft(shape.repl.wire(served, remote("/daemon/education/mode/tactic/harvest/tools")));
    const declared = shard.hallucinate.declarations(tools);
    const result = await steer.dispatch.invoke(tools, new ToolCall("tactic_harvest_drain").signal, steer.strategy.guarded)({
      topography: "italian",
    });
    console.log(["", ...declared.map((tool) => `declared ${tool.name}`), ...sent, `result ${JSON.stringify(result)}`].join("\n"));
    specimen.expect(declared.map((tool) => tool.name)).toEqual(["tactic_harvest_survey", "tactic_harvest_vocalize", "tactic_harvest_drain"]);
  });
});
