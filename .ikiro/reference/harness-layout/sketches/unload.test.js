import { shard, specimen, v, Vector } from "@vivalence/typology";

const names = (tools) => shard.hallucinate.declarations(tools).map((tool) => tool.name);
const modeB = new Vector().open({ nature: "/search", valence: "Searches.", input: v.object({ query: v.string() }) }, () => ({}));

specimen.describe("tool/unload", () => {
  specimen.it("trims the live tree and marks the trait", () => {
    const tools = new Vector().open({ nature: "/modeA/deal", valence: "Deals." }, () => ({}));
    const thread = { trait: { TOOLED: {} } };
    tools.branch("/modeB").graft(modeB);
    thread.trait.TOOLED["/modeB/search"] = "eager";
    console.log(JSON.stringify({ declared: names(tools), TOOLED: thread.trait.TOOLED }));
    tools.trim("/modeB/search");
    thread.trait.TOOLED["/modeB/search"] = "none";
    console.log(JSON.stringify({ declared: names(tools), TOOLED: thread.trait.TOOLED }));
  });
});
