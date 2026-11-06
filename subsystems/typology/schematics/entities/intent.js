import { v } from "../v.js";
import { DataSchematic } from "./base.js";

export const IntentSchematic = {
  ...DataSchematic,
  $id: "Intent",
  is: "what a user wants from a mode: a named aim threads are opened for",
  own: {
    slug: v.string().optional().desc("its name inside the mode").examples("review"),
    name: v.string().optional().desc("the display name").examples("Review the filings"),
    description: v.string().optional().desc("one sentence on the aim").examples("Read the Q3 filings and flag anomalies"),
    traits: v.array(v.string()).optional().desc("the trait names worn").examples([]),
    trait: v.record(v.string(), v.unknown()).optional().desc("trait data by name").examples({}),
  },
  relations: {
    user: () => v.rel().optional().desc("whose intent it is").examples("01a09010-0000-7000-8000-000000000001"),
    mode: () => v.rel().optional().desc("the mode it aims at").examples("01a09010-13a9-7f1e-a2c4-6b0d1f2e3a44"),
  },
  narrowable: ["trait"],
  examples: [{ id: "01a1b1c0-fdf0-71bf-acca-01399f00b7ec", slug: "conjugate", name: "Conjugate", description: null, user: "01a1b1c0-d3b4-724a-9452-32d250140280", traits: ["MASKED", "AIMED", "QUEUEING"], trait: { MASKED: { count: 2, gameplay: "CONJUGATE", recall: "LEARNING" }, AIMED: { mount: "/emit/conjugations" }, QUEUEING: { depth: 1 } }, mode: { id: "01a1b1c0-f0c1-7559-a38c-d59d34854a75", type: "game", slug: "dojo", daemon: "spanish", name: "Dojo", installed: "a4d2781b", version: "0.1.0", traits: ["VIEWABLE", "EMITTER", "INTENTED", "EXPOSED", "TOOLING", "HARNESSED"] } }],
};
