import { getUnitMemory } from "../lib/memory.js";

export default async function (body, ctx) {
  let { units, accept } = body;

  units = await Promise.all(units.map((t) => getUnitMemory(t, ctx)));

  units = units.filter((unit) => {
    if (!unit.memory && accept.includes("UNKNOWN")) return true;
    if (accept.includes(unit.memory.status)) return true;
    return false;
  });

  return units;
}
