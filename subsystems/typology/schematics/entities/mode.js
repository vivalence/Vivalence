import { v } from "../v.js";
import * as traits from "../traits/index.js";
import { DataSchematic } from "./base.js";

export const ModeSchematic = {
  ...DataSchematic,
  $id: "Mode",
  is: "one program on a daemon: a type and slug, a manifest of traits, the buffers it mints; the runtime's own carry no daemon",
  own: {
    slug: v.string().optional().desc("its name inside the type").examples("runtime"),
    type: v.string().optional().desc("its kind").examples("harness"),
    name: v.string().optional().desc("the display name").examples("Runtime Harness"),
    description: v.string().optional().desc("one sentence on what it does").examples("default runtime harness"),
    version: v.string().optional().desc("semver").examples("0.3.0"),
    installed: v.string().optional().desc("the install stamp, empty until installed").examples("2026-11-09T16:11:21.476Z"),
    traits: traits.names.mode.optional().desc("the trait names declared").examples(["HARNESSED", "AGENTIC", "TOOLING", "PRIMER"]),
  },
  relations: {
    daemon: () => v.rel().optional().desc("the daemon it belongs to; null for the runtime's own").examples("test-daemon"),
    intents: () => v.array(v.intent()).optional().desc("intents opened on it"),
    buffers: () => v.array(v.buffer()).optional().desc("buffers it minted"),
    turns: () => v.array(v.turn()).optional().desc("turns it answered"),
    views: () => v.array(v.view()).optional().desc("views it ships"),
    literals: () => v.array(v.literal()).optional().desc("literals it ships"),
    symbols: () => v.array(v.symbol()).optional().desc("symbols it ships"),
    notes: () => v.array(v.note()).optional().desc("notes taken on it"),
    files: () => v.array(v.file()).optional().desc("files it serves"),
  },
  traits: traits.mode,
  narrowable: ["traits"],
  examples: [{ id: "01a1b1c0-f0c1-7559-a38c-d59d34854a75", type: "game", slug: "dojo", daemon: "spanish", name: "Dojo", description: "One rep machine over words, sentences and conjugation forms — prompt, gameplay, preview, streak, continuous and limit all free to combine.", installed: "a4d2781b", version: "0.1.0", traits: ["VIEWABLE", "EMITTER", "INTENTED", "EXPOSED", "TOOLING", "HARNESSED"] }],
};
