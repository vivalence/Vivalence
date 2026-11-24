import { specimen, v } from "@vivalence/typology";

specimen.describe("v.eg", () => {
  specimen.it("gives the schema v.example gives", () => {
    const short = v.object({ nature: v.string() }).eg({ nature: "/modeB/search" });
    const long = v.object({ nature: v.string() }).example({ nature: "/modeB/search" });
    console.log(JSON.stringify(short, null, 2));
    specimen.expect(JSON.stringify(short)).toBe(JSON.stringify(long));
  });
});
