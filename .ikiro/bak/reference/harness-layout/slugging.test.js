import { shard, shape, specimen, v, Vector } from "@vivalence/typology";
import { accio } from "../../../systems/runtime/tests/scenarios/registry.js";

const Slugging = v.enum(["flat", "nested", "deep"]).default("deep");
const BEHIND = {
  flat: { own: false, other: false },
  nested: { own: false, other: true },
  deep: { own: true, other: true },
};
const under = (tree, mode, behind) => (behind ? tree.branch(`/${mode.manifest.slug}`) : tree);
const mounted = (slugging, own, others, key) => {
  const tree = new Vector();
  under(tree, own, BEHIND[slugging].own).graft(own[key]);
  for (const other of others) under(tree, other, BEHIND[slugging].other).graft(other[key]);
  return tree;
};

const modeB = {
  manifest: { slug: "modeB" },
  tools: new Vector().open({ nature: "/search", valence: "Searches the web." }, () => ({})),
  primer: new Vector().open("role", () => "You research the web."),
};

specimen.describe("one setting, three ways to name tools and primer sections", () => {
  specimen.it("francesca's thread with modeB loaded", async () => {
    const francesca = await accio("@education/teacher/francesca");
    console.log(JSON.stringify({ default: Slugging.cast(undefined) }));
    for (const slugging of ["flat", "nested", "deep"]) {
      const tools = shard.hallucinate.declarations(mounted(slugging, francesca, [modeB], "tools")).map((tool) => tool.name);
      const primer = shape.primer.keys(mounted(slugging, francesca, [modeB], "primer"));
      console.log(JSON.stringify({ slugging, tools, primer }));
    }
  });
});
