import { shape, specimen, steer, v, Vector } from "@vivalence/typology";

const modeB = new Vector()
  .open({ nature: "role", valence: "how to research the web" }, () => "You research the web. Cite every source.")
  .open({ nature: "sources", valence: "which sites to trust" }, () => "Prefer primary sources.");
const primer = new Vector().open("modeA/role", () => "You run a drill.");
primer.branch({ nature: "modeB", load: "lazy" }).graft(modeB);

const tools = new Vector().open(
  {
    nature: "/primer/load",
    valence: "Loads one primer section in full, by the nature mode_read listed.",
    input: v.object({ nature: v.string() }).example({ nature: "/modeB/role" }),
    output: v.object({ nature: v.string(), text: v.string() }),
  },
  async (ctx) => {
    const text = await shape.primer.read(ctx.primer, ctx.input.nature, ctx);
    ctx.thread.trait.PRIMED[ctx.input.nature] = "eager";
    return { output: { nature: ctx.input.nature, text } };
  },
);

specimen.describe("primer/load on /modeB/role", () => {
  specimen.it("returns the section's text and marks the thread", async () => {
    const thread = { trait: { PRIMED: {} } };
    const result = await steer.dispatch.execute(tools, { primer, thread, input: { nature: "/modeB/role" } }, "/primer/load");
    console.log(JSON.stringify({ result, PRIMED: thread.trait.PRIMED }, null, 2));
  });
});
