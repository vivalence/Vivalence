import { v } from "../v.js";
import * as traits from "../traits/index.js";
import { DataSchematic } from "./base.js";

export const ThreadSchematic = {
  ...DataSchematic,
  $id: "Thread",
  is: "one conversation: a user, in a mode, as turns; it holds buffers and its configuration in traits",
  own: {
    phase: v.enum(["inert", "manual", "continuous", "escort"]).default("manual").optional().desc("inert: the app manages itself · manual: cursor discipline, the app pulls · continuous: manual plus a queue kept at depth · escort: continuous, back to the launch buffer when the queue drains").examples("manual"),
    traits: traits.names.thread.optional().desc("the trait names worn").examples(["LABELED", "INTELLIGENT"]),
    trait: traits.thread.default({}).desc("trait data by name, the whole vocabulary filled").examples({ LABELED: {}, INTELLIGENT: { effort: "low", rounds: 12, tier: "capable" }, VOCAL: {}, AIMED: {}, MASKED: {}, QUEUEING: { depth: 1 } }),
    counter: v.integer().default(0).optional().desc("buffers minted").examples(3),
  },
  relations: {
    user: () => v.rel().optional().desc("whose conversation it is").examples("01a09010-0000-7000-8000-000000000001"),
    mode: () => v.rel().optional().desc("the mode it runs in").examples("01a09010-13a9-7f1e-a2c4-6b0d1f2e3a44"),
    intent: () => v.rel().optional().desc("the intent it was opened for"),
    parent: () => v.rel().optional().desc("the thread this one forked from"),
    children: () => v.array(v.thread()).optional().desc("threads forked from this one"),
    buffers: () => v.array(v.buffer()).optional().desc("its screens, indexed"),
    turns: () => v.array(v.turn()).optional().desc("the conversation, by createdAt"),
  },
  traits: traits.thread,
  narrowable: ["trait"],
  examples: [{ id: "01a1b609-5607-741b-98df-9899bdc62e02", user: "01a1b1c0-d3b4-724a-9452-32d250140280", mode: "01a1b1c0-f0c1-7559-a38c-d59d34854a75", intent: null, phase: "manual", traits: ["INTELLIGENT", "VOCAL"], trait: { LABELED: {}, INTELLIGENT: { effort: "low", rounds: 12, tier: "capable" }, VOCAL: {}, AIMED: {}, MASKED: {}, QUEUEING: { depth: 1 } }, counter: 3, parent: null }],
};
