import { v } from "../v.js";
import * as traits from "../traits/index.js";
import { DataSchematic } from "./base.js";

export const NoteSchematic = {
  ...DataSchematic,
  $id: "Note",
  is: "a remark hung on something — a literal, a buffer, a turn, a mode — by a user or a daemon; notes nest",
  own: {
    slug: v.string().optional().desc("its address").examples("flamingo-diet"),
    traits: traits.names.note.optional().desc("the trait names worn").examples(["LABELED"]),
    trait: traits.note.default({}).optional().desc("trait data by name").examples({ LABELED: { name: "On flamingos" } }),
  },
  relations: {
    user: () => v.rel().optional().desc("who wrote it").examples("01a09010-0000-7000-8000-000000000001"),
    daemon: () => v.rel().optional().desc("the daemon it belongs to").examples("education"),
    mode: () => v.rel().optional().desc("the mode it was taken in").examples("01a09010-13a9-7f1e-a2c4-6b0d1f2e3a44"),
    literal: () => v.rel().optional().desc("the literal it is about"),
    buffer: () => v.rel().optional().desc("the buffer it is about"),
    turn: () => v.rel().optional().desc("the turn it is about"),
    symbols: () => v.array(v.symbol()).optional().desc("symbols it carries"),
    parent: () => v.rel().optional().desc("the note it nests under"),
    children: () => v.array(v.note()).optional().desc("notes nested under it"),
  },
  narrowable: ["trait"],
  examples: [{ id: "01a1b6e6-58e3-706b-932f-c2c3f8a95b5d", slug: "retention.de.adposition", daemon: "spanish", mode: null, user: "01a1b1c0-d3b4-724a-9452-32d250140280", literal: "01a1b1c0-dd9c-713e-8bc0-35148cecad3f", buffer: null, turn: null, parent: null, traits: ["RETAINED"], trait: { RETAINED: { driver: "BAYESIAN", status: "UNKNOWN", type: "INDIVIDUAL", state: [4, 4, 3.4], nextIn: 3.4, nextAt: "2026-11-07T20:09:11.553Z", due: "2026-11-07T20:09:11.553Z", lastAt: 1794069911781, lastSignal: "SUCCESS" } } }],
};
