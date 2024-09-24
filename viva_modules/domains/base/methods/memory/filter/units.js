import { getUnitMemory, sortByMemory } from "../lib/memory.js";

export default async function (body, ctx) {
  let { units, accept, take } = body;

  units = await Promise.all(units.map((t) => getUnitMemory(t, ctx)));

  units = units
    .filter((unit) => {
      if (!unit.memory && accept.includes("UNKNOWN")) return true;
      if (accept.includes(unit.memory.status)) return true;
      return false;
    })
    .sort(sortByMemory);

  if (take) {
    units = units.slice(0, take);
  }

  return units;
}
