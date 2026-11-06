import { v } from "../v.js";
import * as traits from "../traits/index.js";
import { DataSchematic } from "./base.js";

export const UserSchematic = {
  ...DataSchematic,
  $id: "User",
  is: "one person on the lighthouse: a slug, how they authenticate, their home and dock in traits",
  own: {
    slug: v.string().optional().desc("the login name").examples("beef"),
    traits: traits.names.user.optional().desc("the trait names worn").examples(["HOME", "THEMED"]),
    trait: traits.user.default({}).optional().desc("trait data by name").examples({ HOME: { reference: "/runtime/runtime/mode/harness/runtime" }, THEMED: "northsea" }),
  },
  relations: {
    daemons: () => v.array(v.daemon()).optional().desc("daemons they own"),
    terminals: () => v.array(v.terminal()).optional().desc("their open terminals"),
    threads: () => v.array(v.thread()).optional().desc("their conversations"),
    intents: () => v.array(v.intent()).optional().desc("their intents"),
    notes: () => v.array(v.note()).optional().desc("their notes"),
  },
  traits: traits.user,
  narrowable: ["trait"],
  examples: [{ id: "01a1b1c0-d3b4-724a-9452-32d250140280", slug: "localhost", traits: ["HOME", "THEMED"], trait: { HOME: { reference: "/runtime/runtime/mode/harness/runtime" }, THEMED: "porcelain" } }],
};
