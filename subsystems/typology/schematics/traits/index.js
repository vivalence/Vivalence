import { v } from "../v.js";
import { Home } from "../primitives/home.js";
import { Label } from "../primitives/label.js";
import { Docked } from "./docked.js";
import { Themed } from "./themed.js";
import { Harnessed } from "./harnessed.js";
import { Conversational } from "./conversational.js";
import { Tooled } from "./tooled.js";
import { Primed } from "./primed.js";
import { Aimed } from "./aimed.js";
import { Masked } from "./masked.js";
import { Queueing } from "./queueing.js";
import { Rendered } from "./rendered.js";

export { Docked, Themed, Harnessed, Conversational, Aimed, Masked, Queueing, Rendered };

const open = { additionalProperties: true };
const DOCK = { align: "right", share: 0.38, view: "docked", lens: ["turns", "harness"], markdown: "pretty" };

export const mode = v.object({
  EXPOSED: v.object({}).default({}).optional().desc("serves http endpoints").example({}),
  HARNESS: v
    .object({})
    .default({})
    .optional()
    .desc("runs under the daemon's harness: a model, a primer, tools")
    .example({}),
  CONVERSATION: v
    .object({})
    .default({})
    .optional()
    .desc("a human converses with it: typed, dictated, called")
    .example({}),
  HARNESSED: v
    .object({})
    .default({})
    .optional()
    .desc("runs under the daemon's harness: a model, a primer, tools")
    .example({}), //deprecated
  CONVERSATIONAL: v
    .object({})
    .default({})
    .optional()
    .desc("a human converses with it: typed, dictated, called")
    .example({}), //deprecated
  TOOLING: v.object({}).default({}).optional().desc("brings tools the model can call").example({}),
  EMITTER: v.object({}).default({}).optional().desc("mints buffers on demand").example({}),
  DATASET: v.object({}).default({}).optional().desc("ships symbols and literals").example({}),
  SURFACING: v
    .object({})
    .default({})
    .optional()
    .desc("its buffers are hallucinated at runtime")
    .example({}),
  REPLING: v.object({}).default({}).optional().desc("has a repl").example({}),
  BOOTED: v
    .object({})
    .default({})
    .optional()
    .desc("runs code once every mode is wired")
    .example({}),
  KEYMAPPED: v.object({}).default({}).optional().desc("brings a keymap").example({}),
  PRIMER: v.object({}).default({}).optional().desc("brings primer prose").example({}),
  LOOPING: v
    .object({})
    .default({})
    .optional()
    .desc("brings repl tools the loop can call")
    .example({}),
  SURFACED: v.object({}).default({}).optional().desc("ships svelte surfaces").example({}),
  FILESET: v.object({}).default({}).optional().desc("ships files").example({}),
  FILESINK: v
    .object({})
    .default({})
    .optional()
    .desc("writes files into its mountpoint")
    .example({}),
  ATTACHED: v
    .object({})
    .default({})
    .optional()
    .desc("serves an aperture vector at /attached/:reference")
    .example({}),
  TWITCHY: v
    .object({})
    .default({})
    .optional()
    .desc("grafts its twitch routes onto the mode's twitch")
    .example({}),
}, open);
export const thread = v.object({
  LABELED: Label.default({}).optional().desc("its name, read in the chrome").example({ name: "Q3 filings", description: "Third-quarter filings, due Friday" }),
  HARNESSED: Harnessed.default({})
    .optional()
    .desc("the model it talks to: which one, with what budget, how its tools are named")
    .example({ provider: "anthropic", tier: "capable", effort: "low", rounds: 12, thinking: false, slugging: "deep" }),
  CONVERSATIONAL: Conversational.default({})
    .optional()
    .desc("a human converses here: languages, the ear, the voice, the call")
    .example({
      language: ["it", "en"],
      hear: { provider: "deepgram", id: "flux-general-multi" },
      speak: { provider: "elevenlabs", tier: "fast" },
      call: { provider: "openai" },
      harmonize: { window: 3, tolerance: 0.2, tail: 1 },
      polish: { id: "google/gemini-3.5-flash-lite", engaged: true },
    }),
  TOOLED: Tooled.default({})
    .optional()
    .desc("its tools over the mode's default, absolute reference → eager · lazy · none; add-only")
    .example({ "/daemon/education/mode/tactic/harvest": "eager", "/runtime/runtime/mode/harness/runtime/fs": "lazy" }),
  PRIMED: Primed.default({})
    .optional()
    .desc("its primer over the mode's default, absolute reference → eager · lazy · none; add-only")
    .example({ "/daemon/education/mode/tactic/harvest/archivist": "eager" }),
  AIMED: Aimed.default({}).optional().desc("the emitter route it pulls buffers from").example({ mount: "/emitter/drill" }),
  MASKED: Masked.default({}).optional().desc("fields merged into every pull").example({ level: "a1" }),
  QUEUEING: Queueing.default({}).optional().desc("how many buffers it keeps queued ahead").example({ depth: 2 }),
}, { retired: { INTELLIGENT: "HARNESSED", VOCAL: "CONVERSATIONAL" } });
export const buffer = v.object({
  LABELED: Label.default({}).optional().desc("its name, read on its tab").example({ name: "Annual accounts", description: "The 2026 accounts as filed" }),
  RENDERED: Rendered.default({}).optional().desc("which surfaces draw it: one in the frame, one as its cell").example({ frame: "play", cell: "board" }),
});
export const surface = v.object({
  FRAME: v.object({}).default({}).optional().desc("drawn in the frame").example({}),
  CELL: v.object({}).default({}).optional().desc("drawn as a cell in the journal").example({}),
});
export const terminal = v.object({
  LABELED: Label.default({}).optional().desc("its name, read in the chrome").example({ name: "desk" }),
  DOCKED: Docked.default({}).optional().desc("how its dock sits: side, share, view, lens, markdown").example(DOCK),
});
export const user = v.object({
  HOME: Home.default({}).optional().desc("the mode a terminal with no thread sits in").example({ reference: "/runtime/runtime/mode/harness/runtime" }),
  DOCKED: Docked.default({}).optional().desc("how the dock sits for this user").example(DOCK),
  THEMED: Themed.default("porcelain").optional().desc("the dapper theme").example("northsea"),
});
export const client = v.object({
  HOME: Home.default({}).optional().desc("the mode a terminal with no thread sits in").example({ reference: "/client/ghost/mode/home/console" }),
  DOCKED: Docked.default({}).optional().desc("how the dock sits for this client").example(DOCK),
  THEMED: Themed.optional().desc("the dapper theme").example("northsea"),
});
export const lighthouse = v.object({
  JOINABLE: v.object({}).default({}).optional().desc("signup is open").example({}),
  INVITATIONAL: v.object({}).default({}).optional().desc("signup by invitation").example({}),
  AUTOLOGIN: v
    .object({})
    .default({})
    .optional()
    .desc("a terminal logs in without a password")
    .example({}),
  AUTOSIGNUP: v
    .object({})
    .default({})
    .optional()
    .desc("a visitor enters under the name they type, no password")
    .example({}),
});
export const service = v.object({
  ATTACHED: v
    .object({})
    .default({})
    .optional()
    .desc("hangs an attachment aperture (status · manifest) on its daemon")
    .example({}),
  SERVER: v
    .object({})
    .default({})
    .optional()
    .desc("a server process the runtime starts")
    .example({}),
  DOCKER: v.object({}).default({}).optional().desc("runs as a docker container").example({}),
  COMPOSE: v.object({}).default({}).optional().desc("runs as a docker compose stack").example({}),
});
export const symbol = v.object({
  LABELED: Label.default({}).optional().desc("its name, read in the chrome").example({ name: "flamingo" }),
  ONTOLOGICAL: v
    .object({})
    .default({})
    .optional()
    .desc("a word of a topology's vocabulary")
    .example({}),
  TOPOGRAPHICAL: v
    .object({})
    .default({})
    .optional()
    .desc("a word of one body's vocabulary")
    .example({}),
  STRUCTURAL: v
    .object({})
    .default({})
    .optional()
    .desc("a structural marker of its corpus")
    .example({}),
}, open);
export const literal = v.object({ LABELED: Label.default({}).optional().desc("its name, read in the chrome").example({ name: "Flamingo — six species" }) }, open);
export const note = v.object({ LABELED: Label.default({}).optional().desc("its name, read in the chrome").example({ name: "On flamingos" }) }, open);

const worn = (data) => v.array(v.enum(Object.keys(data.properties)));
export const names = { mode: worn(mode), thread: worn(thread), buffer: worn(buffer), surface: worn(surface), terminal: worn(terminal), user: worn(user), symbol: worn(symbol), literal: worn(literal), note: worn(note) };
