import { specimen, v } from "@vivalence/typology";
import { translateTools } from "../../../commons/hallucinators/anthropic/provider/translate.js";

const declaration = {
  name: "modeB_search",
  valence: "Searches the web for pages.",
  input: v.object({ query: v.string() }).example({ query: "congiuntivo" }),
  output: v.object({ pages: v.array(v.string()) }).example({ pages: ["example.org/congiuntivo"] }),
};
const returns = ({ examples, ...schema }) =>
  [`Returns ${JSON.stringify(schema)}.`, ...(examples ?? []).map((example) => `Example: ${JSON.stringify(example)}`)].join(" ");
const described = (declaration) =>
  [declaration.valence, declaration.output && returns(declaration.output)].filter(Boolean).join(" ");

specimen.describe("the output, written into the description", () => {
  specimen.it("one anthropic tool definition", () => {
    const [definition] = translateTools([{ ...declaration, valence: described(declaration) }]);
    console.log(JSON.stringify(definition, null, 2));
  });
});
