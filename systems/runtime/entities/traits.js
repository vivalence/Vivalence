import { v } from "@vivalence/typology";
import { traits as trait } from "@vivalence/typology";

const LABELED = trait.define("LABELED", { schematic: v.primitives.Label });

export const traits = {
  literal: [LABELED],
  symbol: [
    LABELED,
    trait.define("ONTOLOGICAL", { schematic: v.object({}, { additionalProperties: true }) }),
    trait.define("STRUCTURAL", { schematic: v.object({}, { additionalProperties: true }) }),
    trait.define("TOPOGRAPHICAL", { schematic: v.object({}, { additionalProperties: true }) }),
  ],
  note: [LABELED],
  mode: [],
};
