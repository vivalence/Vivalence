import { shape, specimen, v, Vector } from "@vivalence/typology";

const queried = v.object({ query: v.string().desc('What to search for. Example: "congiuntivo"') });
const modeB = {
  primer: new Vector()
    .open({ nature: "role", valence: "how to research the web" }, () => "You research the web. Cite every source.")
    .open({ nature: "sources", valence: "which sites to trust" }, () => "Prefer primary sources."),
  tools: new Vector().open(
    { nature: "/search", valence: "Searches the web for pages. Returns { message }.", input: queried },
    () => ({ output: { message: "" } }),
  ),
};

specimen.describe("mode read: the outline of modeB", () => {
  specimen.it("nature and valence of every primer section and every tool, no bodies", () => {
    const outline = { primer: shape.strip(modeB.primer), tools: shape.strip(modeB.tools) };
    console.log(JSON.stringify(outline, null, 2));
  });
});
