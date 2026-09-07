import { specimen, Dataset } from "@vivalence/typology";
import { reader } from "../prototypes/dataset.js";

specimen.describe("Dataset — a loader source", () => {
  const load = async () => [];
  const stamp = async () => "x";

  specimen.it("lifts a bare function to { load }", () => {
    specimen.expect(new Dataset({ literal: load }).sources.literal).toEqual([{ load }]);
  });

  specimen.it("keeps { load, stamp } as declared; reader.load omits a missing stamp", () => {
    specimen.expect(new Dataset({ literal: { load, stamp } }).sources.literal).toEqual([{ load, stamp }]);
    specimen.expect(reader.load(load)).toEqual({ load });
    specimen.expect(reader.load(load, stamp)).toEqual({ load, stamp });
  });

  specimen.it("a list mixing a path and a loader keeps declaration order", () => {
    const [first, second] = new Dataset({ symbol: ["dataset/symbols.js", { load, stamp }] }).sources.symbol;
    specimen.expect(first).toEqual({ read: "dataset/symbols.js", codec: "data" });
    specimen.expect(second).toEqual({ load, stamp });
  });
});
