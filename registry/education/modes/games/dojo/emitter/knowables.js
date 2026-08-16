import { buffer } from "./buffer.js";

export const knowables = async (ctx) => {
  if (!ctx.input.knowables?.length) return [];
  return buffer(ctx, { set: [{ pick: "authored", knowables: ctx.input.knowables }] });
};
