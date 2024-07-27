import { getUnitMemory, getWeakest } from "../../memory/lib/memory.js";

export default async function (body, runtime) {
  const { unitIds, take } = body;

  let units = await runtime.locals.client("units/fromUnitIds", { unitIds }).ok();

  units = await Promise.all(units.map((unit) => getUnitMemory(runtime.locals, unit)));
  units = getWeakest(units, take);

  return units;
}
