import { getUnitMemory, sortByMemory, filterResourceByMemory } from "../lib/memory.js";

export default async function (body, ctx) {
  let { units, accept, take } = body;

  units = await Promise.all(units.map((t) => getUnitMemory(t, ctx)));

  units = units.filter(filterResourceByMemory(accept)).sort(sortByMemory);

  if (take) {
    units = units.slice(0, take);
  }

  return units;
}
