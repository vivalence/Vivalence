import { v } from "../v.js";
import * as traits from "../traits/index.js";
import { DataSchematic } from "./base.js";

export const TerminalSchematic = {
  ...DataSchematic,
  $id: "Terminal",
  is: "one seat of a user: where they sit (a daemon, a thread) and how the chrome is docked",
  own: {
    index: v.integer().default(0).optional().desc("its position among the user's terminals, from 0").examples(0),
    traits: traits.names.terminal.optional().desc("the trait names worn").examples(["LABELED", "DOCKED"]),
    trait: traits.terminal.default({}).optional().desc("trait data by name").examples({ LABELED: { name: "desk" }, DOCKED: { align: "right", share: 0.38, view: "docked", lens: "chat", markdown: "pretty" } }),
  },
  relations: {
    user: () => v.rel().desc("whose seat it is").examples("01a09010-0000-7000-8000-000000000001"),
    daemon: () => v.rel().optional().desc("the daemon it sits in; null on the runtime").examples("education"),
    thread: () => v.rel().optional().desc("the thread it is on; null between threads").examples("01a09010-13aa-778b-bce7-19c38f835337"),
    buffer: () => v.rel().optional().desc("the buffer in its frame; null with the frame closed")
      .examples("01a1b60a-2b6f-7c1d-9e3a-5f4b8c7d6e21"),
  },
  traits: traits.terminal,
  narrowable: ["trait"],
  examples: [{ id: "01a1b1c1-0a45-76b5-a801-b17625693895", user: "01a1b1c0-d3b4-724a-9452-32d250140280", daemon: "spanish", thread: "01a1b609-5607-741b-98df-9899bdc62e02", index: 1, traits: ["DOCKED"], trait: { DOCKED: { view: "docked", lens: "repl", share: 0.42, shown: "docked", align: "right" }, LABELED: {} } }],
};
