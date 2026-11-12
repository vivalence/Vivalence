import { shard, specimen, steer, v, Vector } from "@vivalence/typology";
import { translateTools } from "../../../commons/hallucinators/anthropic/provider/translate.js";

const tools = new Vector().open(
  {
    nature: "/modeB/search",
    valence: "Searches the web for pages.",
    input: v.object({ query: v.string() }).example({ query: "congiuntivo" }),
    output: v.object({ pages: v.array(v.string()) }).example({ pages: ["example.org/congiuntivo"] }),
  },
  () => ({ output: { pages: [] } }),
);
const withOutput = (tools) =>
  steer.trie.leaves(tools).map(({ pattern }, index) => ({
    ...shard.hallucinate.declarations(tools)[index],
    ...(pattern.output && { output: pattern.output }),
  }));

specimen.describe("a declaration that carries output", () => {
  specimen.it("the declaration, then what the anthropic translator makes of it today", () => {
    console.log(JSON.stringify(withOutput(tools), null, 2));
    console.log(JSON.stringify(translateTools(withOutput(tools)), null, 2));
  });
});
