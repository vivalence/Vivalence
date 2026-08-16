import { object } from "@vivalence/typology";

export const symbols = (draws) => async (ctx) => {
  ctx.input.where = object.merge(ctx.input.where, { symbols: ctx.input.symbols ?? [] });
  return draws(ctx);
};
