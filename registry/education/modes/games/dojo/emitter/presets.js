import { object } from "@vivalence/typology";
import * as types from "../types.js";

export const PRESETS = types.PRESETS;

export const fold = ({ axes, count, where }) => async (ctx, next) => {
  object.assign(ctx.input, object.merge(axes, types.axes(ctx.input)));
  if (count && ctx.input.count == null) ctx.input.count = count;
  if (where) ctx.input.where = object.merge(where, ctx.input.where ?? {});
  return next();
};
