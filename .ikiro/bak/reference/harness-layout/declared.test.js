import { specimen, steer } from "@vivalence/typology";
import * as root from "../../../commons/harnesses/runtime/runtime-harness.viva.js";
import { accio } from "../../../systems/runtime/tests/scenarios/registry.js";

const name = (steps) => steps.map((step) => step.nature.replace(/^\//, "")).join("/");
const census = (tools) => {
  const leaves = steer.trie.leaves(tools);
  const wearing = (test) => leaves.filter((leaf) => test(leaf.pattern)).map((leaf) => name(leaf.steps));
  return {
    tools: leaves.length,
    input: wearing((pattern) => pattern.input !== undefined).length,
    "input.examples": wearing((pattern) => pattern.input?.examples !== undefined),
    output: wearing((pattern) => pattern.output !== undefined),
    yields: wearing((pattern) => pattern.yields !== undefined),
  };
};

specimen.describe("what tool signatures declare today", () => {
  specimen.it("the runtime harness and francesca", async () => {
    console.log(JSON.stringify({ runtime: census(root.tools) }, null, 2));
    const francesca = await accio("@education/teacher/francesca");
    console.log(JSON.stringify({ francesca: census(francesca.tools) }, null, 2));
    const leaf = steer.trie.leaves(root.tools).find((leaf) => leaf.pattern.input?.examples);
    if (leaf) console.log(JSON.stringify({ [name(leaf.steps)]: { examples: leaf.pattern.input.examples } }, null, 2));
  });
});
