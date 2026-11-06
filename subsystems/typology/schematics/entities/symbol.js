import { v } from "../v.js";
import * as traits from "../traits/index.js";
import { DataSchematic } from "./base.js";

export const SymbolSchematic = {
  ...DataSchematic,
  $id: "Symbol",
  is: "one word of a daemon's vocabulary: a slug the literals are described with",
  own: {
    slug: v.string().optional().desc("the word").examples("wading-bird"),
    traits: traits.names.symbol.optional().desc("the trait names worn").examples(["LABELED", "ONTOLOGICAL"]),
    trait: traits.symbol.default({}).optional().desc("trait data by name").examples({ LABELED: { name: "wading bird" }, ONTOLOGICAL: {} }),
  },
  relations: {
    literals: () => v.array(v.literal()).optional().desc("literals it describes"),
    daemon: () => v.rel().optional().desc("the daemon it belongs to").examples("education"),
    mode: () => v.rel().optional().desc("the mode that ships it").examples("01a09010-13a9-7f1e-a2c4-6b0d1f2e3a44"),
  },
  narrowable: ["trait"],
  examples: [{ id: "01a1b1c0-d3ec-73bf-a784-adb115870224", slug: "material.carbon", traits: ["ONTOLOGICAL", "LABELED"], trait: { ONTOLOGICAL: {}, LABELED: { name: "Carbon", description: "Carbon frame geometry. The only parts where dimensional accuracy matters." } }, daemon: "droneaid", mode: "01a1b1c0-d3e0-75b5-9e06-c19220ab83df" }],
};
