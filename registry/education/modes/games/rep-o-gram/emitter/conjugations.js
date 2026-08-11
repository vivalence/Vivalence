import { buffer } from "./buffer.js";
import { conjugate, rows } from "./conjugate.js";

export const conjugations = async (ctx) => {
  const knowables = await conjugate(ctx, await rows(ctx, ctx.input.where, ctx.input.count ?? 2));
  if (!knowables.length) return [];
  return buffer(ctx, { data: { recall: "LEARNING", knowables } });
};
