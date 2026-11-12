import { shard, shape, specimen, Vector } from "@vivalence/typology";
import { accio } from "../../../systems/runtime/tests/scenarios/registry.js";

specimen.describe("francesca's own thread, tools and primer behind her slug", () => {
  specimen.it("the declarations and the primer keys", async () => {
    const francesca = await accio("@education/teacher/francesca");
    const tools = new Vector();
    tools.branch(`/${francesca.manifest.slug}`).graft(francesca.tools);
    const primer = new Vector();
    primer.branch(francesca.manifest.slug).graft(francesca.primer);
    const declared = shard.hallucinate.declarations(tools);
    console.log(JSON.stringify(declared, null, 2));
    console.log(JSON.stringify(shape.primer.keys(primer)));
    specimen.expect(declared.map((tool) => tool.name)).toEqual(["francesca_drill"]);
    specimen.expect(shape.primer.keys(primer)).toEqual(["francesca/francesca"]);
  });
});
