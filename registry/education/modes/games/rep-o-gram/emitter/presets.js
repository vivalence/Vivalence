import { object } from "@vivalence/typology";
import * as types from "../types.js";
import { conjugations } from "./conjugations.js";
import { generate } from "./generate.js";

const DRAWS = { conjugate: conjugations, translate: generate };

export const PRESETS = Object.fromEntries(
  Object.entries(types.PRESETS).map(([preset, axes]) => [
    preset,
    { axes, ...(DRAWS[preset] && { draws: DRAWS[preset] }) },
  ]),
);

export const fold = (axes) => async (ctx, next) => {
  object.assign(ctx.input, object.merge(axes, types.axes(ctx.input)));
  return next();
};
