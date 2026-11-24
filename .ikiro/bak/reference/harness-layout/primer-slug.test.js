import { shape, specimen, Vector } from "@vivalence/typology";
import { accio } from "../../../systems/runtime/tests/scenarios/registry.js";

specimen.describe("a mode's own primer: at the root, or under its slug", () => {
  specimen.it("francesca's section keys", async () => {
    const francesca = await accio("@education/teacher/francesca");
    const root = new Vector().graft(francesca.primer);
    const slugged = new Vector();
    slugged.branch(francesca.manifest.slug).graft(francesca.primer);
    console.log(JSON.stringify({ today: shape.primer.keys(root), "under the slug": shape.primer.keys(slugged) }, null, 2));
  });
});
