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

export const mode = v.object({
  EXPOSED: opaque.default({}).optional(),
  HARNESSED: opaque.default({}).optional(),
  TOOLING: opaque.default({}).optional(),
  EMITTER: opaque.default({}).optional(),
  DATASET: opaque.default({}).optional(),
  AGENTIC: opaque.default({}).optional(),
  GENERATIVE: opaque.default({}).optional(),
  REPLING: opaque.default({}).optional(),
  BOOTED: opaque.default({}).optional(),
  KEYMAPPED: opaque.default({}).optional(),
  PRIMER: opaque.default({}).optional(),
  LOOPING: opaque.default({}).optional(),
  VIEWABLE: opaque.default({}).optional(),
  FILESET: opaque.default({}).optional(),
  FILESINK: opaque.default({}).optional(),
}, open);
export const thread = v.object({
  LABELED: Label.default({}).optional(),
  INTELLIGENT: Intelligent.default({}).optional(),
  VOCAL: Vocal.default({}).optional(),
  AIMED: Aimed.default({}).optional(),
  MASKED: Masked.default({}).optional(),
  QUEUEING: Queueing.default({}).optional(),
});
export const buffer = v.object({ LABELED: Label.default({}).optional(), RENDERED: Rendered.default({}).optional() });
export const view = v.object({ FRAME: opaque.default({}).optional(), CELL: opaque.default({}).optional() });
export const terminal = v.object({ LABELED: Label.default({}).optional(), DOCKED: Docked.default({}).optional() });
export const user = v.object({ HOME: Home.default({}).optional(), DOCKED: Docked.default({}).optional(), THEMED: Themed.default("porcelain").optional() });
export const client = v.object({ HOME: Home.default({}).optional(), DOCKED: Docked.default({}).optional(), THEMED: Themed.optional() });
export const lighthouse = v.object({ JOINABLE: opaque.default({}).optional(), INVITATIONAL: opaque.default({}).optional(), AUTOLOGIN: opaque.default({}).optional() });
export const service = v.object({ ATTACHED: opaque.default({}).optional(), SERVER: opaque.default({}).optional(), DOCKER: opaque.default({}).optional(), COMPOSE: opaque.default({}).optional() });
export const symbol = v.object({ LABELED: Label.default({}).optional(), ONTOLOGICAL: opaque.default({}).optional(), TOPOGRAPHICAL: opaque.default({}).optional(), STRUCTURAL: opaque.default({}).optional() }, open);
export const literal = v.object({ LABELED: Label.default({}).optional() }, open);
export const note = v.object({ LABELED: Label.default({}).optional() }, open);
