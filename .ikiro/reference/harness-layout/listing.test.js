import { shape, specimen, Vector } from "@vivalence/typology";

specimen.describe("what the model reads today about a lazy primer", () => {
  specimen.it("modeA eager, modeB lazy", async () => {
    const primer = new Vector().open("role", () => "You run a drill.");
    primer
      .branch({ nature: "modeB", load: "lazy" })
      .graft(new Vector().open({ nature: "role", valence: "how to research the web" }, () => "You research the web."));
    console.log(JSON.stringify(await shape.primer.load(primer, {}), null, 2));
  });
});
