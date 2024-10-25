import from from "./lib/from.js";

export default async function fromUnitIds({ scope, mask, unitIds }, ctx) {
  const units = await ctx.runtime.call("/units/fromUnitIds", { unitIds });
  return await from({ scope, mask, units }, ctx);
}
