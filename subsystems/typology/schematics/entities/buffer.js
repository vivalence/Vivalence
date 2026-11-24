import { v } from "../v.js";
import * as mime from "../scalars/mime.js";
import * as traits from "../traits/index.js";
import { DataSchematic } from "./base.js";

export const BufferSchematic = {
  ...DataSchematic,
  $id: "Buffer",
  is: "one screen on a thread: data a surface draws, in a mime the renderers key on",
  own: {
    index: v.integer().default(0).optional().desc("its position on the thread, from 0").example(0),
    status: v.enum(["PENDING", "ACTIVE", "DONE", "ERROR", "STALE"]).default("PENDING").optional().desc("PENDING: minted, not yet shown · ACTIVE: on screen · DONE: finished · ERROR: failed · STALE: superseded").example("ACTIVE"),
    mime: mime.type().optional().desc("its kind: the fallback renderers key on it; a mode mints its own").example("application/vnd.viva.daemon.chess.mode.board.play+json"),
    data: v.record(v.string(), v.unknown()).optional().desc("what the surfaces draw, in the mode's shape").example({ title: "Q3", summary: "final" }),
    traits: traits.names.buffer.optional().desc("the trait names worn").example(["LABELED"]),
    trait: traits.buffer.default({}).optional().desc("trait data by name").example({ LABELED: { name: "Annual accounts" } }),
  },
  relations: {
    mode: () => v.rel().optional().desc("the mode that minted it").example("01a09010-13a9-7f1e-a2c4-6b0d1f2e3a44"),
    thread: () => v.rel().desc("the thread it sits on").example("01a09010-13aa-778b-bce7-19c38f835337"),
    turns: () => v.array(v.turn()).optional().desc("the turns that touched it"),
    files: () => v.array(v.file()).optional().desc("files it shows"),
    surfaces: () => v.array(v.surface()).optional().desc("surfaces pinned to it"),
    literals: () => v.array(v.literal()).optional().desc("literals it carries"),
    symbols: () => v.array(v.symbol()).optional().desc("symbols it carries"),
  },
  traits: traits.buffer,
  narrowable: ["data", "trait"],
  spoken: ["id", "index", "mime", "mode", "thread", "traits", "trait"],
  examples: [{ id: "01a1bd04-54c5-74ca-bc57-45381377cd82", status: "PENDING", data: { gameplay: "TYPE", prompt: "TEXT", streak: 2, set: [{ pick: "feed", limit: 10 }] }, mime: "application/json", index: 2, traits: ["LABELED"], trait: { LABELED: { name: "dojo #2" } }, mode: "01a1b1c0-f0c1-7559-a38c-d59d34854a75", thread: "01a1b609-5607-741b-98df-9899bdc62e02" }],
};
