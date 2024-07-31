import { getUnitMemory, getWeakest } from "../../memory/lib/memory.js";

export default async function (body, ctx) {
  const { tagIds, blacklist = [], take } = body;

  let units = await ctx.runtime.call("/units/fromTagIds", {
    tagIds,
    blacklist,
  });

  units = await Promise.all(units.map((unit) => getUnitMemory(unit, ctx.runtime)));
  units = getWeakest(units, take);

  return units;
}
