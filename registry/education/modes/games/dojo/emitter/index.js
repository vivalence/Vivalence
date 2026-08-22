import { Vector, v } from "@vivalence/typology";
import * as types from "../types.js";
import { PRESETS, fold } from "./presets.js";
import { literals } from "./literals.js";
import { declared } from "./declared.js";
import { feed } from "./feed.js";
import { symbols } from "./symbols.js";
import { knowables } from "./knowables.js";
import { conjugations } from "./conjugations.js";
import { generate } from "./generate.js";

const thread = v.string().desc("Binds the emitted buffer to the caller's thread.").optional();

const LITERALS_INPUT = v.object({
  literals: v.array(v.rel(v.literal())).desc("The rep set, given.").optional(),
  literal: v.rel(v.literal()).desc("Singular form of literals.").optional(),
  distractors: v.array(v.rel(v.literal())).desc("PICK option pool for a singular literal.").optional(),
  thread,
  ...types.AXES,
});

const FEED_INPUT = v.object({
  where: types.where,
  count: types.count,
  thread,
  ...types.AXES,
});

const SYMBOLS_INPUT = v.object({
  symbols: types.scope,
  where: types.where,
  count: types.count,
  thread,
  ...types.AXES,
});

const KNOWABLES_INPUT = v.object({ thread, ...types.AXES });

const SET_INPUT = v.object({
  set: types.set,
  thread,
  ...types.AXES,
});

const CONJUGATIONS_INPUT = v.object({
  where: types.where,
  symbols: types.scope.optional(),
  count: types.count,
  thread,
  ...types.AXES,
});

const GENERATE_INPUT = v.object({
  where: types.where,
  count: types.count,
  anchors: v
    .array(v.string())
    .desc("Literal slugs or ids that every composed sentence must build around.")
    .optional(),
  instructions: v.string().desc("Freeform steering, appended verbatim to the composition prompt.").optional(),
  thread,
  ...types.AXES,
});

export const emitter = new Vector()
  .open({ nature: "/literals", input: LITERALS_INPUT }, literals)
  .open({ nature: "/literal", input: LITERALS_INPUT }, literals)
  .open({ nature: "/feed", input: FEED_INPUT }, feed)
  .open({ nature: "/symbols", input: SYMBOLS_INPUT }, symbols(feed))
  .open({ nature: "/knowables", input: KNOWABLES_INPUT }, knowables)
  .open({ nature: "/set", input: SET_INPUT }, declared)
  .open({ nature: "/conjugations", input: CONJUGATIONS_INPUT }, conjugations)
  .open({ nature: "/generate", input: GENERATE_INPUT }, generate);

for (const [preset, entry] of Object.entries(PRESETS)) {
  emitter
    .branch("/" + preset)
    .use(fold(entry))
    .open({ nature: "/literals", input: LITERALS_INPUT }, literals)
    .open({ nature: "/literal", input: LITERALS_INPUT }, literals)
    .open({ nature: "/feed", input: FEED_INPUT }, feed)
    .open({ nature: "/symbols", input: SYMBOLS_INPUT }, symbols(feed))
    .open({ nature: "/knowables", input: KNOWABLES_INPUT }, knowables);
}
