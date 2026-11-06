import { v } from "../v.js";
import { Home } from "../primitives/home.js";
import { Label } from "../primitives/label.js";
import { Docked } from "./docked.js";
import { Themed } from "./themed.js";
import { Intelligent } from "./intelligent.js";
import { Vocal } from "./vocal.js";
import { Aimed } from "./aimed.js";
import { Masked } from "./masked.js";
import { Queueing } from "./queueing.js";
import { Rendered } from "./rendered.js";

export { Docked, Themed, Intelligent, Vocal, Aimed, Masked, Queueing, Rendered };

const opaque = v.object({}, { additionalProperties: true });
const open = { additionalProperties: true };
const flag = (meaning) => opaque.default({}).optional().desc(meaning).examples({});
const DOCK = { align: "right", share: 0.38, view: "docked", lens: "chat", markdown: "pretty" };

export const mode = v.object({
  EXPOSED: flag("serves http endpoints"),
  HARNESSED: flag("runs under the daemon's harness: a model, a primer, tools"),
  TOOLING: flag("brings tools the model can call"),
  EMITTER: flag("mints buffers on demand"),
  DATASET: flag("ships symbols and literals"),
  AGENTIC: flag("loops: the model acts with tools until the turn is done"),
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
  LABELED: Label.default({}).optional().desc("its name, read in the chrome").examples({ name: "Q3 filings", description: "Third-quarter filings, due Friday" }),
  INTELLIGENT: Intelligent.default({}).optional().desc("which model answers its turns, with what budget").examples({ provider: "anthropic", tier: "capable", effort: "low", rounds: 12, thinking: false }),
  VOCAL: Vocal.default({}).optional().desc("audio: its turns are spoken — language, voice, harmonizing, polish").examples({ language: "it", provider: "openai", polish: true, harmonize: { window: 3, tolerance: 0.2, tail: 1 } }),
  AIMED: Aimed.default({}).optional().desc("the emitter route it pulls buffers from").examples({ mount: "/emitter/drill" }),
  MASKED: Masked.default({}).optional().desc("fields merged into every pull").examples({ level: "a1" }),
  QUEUEING: Queueing.default({}).optional().desc("how many buffers it keeps queued ahead").examples({ depth: 2 }),
});
export const buffer = v.object({
  LABELED: Label.default({}).optional().desc("its name, read on its tab").examples({ name: "Annual accounts", description: "The 2026 accounts as filed" }),
  RENDERED: Rendered.default({}).optional().desc("which views draw it: one in the frame, one as its cell").examples({ frame: "play", cell: "board" }),
});
export const view = v.object({
  FRAME: flag("drawn in the frame"),
  CELL: flag("drawn as a cell in the journal"),
});
export const terminal = v.object({
  LABELED: Label.default({}).optional().desc("its name, read in the chrome").examples({ name: "desk" }),
  DOCKED: Docked.default({}).optional().desc("how its dock sits: side, share, view, lens, markdown").examples(DOCK),
});
export const user = v.object({
  HOME: Home.default({}).optional().desc("the mode a terminal with no thread sits in").examples({ reference: "/runtime/runtime/mode/harness/runtime" }),
  DOCKED: Docked.default({}).optional().desc("how the dock sits for this user").examples(DOCK),
  THEMED: Themed.default("porcelain").optional().desc("the dapper theme").examples("northsea"),
});
export const client = v.object({
  HOME: Home.default({}).optional().desc("the mode a terminal with no thread sits in").examples({ reference: "/client/ghost/mode/home/console" }),
  DOCKED: Docked.default({}).optional().desc("how the dock sits for this client").examples(DOCK),
  THEMED: Themed.optional().desc("the dapper theme").examples("northsea"),
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
  LABELED: Label.default({}).optional().desc("its name, read in the chrome").examples({ name: "flamingo" }),
  ONTOLOGICAL: flag("a word of a topology's vocabulary"),
  TOPOGRAPHICAL: flag("a word of one body's vocabulary"),
  STRUCTURAL: flag("a structural marker of its corpus"),
}, open);
export const literal = v.object({ LABELED: Label.default({}).optional().desc("its name, read in the chrome").examples({ name: "Flamingo — six species" }) }, open);
export const note = v.object({ LABELED: Label.default({}).optional().desc("its name, read in the chrome").examples({ name: "On flamingos" }) }, open);

const worn = (data) => v.array(v.enum(Object.keys(data.properties)));
export const names = { mode: worn(mode), thread: worn(thread), buffer: worn(buffer), view: worn(view), terminal: worn(terminal), user: worn(user), symbol: worn(symbol), literal: worn(literal), note: worn(note) };
