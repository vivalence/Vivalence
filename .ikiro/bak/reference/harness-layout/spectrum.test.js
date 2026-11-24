import { specimen, steer } from "@vivalence/typology";
import * as root from "../../../commons/harnesses/runtime/runtime-harness.viva.js";

const name = (steps) => steps.map((step) => step.nature.replace(/^\//, "")).join("/");
const fields = (input) => Object.entries(input?.properties ?? {});
const typed = (input) =>
  Object.fromEntries(
    fields(input).map(([key, field]) => [(input.required ?? []).includes(key) ? key : `${key}?`, field.type ?? "any"]),
  );
const described = (input) => Object.fromEntries(fields(input).map(([key, field]) => [key, field.description]));

const LEVELS = {
  "0 nature": () => ({}),
  "1 valence": (pattern) => ({ valence: pattern.valence }),
  "2 valence + input names and types": (pattern) => ({ valence: pattern.valence, input: typed(pattern.input) }),
  "3 valence + input names and descriptions": (pattern) => ({ valence: pattern.valence, input: described(pattern.input) }),
  "4 valence + input schema whole": (pattern) => ({ valence: pattern.valence, input: pattern.input }),
};

specimen.describe("how much of a tool the outline shows", () => {
  specimen.it("each level on entity/find, and its weight over the runtime harness", () => {
    const leaves = steer.trie.leaves(root.tools);
    for (const [level, pluck] of Object.entries(LEVELS)) {
      const outline = Object.fromEntries(leaves.map((leaf) => [name(leaf.steps), pluck(leaf.pattern)]));
      console.log(`\n## ${level} · ${leaves.length} tools · ${JSON.stringify(outline).length} chars`);
      console.log(JSON.stringify({ "entity/count": outline["entity/count"] }, null, 2));
    }
  });
});
