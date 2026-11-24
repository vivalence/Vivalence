import { shard, specimen, steer, v, Vector } from "@vivalence/typology";

const queried = v.object({ query: v.string() });
const modeB = new Vector().open(
  { nature: "/search", valence: "Searches the web for pages.", input: queried },
  () => ({ output: { message: "three pages" } }),
);
const armory = new Vector().open(
  { nature: "/tool/load", valence: "Loads one tool by its nature.", input: v.object({ nature: v.string() }) },
  (ctx) => {
    ctx.armory.branch("/modeB").graft(modeB);
    ctx.thread.trait.TOOLED["/modeB/search"] = "eager";
    return { output: { message: "modeB_search loaded" } };
  },
);
const names = (tools) => shard.hallucinate.declarations(tools).map((tool) => tool.name);

specimen.describe("tool/load grafts into the live armory", () => {
  specimen.it("the next round declares the tool and can run it", async () => {
    const thread = { trait: { TOOLED: {} } };
    console.log(JSON.stringify({ round: 1, declared: names(armory), TOOLED: thread.trait.TOOLED }));
    await steer.dispatch.execute(armory, { armory, thread, input: { nature: "/modeB/search" } }, "/tool/load");
    console.log(JSON.stringify({ round: 2, declared: names(armory), TOOLED: thread.trait.TOOLED }));
    const ran = await steer.dispatch.execute(armory, { input: { query: "congiuntivo" } }, "/modeB/search");
    console.log(JSON.stringify({ ran }));
  });
});
