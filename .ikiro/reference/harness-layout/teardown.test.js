import { shard, shape, Signal, specimen, steer, v, Vector } from "@vivalence/typology";

const modeB = {
  manifest: { slug: "modeB" },
  tools: new Vector().open(
    {
      nature: "/search",
      valence: "Searches the web for pages.",
      input: v.object({ query: v.string().desc("What to search for.") }).example({ query: "congiuntivo" }),
      output: v.object({ pages: v.array(v.string()) }).example({ pages: ["example.org/congiuntivo"] }),
    },
    () => ({ output: { pages: [] } }),
  ),
};

specimen.describe("tool/load on /modeB/search", () => {
  specimen.it("the signature splits the nature; the result is the tool's teardown", () => {
    const wanted = new Signal("/modeB/search");
    console.log(JSON.stringify({ root: wanted.root.nature, heir: wanted.heir.absolute, fin: wanted.fin.nature }));
    const armory = new Vector();
    armory.branch(wanted.root).graft(modeB.tools);
    const [declared] = shard.hallucinate.declarations(armory);
    console.log(JSON.stringify({ output: { loaded: declared } }, null, 2));
  });
});
