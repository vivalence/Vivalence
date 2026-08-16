import { buffer } from "./buffer.js";

export const declared = (ctx) => buffer(ctx, { set: ctx.input.set ?? [] });
