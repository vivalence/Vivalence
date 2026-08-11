import { buffer } from "./buffer.js";

export const knowables = async (ctx) => {
  if (!ctx.input.knowables?.length) return [];
  return buffer(ctx);
};
