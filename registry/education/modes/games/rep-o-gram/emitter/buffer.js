import * as types from "../types.js";

export const buffer = (ctx, { data, ...rest } = {}) =>
  ctx.mode.app.buffer({
    data: { ...types.axes(ctx.input), ...data },
    symbols: ctx.input.symbols ?? [],
    literals: [],
    ...rest,
  });
