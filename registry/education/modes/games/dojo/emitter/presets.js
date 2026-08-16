import { object } from "@vivalence/typology";
import * as types from "../types.js";

export const PRESETS = types.PRESETS;

export const fold = ({ axes, count }) => async (ctx, next) => {
  object.assign(ctx.input, object.merge(axes, types.axes(ctx.input)));
  if (count && ctx.input.count == null) ctx.input.count = count;
  return next();
};
