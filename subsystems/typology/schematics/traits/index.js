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

const opaque = v.object({}, { additionalProperties: true });
const open = { additionalProperties: true };
const flag = (meaning) => opaque.default({}).optional().desc(meaning).example({});
const DOCK = { align: "right", share: 0.38, view: "docked", lens: ["turns", "harness"], markdown: "pretty" };

export const mode = v.object({
  EXPOSED: flag("serves http endpoints"),
  HARNESSED: flag("runs under the daemon's harness: a model, a primer, tools"),
  CONVERSATIONAL: flag("a human converses with it: typed, dictated, called"),
  TOOLING: flag("brings tools the model can call"),
  EMITTER: flag("mints buffers on demand"),
  DATASET: flag("ships symbols and literals"),
  GENERATIVE: flag("its buffers are hallucinated at runtime"),
  REPLING: flag("has a repl"),
  BOOTED: flag("runs code once every mode is wired"),
  KEYMAPPED: flag("brings a keymap"),
  PRIMER: flag("brings primer prose"),
  LOOPING: flag("brings repl tools the loop can call"),
  VIEWABLE: flag("ships svelte views"),
  FILESET: flag("ships files"),
  FILESINK: flag("writes files into its mountpoint"),
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
  RENDERED: Rendered.default({}).optional().desc("which views draw it: one in the frame, one as its cell").example({ frame: "play", cell: "board" }),
});
export const view = v.object({
  FRAME: flag("drawn in the frame"),
  CELL: flag("drawn as a cell in the journal"),
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
  JOINABLE: flag("signup is open"),
  INVITATIONAL: flag("signup by invitation"),
  AUTOLOGIN: flag("a terminal logs in without a password"),
});
export const service = v.object({
  ATTACHED: flag("hangs an attachment aperture (status · manifest) on its daemon"),
  SERVER: flag("a server process the runtime starts"),
  DOCKER: flag("runs as a docker container"),
  COMPOSE: flag("runs as a docker compose stack"),
});
export const symbol = v.object({
  LABELED: Label.default({}).optional().desc("its name, read in the chrome").example({ name: "flamingo" }),
  ONTOLOGICAL: flag("a word of a topology's vocabulary"),
  TOPOGRAPHICAL: flag("a word of one body's vocabulary"),
  STRUCTURAL: flag("a structural marker of its corpus"),
}, open);
export const literal = v.object({ LABELED: Label.default({}).optional().desc("its name, read in the chrome").example({ name: "Flamingo — six species" }) }, open);
export const note = v.object({ LABELED: Label.default({}).optional().desc("its name, read in the chrome").example({ name: "On flamingos" }) }, open);

const worn = (data) => v.array(v.enum(Object.keys(data.properties)));
export const names = { mode: worn(mode), thread: worn(thread), buffer: worn(buffer), view: worn(view), terminal: worn(terminal), user: worn(user), symbol: worn(symbol), literal: worn(literal), note: worn(note) };
