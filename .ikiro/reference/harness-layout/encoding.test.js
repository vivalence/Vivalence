import { shape, shard, specimen, steer, Vector } from "@vivalence/typology";
import * as oracle from "../../../commons/playground/chaosmonkey/oracle/oracle.viva.js";
import * as root from "../../../commons/harnesses/runtime/runtime-harness.viva.js";

const loading = (steps) => steps.findLast((step) => step.load)?.load ?? "eager";
const state = (vector, wanted) =>
  steer.trie.sieve(vector, (pattern, path) => loading(path) === wanted);

specimen.describe("the load state rides the node, tools as the primer already does", () => {
  specimen.it("a sibling seated lazy is listed; the thread's delta seats it eager", () => {
    const armed = new Vector().graft(root.tools);
    armed.branch({ nature: "oracle", load: "lazy" }).graft(oracle.tools);
    const before = shard.hallucinate.declarations(state(armed, "eager")).map((tool) => tool.name);
    const listed = shard.hallucinate.declarations(state(armed, "lazy")).map((tool) => tool.name);
    for (const [path, load] of Object.entries({ "/oracle": "eager" })) armed.branch({ nature: path, load });
    const after = shard.hallucinate.declarations(state(armed, "eager")).map((tool) => tool.name);
    console.log(JSON.stringify({ before, listed, after }, null, 2));
    console.log(JSON.stringify(shape.strip(armed).branches.oracle, null, 2).slice(0, 600));
    specimen.expect(before.some((name) => name.startsWith("oracle_"))).toBe(false);
    specimen.expect(after.some((name) => name.startsWith("oracle_"))).toBe(true);
  });
});
