import { Vector, v } from "@vivalence/typology";
import * as types from "../types.js";
import { PRESETS, fold } from "./presets.js";
import { literals } from "./literals.js";
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
  .open({ nature: "/conjugations", input: CONJUGATIONS_INPUT }, conjugations)
  .open({ nature: "/generate", input: GENERATE_INPUT }, generate);

for (const [preset, { axes, draws = feed }] of Object.entries(PRESETS)) {
  emitter
    .branch("/" + preset)
    .use(fold(axes))
    .open({ nature: "/literals", input: LITERALS_INPUT }, literals)
    .open({ nature: "/literal", input: LITERALS_INPUT }, literals)
    .open({ nature: "/feed", input: FEED_INPUT }, draws)
    .open({ nature: "/symbols", input: SYMBOLS_INPUT }, symbols(draws))
    .open({ nature: "/knowables", input: KNOWABLES_INPUT }, knowables);
}
