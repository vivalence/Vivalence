import { shard, specimen, Vector } from "@vivalence/typology";
import { accio } from "../../../systems/runtime/tests/scenarios/registry.js";

const names = (tools) => shard.hallucinate.declarations(tools).map((tool) => tool.name);

specimen.describe("a mode's own tools: at the root, or under its slug", () => {
  specimen.it("francesca", async () => {
    const francesca = await accio("@education/teacher/francesca");
    const root = new Vector().graft(francesca.tools);
    const slugged = new Vector();
    slugged.branch(`/${francesca.manifest.slug}`).graft(francesca.tools);
    console.log(JSON.stringify({ today: names(root), "under the slug": names(slugged) }));
  });
});
