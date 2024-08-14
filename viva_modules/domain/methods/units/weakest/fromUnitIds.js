import { getUnitMemory, getWeakest } from "../../memory/lib/memory.js";

export default async function (body, ctx) {
  const { unitIds, take } = body;

  let units = await ctx.runtime.call("/units/fromUnitIds", { unitIds });

  units = await Promise.all(units.map((unit) => getUnitMemory(unit, ctx)));
  units = getWeakest(units, take);

  return units;
}
