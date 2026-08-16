import { object } from "@vivalence/typology";
import * as types from "../types.js";
import { resolve, empty, projection } from "../set/index.js";

export const buffer = async (ctx, { set = [], data = {}, ...rest } = {}) => {
  const resolved = await resolve(
    ctx,
    { set },
    { prompt: ctx.input.prompt, blacklist: ctx.input.blacklist?.literals ?? [] },
  );
  if (empty(resolved)) return [];
  return ctx.mode.app.buffer({
    data: {
      ...object.omit(types.axes(ctx.input), ["knowables"]),
      set,
      knowables: resolved.knowables,
      ...data,
    },
    symbols: projection(set),
    literals: resolved.literals,
    ...rest,
  });
};
