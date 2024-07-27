import { getUnitMemory } from "../lib/memory.js";

export default async function (body, runtime) {
  let { units, accept } = body;

  units = await Promise.all(units.map(getUnitMemory(runtime.locals)));

  units = units.filter((unit) => {
    if (!unit.memory && accept.includes("UNKNOWN")) return true;
    if (accept.includes(unit.memory.status)) return true;
    return false;
  });

  return units;
}
